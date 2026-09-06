/* JORON Country → Language selector. Country controls the available language choices. */
(function(){
  const COUNTRY_KEY='joronCountry';
  const LANG_KEY='joronLanguage';
  const COUNTRIES=[
    ['BD','🇧🇩','বাংলাদেশ',['bn','en']],
    ['IN','🇮🇳','ভারত',['hi','en']],
    ['US','🇺🇸','United States',['en']],
    ['GB','🇬🇧','United Kingdom',['en']],
    ['CA','🇨🇦','Canada',['en']],
    ['AU','🇦🇺','Australia',['en']],
    ['AE','🇦🇪','United Arab Emirates',['en']],
    ['SA','🇸🇦','Saudi Arabia',['en']],
    ['PK','🇵🇰','Pakistan',['en']],
    ['MY','🇲🇾','Malaysia',['en']],
    ['SG','🇸🇬','Singapore',['en']],
    ['QA','🇶🇦','Qatar',['en']],
    ['OM','🇴🇲','Oman',['en']],
    ['KW','🇰🇼','Kuwait',['en']],
    ['IT','🇮🇹','Italy',['en']],
    ['DE','🇩🇪','Germany',['en']],
    ['FR','🇫🇷','France',['en']],
    ['OTHER','🌍','Other',['en']]
  ];
  const LANGS={bn:['🇧🇩','বাংলা'],en:['🇬🇧','English'],hi:['🇮🇳','हिन्दी']};
  const countryMap=Object.fromEntries(COUNTRIES.map(x=>[x[0],x]));
  const countryLangs=c=>countryMap[c]?.[3]||['en'];
  function currentCountry(){return localStorage.getItem(COUNTRY_KEY)||'BD';}
  function currentLang(){return window.JORONLanguage?.getLanguage?.()||localStorage.getItem(LANG_KEY)||'bn';}
  function applyCountry(c, preserve=true){
    if(!countryMap[c]) c='BD';
    localStorage.setItem(COUNTRY_KEY,c);
    const allowed=countryLangs(c), old=currentLang();
    const lang=preserve&&allowed.includes(old)?old:allowed[0];
    localStorage.setItem(LANG_KEY,lang);
    if(window.JORONLanguage?.setLanguage) window.JORONLanguage.setLanguage(lang);
    document.documentElement.dataset.joronCountry=c;
    document.querySelectorAll('[data-joron-country-select]').forEach(s=>s.value=c);
    renderLanguages();
  }
  function renderLanguages(){
    const allowed=countryLangs(currentCountry()), selected=currentLang();
    document.querySelectorAll('[data-joron-language-select]').forEach(s=>{
      s.innerHTML='';
      allowed.forEach(code=>{const o=document.createElement('option');o.value=code;o.textContent=LANGS[code][0]+' '+LANGS[code][1];o.selected=code===selected;s.appendChild(o);});
    });
  }
  function style(){
    if(document.getElementById('joron-country-language-style'))return;
    const s=document.createElement('style');s.id='joron-country-language-style';s.textContent=`
      .joron-country-language{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:0 auto 12px;padding:8px 10px;border:1px solid rgba(104,65,132,.16);border-radius:16px;background:rgba(255,255,255,.96);box-shadow:0 5px 18px rgba(54,27,72,.08);max-width:760px;position:relative;z-index:50}
      .joron-country-language label{font:800 11px/1.2 system-ui,sans-serif;color:#51395e;display:flex;align-items:center;gap:5px}
      .joron-country-language select{min-height:34px;border:1px solid rgba(104,65,132,.22);border-radius:10px;padding:5px 9px;background:#fff;color:#382743;font:700 12px/1.2 system-ui,sans-serif;outline:none}
      .joron-country-language select:focus{border-color:#8b5aa8;box-shadow:0 0 0 3px rgba(139,90,168,.10)}
      @media(max-width:520px){.joron-country-language{gap:5px;padding:7px;margin-left:8px;margin-right:8px}.joron-country-language label{font-size:10px}.joron-country-language select{font-size:11px;min-height:32px;padding:4px 7px;max-width:145px}}
    `;document.head.appendChild(s);
  }
  function mount(){
    if(document.querySelector('.joron-country-language')){renderLanguages();return;}
    const box=document.createElement('div');box.className='joron-country-language';box.setAttribute('aria-label','Country and language selection');
    box.innerHTML='<label>🌍 দেশ <select data-joron-country-select aria-label="দেশ নির্বাচন"></select></label><label>🗣️ ভাষা <select data-joron-language-select aria-label="ভাষা নির্বাচন"></select></label>';
    const pageTop=document.body.firstElementChild;
    if(pageTop) pageTop.parentNode.insertBefore(box,pageTop); else document.body.prepend(box);
    const cs=box.querySelector('[data-joron-country-select]');
    COUNTRIES.forEach(([code,flag,name])=>{const o=document.createElement('option');o.value=code;o.textContent=flag+' '+name;cs.appendChild(o);});
    cs.value=currentCountry();
    cs.addEventListener('change',()=>applyCountry(cs.value,false));
    box.querySelector('[data-joron-language-select]').addEventListener('change',e=>{const l=e.target.value;localStorage.setItem(LANG_KEY,l);window.JORONLanguage?.setLanguage?.(l);});
    renderLanguages();
  }
  function init(){style();applyCountry(currentCountry(),true);mount();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.JORONCountryLanguage={applyCountry,currentCountry,currentLang,countries:COUNTRIES};
})();
