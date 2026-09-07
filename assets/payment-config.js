/* JORON Central Payment Configuration — prepared for live gateway integration */
(function(){
  'use strict';
  const TIERS={
    lower:{registration:49,membership:{Basic:99,Standard:199,Premium:399,'Premium Plus':599}},
    middle:{registration:99,membership:{Basic:199,Standard:399,Premium:799,'Premium Plus':1199}},
    high:{registration:9.99,membership:{Basic:9.99,Standard:19.99,Premium:39.99,'Premium Plus':59.99}},
    other:{registration:9.99,membership:{Basic:9.99,Standard:19.99,Premium:39.99,'Premium Plus':59.99}}
  };
  const EXPAT_INCOME_BANDS={
    '0-1000':{label:'$0–$1,000',multiplier:0.5},
    '1001-2500':{label:'$1,001–$2,500',multiplier:0.75},
    '2501-5000':{label:'$2,501–$5,000',multiplier:1},
    '5001-10000':{label:'$5,001–$10,000',multiplier:1.5},
    '10000+':{label:'$10,000+',multiplier:2}
  };
  const C={
    BD:{name:'বাংলাদেশ',flag:'🇧🇩',currency:'BDT',symbol:'৳',tier:'lower',localLanguage:'bn'},IN:{name:'India',flag:'🇮🇳',currency:'INR',symbol:'₹',tier:'middle',localLanguage:'hi'},PK:{name:'Pakistan',flag:'🇵🇰',currency:'PKR',symbol:'₨',tier:'lower',localLanguage:'ur'},NP:{name:'Nepal',flag:'🇳🇵',currency:'NPR',symbol:'रु',tier:'lower',localLanguage:'ne'},LK:{name:'Sri Lanka',flag:'🇱🇰',currency:'LKR',symbol:'Rs',tier:'lower',localLanguage:'si'},ID:{name:'Indonesia',flag:'🇮🇩',currency:'IDR',symbol:'Rp',tier:'middle',localLanguage:'id'},MY:{name:'Malaysia',flag:'🇲🇾',currency:'MYR',symbol:'RM',tier:'middle',localLanguage:'ms'},TH:{name:'Thailand',flag:'🇹🇭',currency:'THB',symbol:'฿',tier:'middle',localLanguage:'th'},VN:{name:'Vietnam',flag:'🇻🇳',currency:'VND',symbol:'₫',tier:'middle',localLanguage:'vi'},SA:{name:'Saudi Arabia',flag:'🇸🇦',currency:'SAR',symbol:'﷼',tier:'high',localLanguage:'ar'},AE:{name:'United Arab Emirates',flag:'🇦🇪',currency:'AED',symbol:'د.إ',tier:'high',localLanguage:'ar'},QA:{name:'Qatar',flag:'🇶🇦',currency:'QAR',symbol:'﷼',tier:'high',localLanguage:'ar'},KW:{name:'Kuwait',flag:'🇰🇼',currency:'KWD',symbol:'د.ك',tier:'high',localLanguage:'ar'},OM:{name:'Oman',flag:'🇴🇲',currency:'OMR',symbol:'﷼',tier:'high',localLanguage:'ar'},GB:{name:'United Kingdom',flag:'🇬🇧',currency:'GBP',symbol:'£',tier:'high',localLanguage:'en'},US:{name:'United States',flag:'🇺🇸',currency:'USD',symbol:'$',tier:'high',localLanguage:'en'},CA:{name:'Canada',flag:'🇨🇦',currency:'CAD',symbol:'C$',tier:'high',localLanguage:'en'},AU:{name:'Australia',flag:'🇦🇺',currency:'AUD',symbol:'A$',tier:'high',localLanguage:'en'},FR:{name:'France',flag:'🇫🇷',currency:'EUR',symbol:'€',tier:'high',localLanguage:'fr'},DE:{name:'Germany',flag:'🇩🇪',currency:'EUR',symbol:'€',tier:'high',localLanguage:'de'},IT:{name:'Italy',flag:'🇮🇹',currency:'EUR',symbol:'€',tier:'high',localLanguage:'it'},ES:{name:'Spain',flag:'🇪🇸',currency:'EUR',symbol:'€',tier:'high',localLanguage:'es'},PT:{name:'Portugal',flag:'🇵🇹',currency:'EUR',symbol:'€',tier:'high',localLanguage:'pt'},NL:{name:'Netherlands',flag:'🇳🇱',currency:'EUR',symbol:'€',tier:'high',localLanguage:'nl'},BE:{name:'Belgium',flag:'🇧🇪',currency:'EUR',symbol:'€',tier:'high',localLanguage:'nl'},IE:{name:'Ireland',flag:'🇮🇪',currency:'EUR',symbol:'€',tier:'high',localLanguage:'en'},JP:{name:'Japan',flag:'🇯🇵',currency:'JPY',symbol:'¥',tier:'high',localLanguage:'ja'},CN:{name:'China',flag:'🇨🇳',currency:'CNY',symbol:'¥',tier:'middle',localLanguage:'zh'},KR:{name:'South Korea',flag:'🇰🇷',currency:'KRW',symbol:'₩',tier:'high',localLanguage:'ko'},TR:{name:'Turkey',flag:'🇹🇷',currency:'TRY',symbol:'₺',tier:'middle',localLanguage:'tr'},RU:{name:'Russia',flag:'🇷🇺',currency:'RUB',symbol:'₽',tier:'middle',localLanguage:'ru'},GR:{name:'Greece',flag:'🇬🇷',currency:'EUR',symbol:'€',tier:'high',localLanguage:'el'},IL:{name:'Israel',flag:'🇮🇱',currency:'ILS',symbol:'₪',tier:'high',localLanguage:'he'},SG:{name:'Singapore',flag:'🇸🇬',currency:'SGD',symbol:'S$',tier:'high',localLanguage:'en'},SE:{name:'Sweden',flag:'🇸🇪',currency:'SEK',symbol:'kr',tier:'high',localLanguage:'sv'},NO:{name:'Norway',flag:'🇳🇴',currency:'NOK',symbol:'kr',tier:'high',localLanguage:'no'},DK:{name:'Denmark',flag:'🇩🇰',currency:'DKK',symbol:'kr',tier:'high',localLanguage:'da'},FI:{name:'Finland',flag:'🇫🇮',currency:'EUR',symbol:'€',tier:'high',localLanguage:'fi'}
  };
  const DEMO={enabled:true,label:'Demo / Gateway not connected'};
  function country(code){return C[String(code||'BD').toUpperCase()]||{name:'Other',flag:'🌍',currency:'USD',symbol:'$',tier:'other',localLanguage:'en'};}
  function price(countryCode,plan){const c=country(countryCode),t=TIERS[c.tier]||TIERS.other;return Number((t.membership||{})[plan]??0);}
  function registrationFee(countryCode){const c=country(countryCode),t=TIERS[c.tier]||TIERS.other;return Number(t.registration||0);}
  function expatriateRegistrationFee(countryCode,incomeBand){const base=registrationFee(countryCode),band=EXPAT_INCOME_BANDS[incomeBand];return band?Number((base*band.multiplier).toFixed(2)):base;}
  function registrationQuote(countryCode,residencyType,incomeBand){const c=country(countryCode);const expat=residencyType==='expat-bangladeshi';const amount=expat?expatriateRegistrationFee(countryCode,incomeBand):registrationFee(countryCode);return {country:c.name,countryCode:String(countryCode||'BD').toUpperCase(),currency:c.currency,symbol:c.symbol,tier:c.tier,amount:Number(amount),residencyType:residencyType||'bangladeshi',incomeBand:expat?(incomeBand||null):null,language:c.localLanguage,demo:DEMO.enabled};}
  function quote(countryCode,plan){const c=country(countryCode);return {country:c.name,countryCode:String(countryCode||'BD').toUpperCase(),currency:c.currency,symbol:c.symbol,tier:c.tier,plan,amount:price(countryCode,plan),registrationFee:registrationFee(countryCode),language:c.localLanguage};}
  window.JORONPayment={countries:C,tiers:TIERS,expatIncomeBands:EXPAT_INCOME_BANDS,demo:DEMO,country,price,registrationFee,expatriateRegistrationFee,registrationQuote,quote};
})();

/* Signup opening gate: Country + Language first, then the registration form. */
(function(){
  'use strict';
  function initSignupGate(){
    const form=document.getElementById('signupForm');
    const country=document.getElementById('country');
    const language=document.getElementById('language');
    if(!form||!country||!language||document.getElementById('joronSignupGate'))return;

    const box=form.closest('.signup-box')||form.parentElement;
    const locationTitle=form.querySelector('.step-title');
    const countryLabel=form.querySelector('label[for="country"]');
    const languageLabel=form.querySelector('label[for="language"]');

    const gate=document.createElement('section');
    gate.id='joronSignupGate';
    gate.className='joron-signup-gate';
    gate.innerHTML='<div class="gate-icon">🌍</div><h2>আপনার যাত্রা শুরু করুন</h2><p>প্রথমে আপনার <strong>দেশ</strong> ও <strong>পছন্দের ভাষা</strong> নির্বাচন করুন। তারপর সহজ ধাপে Registration সম্পূর্ণ করুন।</p><div class="gate-fields"></div><div id="joronGateError" class="gate-error" role="alert"></div><button type="button" id="joronGateContinue" class="primary-btn gate-continue">✨ শুরু করুন</button>';
    box.insertBefore(gate,form);

    const fields=gate.querySelector('.gate-fields');
    if(locationTitle)fields.appendChild(locationTitle);
    if(countryLabel)fields.appendChild(countryLabel);
    fields.appendChild(country);
    if(languageLabel)fields.appendChild(languageLabel);
    fields.appendChild(language);

    const oldBar=box.querySelector('.joron-country-language');
    if(oldBar)oldBar.remove();

    const style=document.createElement('style');
    style.textContent='.joron-signup-gate{margin:8px 0 24px;padding:24px 20px;border:1px solid var(--gold-line);border-radius:22px;background:linear-gradient(145deg,#fffdf8,#fff8ea);box-shadow:0 12px 30px rgba(100,72,28,.08);text-align:center}.gate-icon{font-size:42px;line-height:1;margin-bottom:8px}.joron-signup-gate h2{margin:0;color:var(--gold-deep);font-size:25px}.joron-signup-gate>p{margin:9px auto 18px;max-width:500px;color:var(--muted);line-height:1.7;font-size:14px}.gate-fields{text-align:left}.gate-fields .step-title{margin-top:0}.gate-fields label.field-label{margin-top:13px}.gate-continue{width:100%;margin-top:16px;min-height:50px;font-size:16px}.gate-error{display:none;margin-top:12px;padding:10px 12px;border-radius:12px;background:#fff0f0;color:#a21b1b;font-size:13px;font-weight:700}.gate-error.show{display:block}.signup-box>#signupForm{display:none}.signup-box>#signupForm.gate-open{display:block}.signup-box>#signupForm.gate-open .step-title:first-child,.signup-box>#signupForm.gate-open label[for="country"],.signup-box>#signupForm.gate-open #country,.signup-box>#signupForm.gate-open label[for="language"],.signup-box>#signupForm.gate-open #language{display:none}@media(max-width:480px){.joron-signup-gate{padding:22px 15px}.joron-signup-gate h2{font-size:22px}.joron-signup-gate>p{font-size:13px}}';
    document.head.appendChild(style);

    function fillLanguages(){
      const map={BD:[['bn','বাংলা'],['en','English']],IN:[['hi','हिन्दी'],['en','English']],PK:[['ur','اردو'],['en','English']],NP:[['ne','नेपाली'],['en','English']],LK:[['si','සිංහල'],['en','English']],SA:[['ar','العربية'],['en','English']],AE:[['ar','العربية'],['en','English']],QA:[['ar','العربية'],['en','English']],KW:[['ar','العربية'],['en','English']],OM:[['ar','العربية'],['en','English']],GB:[['en','English']],US:[['en','English']],CA:[['en','English']],AU:[['en','English']],FR:[['fr','Français'],['en','English']],DE:[['de','Deutsch'],['en','English']],IT:[['it','Italiano'],['en','English']],ES:[['es','Español'],['en','English']],PT:[['pt','Português'],['en','English']],NL:[['nl','Nederlands'],['en','English']],IE:[['en','English']],JP:[['ja','日本語'],['en','English']],CN:[['zh','中文'],['en','English']],KR:[['ko','한국어'],['en','English']],TR:[['tr','Türkçe'],['en','English']],RU:[['ru','Русский'],['en','English']],ID:[['id','Bahasa Indonesia'],['en','English']],MY:[['ms','Bahasa Melayu'],['en','English']],TH:[['th','ไทย'],['en','English']],VN:[['vi','Tiếng Việt'],['en','English']],SG:[['en','English']],SE:[['sv','Svenska'],['en','English']],NO:[['no','Norsk'],['en','English']],DK:[['da','Dansk'],['en','English']],FI:[['fi','Suomi'],['en','English']],GR:[['el','Ελληνικά'],['en','English']],IL:[['he','עברית'],['en','English']]};
      const list=map[country.value]||[['en','English']];
      language.innerHTML='<option value="">ভাষা নির্বাচন করুন</option>';
      list.forEach(([code,label])=>{const o=document.createElement('option');o.value=code;o.textContent=label;language.appendChild(o);});
    }
    country.value='';
    language.innerHTML='<option value="">দেশ নির্বাচন করার পর ভাষা বেছে নিন</option>';
    country.addEventListener('change',fillLanguages);

    const err=gate.querySelector('#joronGateError');
    gate.querySelector('#joronGateContinue').addEventListener('click',function(){
      err.textContent='';err.classList.remove('show');
      if(!country.value){err.textContent='অনুগ্রহ করে আপনার দেশ নির্বাচন করুন।';err.classList.add('show');country.focus();return;}
      if(!language.value){err.textContent='অনুগ্রহ করে আপনার পছন্দের ভাষা নির্বাচন করুন।';err.classList.add('show');language.focus();return;}
      localStorage.setItem('joronCountry',country.value);
      localStorage.setItem('joronLanguage',language.value);
      document.documentElement.lang=language.value;
      gate.hidden=true;
      form.classList.add('gate-open');
      form.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initSignupGate,{once:true});else initSignupGate();
})();
