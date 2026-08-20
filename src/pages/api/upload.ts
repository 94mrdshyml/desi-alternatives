import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const r2 = locals.runtime?.env?.R2_BUCKET;
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Please sign in to upload assets.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!r2) {
    return new Response(JSON.stringify({ error: 'R2 storage is unavailable.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No file provided.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File size must be under 5MB.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ext = file.name.split('.').pop() || 'png';
    const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const key = `logos/${Date.now()}-${randomSuffix}.${cleanExt}`;

    const arrayBuffer = await file.arrayBuffer();
    await r2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || 'image/png',
      },
    });

    const url = `/api/assets/${key}`;

    return new Response(JSON.stringify({ success: true, key, url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
