/* JORON Global Country → Language selector. Every country offers its primary/local language + English. */
(function(){
  const COUNTRY_KEY='joronCountry', LANG_KEY='joronLanguage';
  const COUNTRIES=[
    ['BD','🇧🇩','বাংলাদেশ',['bn','en']],['IN','🇮🇳','ভারত',['hi','en']],['PK','🇵🇰','Pakistan',['ur','en']],
    ['SA','🇸🇦','Saudi Arabia',['ar','en']],['AE','🇦🇪','United Arab Emirates',['ar','en']],['EG','🇪🇬','Egypt',['ar','en']],
    ['FR','🇫🇷','France',['fr','en']],['DE','🇩🇪','Germany',['de','en']],['IT','🇮🇹','Italy',['it','en']],
    ['ES','🇪🇸','Spain',['es','en']],['PT','🇵🇹','Portugal',['pt','en']],['JP','🇯🇵','Japan',['ja','en']],
    ['CN','🇨🇳','China',['zh','en']],['KR','🇰🇷','South Korea',['ko','en']],['TR','🇹🇷','Turkey',['tr','en']],
    ['RU','🇷🇺','Russia',['ru','en']],['ID','🇮🇩','Indonesia',['id','en']],['MY','🇲🇾','Malaysia',['ms','en']],
    ['TH','🇹🇭','Thailand',['th','en']],['VN','🇻🇳','Vietnam',['vi','en']],['NL','🇳🇱','Netherlands',['nl','en']],
    ['SE','🇸🇪','Sweden',['sv','en']],['NO','🇳🇴','Norway',['no','en']],['DK','🇩🇰','Denmark',['da','en']],
    ['FI','🇫🇮','Finland',['fi','en']],['GR','🇬🇷','Greece',['el','en']],['IL','🇮🇱','Israel',['he','en']],
    ['US','🇺🇸','United States',['en']],['GB','🇬🇧','United Kingdom',['en']],['CA','🇨🇦','Canada',['en']],['AU','🇦🇺','Australia',['en']],
    ['SG','🇸🇬','Singapore',['en']],['QA','🇶🇦','Qatar',['ar','en']],['OM','🇴🇲','Oman',['ar','en']],['KW','🇰🇼','Kuwait',['ar','en']],
    ['OTHER','🌍','Other country',['en']]
  ];
  const LANGS={bn:['🇧🇩','বাংলা'],en:['🇬🇧','English'],hi:['🇮🇳','हिन्दी'],ur:['🇵🇰','اردو'],ar:['🇸🇦','العربية'],fr:['🇫🇷','Français'],de:['🇩🇪','Deutsch'],it:['🇮🇹','Italiano'],es:['🇪🇸','Español'],pt:['🇵🇹','Português'],ja:['🇯🇵','日本語'],zh:['🇨🇳','中文'],ko:['🇰🇷','한국어'],tr:['🇹🇷','Türkçe'],ru:['🇷🇺','Русский'],id:['🇮🇩','Bahasa Indonesia'],ms:['🇲🇾','Bahasa Melayu'],th:['🇹🇭','ไทย'],vi:['🇻🇳','Tiếng Việt'],nl:['🇳🇱','Nederlands'],sv:['🇸🇪','Svenska'],no:['🇳🇴','Norsk'],da:['🇩🇰','Dansk'],fi:['🇫🇮','Suomi'],el:['🇬🇷','Ελληνικά'],he:['🇮🇱','עברית']};
  const map=Object.fromEntries(COUNTRIES.map(x=>[x[0],x]));
  function allowed(c){return map[c]?.[3]||['en'];}
  function country(){return localStorage.getItem(COUNTRY_KEY)||'BD';}
  function language(){return window.JORONLanguage?.getLanguage?.()||localStorage.getItem(LANG_KEY)||'bn';}
  function setCountry(c){if(!map[c])c='BD';localStorage.setItem(COUNTRY_KEY,c);const a=allowed(c),current=language(),l=a.includes(current)?current:a[0];localStorage.setItem(LANG_KEY,l);window.JORONLanguage?.setLanguage?.(l);document.documentElement.dataset.joronCountry=c;render();}
  function render(){const c=country(),a=allowed(c),l=language();document.querySelectorAll('[data-joron-country-select]').forEach(s=>s.value=c);document.querySelectorAll('[data-joron-language-select]').forEach(s=>{s.innerHTML='';a.forEach(code=>{const o=document.createElement('option');o.value=code;o.textContent=(LANGS[code]?.[0]||'🌐')+' '+(LANGS[code]?.[1]||code);o.selected=code===l;s.appendChild(o);});});}
  function style(){if(document.getElementById('joron-country-language-style'))return;const s=document.createElement('style');s.id='joron-country-language-style';s.textContent='.joron-country-language{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:0 auto 12px;padding:8px 10px;border:1px solid rgba(104,65,132,.16);border-radius:16px;background:rgba(255,255,255,.96);box-shadow:0 5px 18px rgba(54,27,72,.08);max-width:820px;position:relative;z-index:50}.joron-country-language label{font:800 11px/1.2 system-ui,sans-serif;color:#51395e;display:flex;align-items:center;gap:5px}.joron-country-language select{min-height:34px;border:1px solid rgba(104,65,132,.22);border-radius:10px;padding:5px 9px;background:#fff;color:#382743;font:700 12px/1.2 system-ui,sans-serif;outline:none;max-width:240px}@media(max-width:520px){.joron-country-language{gap:5px;padding:7px;margin-left:8px;margin-right:8px}.joron-country-language select{font-size:11px;min-height:32px;padding:4px 7px;max-width:150px}}';document.head.appendChild(s);}
  function mount(){if(document.querySelector('.joron-country-language')){render();return;}const b=document.createElement('div');b.className='joron-country-language';b.innerHTML='<label>🌍 দেশ <select data-joron-country-select aria-label="দেশ নির্বাচন"></select></label><label>🗣️ ভাষা <select data-joron-language-select aria-label="ভাষা নির্বাচন"></select></label>';const first=document.body.firstElementChild;if(first)first.parentNode.insertBefore(b,first);else document.body.prepend(b);const cs=b.querySelector('[data-joron-country-select]');COUNTRIES.forEach(([c,f,n])=>{const o=document.createElement('option');o.value=c;o.textContent=f+' '+n;cs.appendChild(o);});cs.addEventListener('change',()=>setCountry(cs.value));b.querySelector('[data-joron-language-select]').addEventListener('change',e=>{const l=e.target.value;localStorage.setItem(LANG_KEY,l);window.JORONLanguage?.setLanguage?.(l);render();});render();}
  function init(){style();setCountry(country());mount();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.JORONCountryLanguage={setCountry,country,language,countries:COUNTRIES,languages:LANGS};
})();
