import { db, auth } from "./firebase-client.js";
import { collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

function uid(){const id=auth.currentUser?.uid;if(!id)throw new Error("Authentication required");return id;}

export async function getInterest(profileId){const fromUserId=uid();if(!profileId||profileId===fromUserId)return null;const snap=await getDoc(doc(db,"interests",`${fromUserId}_${profileId}`));return snap.exists()?{id:snap.id,...snap.data()}:null;}

export async function likeProfile(profileId){const fromUserId=uid();if(!profileId||profileId===fromUserId)throw new Error("Invalid profile");const ref=doc(db,"interests",`${fromUserId}_${profileId}`);const existing=await getDoc(ref);if(existing.exists()){const status=existing.data().status;if(["pending","accepted"].includes(status))return {id:existing.id,status};}
await setDoc(ref,{fromUserId,profileId,status:"pending",createdAt:existing.exists()&&existing.data().createdAt?existing.data().createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});return {id:ref.id,status:"pending"};}

export async function removeLike(profileId){const fromUserId=uid();if(!profileId||profileId===fromUserId)return;await deleteDoc(doc(db,"interests",`${fromUserId}_${profileId}`));}
export async function getOutgoingInterests(){const fromUserId=uid();const snap=await getDocs(query(collection(db,"interests"),where("fromUserId","==",fromUserId)));return snap.docs.map(d=>({id:d.id,...d.data()}));}
export async function getIncomingInterests(){const profileId=uid();const snap=await getDocs(query(collection(db,"interests"),where("profileId","==",profileId)));return snap.docs.map(d=>({id:d.id,...d.data()}));}
export async function respondToInterest(interestId,status){const profileId=uid();if(!["accepted","rejected"].includes(status))throw new Error("Invalid interest status");const ref=doc(db,"interests",interestId);const snap=await getDoc(ref);if(!snap.exists()||snap.data().profileId!==profileId)throw new Error("Unauthorized interest update");await updateDoc(ref,{status,updatedAt:serverTimestamp()});}
export async function getMutualInterestIds(){const me=uid();const[outgoing,incoming]=await Promise.all([getOutgoingInterests(),getIncomingInterests()]);const accepted=new Set(outgoing.filter(x=>x.status==="accepted").map(x=>x.profileId));return incoming.filter(x=>x.status==="accepted"&&accepted.has(x.fromUserId)).map(x=>x.fromUserId);}
