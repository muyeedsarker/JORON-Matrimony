/* JORON Onboarding 8-Step language pack — BN / EN / HI */
(function(){
  const KEY='joronLanguage', supported=['bn','en','hi'];
  const M={
    'MATRIMONY':{en:'MATRIMONY',hi:'विवाह'},'সম্পর্ক জুড়ে দেয় জোড়ন ❤️':{en:'JORON connects relationships ❤️',hi:'JORON रिश्ते जोड़ता है ❤️'},
    'কার জন্য':{en:'For',hi:'किसके लिए'},'দেশ':{en:'Country',hi:'देश'},'ভাষা':{en:'Language',hi:'भाषा'},'আপনি':{en:'You',hi:'आप'},'ধর্ম':{en:'Religion',hi:'धर्म'},'ঠিকানা':{en:'Address',hi:'पता'},'পছন্দ':{en:'Preferences',hi:'पसंद'},'শেষ':{en:'Finish',hi:'समाप्त'},
    '👤 কার জন্য Profile তৈরি করছেন?':{en:'👤 Who are you creating this Profile for?',hi:'👤 यह Profile किसके लिए बना रहे हैं?'},'একটি নির্বাচন করুন। Next চাপলে পরের প্রশ্ন আসবে।':{en:'Choose one. Press Next to continue to the next question.',hi:'एक विकल्प चुनें। Next दबाकर अगले प्रश्न पर जाएँ।'},'✓ এই তথ্য Smart Biodata-তে দ্বিতীয়বার লিখতে হবে না।':{en:'✓ You will not need to enter this information again in Smart Biodata.',hi:'✓ यह जानकारी Smart Biodata में दोबारा दर्ज नहीं करनी होगी।'},
    '🌍 কোন দেশে?':{en:'🌍 Which country?',hi:'🌍 कौन सा देश?'},'ফোনের ভাষা ও সময় অঞ্চল দেখে দেশ অটো-সিলেক্ট করা হবে।':{en:'The country will be auto-selected using your phone language and time zone.',hi:'आपकी फोन भाषा और समय क्षेत्र के आधार पर देश अपने-आप चुना जाएगा।'},'⚡ Smart Auto Detect':{en:'⚡ Smart Auto Detect',hi:'⚡ स्मार्ट ऑटो डिटेक्ट'},
    '🗣️ ভাষা ও Mother Tongue':{en:'🗣️ Language & Mother Tongue',hi:'🗣️ भाषा और मातृभाषा'},'Mother Tongue':{en:'Mother Tongue',hi:'मातृभाषा'},'✓ দেশ বদলালে ভাষা ও Mother Tongue-এর প্রাথমিক মান অটো বদলাবে।':{en:'✓ Changing country will automatically update the initial language and mother tongue.',hi:'✓ देश बदलने पर भाषा और मातृभाषा का प्रारंभिक मान अपने-आप बदल जाएगा।'},
    '👫 আপনার Gender':{en:'👫 Your Gender',hi:'👫 आपका लिंग'},'পুরুষ':{en:'Male',hi:'पुरुष'},'নারী':{en:'Female',hi:'महिला'},'⚙️ Partner Gender অটো হবে':{en:'⚙️ Partner Gender will be set automatically',hi:'⚙️ Partner Gender अपने-आप सेट होगा'},
    '🕌 ধর্ম ও Community':{en:'🕌 Religion & Community',hi:'🕌 धर्म और Community'},'ধর্ম নির্বাচন করুন':{en:'Select religion',hi:'धर्म चुनें'},'Community / মত':{en:'Community / School of thought',hi:'Community / मत'},'আগে ধর্ম নির্বাচন করুন':{en:'Select religion first',hi:'पहले धर्म चुनें'},'✓ ধর্ম বদলালে Community তালিকা অটো বদলাবে।':{en:'✓ Changing religion will automatically update the Community list.',hi:'✓ धर्म बदलने पर Community सूची अपने-आप अपडेट होगी।'},
    '📍 আপনার ঠিকানা':{en:'📍 Your Address',hi:'📍 आपका पता'},'বিভাগ':{en:'Division',hi:'विभाग'},'বিভাগ নির্বাচন করুন':{en:'Select division',hi:'विभाग चुनें'},'আগে বিভাগ নির্বাচন করুন':{en:'Select division first',hi:'पहले विभाग चुनें'},'জেলা নির্বাচন করুন':{en:'Select district',hi:'जिला चुनें'},
    '❤️ জীবনসঙ্গীর পছন্দ':{en:'❤️ Partner Preferences',hi:'❤️ जीवनसाथी की पसंद'},'এগুলো Smart Biodata-এর একই preference field-এ যাবে। পরে এখানে বা Smart Biodata-তে পরিবর্তন করলে একই তথ্য রাখা হবে।':{en:'These will use the same preference fields as Smart Biodata. Changes here or in Smart Biodata stay synchronized.',hi:'ये Smart Biodata के उन्हीं preference fields में जाएँगे। यहाँ या Smart Biodata में बदलाव करने पर जानकारी समान रहेगी।'},
    'Partner Gender':{en:'Partner Gender',hi:'Partner Gender'},'অটো নির্বাচন':{en:'Auto select',hi:'ऑटो चयन'},'বয়স — সর্বনিম্ন':{en:'Age — Minimum',hi:'उम्र — न्यूनतम'},'বয়স — সর্বোচ্চ':{en:'Age — Maximum',hi:'उम्र — अधिकतम'},'Partner Religion':{en:'Partner Religion',hi:'Partner Religion'},'যেকোনো ধর্ম':{en:'Any religion',hi:'कोई भी धर्म'},'Partner Community':{en:'Partner Community',hi:'Partner Community'},'যেকোনো Community':{en:'Any Community',hi:'कोई भी Community'},'Partner District':{en:'Partner District',hi:'Partner District'},'যেকোনো জেলা':{en:'Any district',hi:'कोई भी जिला'},'Partner Education':{en:'Partner Education',hi:'Partner Education'},'যেকোনো শিক্ষা':{en:'Any education',hi:'Any education'},
    'JORON Matrimony প্রস্তুত!':{en:'JORON Matrimony is ready!',hi:'JORON Matrimony तैयार है!'},'আপনার Onboarding তথ্য সংরক্ষিত। এখন Smart Biodata-তে বাকি তথ্য এক ধাপ করে পূরণ করুন।':{en:'Your onboarding information is saved. Now complete the remaining details step by step in Smart Biodata.',hi:'आपकी onboarding जानकारी सेव हो गई है। अब Smart Biodata में बाकी जानकारी चरण-दर-चरण भरें।'},'📝 Smart Biodata শুরু করুন':{en:'📝 Start Smart Biodata',hi:'📝 Smart Biodata शुरू करें'},'❤️ Matching দেখুন':{en:'❤️ View Matching',hi:'❤️ Matching देखें'},
    '← পিছনে':{en:'← Back',hi:'← पीछे'},'পরের ধাপ →':{en:'Next →',hi:'अगला →'},'শেষ করুন →':{en:'Finish →',hi:'समाप्त →'},
    'নিজের জন্য':{en:'Myself',hi:'स्वयं'},'ছেলের জন্য':{en:'Son',hi:'बेटा'},'মেয়ের জন্য':{en:'Daughter',hi:'बेटी'},'ভাইয়ের জন্য':{en:'Brother',hi:'भाई'},'বোনের জন্য':{en:'Sister',hi:'बहन'},'বন্ধুর জন্য':{en:'Friend',hi:'मित्र'},'আত্মীয়ের জন্য':{en:'Relative',hi:'रिश्तेदार'}
  };
  const originals=new WeakMap();
  function lang(){const x=localStorage.getItem(KEY);return supported.includes(x)?x:'bn';}
  function tr(base,l){return l==='bn'?base:(M[base]&&M[base][l])||base;}
  function apply(){
    const l=lang();
    document.querySelectorAll('.step,h1,p,.hint,.auto,.field label,.actions button,.finish a,.brand small,.tag').forEach(el=>{if(!originals.has(el))originals.set(el,el.textContent.trim());el.textContent=tr(originals.get(el),l);});
    document.querySelectorAll('select option').forEach(el=>{if(!originals.has(el))originals.set(el,el.textContent.trim());el.textContent=tr(originals.get(el),l);});
    document.querySelectorAll('input[placeholder]').forEach(el=>{if(!originals.has(el))originals.set(el,el.getAttribute('placeholder'));el.setAttribute('placeholder',tr(originals.get(el),l));});
    document.querySelectorAll('.choice').forEach(el=>{if(!originals.has(el))originals.set(el,el.textContent.trim());el.textContent=tr(originals.get(el),l);});
  }
  function init(){apply();setInterval(apply,500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

  /* Security gate: Smart Profile Setup is available only after Firebase sign-in. */
  (async function(){
    try{
      const {auth}=await import('../assets/firebase-client.js');
      const {onAuthStateChanged}=await import('https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js');
      onAuthStateChanged(auth,user=>{
        if(!user){
          sessionStorage.setItem('joronReturnAfterLogin','onboarding-v4.html');
          location.replace('login.html?next='+encodeURIComponent('onboarding-v4.html'));
        }
      });
    }catch(err){
      console.error('JORON onboarding auth guard error:',err);
    }
  })();
})();
