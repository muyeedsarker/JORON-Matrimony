// JORON Magic Features — keep Country/Language selection only on the first registration/onboarding flow.
(function(){
  'use strict';
  const blocked = /^(country|language|কান্ট্রি|দেশ|ভাষা|language select|country select)$/i;
  const normalize = s => String(s || '').replace(/\s+/g,' ').trim();
  function clean(){
    document.querySelectorAll('.magic').forEach(card => {
      const label = normalize(card.querySelector('strong')?.textContent);
      const desc = normalize(card.querySelector('span')?.textContent);
      if (blocked.test(label) || blocked.test(desc) || /\b(country|language)\b/i.test(label + ' ' + desc) || /কান্ট্রি|ভাষা নির্বাচন|দেশ নির্বাচন/.test(label + ' ' + desc)) {
        card.remove();
      }
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clean, {once:true});
  else clean();
})();
