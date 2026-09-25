import type { APIRoute } from 'astro';
import { buildAssetHeaders } from '@/lib/server/upload';

export const GET: APIRoute = async ({ params, locals }) => {
  const r2 = locals.runtime?.env?.R2_BUCKET;
  const key = params.key;

  if (!r2 || !key) {
    return new Response('Asset storage not available or key missing', { status: 404 });
  }

  try {
    const object = await r2.get(key);

    if (!object) {
      return new Response('Asset not found', { status: 404 });
    }

    const headers = buildAssetHeaders(object.httpMetadata?.contentType, object.httpEtag);

    return new Response(object.body as any, {
      status: 200,
      headers,
    });
  } catch {
    return new Response('Error fetching asset', { status: 500 });
  }
};
