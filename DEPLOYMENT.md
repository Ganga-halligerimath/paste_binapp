# Deployment Checklist

## Pre-Deployment

- [x] Code is ready and tested locally
- [x] No hardcoded localhost URLs
- [x] No secrets in code
- [x] Database layer supports both SQLite (local) and Vercel KV (production)
- [x] All environment variables documented

## Vercel Deployment Steps

1. **Create Vercel KV Database**:
   - Go to https://vercel.com/dashboard
   - Navigate to Storage → Create Database → KV
   - Create a new KV database
   - Note the `KV_REST_API_URL` and `KV_REST_API_TOKEN`

2. **Deploy to Vercel**:
   ```bash
   # Option 1: Via Vercel Dashboard
   # - Push code to GitHub
   # - Import project in Vercel
   # - Add environment variables
   # - Deploy

   # Option 2: Via Vercel CLI
   npm i -g vercel
   vercel
   ```

3. **Set Environment Variables in Vercel**:
   - `KV_REST_API_URL` - Your Vercel KV REST API URL
   - `KV_REST_API_TOKEN` - Your Vercel KV REST API Token
   - `TEST_MODE` (optional) - Set to `1` if you need testing mode

4. **Verify Deployment**:
   - Check `/api/healthz` returns `{ "ok": true }`
   - Test creating a paste via `POST /api/pastes`
   - Test viewing a paste via `GET /p/:id`
   - Test API endpoint via `GET /api/pastes/:id`

## What Gets Deployed

- All source code in `app/` directory
- Database layer in `lib/db.ts` (automatically uses KV in production)
- No SQLite database files (those are gitignored)
- All dependencies from `package.json`

## Post-Deployment

- [ ] Test health check endpoint
- [ ] Test paste creation
- [ ] Test paste viewing (HTML)
- [ ] Test paste API endpoint
- [ ] Test TTL expiry (if TEST_MODE enabled)
- [ ] Test view limits
- [ ] Verify URLs are correct (no localhost)

## Troubleshooting

**Issue**: Database errors in production
**Solution**: Ensure `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set in Vercel environment variables

**Issue**: Pastes not persisting
**Solution**: Check Vercel KV is properly configured and environment variables are correct

**Issue**: Build fails
**Solution**: Ensure all dependencies are in `package.json` and `better-sqlite3` is optional (it won't be used in production)

