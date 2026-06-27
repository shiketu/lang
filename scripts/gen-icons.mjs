// Rasterize the brand SVGs into the PNG sizes the PWA manifest needs.
// Run: npm run gen:icons   (requires devDependency `sharp`)
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "public", "icons");
const publicDir = join(root, "public");

async function render(svgName, outPath, size) {
  const svg = await readFile(join(iconsDir, svgName));
  await sharp(svg, { density: 512 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
  console.log("wrote", outPath, `${size}x${size}`);
}

await render("icon.svg", join(iconsDir, "icon-192.png"), 192);
await render("icon.svg", join(iconsDir, "icon-512.png"), 512);
await render("icon-maskable.svg", join(iconsDir, "icon-maskable-512.png"), 512);
await render("icon.svg", join(publicDir, "apple-touch-icon.png"), 180);
console.log("done");
