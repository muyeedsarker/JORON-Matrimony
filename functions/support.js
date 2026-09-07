const { onRequest } = require("firebase-functions/https");
const { getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

if (!getApps().length) initializeApp();
const db = getFirestore();
const auth = getAuth();

const ADMIN_UID = "PcDehBv4dYezeIPA6h0Peo9lpih2";
const ALLOWED_ORIGINS = new Set([
  "https://muyeedsarker.github.io",
  "https://joron-d7742.web.app",
  "https://joron-d7742.firebaseapp.com",
]);
const STATUSES = new Set(["open", "ai_handled", "pending_admin", "in_progress", "resolved", "closed"]);
const PRIORITIES = new Set(["low", "normal", "high", "urgent"]);
const CATEGORIES = new Set(["account", "profile", "biodata", "matching", "membership", "payment", "privacy", "safety", "technical", "other"]);
const MAX_LIMIT = 50;
const MAX_TEXT = 4000;

function cors(req, res) {
  const origin = req.get("origin") || "";
  if (ALLOWED_ORIGINS.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}
function jsonError(res, status, error) { return res.status(status).json({ ok: false, error }); }
async function requireAdmin(req, res) {
  const header = req.get("authorization") || "";
  if (!header.startsWith("Bearer ")) { jsonError(res, 401, "Admin authentication required"); return null; }
  try {
    const decoded = await auth.verifyIdToken(header.slice(7));
    if (decoded.uid !== ADMIN_UID) { jsonError(res, 403, "Admin access denied"); return null; }
    return decoded;
  } catch (error) {
    console.error("Support admin token verification failed", error.message);
    jsonError(res, 401, "Invalid authentication token");
    return null;
  }
}
function cleanText(value, max = MAX_TEXT) {
  return String(value == null ? "" : value).trim().slice(0, max);
}
function validTicketId(value) { return /^[A-Za-z0-9_-]{1,160}$/.test(String(value || "")); }
function ticketPayload(d, id) {
  return {
    ticketId: id,
    uid: d.uid || "",
    category: d.category || "other",
    subject: cleanText(d.subject, 200),
    message: cleanText(d.message),
    status: d.status || "open",
    priority: d.priority || "normal",
    source: d.source || "web",
    aiSummary: cleanText(d.aiSummary, 1000),
    aiConfidence: typeof d.aiConfidence === "number" ? d.aiConfidence : null,
    escalationReason: cleanText(d.escalationReason, 1000),
    assignedAdminUid: d.assignedAdminUid || "",
    createdAt: d.createdAt || null,
    updatedAt: d.updatedAt || null,
    lastReplyAt: d.lastReplyAt || null,
  };
}

exports.adminListSupportTickets = onRequest(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "GET") return jsonError(res, 405, "GET required");
  const admin = await requireAdmin(req, res); if (!admin) return;
  try {
    const status = cleanText(req.query.status, 40);
    const limitRaw = Number(req.query.limit || 30);
    const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? Math.floor(limitRaw) : 30, 1), MAX_LIMIT);
    let query = db.collection("supportTickets").orderBy("updatedAt", "desc").limit(limit);
    if (status && status !== "all") {
      if (!STATUSES.has(status)) return jsonError(res, 400, "Invalid status");
      query = db.collection("supportTickets").where("status", "==", status).orderBy("updatedAt", "desc").limit(limit);
    }
    const snap = await query.get();
    return res.json({ ok: true, tickets: snap.docs.map((doc) => ticketPayload(doc.data(), doc.id)) });
  } catch (error) {
    console.error("adminListSupportTickets failed", error);
    return jsonError(res, 500, "Could not load support tickets");
  }
});

exports.adminUpdateSupportTicket = onRequest(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return jsonError(res, 405, "POST required");
  const admin = await requireAdmin(req, res); if (!admin) return;
  const body = req.body || {};
  const ticketId = cleanText(body.ticketId, 160);
  const status = cleanText(body.status, 40);
  const priority = cleanText(body.priority, 40);
  const assignedAdminUid = cleanText(body.assignedAdminUid, 128);
  if (!validTicketId(ticketId)) return jsonError(res, 400, "Invalid ticketId");
  if (!STATUSES.has(status)) return jsonError(res, 400, "Invalid status");
  if (priority && !PRIORITIES.has(priority)) return jsonError(res, 400, "Invalid priority");
  if (assignedAdminUid && assignedAdminUid !== ADMIN_UID) return jsonError(res, 400, "Invalid assignee");
  try {
    const ref = db.collection("supportTickets").doc(ticketId);
    const snap = await ref.get();
    if (!snap.exists) return jsonError(res, 404, "Ticket not found");
    const update = { status, updatedAt: FieldValue.serverTimestamp() };
    if (priority) update.priority = priority;
    if (assignedAdminUid) update.assignedAdminUid = assignedAdminUid;
    else if (status === "in_progress") update.assignedAdminUid = ADMIN_UID;
    await ref.update(update);
    return res.json({ ok: true, ticketId, status });
  } catch (error) {
    console.error("adminUpdateSupportTicket failed", error);
    return jsonError(res, 500, "Could not update support ticket");
  }
});

exports.adminReplySupportTicket = onRequest(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return jsonError(res, 405, "POST required");
  const admin = await requireAdmin(req, res); if (!admin) return;
  const body = req.body || {};
  const ticketId = cleanText(body.ticketId, 160);
  const text = cleanText(body.text);
  if (!validTicketId(ticketId) || !text) return jsonError(res, 400, "Ticket and reply text are required");
  try {
    const ticketRef = db.collection("supportTickets").doc(ticketId);
    const messageRef = db.collection("supportMessages").doc();
    const ticketSnap = await ticketRef.get();
    if (!ticketSnap.exists) return jsonError(res, 404, "Ticket not found");
    const now = FieldValue.serverTimestamp();
    const batch = db.batch();
    batch.set(messageRef, {
      ticketId,
      senderType: "admin",
      senderUid: admin.uid,
      text,
      createdAt: now,
    });
    batch.update(ticketRef, {
      status: "in_progress",
      assignedAdminUid: admin.uid,
      lastReplyAt: now,
      updatedAt: now,
    });
    await batch.commit();
    return res.json({ ok: true, ticketId, messageId: messageRef.id });
  } catch (error) {
    console.error("adminReplySupportTicket failed", error);
    return jsonError(res, 500, "Could not send support reply");
  }
});
