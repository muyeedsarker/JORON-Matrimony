import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app-check.js";
import {
  getAuth,onAuthStateChanged,signOut,signInWithEmailAndPassword,signInWithCustomToken,
  createUserWithEmailAndPassword,sendPasswordResetEmail,GoogleAuthProvider,FacebookAuthProvider,
  signInWithPopup,updateProfile,setPersistence,browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore,doc,getDoc,setDoc,updateDoc,serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app=initializeApp(firebaseConfig);
const RECAPTCHA_ENTERPRISE_KEY="6LfNZagtAAAAAJRvhigb-zsV9peE-JGZi1f-4GaD";
const appCheck=initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_KEY),isTokenAutoRefreshEnabled:true});
const auth=getAuth(app),db=getFirestore(app),storage=getStorage(app);
const googleProvider=new GoogleAuthProvider(),facebookProvider=new FacebookAuthProvider();
googleProvider.setCustomParameters({prompt:"select_account"});
const persistenceReady=setPersistence(auth,browserLocalPersistence);
const IDENTIFIER_API="https://us-central1-joron-d7742.cloudfunctions.net";

function createMemberId(uid){return `JRN-${String(uid).replace(/[^a-zA-Z0-9]/g,"").slice(0,10).toUpperCase()}`;}
async function ensureUserProfile(user,provider=null,extra={}){
  if(!user)throw new Error("ইউজার পাওয়া যায়নি");
  const ref=doc(db,"users",user.uid),snap=await getDoc(ref);
  if(snap.exists()){
    const existing=snap.data();
    if(!existing.memberId){const memberId=createMemberId(user.uid);await updateDoc(ref,{memberId});return {...existing,memberId};}
    return existing;
  }
  const data={uid:user.uid,memberId:createMemberId(user.uid),name:user.displayName||extra.name||"",email:user.email||extra.email||"",phone:user.phoneNumber||extra.phone||"",photoURL:user.photoURL||extra.photoURL||"",gender:extra.gender||"",provider:provider||user.providerData?.[0]?.providerId||"password",createdAt:serverTimestamp()};
  await setDoc(ref,data);return data;
}
async function identifierRequest(path,body){
  const response=await fetch(`${IDENTIFIER_API}/${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!response.ok)throw new Error("IDENTIFIER_SERVICE_ERROR");
  return response.json();
}
async function signInWithIdentifier(identifier,password){
  const result=await identifierRequest("loginWithIdentifier",{identifier,password});
  if(!result?.customToken)throw new Error("INVALID_CREDENTIALS");
  await persistenceReady;return signInWithCustomToken(auth,result.customToken);
}
async function resetPasswordWithIdentifier(identifier){return identifierRequest("passwordResetByIdentifier",{identifier});}
async function findLoginEmail(identifier){
  const value=String(identifier||"").trim();if(!value)throw new Error("LOGIN_IDENTIFIER_REQUIRED");
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return value.toLowerCase();
  throw new Error("LOGIN_IDENTIFIER_LOOKUP_MOVED_TO_BACKEND");
}
function friendlyAuthError(error){
  const code=error?.code||error?.message||"";
  const map={"auth/email-already-in-use":"এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে।","auth/invalid-email":"ইমেইল ঠিকানাটি সঠিক নয়।","auth/weak-password":"পাসওয়ার্ড আরও শক্তিশালী দিন (কমপক্ষে ৬ অক্ষর)।","auth/invalid-credential":"ইমেইল, Member ID/মোবাইল অথবা পাসওয়ার্ড সঠিক নয়।","auth/popup-closed-by-user":"লগইন উইন্ডো বন্ধ করা হয়েছে।","auth/popup-blocked":"ব্রাউজার popup বন্ধ করেছে। Popup অনুমতি দিন।","auth/account-exists-with-different-credential":"এই ইমেইলে অন্য একটি লগইন পদ্ধতির অ্যাকাউন্ট আছে।","auth/operation-not-allowed":"Firebase Console-এ এই Login Provider চালু করা হয়নি।","auth/unauthorized-domain":"এই ওয়েবসাইটের domain Firebase Authentication-এ অনুমোদিত নয়।","auth/network-request-failed":"ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।","auth/too-many-requests":"অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।","LOGIN_IDENTIFIER_REQUIRED":"Member ID, মোবাইল অথবা ইমেইল দিন।","LOGIN_IDENTIFIER_LOOKUP_MOVED_TO_BACKEND":"Member ID/মোবাইল লগইনের জন্য নিরাপদ সার্ভিস ব্যবহার করুন।","INVALID_CREDENTIALS":"Member ID/মোবাইল/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।","IDENTIFIER_SERVICE_ERROR":"লগইন সার্ভিসে সাময়িক সমস্যা হয়েছে। আবার চেষ্টা করুন।"};
  return map[code]||"লগইন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।";
}
function safeLoginNext(){
  const raw=typeof window!=="undefined"?window.JORON_LOGIN_NEXT:null;
  if(!raw)return "biodata.html";
  try{
    const value=String(raw);if(!value||value.startsWith("//")||value.includes("..")||/^[a-z][a-z0-9+.-]*:/i.test(value))return "biodata.html";
    return value;
  }catch{return "biodata.html";}
}
function finishLogin(){location.replace(safeLoginNext());}
async function loginWithProvider(provider,label,msgEl){
  if(msgEl)msgEl.textContent=`⏳ ${label} দিয়ে লগইন হচ্ছে...`;
  try{await persistenceReady;const result=await signInWithPopup(auth,provider);await ensureUserProfile(result.user,provider===googleProvider?"google.com":"facebook.com");if(msgEl)msgEl.textContent="✅ লগইন সফল হচ্ছে...";setTimeout(finishLogin,250);}
  catch(error){if(msgEl)msgEl.textContent=`❌ ${friendlyAuthError(error)}`;console.error("JORON OAuth login error:",error);}
}
function wireLoginPage(){
  const googleBtn=document.getElementById("googleBtn"),facebookBtn=document.getElementById("facebookBtn"),msg=document.getElementById("msg"),form=document.getElementById("emailForm"),identifierInput=document.getElementById("email"),passwordInput=document.getElementById("password"),forgotBtn=document.getElementById("forgot");
  if(!googleBtn&&!facebookBtn&&!form)return;
  document.title="JORON — Login";
  if(identifierInput){identifierInput.type="text";identifierInput.inputMode="text";identifierInput.placeholder="Member ID / মোবাইল / ইমেইল";}
  const label=form?.querySelector('label[for="email"]')||form?.querySelector("label");if(label)label.textContent="📧 Member ID / Mobile / Email";
  if(googleBtn&&!googleBtn.dataset.joronWired){googleBtn.dataset.joronWired="1";googleBtn.onclick=()=>loginWithProvider(googleProvider,"Google",msg);}
  if(facebookBtn&&!facebookBtn.dataset.joronWired){facebookBtn.dataset.joronWired="1";facebookBtn.onclick=()=>loginWithProvider(facebookProvider,"Facebook",msg);}
  if(form&&!form.dataset.joronIdentifierWired){
    form.dataset.joronIdentifierWired="1";form.addEventListener("submit",async event=>{event.preventDefault();event.stopImmediatePropagation();const identifier=identifierInput?.value.trim()||"",password=passwordInput?.value||"";if(!identifier||!password)return msg.textContent="Member ID, মোবাইল/ইমেইল এবং পাসওয়ার্ড দিন।";try{msg.textContent="⏳ লগইন হচ্ছে...";await signInWithIdentifier(identifier,password);msg.textContent="✅ লগইন সফল হচ্ছে...";setTimeout(finishLogin,500);}catch(error){msg.textContent=`❌ ${friendlyAuthError(error)}`;console.error("JORON identifier login error:",error);}});
  }
  if(forgotBtn&&!forgotBtn.dataset.joronResetWired){forgotBtn.dataset.joronResetWired="1";forgotBtn.onclick=async()=>{const identifier=identifierInput?.value.trim()||"";if(!identifier)return msg.textContent="আগে Member ID, মোবাইল অথবা ইমেইল লিখুন।";try{msg.textContent="⏳ রিসেট লিংক পাঠানো হচ্ছে...";await resetPasswordWithIdentifier(identifier);msg.textContent="✅ যদি অ্যাকাউন্টটি থাকে, রিসেট লিংক ইমেইলে পাঠানো হয়েছে।";}catch(error){msg.textContent=`❌ ${friendlyAuthError(error)}`;}};}
}
if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",wireLoginPage,{once:true});else wireLoginPage();}
export {app,appCheck,auth,db,storage,onAuthStateChanged,signOut,signInWithEmailAndPassword,signInWithCustomToken,createUserWithEmailAndPassword,sendPasswordResetEmail,GoogleAuthProvider,FacebookAuthProvider,googleProvider,facebookProvider,signInWithPopup,updateProfile,ensureUserProfile,findLoginEmail,signInWithIdentifier,resetPasswordWithIdentifier,persistenceReady,friendlyAuthError};