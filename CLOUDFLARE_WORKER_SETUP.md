# Cloudflare Worker Deployment Guide

## Prerequisites

1. Install Wrangler CLI: `npm install -g wrangler`
2. Login to Cloudflare: `wrangler login`

## Deployment Steps

### 1. Create wrangler.toml configuration

Create a `wrangler.toml` file in your project root:

```toml
name = "r2-image-proxy"
main = "cloudflare-worker-r2-proxy.js"
compatibility_date = "2025-11-04"

# Bind your R2 bucket
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "trackall"

# Optional: KV namespace for rate limiting
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "YOUR_KV_NAMESPACE_ID"
```

### 2. Create KV Namespace (for rate limiting)

```bash
wrangler kv:namespace create "RATE_LIMIT"
```

Copy the namespace ID and add it to `wrangler.toml`.

### 3. Deploy the Worker

```bash
wrangler deploy
```

### 4. Set up Custom Domain (Optional)

In Cloudflare Dashboard:

- Workers & Pages → Your Worker → Settings → Triggers
- Add Custom Domain: `images.trackall.food`

### 5. Update .env

Replace your R2_PUBLIC_URL:

```env
# Old (direct R2)
R2_PUBLIC_URL=https://pub-7265c7bd58524b13b0359f02cf1dcb6b.r2.dev

# New (through Worker)
R2_PUBLIC_URL=https://r2-image-proxy.YOUR-SUBDOMAIN.workers.dev
# OR with custom domain:
R2_PUBLIC_URL=https://images.trackall.food
```

## Features Enabled

✅ **Referer Check**: Only trackall.food can embed images
✅ **Rate Limiting**: 100 requests/minute per IP
✅ **Caching**: Images cached for 1 year
✅ **Security Headers**: Prevents XSS and clickjacking

## Testing

```bash
# Should work (with referer)
curl -H "Referer: https://trackall.food" https://your-worker.workers.dev/path/to/image.webp

# Should fail (invalid referer)
curl -H "Referer: https://evil-site.com" https://your-worker.workers.dev/path/to/image.webp
```

## Cost

- Workers: **FREE** (100,000 requests/day)
- KV: **FREE** (100,000 reads/day)
- Perfect for your use case!
