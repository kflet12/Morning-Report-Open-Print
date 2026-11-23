const rowsEl = document.getElementById("rows");
function addRow(step = { folder: "", file: "" }) {
  const r = document.createElement("div"); r.className = "row";
  r.innerHTML = `<input class="f" placeholder="Folder prefix, e.g. HB_DAILY_REPORTS_">
    <input class="n" placeholder="File name, e.g. Morning - HB.pdf">
    <button data-a="up">↑</button><button data-a="down">↓</button><button data-a="del">✕</button>`;
  r.children[0].value = step.folder; r.children[1].value = step.file;
  r.onclick = e => {
    const a = e.target.dataset.a;
    if (a === "up" && r.previousElementSibling) rowsEl.insertBefore(r, r.previousElementSibling);
    if (a === "down" && r.nextElementSibling) rowsEl.insertBefore(r.nextElementSibling, r);
    if (a === "del") r.remove();
  };
  rowsEl.appendChild(r);
}
function render(s) {
  rowsEl.innerHTML = "";
  s.steps.forEach(addRow);
  document.getElementById("fb").checked = !!s.fallbackLatest;
  document.getElementById("idx").value = s.indexUrl;
  document.getElementById("dfrom").value = s.driveFrom;
  document.getElementById("dto").value = s.driveTo;
}
document.getElementById("add").onclick = () => addRow();
document.getElementById("save").onclick = async () => {
  const steps = [...rowsEl.children].map(r => ({ folder: r.children[0].value.trim(), file: r.children[1].value.trim() }))
    .filter(s => s.folder && s.file);
  await chrome.storage.sync.set({ steps, fallbackLatest: document.getElementById("fb").checked, indexUrl: document.getElementById("idx").value.trim(), driveFrom: document.getElementById("dfrom").value.trim(), driveTo: document.getElementById("dto").value.trim() });
  document.getElementById("msg").textContent = "Saved.";
};
document.getElementById("reset").onclick = () => render(DEFAULTS);
loadSettings().then(render);
