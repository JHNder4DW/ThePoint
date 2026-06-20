import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src/app");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx)$/.test(entry.name)) out.push(p);
  }
  return out;
}

// Red / strong colored background markers => element where white text must stay
const KEEP_WHITE = [
  "glow-red",
  "glow-green",
  "#DC2626",
  "#B91C1C",
  "#EF4444",
  "#16A34A",
  "#15803D",
  "#22C55E",
  "bg-red-",
  "bg-green-",
  "bg-[#DC",
  "bg-[#B9",
  "bg-[#EF",
  "rgba(220,38,38",
  "rgba(239,68,68",
  "rgba(34,197,94",
];

const DARK = "text-[#18181B]";

let changed = 0;
for (const file of walk(ROOT)) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("text-white")) continue;

  // Match opening/self-closing tags (attribute values here contain no literal > )
  const out = src.replace(/<[A-Za-z][\w.]*[^<>]*>/gs, (tag) => {
    if (!tag.includes("text-white")) return tag;
    const keep = KEEP_WHITE.some((m) => tag.includes(m));
    if (keep) return tag; // leave white on colored buttons/badges
    return tag.replace(/text-white\b/g, DARK);
  });

  if (out !== src) {
    fs.writeFileSync(file, out);
    changed++;
  }
}
console.log("Text files changed:", changed);
