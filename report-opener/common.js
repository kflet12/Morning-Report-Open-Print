const DEFAULTS = {
  indexUrl: "file://olgwfap1/data/Fac%20Maint/Reports/Ingres%20-%20Daily%20Operations%20Reports/",
  driveFrom: "file://olgwfap1/data/",
  driveTo: "file:///S:/",
  fallbackLatest: false,
  steps: [
    { folder: "LBU_DAILY_REPORTS_", file: "Daily Shipments and Tank Gauges.pdf" },
    { folder: "LBU_DAILY_REPORTS_", file: "Morning - LBU.pdf" },
    { folder: "TIDELANDS_DAILY_REPORTS_", file: "Morning - Tidelands.pdf" },
    { folder: "HB_DAILY_REPORTS_", file: "Morning - HB.pdf" },
    { folder: "LBU_DAILY_REPORTS_", file: "Morning - Pico.pdf" },
    { folder: "LBU_DAILY_REPORTS_", file: "LBU Prod Down.pdf" },
    { folder: "LBU_DAILY_REPORTS_", file: "LBU Inj Down.pdf" },
    { folder: "TIDELANDS_DAILY_REPORTS_", file: "Tide Prod Down.pdf" },
    { folder: "TIDELANDS_DAILY_REPORTS_", file: "Tide Inj Down.pdf" },
    { folder: "HB_DAILY_REPORTS_", file: "HB Prod Down.pdf" },
    { folder: "HB_DAILY_REPORTS_", file: "HB Inj Down.pdf" },
    { folder: "LBU_DAILY_REPORTS_", file: "Pico Prod Down.pdf" },
    { folder: "LBU_DAILY_REPORTS_", file: "Pico Inj Down.pdf" }
  ]
};;
async function loadSettings() {
  const s = await chrome.storage.sync.get(["steps", "fallbackLatest", "indexUrl", "driveFrom", "driveTo"]);
  return {
    steps: Array.isArray(s.steps) ? s.steps : DEFAULTS.steps,
    fallbackLatest: s.fallbackLatest ?? DEFAULTS.fallbackLatest,
    indexUrl: s.indexUrl || DEFAULTS.indexUrl,
    driveFrom: s.driveFrom ?? DEFAULTS.driveFrom,
    driveTo: s.driveTo ?? DEFAULTS.driveTo
  };
}
