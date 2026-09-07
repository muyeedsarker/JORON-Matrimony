/* JORON Smart Biodata ← Onboarding handoff.
   Prefills only empty fields, so an existing saved/editing value always wins. */
(() => {
  const KEY = 'joronOnboarding';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; } };
  const setIfEmpty = (id, value) => {
    const el = document.getElementById(id);
    if (!el || value === undefined || value === null || value === '') return;
    if (String(el.value || '').trim()) return;
    if (el.tagName === 'SELECT') {
      const v = String(value);
      const option = [...el.options].find(o => String(o.value) === v || String(o.textContent).trim() === v);
      if (!option) return;
      el.value = option.value;
    } else el.value = String(value);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const country = {
    BD:'বাংলাদেশ', IN:'ভারত', PK:'পাকিস্তান', SA:'সৌদি আরব', AE:'সংযুক্ত আরব আমিরাত',
    QA:'কাতার', KW:'কুয়েত', OM:'ওমান', GB:'যুক্তরাজ্য', US:'যুক্তরাষ্ট্র', CA:'কানাডা',
    AU:'অস্ট্রেলিয়া', MY:'মালয়েশিয়া', SG:'সিঙ্গাপুর', IT:'ইতালি', DE:'জার্মানি', FR:'ফ্রান্স', OTHER:'অন্যান্য'
  };
  const map = () => {
    const o = read();
    setIfEmpty('country', country[o.country] || o.country);
    setIfEmpty('gender', o.gender);
    setIfEmpty('nationality', o.nationality || (country[o.country] ? ({BD:'বাংলাদেশি',IN:'ভারতীয়',PK:'পাকিস্তানি',SA:'সৌদি আরবের',AE:'সংযুক্ত আরব আমিরাতের',GB:'ব্রিটিশ',US:'আমেরিকান',CA:'কানাডিয়ান',AU:'অস্ট্রেলিয়ান',MY:'মালয়েশীয়'}[o.country]) : ''));
    setIfEmpty('language', o.language);
    setIfEmpty('religion', o.religion);
    setIfEmpty('division', o.division);
    setIfEmpty('district', o.district);
    setIfEmpty('partnerGender', o.partnerGender);
    setIfEmpty('partnerAgeMin', o.partnerAgeMin);
    setIfEmpty('partnerAgeMax', o.partnerAgeMax);
    setIfEmpty('partnerReligion', o.partnerReligion);
    setIfEmpty('partnerCommunity', o.partnerCommunity);
    setIfEmpty('prefDistrict', o.partnerDistrict);
    const profileFor = document.getElementById('profileFor');
    if (profileFor && !String(profileFor.value || '').trim() && o.profileFor) {
      profileFor.value = o.profileFor;
      profileFor.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', map, { once:true });
  else map();
  window.addEventListener('joron:onboarding-ready', map);
})();
