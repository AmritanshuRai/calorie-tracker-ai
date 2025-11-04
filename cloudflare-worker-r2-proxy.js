/**
 * Cloudflare Worker for R2 Image Proxy
 * Features:
 * - Referer check (only allow images from trackall.food)
 * - Rate limiting (prevent abuse)
 * - Caching for better performance
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Only allow GET and HEAD requests
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response('Method not allowed', { status: 405 });
    }

    // ====================
    // REFERER CHECK
    // ====================
    const referer = request.headers.get('Referer');
    const allowedReferers = [
      'https://trackall.food',
      'https://www.trackall.food',
      'http://localhost:5173', // Dev frontend
      'http://localhost:3001', // Dev backend
    ];

    // Allow direct access for now (optional - remove in production)
    // If no referer, it might be direct link or API call
    if (referer) {
      const isAllowed = allowedReferers.some((allowed) =>
        referer.startsWith(allowed)
      );

      if (!isAllowed) {
        return new Response('Forbidden: Invalid referer', {
          status: 403,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }
    }

    // ====================
    // RATE LIMITING
    // ====================
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `rate-limit:${clientIP}`;

    // Check rate limit (using Cloudflare KV for storage)
    if (env.RATE_LIMIT_KV) {
      const requestCount = await env.RATE_LIMIT_KV.get(rateLimitKey);
      const limit = 100; // 100 requests per minute

      if (requestCount && parseInt(requestCount) > limit) {
        return new Response('Too many requests', {
          status: 429,
          headers: {
            'Retry-After': '60',
            'Content-Type': 'text/plain',
          },
        });
      }

      // Increment counter
      const newCount = requestCount ? parseInt(requestCount) + 1 : 1;
      await env.RATE_LIMIT_KV.put(rateLimitKey, newCount.toString(), {
        expirationTtl: 60, // Expire after 60 seconds
      });
    }

    // ====================
    // FETCH FROM R2
    // ====================
    try {
      // Remove the worker domain from the path
      const objectKey = url.pathname.slice(1); // Remove leading slash

      // Get object from R2
      const object = await env.R2_BUCKET.get(objectKey);

      if (!object) {
        return new Response('Image not found', { status: 404 });
      }

      // Set appropriate headers
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      headers.set('Access-Control-Allow-Origin', '*'); // CORS
      headers.set('X-Content-Type-Options', 'nosniff');

      return new Response(object.body, {
        headers,
      });
    } catch (error) {
      return new Response('Internal server error', { status: 500 });
    }
  },
};
