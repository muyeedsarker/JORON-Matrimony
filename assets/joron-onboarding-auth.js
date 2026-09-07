/* JORON — authenticated onboarding bridge.
   Keeps the onboarding wizard tied to the Firebase user and persists its
   localStorage state to users/{uid} when the wizard reaches the finish step. */
import {auth,db,onAuthStateChanged} from './firebase-client.js';
import {doc,updateDoc} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const KEY='joronOnboarding';
const readState=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{return{};}};
const safeNext=()=>{const raw=new URLSearchParams(location.search).get('next');return raw&&/^(?!\/\/)(?![a-z][a-z0-9+.-]*:)[^\s]*$/i.test(raw)&&!raw.includes('..')?raw:null;};

onAuthStateChanged(auth,user=>{
  if(user)return;
  const next=encodeURIComponent('biodata.html');
  location.replace(`login.html?next=${next}`);
});

let synced=false;
async function syncFinishedOnboarding(){
  if(synced||!auth.currentUser)return;
  const state=readState();
  if(Number(state.onboardingStep)!==8)return;
  const data={
    onboardingCompleted:true,
    onboardingStep:8,
    profileFor:state.profileFor||null,
    country:state.country||null,
    preferredLanguage:state.language||null,
    motherTongue:state.motherTongue||null,
    gender:state.gender||null,
    religion:state.religion||null,
    community:state.community||null,
    division:state.division||null,
    district:state.district||null,
    partnerGender:state.partnerGender||null,
    partnerAgeMin:state.partnerAgeMin||null,
    partnerAgeMax:state.partnerAgeMax||null,
    partnerReligion:state.partnerReligion||null,
    partnerCommunity:state.partnerCommunity||null,
    partnerDistrict:state.partnerDistrict||null,
    partnerEducation:state.partnerEducation||null
  };
  try{await updateDoc(doc(db,'users',auth.currentUser.uid),data);synced=true;}
  catch(error){console.error('JORON onboarding sync failed:',error);}
}

const finishScreen=document.querySelector('.screen.finish[data-s="8"]');
if(finishScreen)new MutationObserver(syncFinishedOnboarding).observe(finishScreen,{attributes:true,attributeFilter:['class']});
window.addEventListener('storage',syncFinishedOnboarding);
setTimeout(syncFinishedOnboarding,1200);
void safeNext;
