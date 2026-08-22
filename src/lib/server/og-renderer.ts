import { Resvg } from '@resvg/resvg-js';

export async function renderSvgToPng(svg: string): Promise<Uint8Array> {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}
