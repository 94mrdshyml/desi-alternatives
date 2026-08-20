import type { APIRoute } from 'astro';

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

    const headers: Record<string, string> = {
      'Cache-Control': 'public, max-age=31536000, immutable',
      etag: object.httpEtag,
    };

    if (object.httpMetadata?.contentType) {
      headers['Content-Type'] = object.httpMetadata.contentType;
    }

    return new Response(object.body as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return new Response(err.message || 'Error fetching asset', { status: 500 });
  }
};
