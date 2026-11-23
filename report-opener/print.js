const out = document.getElementById("s");
// fetch() can't load file:// URLs in Chromium; XHR can (with "Allow access to file URLs" on).
function xhrRead(url) {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("GET", url); x.responseType = "arraybuffer";
    x.onload = () => (x.status === 0 || x.status === 200) && x.response && x.response.byteLength
      ? resolve(x.response) : reject(new Error(`Couldn't read ${url} (status ${x.status}).`));
    x.onerror = () => reject(new Error(`XHR error reading ${url} (readyState ${x.readyState}, status ${x.status}).`));
    x.send();
  });
}
// Try the URL as-is, then the five-slash UNC form (file://///host/share/...), which Chromium treats as a local-style path.
async function readFile(url, cfg) {
  const m = url.match(/^file:\/\/([^\/]+)\/(.*)$/i);
  const tries = [];
  if (cfg.driveFrom && cfg.driveTo && url.toLowerCase().startsWith(cfg.driveFrom.toLowerCase()))
    tries.push(cfg.driveTo + url.slice(cfg.driveFrom.length));
  tries.push(url); if (m) tries.push(`file://///${m[1]}/${m[2]}`);
  const errs = [];
  for (const t of tries) { try { return await xhrRead(t); } catch (e) { errs.push(e.message); } }
  throw new Error(errs.join("  |  "));
}
(async () => {
  try {
    const cfg = await loadSettings();
    const { printUrls } = await chrome.storage.session.get("printUrls");
    if (!printUrls || !printUrls.length) throw new Error("Nothing to print.");
    const { PDFDocument } = PDFLib;
    const merged = await PDFDocument.create();
    let i = 0;
    for (const url of printUrls) {
      out.textContent = `Merging ${++i} of ${printUrls.length}: ${decodeURIComponent(url.split("/").pop())}`;
      const buf = await readFile(url, cfg);
      const src = await PDFDocument.load(buf, { ignoreEncryption: true });
      (await merged.copyPages(src, src.getPageIndices())).forEach(p => merged.addPage(p));
    }
    const bytes = await merged.save();
    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    location.replace(blobUrl);
  } catch (e) {
    out.className = "err"; out.textContent = e.message;
  }
})();
