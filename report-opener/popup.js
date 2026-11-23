const log = document.getElementById("log");
function say(msg, cls) {
  const d = document.createElement("div");
  d.textContent = msg; if (cls) d.className = cls;
  log.appendChild(d);
}
const normUrl = u => { try { u = decodeURIComponent(u); } catch {}
  return u.replace(/\\/g, "/").replace(/^file:\/*/i, "").replace(/\/+$/, "").toLowerCase(); };
function todayStr() {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function lastSeg(href) {
  try {
    const seg = new URL(href).pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(seg);
  } catch { return ""; }
}
function folderUrl(href) {
  const u = new URL(href); u.search = ""; u.hash = "";
  if (!u.pathname.endsWith("/")) u.pathname += "/";
  return u.toString();
}
function findFolder(links, prefix, date, fallback) {
  const want = (prefix + date).toLowerCase();
  const exact = links.find(l => lastSeg(l.href).toLowerCase() === want ||
                                l.text.replace(/\/$/, "").toLowerCase() === want);
  if (exact) return { url: folderUrl(exact.href), date, fellBack: false };
  if (!fallback) return null;
  const re = new RegExp("^" + prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(\\d{4}-\\d{2}-\\d{2})$", "i");
  let best = null;
  for (const l of links) {
    const m = lastSeg(l.href).match(re);
    if (m && (!best || m[1] > best.date)) best = { url: folderUrl(l.href), date: m[1], fellBack: true };
  }
  return best;
}
// Returns the active tab if it's on the index page; otherwise navigates it there and returns null.
async function ensureIndex(settings) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (normUrl(tab.url || "") === normUrl(settings.indexUrl)) return tab;
  await chrome.tabs.update(tab.id, { url: settings.indexUrl });
  say("Went to the reports index. Click the icon again to open the reports.", "warn");
  return null;
}
// Builds the ordered list of file URLs from the links on the index page.
async function buildPlan() {
  const settings = await loadSettings();
  const tab = await ensureIndex(settings);
  if (!tab) return null;
  let links;
  try {
    const res = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => [...document.querySelectorAll("a[href]")].map(a => ({ href: a.href, text: a.textContent.trim() }))
    });
    links = res[0].result;
  } catch (e) {
    say("Can't read this page: " + e.message + " (for file:// pages, enable 'Allow access to file URLs' for this extension in edge://extensions)", "err");
    return null;
  }
  const date = todayStr(), cache = {}, warned = new Set(), urls = [];
  for (const s of settings.steps) {
    if (!s.folder || !s.file) continue;
    if (!(s.folder in cache)) cache[s.folder] = findFolder(links, s.folder, date, settings.fallbackLatest);
    const f = cache[s.folder];
    if (!f) { say(`No folder for ${s.folder}${date}: skipped ${s.file}`, "err"); continue; }
    if (f.fellBack && !warned.has(s.folder)) { say(`${s.folder}${date} not found, using ${f.date}`, "warn"); warned.add(s.folder); }
    urls.push(f.url + encodeURIComponent(s.file));
  }
  return urls;
}
async function openAll() {
  log.innerHTML = "";
  const urls = await buildPlan();
  if (!urls) return;
  for (const url of urls) await chrome.tabs.create({ url, active: false });
  say(`Opened ${urls.length} tab${urls.length === 1 ? "" : "s"} for ${todayStr()}.`, urls.length ? "ok" : "err");
}
async function printAll() {
  log.innerHTML = "";
  const urls = await buildPlan();
  if (!urls || !urls.length) return;
  await chrome.storage.session.set({ printUrls: urls });
  await chrome.tabs.create({ url: chrome.runtime.getURL("print.html") });
}
document.getElementById("again").onclick = openAll;
document.getElementById("print").onclick = printAll;
document.getElementById("opts").onclick = () => chrome.runtime.openOptionsPage();
openAll();
