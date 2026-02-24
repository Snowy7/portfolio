/**
 * Generate OG social card (1200x630 PNG) and favicon.ico (32x32 PNG)
 * Run: node scripts/generate-assets.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

// ============================================================
// 1. OG Social Card — 1200x630
// ============================================================
const ogWidth = 1200;
const ogHeight = 630;

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${ogWidth}" height="${ogHeight}" viewBox="0 0 ${ogWidth} ${ogHeight}">
  <defs>
    <!-- Subtle scanline pattern -->
    <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="2" fill="#22c55e" opacity="0.03"/>
    </pattern>
    <!-- Glow filter for the name -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${ogWidth}" height="${ogHeight}" fill="#000"/>
  <rect width="${ogWidth}" height="${ogHeight}" fill="url(#scanlines)"/>

  <!-- Border -->
  <rect x="16" y="16" width="${ogWidth - 32}" height="${ogHeight - 32}" rx="8" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-opacity="0.25"/>

  <!-- Top bar (terminal header) -->
  <rect x="16" y="16" width="${ogWidth - 32}" height="48" rx="8" fill="#22c55e" fill-opacity="0.06"/>
  <line x1="16" y1="64" x2="${ogWidth - 16}" y2="64" stroke="#22c55e" stroke-opacity="0.15" stroke-width="1"/>
  <!-- Terminal dots -->
  <circle cx="48" cy="40" r="6" fill="#ef4444" opacity="0.7"/>
  <circle cx="72" cy="40" r="6" fill="#eab308" opacity="0.7"/>
  <circle cx="96" cy="40" r="6" fill="#22c55e" opacity="0.7"/>
  <!-- Terminal title -->
  <text x="600" y="46" text-anchor="middle" font-family="monospace, 'Courier New'" font-size="14" fill="#22c55e" fill-opacity="0.5">islam@portfolio:~</text>

  <!-- Decorative bracket left -->
  <text x="60" y="280" font-family="monospace, 'Courier New'" font-size="180" fill="#22c55e" fill-opacity="0.06">{</text>

  <!-- Decorative bracket right -->
  <text x="1050" y="500" font-family="monospace, 'Courier New'" font-size="180" fill="#22c55e" fill-opacity="0.06">}</text>

  <!-- Prompt line -->
  <text x="80" y="180" font-family="monospace, 'Courier New'" font-size="18" fill="#22c55e" fill-opacity="0.5">visitor@snowydev.xyz ~ $</text>
  <text x="395" y="180" font-family="monospace, 'Courier New'" font-size="18" fill="#22c55e" fill-opacity="0.8">cat about.txt</text>

  <!-- Name -->
  <text x="80" y="290" font-family="monospace, 'Courier New'" font-weight="700" font-size="72" fill="#22c55e" filter="url(#glow)">Islam Azzam</text>

  <!-- Title -->
  <text x="80" y="350" font-family="monospace, 'Courier New'" font-size="28" fill="#22c55e" fill-opacity="0.7">Software Developer &amp; Network Engineer</text>

  <!-- Separator -->
  <line x1="80" y1="380" x2="700" y2="380" stroke="#22c55e" stroke-opacity="0.2" stroke-width="1"/>

  <!-- Info lines -->
  <text x="80" y="420" font-family="monospace, 'Courier New'" font-size="20" fill="#22c55e" fill-opacity="0.5">
    <tspan fill="#22c55e" fill-opacity="0.3">// </tspan>8+ years of coding
  </text>
  <text x="80" y="455" font-family="monospace, 'Courier New'" font-size="20" fill="#22c55e" fill-opacity="0.5">
    <tspan fill="#22c55e" fill-opacity="0.3">// </tspan>Web &amp; Game Dev · AI · Networking
  </text>
  <text x="80" y="490" font-family="monospace, 'Courier New'" font-size="20" fill="#22c55e" fill-opacity="0.5">
    <tspan fill="#22c55e" fill-opacity="0.3">// </tspan>Doha, Qatar
  </text>

  <!-- URL -->
  <text x="80" y="570" font-family="monospace, 'Courier New'" font-size="22" fill="#22c55e" fill-opacity="0.4">https://snowydev.xyz</text>

  <!-- Cursor blink -->
  <rect x="570" y="175" width="14" height="3" fill="#22c55e" opacity="0.8"/>

  <!-- Decorative code lines (right side, faint) -->
  <text x="750" y="420" font-family="monospace, 'Courier New'" font-size="14" fill="#22c55e" fill-opacity="0.1">const skills = ["TypeScript", "Vue",</text>
  <text x="750" y="442" font-family="monospace, 'Courier New'" font-size="14" fill="#22c55e" fill-opacity="0.1">  "React", "Node.js", "Python",</text>
  <text x="750" y="464" font-family="monospace, 'Courier New'" font-size="14" fill="#22c55e" fill-opacity="0.1">  "C#", "Unity", "Networking"];</text>
  <text x="750" y="498" font-family="monospace, 'Courier New'" font-size="14" fill="#22c55e" fill-opacity="0.1">export default {</text>
  <text x="750" y="520" font-family="monospace, 'Courier New'" font-size="14" fill="#22c55e" fill-opacity="0.1">  passion: "building things",</text>
  <text x="750" y="542" font-family="monospace, 'Courier New'" font-size="14" fill="#22c55e" fill-opacity="0.1">  status: "open to opportunities"</text>
  <text x="750" y="564" font-family="monospace, 'Courier New'" font-size="14" fill="#22c55e" fill-opacity="0.1">};</text>
</svg>
`;

console.log("Generating OG image (1200x630)...");
await sharp(Buffer.from(ogSvg))
  .png()
  .toFile(join(publicDir, "og-card.png"));
console.log("  -> public/og-card.png");

// ============================================================
// 2. Favicon — 32x32 PNG (for .ico fallback)
// ============================================================
const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="12" fill="#000"/>
  <rect x="2" y="2" width="60" height="60" rx="10" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-opacity="0.3"/>
  <text x="32" y="44" text-anchor="middle" font-family="monospace, 'Courier New'" font-weight="700" font-size="36" fill="#22c55e">I</text>
  <rect x="18" y="10" width="28" height="2" rx="1" fill="#22c55e" fill-opacity="0.15"/>
  <rect x="18" y="52" width="28" height="2" rx="1" fill="#22c55e" fill-opacity="0.15"/>
</svg>
`;

console.log("Generating favicon-32.png (32x32)...");
await sharp(Buffer.from(faviconSvg))
  .resize(32, 32)
  .png()
  .toFile(join(publicDir, "favicon-32.png"));
console.log("  -> public/favicon-32.png");

// Generate 16x16 as well
console.log("Generating favicon-16.png (16x16)...");
await sharp(Buffer.from(faviconSvg))
  .resize(16, 16)
  .png()
  .toFile(join(publicDir, "favicon-16.png"));
console.log("  -> public/favicon-16.png");

// Generate apple-touch-icon (180x180)
console.log("Generating apple-touch-icon.png (180x180)...");
await sharp(Buffer.from(faviconSvg))
  .resize(180, 180)
  .png()
  .toFile(join(publicDir, "apple-touch-icon.png"));
console.log("  -> public/apple-touch-icon.png");

// ============================================================
// 3. Build ICO file manually (simple BMP-in-ICO format)
//    ICO = header + directory entries + PNG data
// ============================================================
console.log("Building favicon.ico (16x16 + 32x32)...");

const png16 = await sharp(Buffer.from(faviconSvg)).resize(16, 16).png().toBuffer();
const png32 = await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toBuffer();

// ICO file format: Header (6 bytes) + Directory entries (16 bytes each) + image data
const numImages = 2;
const headerSize = 6;
const dirEntrySize = 16;
const dataOffset = headerSize + numImages * dirEntrySize;

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);       // Reserved
header.writeUInt16LE(1, 2);       // Type: 1 = ICO
header.writeUInt16LE(numImages, 4); // Number of images

// Directory entry for 16x16
const dir16 = Buffer.alloc(16);
dir16.writeUInt8(16, 0);           // Width
dir16.writeUInt8(16, 1);           // Height
dir16.writeUInt8(0, 2);            // Color palette
dir16.writeUInt8(0, 3);            // Reserved
dir16.writeUInt16LE(1, 4);         // Color planes
dir16.writeUInt16LE(32, 6);        // Bits per pixel
dir16.writeUInt32LE(png16.length, 8);  // Size of image data
dir16.writeUInt32LE(dataOffset, 12);   // Offset to image data

// Directory entry for 32x32
const dir32 = Buffer.alloc(16);
dir32.writeUInt8(32, 0);
dir32.writeUInt8(32, 1);
dir32.writeUInt8(0, 2);
dir32.writeUInt8(0, 3);
dir32.writeUInt16LE(1, 4);
dir32.writeUInt16LE(32, 6);
dir32.writeUInt32LE(png32.length, 8);
dir32.writeUInt32LE(dataOffset + png16.length, 12);

const ico = Buffer.concat([header, dir16, dir32, png16, png32]);
writeFileSync(join(publicDir, "favicon.ico"), ico);
console.log("  -> public/favicon.ico");

console.log("\nAll assets generated successfully!");
