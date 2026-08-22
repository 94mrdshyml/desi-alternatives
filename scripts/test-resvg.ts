import { initWasm, Resvg } from '@resvg/resvg-wasm';
import fs from 'node:fs';
import path from 'node:path';

const wasmBuffer = fs.readFileSync(path.resolve('./node_modules/@resvg/resvg-wasm/index_bg.wasm'));
await initWasm(wasmBuffer);

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0f172a"/>
  <text x="100" y="200" fill="#ffffff" font-size="60" font-family="sans-serif">Razorpay</text>
  <text x="100" y="280" fill="#94a3b8" font-size="28" font-family="sans-serif">Payments &amp; Banking for Indian Businesses</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: {
    mode: 'width',
    value: 1200,
  },
});
const pngData = resvg.render();
const pngBuffer = pngData.asPng();
console.log('Successfully generated PNG, size:', pngBuffer.byteLength);
