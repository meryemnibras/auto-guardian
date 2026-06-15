/**
 * Generates the Android icon set from /public/logo.png:
 *   • icon-192.png         (Play Store "any" purpose)
 *   • icon-512.png         (Play Store hi-res tile)
 *   • icon-512-maskable.png (adaptive Android 8+ icon)
 *   • apple-touch-icon.png  (180x180 for iOS PWA)
 *   • favicon.png           (32x32 for browsers that can't read SVG)
 *
 * Run:  node scripts/generate-android-icons.mjs
 *
 * The "maskable" variant pads the logo to 80% of the canvas with the brand
 * background color, so Android's circular/squircle masks never crop the
 * meaningful pixels of the logo.
 */

import { mkdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");
const inputLogo = resolve(root, "public", "logo.png");
const outDir = resolve(root, "public", "icons");

/** Brand background — matches the manifest's background_color. */
const BG = { r: 2, g: 6, b: 23, alpha: 1 };

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function flat({ size, padding = 0, output }) {
  const innerSize = Math.round(size * (1 - padding * 2));
  const offset = Math.round((size - innerSize) / 2);
  const logo = await sharp(inputLogo)
    .resize(innerSize, innerSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logo, top: offset, left: offset }])
    .png({ compressionLevel: 9 })
    .toFile(output);

  console.log(`  ✓ ${output}`);
}

async function transparent({ size, output }) {
  await sharp(inputLogo)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(output);
  console.log(`  ✓ ${output}`);
}

async function main() {
  if (!(await fileExists(inputLogo))) {
    console.error(`logo not found at ${inputLogo}`);
    process.exit(1);
  }
  await ensureDir(outDir);

  console.log("Generating Android icon set from logo.png…");
  await Promise.all([
    transparent({
      size: 192,
      output: resolve(outDir, "icon-192.png"),
    }),
    transparent({
      size: 512,
      output: resolve(outDir, "icon-512.png"),
    }),
    /* Maskable icons pad to 80% so the safe-zone clears Android's mask. */
    flat({
      size: 512,
      padding: 0.1,
      output: resolve(outDir, "icon-512-maskable.png"),
    }),
    /* iOS PWA splash icon. */
    flat({
      size: 180,
      padding: 0.08,
      output: resolve(root, "public", "apple-touch-icon.png"),
    }),
    transparent({
      size: 32,
      output: resolve(root, "public", "favicon.png"),
    }),
  ]);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
