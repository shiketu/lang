// Crop a square focal region out of public/icons/source.png and emit PWA icons.
// Modes:
//   node scripts/gen-icons-from-image.mjs full                  -> _full.png (calibration)
//   node scripts/gen-icons-from-image.mjs <left> <top> <size>   -> _preview.png (512 crop)
//   node scripts/gen-icons-from-image.mjs <left> <top> <size> --final  -> icon-192/512/maskable + apple-touch
import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const icons = join(root, "public", "icons");
const src = join(icons, "source.png");

const meta = await sharp(src).metadata();

if (process.argv[2] === "full") {
  await sharp(src).resize(1200).png().toFile(join(icons, "_full.png"));
  console.log(`source ${meta.width}x${meta.height} -> _full.png (1200w)`);
  process.exit(0);
}

const left = parseInt(process.argv[2], 10);
const top = parseInt(process.argv[3], 10);
const size = parseInt(process.argv[4], 10);
const isFinal = process.argv[5] === "--final";

function clampSquare(l, t, s) {
  s = Math.min(s, meta.width, meta.height);
  l = Math.max(0, Math.min(l, meta.width - s));
  t = Math.max(0, Math.min(t, meta.height - s));
  return { left: Math.round(l), top: Math.round(t), width: Math.round(s), height: Math.round(s) };
}

async function crop(region, out, outSize) {
  await sharp(src).extract(region).resize(outSize, outSize).png().toFile(out);
  console.log("wrote", out, JSON.stringify(region));
}

const region = clampSquare(left, top, size);

if (!isFinal) {
  await crop(region, join(icons, "_preview.png"), 512);
} else {
  await crop(region, join(icons, "icon-192.png"), 192);
  await crop(region, join(icons, "icon-512.png"), 512);
  await crop(region, join(root, "public", "apple-touch-icon.png"), 180);
  // maskable: zoom out ~30% around the same center for safe-zone padding.
  const ms = size * 1.3;
  const cx = left + size / 2;
  const cy = top + size / 2;
  await crop(clampSquare(cx - ms / 2, cy - ms / 2, ms), join(icons, "icon-maskable-512.png"), 512);
  console.log("FINAL icons written");
}
