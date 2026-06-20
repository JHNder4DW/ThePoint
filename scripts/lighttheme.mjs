import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src/app");

// Collect target files
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(p);
  }
  return out;
}

const files = walk(ROOT);

// ---- Deterministic replacements ----
// Use a two-phase placeholder swap to safely invert the Zinc gray scale.

// Zinc scale inversion (dark surface -> light surface). 500 stays.
const zincHexInvert = {
  "#09090B": "#F4F4F5", // 950 page bg -> 100
  "#111115": "#FAFAFA", // ~950 -> 50
  "#18181B": "#FFFFFF", // 900 card -> white
  "#27272A": "#E4E4E7", // 800 surface/border -> 200
  "#3F3F46": "#D4D4D8", // 700 -> 300
  "#52525B": "#A1A1AA", // 600 -> 400
  // 500 (#71717A) stays as mid muted text
  "#A1A1AA": "#52525B", // 400 text -> 600
  "#D4D4D8": "#3F3F46", // 300 text -> 700
  "#FAFAFA": "#18181B", // 50 text -> 900
  "#FFFFFF": "#18181B", // white text -> near-black (cards rarely use #FFFFFF here)
};

// Slate accents used in a few spots -> invert toward dark text on light
const slateHexInvert = {
  "#E2E8F0": "#334155",
  "#CBD5E1": "#475569",
  "#475569": "#CBD5E1",
};

// Blue accent -> Red accent
const blueHex = {
  "#2563EB": "#DC2626",
  "#1D4ED8": "#B91C1C",
  "#3B82F6": "#EF4444",
  "#60A5FA": "#F87171",
  "#93C5FD": "#FCA5A5",
};

// rgba inversions (gray surfaces dark->light) and blue->red
const rgbaReplers = [
  // zinc-700 rgba -> zinc-300
  [/rgba\(\s*63\s*,\s*63\s*,\s*70\s*,/g, "rgba(212,212,216,"],
  // zinc-800 rgba -> zinc-200
  [/rgba\(\s*39\s*,\s*39\s*,\s*42\s*,/g, "rgba(228,228,231,"],
  // zinc-900 rgba -> zinc-100
  [/rgba\(\s*24\s*,\s*24\s*,\s*27\s*,/g, "rgba(244,244,245,"],
  // zinc-950 rgba -> zinc-50
  [/rgba\(\s*9\s*,\s*9\s*,\s*11\s*,/g, "rgba(250,250,250,"],
  // white overlays on dark -> dark overlays on light (subtle)
  [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,/g, "rgba(24,24,27,"],
  // blue accents -> red
  [/rgba\(\s*37\s*,\s*99\s*,\s*235\s*,/g, "rgba(220,38,38,"],
  [/rgba\(\s*99\s*,\s*102\s*,\s*241\s*,/g, "rgba(220,38,38,"], // indigo -> red
  [/rgba\(\s*59\s*,\s*130\s*,\s*246\s*,/g, "rgba(239,68,68,"],
];

function applyHexMap(src, map) {
  // placeholder phase to avoid collisions
  const keys = Object.keys(map);
  let s = src;
  keys.forEach((k, i) => {
    const re = new RegExp(k, "gi");
    s = s.replace(re, `__HEX${i}__`);
  });
  keys.forEach((k, i) => {
    const re = new RegExp(`__HEX${i}__`, "g");
    s = s.replace(re, map[k]);
  });
  return s;
}

let changed = 0;
for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  const before = src;

  // combine all hex maps into one collision-safe pass
  const combined = { ...zincHexInvert, ...slateHexInvert, ...blueHex };
  src = applyHexMap(src, combined);

  for (const [re, rep] of rgbaReplers) src = src.replace(re, rep);

  // Tailwind utility blue -> red (text/bg/border-blue-XXX, ring-blue)
  src = src.replace(/(text|bg|border|ring|from|to|via)-blue-(\d{2,3})/g, "$1-red-$2");

  if (src !== before) {
    fs.writeFileSync(file, src);
    changed++;
  }
}
console.log("Files changed:", changed, "of", files.length);
