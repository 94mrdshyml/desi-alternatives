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

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return new Response(err.message || 'Error fetching asset', { status: 500 });
  }
};
