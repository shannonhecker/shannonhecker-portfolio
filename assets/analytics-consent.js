// Shared by the static pages and Vite build. The existing production choice applies to both.
(() => {
  const key = 'portfolio-analytics-v1';
  const gaId = 'G-795LXWTYWM';
  const eligible = ['shannonhecker.com', 'www.shannonhecker.com'].includes(location.hostname);
  const offFlag = 'portfolio-analytics-just-off';
  const pageLocation = location.origin + location.pathname;
  const referrer = document.referrer ? new URL(document.referrer).origin : '';
  let loaded = false;
  let trigger;
  function savedChoice() {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      const age = Date.now() - data?.at;
      if (Number.isFinite(data?.at) && age >= 0 && age < 180 * 86400000 && ['yes', 'no'].includes(data.choice)) return data.choice;
    } catch { /* Storage is optional. */ }
    return null;
  }
  function command() { (window.dataLayer ||= []).push(arguments); }
  function loadScript(src) {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.head.append(script);
  }
  function enable() {
    if (!eligible || loaded) return;
    loaded = true;
    window['ga-disable-' + gaId] = false;
    command('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    command('consent', 'update', { analytics_storage: 'granted' });
    command('js', new Date());
    command('config', gaId, { send_page_view: false, page_location: pageLocation, page_referrer: referrer, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 15552000 });
    command('event', 'page_view', { page_location: pageLocation, page_title: document.title, page_referrer: referrer });
    function clarity() { (clarity.q ||= []).push(arguments); }
    window.clarity = clarity;
    clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + gaId);
    loadScript('https://www.clarity.ms/tag/w42m2jben0');
  }
  function clearCookies() {
    const host = location.hostname.replace(/^www\./, '');
    for (const part of document.cookie.split(';')) {
      const name = part.trim().split('=')[0];
      if (name === '_ga' || name.startsWith('_ga_') || name === '_clsk' || name === '_clck') {
        document.cookie = name + '=; Max-Age=0; Path=/';
        for (const domain of [location.hostname, host]) document.cookie = name + '=; Max-Age=0; Path=/; Domain=' + domain;
      }
    }
  }
  function stop() {
    window['ga-disable-' + gaId] = true;
    if (loaded) {
      command('consent', 'update', { analytics_storage: 'denied' });
      window.clarity?.('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
      window.clarity?.('consent', false);
    }
    try { clearCookies(); } catch { /* Cookies may be blocked. */ }
    if (loaded) {
      loaded = false;
      try { sessionStorage.setItem(offFlag, '1'); } catch { /* Reload still stops both tools. */ }
      location.reload();
    }
  }
  const panel = document.createElement('aside');
  panel.id = 'analytics-choice';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Optional analytics');
  panel.innerHTML = '<p>Allow Google Analytics and Microsoft Clarity to measure visits and interactions?</p><div><a href="/privacy.html">Privacy details</a><button type="button" data-choice="no">No thanks</button><button type="button" data-choice="yes">Allow analytics</button></div>';
  document.body.append(panel);
  const footerPrivacy = document.querySelector('footer a[href="privacy.html"]');
  if (footerPrivacy) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'footer-li';
    button.setAttribute('data-analytics-settings', '');
    button.textContent = 'Analytics settings';
    footerPrivacy.after(button);
    const feedback = document.createElement('span');
    feedback.id = 'analytics-status';
    feedback.className = 'sr-only';
    feedback.setAttribute('role', 'status');
    button.after(feedback);
  }
  const status = document.getElementById('analytics-status');
  function display(choice) {
    panel.hidden = choice !== null;
    if (status) status.textContent = choice === 'yes' ? 'Analytics allowed.' : choice === 'no' ? 'Analytics off.' : 'Analytics are off until you allow them.';
  }
  panel.addEventListener('click', event => {
    const choice = event.target.closest('button')?.dataset.choice;
    if (choice !== 'no' && choice !== 'yes') return;
    try { localStorage.setItem(key, JSON.stringify({ choice, at: Date.now() })); } catch { /* Choice still applies on this page. */ }
    display(choice);
    if (choice === 'yes') enable(); else stop();
    trigger?.focus();
  });
  const settings = document.querySelector('[data-analytics-settings]');
  if (settings) {
    settings.hidden = false;
    settings.addEventListener('click', () => {
      trigger = settings;
      panel.hidden = false;
      panel.querySelector('button').focus();
    });
  }
  function sync() {
    const choice = savedChoice();
    display(choice);
    if (choice === 'yes') enable(); else stop();
  }
  sync();
  try {
    if (sessionStorage.getItem(offFlag)) {
      sessionStorage.removeItem(offFlag);
      settings?.focus();
    }
  } catch { /* No saved focus to restore. */ }
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) sync(); });
  window.addEventListener('pageshow', event => { if (event.persisted) sync(); });
  const seen = new Set();
  window.addEventListener('scroll', () => {
    if (!loaded) return;
    const range = document.documentElement.scrollHeight - innerHeight;
    for (const threshold of [25, 50, 75, 90]) {
      if (range > 0 && scrollY * 100 / range >= threshold && !seen.has(threshold)) {
        seen.add(threshold);
        command('event', 'portfolio_scroll', { percent_scrolled: threshold, page_location: pageLocation, page_referrer: referrer });
      }
    }
  }, { passive: true });
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--consent-height', panel.hidden ? '0px' : panel.offsetHeight + 'px');
  }).observe(panel);
})();
