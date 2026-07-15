// Generates the product illustration SVGs in public/images/products/.
// Run: node scripts/generate-images.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "images", "products");
mkdirSync(OUT, { recursive: true });

const NAVY = "#0f172a";
const SLATE = "#475569";
const SLATE_LIGHT = "#cbd5e1";
const TEAL = "#0d9488";
const YELLOW = "#facc15";

const svg = (body, w = 400, h = 300) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="none">
<defs>
<linearGradient id="cell" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#1e293b"/><stop offset="0.55" stop-color="#0f172a"/><stop offset="1" stop-color="#164e63"/>
</linearGradient>
<linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="${TEAL}"/><stop offset="1" stop-color="${YELLOW}"/>
</linearGradient>
<linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#94a3b8"/>
</linearGradient>
</defs>
${body}
</svg>`;

function panel({ cols = 6, rows = 4, frame = SLATE_LIGHT, busbars = true, tag = null }) {
  const x0 = 48, y0 = 44, w = 304, h = 196;
  const cw = w / cols, ch = h / rows;
  let cells = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells += `<rect x="${(x0 + c * cw + 2).toFixed(1)}" y="${(y0 + r * ch + 2).toFixed(1)}" width="${(cw - 4).toFixed(1)}" height="${(ch - 4).toFixed(1)}" rx="2" fill="url(#cell)"/>`;
      if (busbars) {
        cells += `<line x1="${(x0 + c * cw + cw / 2).toFixed(1)}" y1="${(y0 + r * ch + 4).toFixed(1)}" x2="${(x0 + c * cw + cw / 2).toFixed(1)}" y2="${(y0 + (r + 1) * ch - 4).toFixed(1)}" stroke="#334155" stroke-width="1"/>`;
      }
    }
  }
  const tagEl = tag
    ? `<rect x="48" y="252" width="${8 * tag.length + 16}" height="18" fill="${NAVY}"/><text x="56" y="265" font-family="monospace" font-size="11" fill="${YELLOW}">${tag}</text>`
    : "";
  return svg(`
<rect x="40" y="36" width="320" height="212" rx="6" fill="${frame}"/>
<rect x="46" y="42" width="308" height="200" rx="3" fill="#0b1120"/>
${cells}
<rect x="46" y="42" width="308" height="200" rx="3" stroke="#475569" stroke-width="1.5"/>
<rect x="120" y="252" width="160" height="8" rx="2" fill="url(#metal)" opacity="0"/>
<path d="M110 248 L90 282 H310 L290 248" fill="#94a3b8" opacity="0.35"/>
<rect x="84" y="280" width="232" height="6" rx="3" fill="${SLATE}"/>
${tagEl}
`);
}

function battery({ w = 150, h = 200, led = TEAL, vents = 3, label }) {
  const x = (400 - w) / 2, y = (280 - h) / 2 + 10;
  let ventEls = "";
  for (let i = 0; i < vents; i++) {
    ventEls += `<rect x="${x + 20}" y="${y + h - 34 - i * 12}" width="${w - 40}" height="5" rx="2.5" fill="#cbd5e1"/>`;
  }
  return svg(`
<ellipse cx="200" cy="${y + h + 12}" rx="${w * 0.62}" ry="10" fill="#e2e8f0"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="url(#metal)"/>
<rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
<rect x="${x + 20}" y="${y + 22}" width="${w - 40}" height="6" rx="3" fill="url(#glow)"/>
<circle cx="${x + 26}" cy="${y + 48}" r="4" fill="${led}"/>
<text x="${x + 38}" y="${y + 52}" font-family="monospace" font-size="11" fill="${SLATE}">${label}</text>
${ventEls}
`);
}

function inverter({ threePhase = false }) {
  return svg(`
<ellipse cx="200" cy="252" rx="110" ry="10" fill="#e2e8f0"/>
<rect x="110" y="48" width="180" height="196" rx="12" fill="url(#metal)"/>
<rect x="120" y="58" width="160" height="176" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
<rect x="136" y="76" width="128" height="56" rx="4" fill="${NAVY}"/>
<text x="148" y="100" font-family="monospace" font-size="12" fill="${TEAL}">${threePhase ? "10.0kW 3-PH" : "7.6kW ACTIVE"}</text>
<rect x="148" y="110" width="${threePhase ? 96 : 76}" height="6" rx="3" fill="url(#glow)"/>
<circle cx="152" cy="156" r="5" fill="${TEAL}"/>
<text x="164" y="160" font-family="monospace" font-size="10" fill="${SLATE}">GRID OK</text>
<circle cx="152" cy="178" r="5" fill="${YELLOW}"/>
<text x="164" y="182" font-family="monospace" font-size="10" fill="${SLATE}">PV INPUT</text>
<rect x="136" y="200" width="128" height="18" rx="3" fill="#e2e8f0"/>
<rect x="150" y="244" width="18" height="14" rx="2" fill="${SLATE}"/>
<rect x="232" y="244" width="18" height="14" rx="2" fill="${SLATE}"/>
`);
}

function mounting() {
  return svg(`
<ellipse cx="200" cy="250" rx="140" ry="10" fill="#e2e8f0"/>
<rect x="60" y="120" width="280" height="14" rx="4" fill="url(#metal)" transform="rotate(-8 200 127)"/>
<rect x="60" y="170" width="280" height="14" rx="4" fill="url(#metal)" transform="rotate(-8 200 177)"/>
<rect x="120" y="90" width="16" height="120" rx="3" fill="#94a3b8" transform="rotate(-8 128 150)"/>
<rect x="264" y="70" width="16" height="120" rx="3" fill="#94a3b8" transform="rotate(-8 272 130)"/>
<circle cx="130" cy="118" r="6" fill="${NAVY}"/>
<circle cx="274" cy="98" r="6" fill="${NAVY}"/>
<circle cx="136" cy="170" r="6" fill="${NAVY}"/>
<circle cx="280" cy="150" r="6" fill="${NAVY}"/>
<rect x="80" y="216" width="90" height="26" rx="4" fill="${SLATE}"/>
<rect x="180" y="216" width="60" height="26" rx="4" fill="#94a3b8"/>
<rect x="250" y="216" width="70" height="26" rx="4" fill="${SLATE}"/>
<text x="88" y="233" font-family="monospace" font-size="10" fill="#f8fafc">RAIL-KIT</text>
`);
}

const files = {
  "panel-mono.svg": panel({ cols: 6, rows: 4, tag: "450W MONO" }),
  "panel-pro.svg": panel({ cols: 8, rows: 4, tag: "400W N-TYPE" }),
  "panel-bifacial.svg": panel({ cols: 5, rows: 5, frame: "#e2e8f0", tag: "550W BIFACIAL" }),
  "panel-compact.svg": panel({ cols: 4, rows: 4, tag: "360W COMPACT" }),
  "panel-detail.svg": panel({ cols: 10, rows: 6, busbars: false }),
  "battery-wall.svg": battery({ w: 150, h: 200, label: "10.5 kWh", led: TEAL, vents: 3 }),
  "battery-max.svg": battery({ w: 190, h: 220, label: "25.0 kWh", led: TEAL, vents: 4 }),
  "battery-nano.svg": battery({ w: 110, h: 140, label: "3.0 kWh", led: YELLOW, vents: 2 }),
  "battery-rack.svg": svg(`
<ellipse cx="200" cy="266" rx="110" ry="10" fill="#e2e8f0"/>
<rect x="110" y="30" width="180" height="232" rx="8" fill="${NAVY}"/>
<rect x="118" y="38" width="164" height="216" rx="5" fill="#1e293b"/>
${[0, 1, 2, 3, 4]
  .map(
    (i) => `<rect x="126" y="${46 + i * 42}" width="148" height="34" rx="3" fill="#0f172a" stroke="#334155"/>
<circle cx="140" cy="${63 + i * 42}" r="4" fill="${i === 4 ? YELLOW : TEAL}"/>
<rect x="152" y="${59 + i * 42}" width="${60 - i * 6}" height="8" rx="2" fill="url(#glow)" opacity="0.85"/>
<rect x="236" y="${56 + i * 42}" width="28" height="14" rx="2" fill="#334155"/>`
  )
  .join("\n")}
`),
  "inverter.svg": inverter({ threePhase: false }),
  "inverter-3phase.svg": inverter({ threePhase: true }),
  "mounting-kit.svg": mounting(),
};

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(OUT, name), content.trim() + "\n");
  console.log("wrote", name);
}
