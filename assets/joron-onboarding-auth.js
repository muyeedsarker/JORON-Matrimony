/* JORON — authenticated onboarding bridge.
   Keeps the onboarding wizard tied to the Firebase user and persists its
   localStorage state to users/{uid} when the wizard reaches the finish step. */
import {auth,db,onAuthStateChanged} from './firebase-client.js';
import {doc,setDoc} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const KEY='joronOnboarding';
const readState=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{return{};}};

onAuthStateChanged(auth,user=>{
  if(user)return;
  location.replace('login.html?next='+encodeURIComponent('biodata.html'));
});

let synced=false;
async function syncFinishedOnboarding(){
  if(synced||!auth.currentUser)return;
  const state=readState();
  if(Number(state.onboardingStep)!==8)return;
  const data={
    onboardingCompleted:true,onboardingStep:8,
    profileFor:state.profileFor||null,country:state.country||null,
    preferredLanguage:state.language||null,motherTongue:state.motherTongue||null,
    gender:state.gender||null,religion:state.religion||null,community:state.community||null,
    division:state.division||null,district:state.district||null,
    partnerGender:state.partnerGender||null,partnerAgeMin:state.partnerAgeMin||null,
    partnerAgeMax:state.partnerAgeMax||null,partnerReligion:state.partnerReligion||null,
    partnerCommunity:state.partnerCommunity||null,partnerDistrict:state.partnerDistrict||null,
    partnerEducation:state.partnerEducation||null
  };
  try{await setDoc(doc(db,'users',auth.currentUser.uid),data,{merge:true});synced=true;}
  catch(error){console.error('JORON onboarding sync failed:',error);}
}

const finishScreen=document.querySelector('.screen.finish[data-s="8"]');
if(finishScreen)new MutationObserver(syncFinishedOnboarding).observe(finishScreen,{attributes:true,attributeFilter:['class']});
window.addEventListener('storage',syncFinishedOnboarding);
setTimeout(syncFinishedOnboarding,1200);
