import { initWasm, Resvg } from '@resvg/resvg-wasm';

let wasmInitPromise: Promise<void> | null = null;

export async function ensureWasmInitialized(baseUrl?: string): Promise<void> {
  if (!wasmInitPromise) {
    wasmInitPromise = (async () => {
      try {
        let wasmRes: Response | null = null;
        if (baseUrl) {
          try {
            const localUrl = new URL('/index_bg.wasm', baseUrl).toString();
            const res = await fetch(localUrl);
            if (res.ok) wasmRes = res;
          } catch {}
        }

        if (!wasmRes) {
          wasmRes = await fetch('https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm');
        }

        await initWasm(wasmRes);
      } catch (e: any) {
        if (!e?.message?.includes('already')) {
          console.error('Failed to initialize resvg WASM:', e);
          wasmInitPromise = null;
          throw e;
        }
      }
    })();
  }
  return wasmInitPromise;
}

export async function renderSvgToPng(svg: string, baseUrl?: string): Promise<Uint8Array> {
  await ensureWasmInitialized(baseUrl);
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}
