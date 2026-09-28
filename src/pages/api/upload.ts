import type { APIRoute } from 'astro';
import { detectImageType } from '@/lib/server/upload';

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

    const arrayBuffer = await file.arrayBuffer();
    const detected = detectImageType(new Uint8Array(arrayBuffer));

    if (!detected) {
      return new Response(JSON.stringify({ error: 'Only PNG, JPG, or WebP images are allowed.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const key = `logos/${Date.now()}-${randomSuffix}.${detected.ext}`;

    await r2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: detected.mime,
      },
    });

    const url = `/api/assets/${key}`;

    return new Response(JSON.stringify({ success: true, key, url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
