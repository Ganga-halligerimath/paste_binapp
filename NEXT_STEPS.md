# Next Steps to Deploy

## ✅ What's Done ✅
- [x] Project structure created
- [x] All API routes implemented
- [x] Database layer (SQLite + Vercel KV support)
- [x] UI for creating/viewing pastes
- [x] All requirements met
- [x] Git repository initialized
- [x] Files staged for commit

## 📋 Next Steps

### 1. Commit Your Code
```bash
git commit -m "Initial commit: Pastebin application with Next.js"
```

### 2. Push to GitHub
```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js settings
6. **Before deploying**, add environment variables (see step 4)

**Option B: Via Vercel CLI**
```bash
npm i -g vercel
vercel
# Follow the prompts
```

### 4. Set Up Vercel KV (Required for Production)

1. **Create KV Database**:
   - In Vercel Dashboard → Storage → Create Database → KV
   - Create a new KV database
   - Copy the credentials

2. **Add Environment Variables in Vercel**:
   - Go to your project → Settings → Environment Variables
   - Add these variables:
     ```
     KV_REST_API_URL = <your-kv-url>
     KV_REST_API_TOKEN = <your-kv-token>
     ```
   - Optional: `TEST_MODE=1` (if you need testing mode)

3. **Redeploy**:
   - After adding environment variables, trigger a new deployment
   - The app will automatically use Vercel KV instead of SQLite

### 5. Test Your Deployment

Once deployed, test these endpoints:
- ✅ `GET https://your-app.vercel.app/api/healthz` → Should return `{ "ok": true }`
- ✅ `POST https://your-app.vercel.app/api/pastes` → Create a paste
- ✅ `GET https://your-app.vercel.app/p/:id` → View paste in browser
- ✅ `GET https://your-app.vercel.app/api/pastes/:id` → Get paste via API

## 📝 Submission Checklist

Before submitting, make sure you have:
- [ ] Deployed URL (e.g., `https://your-app.vercel.app`)
- [ ] Public GitHub repository URL
- [ ] README.md with:
  - [x] Project description ✅
  - [x] How to run locally ✅
  - [x] Persistence layer choice ✅
  - [x] Design decisions ✅

## 🧪 Local Testing (Before Deployment)

Test locally first:
```bash
npm run dev
```

Then test:
- http://localhost:3000 - Home page
- http://localhost:3000/api/healthz - Health check
- Create a paste and verify it works

## 🚨 Important Notes

1. **SQLite won't work on Vercel** - Make sure to set up Vercel KV before deploying
2. **Environment Variables** - Must be set in Vercel dashboard, not in code
3. **No Secrets in Code** - All sensitive data should be in environment variables
4. **Build Command** - Vercel auto-detects Next.js, but you can verify: `npm run build`

## 🆘 Troubleshooting

**Build fails?**
- Check that all dependencies are in `package.json`
- Ensure Node.js version is compatible (18+)

**Database errors in production?**
- Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
- Check Vercel KV database is created and active

**Pastes not persisting?**
- Confirm Vercel KV is properly configured
- Check environment variables are set correctly

## 📚 Resources

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

