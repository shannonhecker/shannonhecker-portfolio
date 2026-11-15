const ID = 'G-795LXWTYWM';
const KEY = 'portfolio-analytics-v1';
const live = location.hostname === 'shannonhecker-work.vercel.app';
const pageLocation = location.origin + location.pathname;
const pageReferrer = document.referrer ? new URL(document.referrer).origin : '';
type Choice = 'yes' | 'no';
type AnalyticsWindow = Window & { dataLayer?: unknown[]; [key: `ga-disable-${string}`]: boolean; };
const w = window as unknown as AnalyticsWindow;
let enabled = false, loaded = false;
function command(..._args: unknown[]) { (w.dataLayer ||= []).push(arguments); }
function read(): Choice | null {
  try { const stored = JSON.parse(localStorage.getItem(KEY) || 'null'); return stored && Date.now() - stored.at < 180 * 86400000 ? stored.choice : null; } catch { return null; }
}
export function track(name: string, fields: Record<string, string | number | boolean> = {}) {
  if (enabled && live) command('event', name, { ...fields, page_location: pageLocation, page_referrer: pageReferrer });
}
function enable() {
  enabled = true;
  w[`ga-disable-${ID}`] = false;
  if (!live) return;
  if (loaded) { command('consent', 'update', { analytics_storage: 'granted' }); return; }
  loaded = true;
  command('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  command('consent', 'update', { analytics_storage: 'granted' });
  command('js', new Date());
  command('config', ID, { send_page_view: false, page_location: pageLocation, page_referrer: pageReferrer, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 15552000 });
  // No query strings, fragments, nicknames or form values go to Analytics.
  command('event', 'page_view', { page_location: pageLocation, page_title: document.title, page_referrer: pageReferrer });
  const script = document.createElement('script');
  script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
  document.head.append(script);
}
const panel = document.getElementById('analytics-choice');
const status = document.getElementById('analytics-status');
function choose(choice: Choice) {
  try { localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() })); } catch { /* choice still applies for this page */ }
  if (choice === 'yes') enable();
  else {
    enabled = false; w[`ga-disable-${ID}`] = true;
    if (loaded) command('consent', 'update', { analytics_storage: 'denied' });
    for (const item of document.cookie.split(';')) {
      const name = item.trim().split('=')[0];
      if (name === '_ga' || name.startsWith('_ga_')) {
        document.cookie = `${name}=; Max-Age=0; Path=/`;
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${location.hostname}`;
      }
    }
  }
  if (panel) panel.hidden = true;
  if (status) status.textContent = choice === 'yes' ? 'Analytics allowed. You can change this below.' : 'Analytics off. Your choice is saved.';
}
document.querySelectorAll<HTMLButtonElement>('[data-analytics-choice]').forEach(button => button.addEventListener('click', () => choose(button.dataset.analyticsChoice as Choice)));
document.querySelectorAll<HTMLButtonElement>('[data-analytics-settings]').forEach(button => button.addEventListener('click', () => { if (panel) { panel.hidden = false; panel.querySelector<HTMLButtonElement>('button')?.focus(); } }));
const saved = read();
if (saved === 'yes') enable();
if (panel) panel.hidden = saved !== null;
const seen = new Set<number>();
window.addEventListener('scroll', () => {
  if (!enabled) return;
  const total = document.documentElement.scrollHeight - innerHeight;
  if (total <= 0) return;
  const percent = Math.round(scrollY / total * 100);
  for (const threshold of [25, 50, 75, 90]) if (percent >= threshold && !seen.has(threshold)) { seen.add(threshold); track('portfolio_scroll', { percent_scrolled: threshold, page_path: location.pathname }); }
}, { passive: true });
