import { db } from './firebase-client.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

// Canonical JORON membership catalog. Premium+ remains disabled until its price is finalized.
export const MEMBERSHIP_PLANS = Object.freeze({
  Basic: { displayName: 'Basic / Silver', price: 700, enabled: true },
  Standard: { displayName: 'Gold', price: 1500, enabled: true },
  Premium: { displayName: 'Premium', price: 3500, enabled: true },
  'Premium Plus': { displayName: 'Premium+', price: null, enabled: false },
});

export async function getMembership(uid){
  if(!uid) return null;
  const snap=await getDoc(doc(db,'users',uid));
  return snap.exists()?snap.data():null;
}

export function getMembershipPlan(plan){
  return MEMBERSHIP_PLANS[String(plan || '').trim()] || null;
}

export async function startMembershipRequest(uid, plan='Premium', price){
  if(!uid) throw new Error('Login required');
  const selected=getMembershipPlan(plan);
  if(!selected || !selected.enabled) throw new Error('এই Membership plan বর্তমানে চালু নেই।');
  const expectedPrice=selected.price;
  const requestedPrice=Number(price);
  if(!Number.isFinite(requestedPrice) || requestedPrice !== expectedPrice){
    throw new Error('Membership price mismatch। আবার plan নির্বাচন করুন।');
  }
  const now=serverTimestamp();
  await setDoc(doc(db,'users',uid),{
    membershipPlan:plan,
    membershipDisplayName:selected.displayName,
    membershipPrice:expectedPrice,
    membershipStatus:'pending',
    paymentStatus:'pending',
    membershipRequestedAt:now
  },{merge:true});
  await setDoc(doc(db,'payments',uid),{
    uid,
    selectedPlan:plan,
    membershipPlan:plan,
    membershipDisplayName:selected.displayName,
    membershipPrice:expectedPrice,
    membershipStatus:'pending',
    paymentStatus:'pending',
    createdAt:now
  },{merge:true});
}
