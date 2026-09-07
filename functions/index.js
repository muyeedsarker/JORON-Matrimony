const { onRequest } = require("firebase-functions/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const { isoUint8Array } = require("@simplewebauthn/server/helpers");
const crypto = require("crypto");

initializeApp();
const db = getFirestore();
const auth = getAuth();
const ADMIN_UID = "PcDehBv4dYezeIPA6h0Peo9lpih2";
const PLAN_PRICES = Object.freeze({ Basic: 700, Standard: 1500, Premium: 3500 });
const RP_NAME = "JORON Matrimony — জোড়ন";
const RP_ID = "joron-d7742.web.app";
const ORIGIN = "https://joron-d7742.web.app";
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const PASSKEYS = "passkeys";
const CHALLENGES = "passkeyChallenges";

function cors(req, res) {
  const origin = req.get("origin");
  if (origin === ORIGIN) { res.set("Access-Control-Allow-Origin", origin); res.set("Vary", "Origin"); }
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}
function jsonError(res, status, message) { return res.status(status).json({ ok: false, error: message }); }
function challengeId() { return crypto.randomBytes(24).toString("base64url"); }
function isFreshChallenge(data) { if (!data || data.used || !data.createdAt) return false; return Date.now() - data.createdAt.toMillis() <= CHALLENGE_TTL_MS; }
async function requireAdmin(req, res) {
  const header = req.get("authorization") || "";
  if (!header.startsWith("Bearer ")) { jsonError(res, 401, "Admin authentication required"); return null; }
  try { const decoded = await auth.verifyIdToken(header.slice(7)); if (decoded.uid !== ADMIN_UID) { jsonError(res, 403, "Admin access denied"); return null; } return decoded; }
  catch (error) { console.error("Admin token verification failed", error); jsonError(res, 401, "Invalid authentication token"); return null; }
}
async function storeChallenge(id, type, challenge, extra = {}) { await db.collection(CHALLENGES).doc(id).set({ type, challenge, createdAt: FieldValue.serverTimestamp(), used: false, ...extra }); }

exports.passkeyRegisterOptions = onRequest(async (req, res) => {
  cors(req, res); if (req.method === "OPTIONS") return res.status(204).send(""); if (req.method !== "GET") return jsonError(res, 405, "GET required");
  const user = await requireAdmin(req, res); if (!user) return;
  try { const existing = await db.collection(PASSKEYS).where("uid", "==", ADMIN_UID).get(); const options = await generateRegistrationOptions({ rpName: RP_NAME, rpID: RP_ID, userName: `admin-${ADMIN_UID}`, userDisplayName: "JORON Matrimony Admin", userID: isoUint8Array.fromUTF8String(`joron-admin-${ADMIN_UID}`), attestationType: "none", excludeCredentials: existing.docs.map((doc) => ({ id: doc.data().id, transports: doc.data().transports || [] })), authenticatorSelection: { residentKey: "required", userVerification: "required", authenticatorAttachment: "platform" } }); const id = challengeId(); await storeChallenge(id, "registration", options.challenge, { uid: ADMIN_UID }); return res.json({ ok: true, challengeId: id, options }); }
  catch (error) { console.error("Passkey registration options failed", error); return jsonError(res, 500, "Could not create Passkey registration options"); }
});
exports.passkeyRegisterVerify = onRequest(async (req, res) => {
  cors(req, res); if (req.method === "OPTIONS") return res.status(204).send(""); if (req.method !== "POST") return jsonError(res, 405, "POST required"); const user = await requireAdmin(req, res); if (!user) return;
  const { challengeId: id, response } = req.body || {}; if (!id || !response) return jsonError(res, 400, "Missing registration response"); const ref = db.collection(CHALLENGES).doc(id); const snap = await ref.get(); const data = snap.data(); if (!snap.exists || !isFreshChallenge(data) || data.type !== "registration" || data.uid !== ADMIN_UID) return jsonError(res, 400, "Registration challenge expired or invalid");
  try { const verification = await verifyRegistrationResponse({ response, expectedChallenge: data.challenge, expectedOrigin: ORIGIN, expectedRPID: RP_ID, requireUserVerification: true }); if (!verification.verified || !verification.registrationInfo) return jsonError(res, 400, "Passkey registration was not verified"); const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo; await db.collection(PASSKEYS).doc(credential.id).set({ id: credential.id, uid: ADMIN_UID, publicKey: Buffer.from(credential.publicKey), counter: credential.counter, transports: credential.transports || [], credentialDeviceType, credentialBackedUp, createdAt: FieldValue.serverTimestamp() }); await ref.update({ used: true }); return res.json({ ok: true, verified: true }); }
  catch (error) { console.error("Passkey registration verification failed", error); return jsonError(res, 400, "Passkey registration verification failed"); }
});
exports.passkeyAuthOptions = onRequest(async (req, res) => { cors(req, res); if (req.method === "OPTIONS") return res.status(204).send(""); if (req.method !== "GET") return jsonError(res, 405, "GET required"); try { const options = await generateAuthenticationOptions({ rpID: RP_ID, userVerification: "required" }); const id = challengeId(); await storeChallenge(id, "authentication", options.challenge); return res.json({ ok: true, challengeId: id, options }); } catch (error) { console.error("Passkey authentication options failed", error); return jsonError(res, 500, "Could not create Passkey login options"); } });
exports.passkeyAuthVerify = onRequest(async (req, res) => {
  cors(req, res); if (req.method === "OPTIONS") return res.status(204).send(""); if (req.method !== "POST") return jsonError(res, 405, "POST required"); const { challengeId: id, response } = req.body || {}; if (!id || !response || !response.id) return jsonError(res, 400, "Missing Passkey response"); const challengeRef = db.collection(CHALLENGES).doc(id); const challengeSnap = await challengeRef.get(); const challengeData = challengeSnap.data(); if (!challengeSnap.exists || !isFreshChallenge(challengeData) || challengeData.type !== "authentication") return jsonError(res, 400, "Authentication challenge expired or invalid");
  try { const passkeySnap = await db.collection(PASSKEYS).doc(response.id).get(); if (!passkeySnap.exists || passkeySnap.data().uid !== ADMIN_UID) return jsonError(res, 403, "This Passkey is not authorized for JORON Matrimony Admin"); const passkey = passkeySnap.data(); const verification = await verifyAuthenticationResponse({ response, expectedChallenge: challengeData.challenge, expectedOrigin: ORIGIN, expectedRPID: RP_ID, requireUserVerification: true, credential: { id: passkey.id, publicKey: new Uint8Array(passkey.publicKey), counter: passkey.counter || 0, transports: passkey.transports || [] } }); if (!verification.verified) return jsonError(res, 401, "Passkey verification failed"); await passkeySnap.ref.update({ counter: verification.authenticationInfo.newCounter, lastUsedAt: FieldValue.serverTimestamp() }); await challengeRef.update({ used: true }); const customToken = await auth.createCustomToken(ADMIN_UID, { passkey: true, adminAccess: true }); return res.json({ ok: true, verified: true, customToken }); }
  catch (error) { console.error("Passkey authentication verification failed", error); return jsonError(res, 401, "Passkey authentication failed"); }
});
exports.passkeyHealth = onRequest((req, res) => { cors(req, res); return res.json({ ok: true, service: "JORON Matrimony Passkey", rpId: RP_ID }); });

Object.assign(module.exports, require("./identifier-auth"));
Object.assign(module.exports, require("./support"));

exports.adminListPendingPayments = onRequest(async (req, res) => {
  cors(req, res); if (req.method === "OPTIONS") return res.status(204).send(""); if (req.method !== "GET") return jsonError(res, 405, "GET required");
  const admin = await requireAdmin(req, res); if (!admin) return;
  try { const snap = await db.collection("payments").where("paymentStatus", "==", "pending").get(); const payments = snap.docs.map((docSnap) => { const d = docSnap.data(); return { uid: docSnap.id, senderNumber: d.senderNumber || "", transactionId: d.transactionId || "", selectedPlan: d.selectedPlan || "", membershipPrice: d.membershipPrice || null }; }); return res.json({ ok: true, payments }); }
  catch (error) { console.error("adminListPendingPayments failed", error); return jsonError(res, 500, "Could not load pending payments"); }
});
exports.adminReviewPayment = onRequest(async (req, res) => {
  cors(req, res); if (req.method === "OPTIONS") return res.status(204).send(""); if (req.method !== "POST") return jsonError(res, 405, "POST required");
  const admin = await requireAdmin(req, res); if (!admin) return;
  const { uid, action } = req.body || {}; if (!uid || typeof uid !== "string") return jsonError(res, 400, "Missing uid"); if (!["approve","reject"].includes(action)) return jsonError(res, 400, "Invalid action");
  try {
    const paymentRef = db.collection("payments").doc(uid);
    const userRef = db.collection("users").doc(uid);
    const result = await db.runTransaction(async (tx) => {
      const paymentSnap = await tx.get(paymentRef);
      if (!paymentSnap.exists) { const error = new Error("Payment not found"); error.code = "NOT_FOUND"; throw error; }
      const payment = paymentSnap.data();
      if (payment.paymentStatus !== "pending") { const error = new Error("Payment already reviewed"); error.code = "ALREADY_REVIEWED"; throw error; }
      const expectedPrice = PLAN_PRICES[payment.selectedPlan];
      if (!expectedPrice || Number(payment.membershipPrice) !== expectedPrice) { const error = new Error("Invalid payment plan or amount"); error.code = "INVALID_PAYMENT_DATA"; throw error; }
      const reviewedAt = FieldValue.serverTimestamp();
      if (action === "approve") {
        tx.update(paymentRef, { paymentStatus: "approved", membershipStatus: "active", reviewedAt, reviewedBy: admin.uid });
        tx.set(userRef, { membershipPlan: payment.selectedPlan, paymentStatus: "paid", membershipStatus: "active", updatedAt: reviewedAt }, { merge: true });
      } else {
        tx.update(paymentRef, { paymentStatus: "rejected", reviewedAt, reviewedBy: admin.uid });
        tx.set(userRef, { paymentStatus: "rejected", membershipStatus: "pending", updatedAt: reviewedAt }, { merge: true });
      }
      return { uid, action };
    });
    return res.json({ ok: true, ...result });
  } catch (error) {
    if (error.code === "NOT_FOUND") return jsonError(res, 404, "Payment not found");
    if (error.code === "ALREADY_REVIEWED") return jsonError(res, 409, "Payment already reviewed");
    if (error.code === "INVALID_PAYMENT_DATA") return jsonError(res, 400, "Payment plan or amount is invalid");
    console.error("adminReviewPayment failed", error); return jsonError(res, 500, "Could not review payment");
  }
});