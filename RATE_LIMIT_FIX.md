# Rate Limit Fix

## Problem
Getting "Too many requests from this IP" error when testing the application.

## Solutions Applied

### 1. **Increased Rate Limit in Development**
- **Production:** 100 requests per 15 minutes
- **Development:** 1000 requests per 15 minutes (10x more lenient)

### 2. **Skip Rate Limiting for Critical Endpoints**
In development mode, these endpoints bypass rate limiting:
- `/health` - Health check endpoint
- `/api/rate` - Exchange rate endpoint (frequently called)

### 3. **Clear Rate Limit Endpoint** (Development Only)
Added a development endpoint to clear rate limits:
```bash
POST /api/dev/clear-rate-limit
Body: { "ip": "optional-ip-address" }
```

If no IP is provided, it clears all rate limits.

## How to Use

### Option 1: Wait for Rate Limit to Reset
- Rate limits reset automatically after 15 minutes
- Check the `retryAfter` field in the error response for seconds remaining

### Option 2: Clear Rate Limit (Development Only)
```bash
# Clear all rate limits
curl -X POST http://localhost:5000/api/dev/clear-rate-limit \
  -H "Content-Type: application/json" \
  -d "{}"

# Clear rate limit for specific IP
curl -X POST http://localhost:5000/api/dev/clear-rate-limit \
  -H "Content-Type: application/json" \
  -d '{"ip": "::1"}'
```

### Option 3: Restart Server
Restarting the server will clear all in-memory rate limits.

## Rate Limits Summary

| Limiter | Window | Max Requests | Purpose |
|---------|--------|--------------|---------|
| `apiLimiter` | 15 min | 100 (prod) / 1000 (dev) | General API requests |
| `authLimiter` | 15 min | 5 | Login/Register attempts |
| `transactionLimiter` | 1 min | 10 | Transaction operations |

## Notes

- Rate limits are stored in memory and reset on server restart
- In production, limits are stricter to prevent abuse
- The `/api/dev/clear-rate-limit` endpoint is only available in development mode

