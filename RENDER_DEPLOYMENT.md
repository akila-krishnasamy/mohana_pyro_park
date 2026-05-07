# Render Deployment Guide - Mohana Pyro Park

Complete steps to deploy both backend and frontend to Render.

## Prerequisites
- Render account (free tier available: https://render.com)
- GitHub account with repo pushed
- MongoDB Atlas connection string (already configured)

---

## PART 1: Deploy Backend to Render

### Step 1: Create New Web Service
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy an existing project from a Git repository"**
4. Connect your GitHub account if not already done
5. Select repository: `mohana_pyro_park`
6. Click **"Connect"**

### Step 2: Configure Backend Service
Fill in these settings:

| Field | Value |
|-------|-------|
| Name | `mohana-pyro-park-backend` |
| Root Directory | `backend` |
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Plan | `Free` (or Starter) |

### Step 3: Add Environment Variables
In the **"Environment"** section, click **"Add Environment Variable"** for each of these keys.

**Get values from your local `.env` file:**

| Key | Source | Example |
|-----|--------|---------|
| `MONGODB_URI` | `.env` file | `mongodb+srv://...` |
| `JWT_SECRET` | `.env` file | `your_secret_key` |
| `PORT` | `.env` file | `5000` |
| `NODE_ENV` | Type this | `production` |
| `SMTP_HOST` | `.env` file | `smtp.gmail.com` |
| `SMTP_PORT` | `.env` file | `587` |
| `SMTP_USER` | `.env` file | `your_email@gmail.com` |
| `SMTP_PASS` | `.env` file | `your_app_password` |
| `MAIL_FROM` | `.env` file | `Company <email@gmail.com>` |
| `TWILIO_ACCOUNT_SID` | `.env` file | `AC...` |
| `TWILIO_AUTH_TOKEN` | `.env` file | `your_token` |
| `TWILIO_FROM_NUMBER` | `.env` file | `+1234567890` |
| `TWILIO_WHATSAPP_FROM` | `.env` file | `whatsapp:+1234567890` |

**⚠️ DO NOT commit `.env` to GitHub. Use Render environment variables only.**

### Step 4: Deploy
- Click **"Create Web Service"**
- Wait for build to complete (5-10 minutes)
- Copy the backend URL (e.g., `https://mohana-pyro-park-backend.onrender.com`)

### Step 5: Whitelist Render IP in MongoDB Atlas
1. Go to MongoDB Atlas → Cluster → Network Access
2. Add IP Address: Click **"Add IP Address"**
3. Enter Render's IP or use `0.0.0.0/0` (allow all, less secure)
4. Click **"Confirm"**

**Note:** Render uses dynamic IPs. Best practice: Allow `0.0.0.0/0` or use Database Access whitelist in Atlas.

---

## PART 2: Deploy Frontend to Render

### Step 1: Create New Static Site
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Static Site"**
3. Select your `mohana_pyro_park` repository
4. Click **"Connect"**

### Step 2: Configure Frontend Service
Fill in these settings:

| Field | Value |
|-------|-------|
| Name | `mohana-pyro-park-frontend` |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Plan | `Free` |

### Step 3: Add Environment Variables
Click **"Add Environment Variable"**:

```
VITE_API_URL=https://mohana-pyro-park-backend.onrender.com/api
```

(Replace with your actual backend URL from Step 1)

### Step 4: Deploy
- Click **"Create Static Site"**
- Wait for build (3-5 minutes)
- Your site will be live at the provided Render URL

---

## PART 3: Update Frontend to Use Backend URL

### Option A: Already Set in VITE_API_URL
If you set `VITE_API_URL` in Render environment, the frontend will automatically use it.

### Option B: Update .env.example (for reference)
Edit `frontend/.env.example`:
```
VITE_API_URL=https://mohana-pyro-park-backend.onrender.com/api
```

---

## PART 4: Verify Deployment

### Test Backend
```bash
curl https://mohana-pyro-park-backend.onrender.com/api/health
```

Should return:
```json
{
  "success": true,
  "message": "Mohana Pyro Park API is running",
  "timestamp": "2026-05-07T..."
}
```

### Test Frontend
Visit `https://your-frontend-url.onrender.com` in browser. Should load successfully.

### Test Registration
1. Open frontend URL
2. Go to Register page
3. Try registering with valid Indian phone (10 digits, starts with 6-9)
4. Should work if backend and MongoDB are connected

---

## PART 5: Troubleshooting

### Backend won't start?
1. Check **Logs** in Render dashboard
2. Verify MongoDB Atlas connection string is correct
3. Ensure Render IP is whitelisted in Atlas
4. Check environment variables are all set

### Frontend shows blank page?
1. Check browser console for errors
2. Verify `VITE_API_URL` is set correctly
3. Check that backend URL is accessible

### Registration still fails?
1. Verify backend is running: `curl /api/health`
2. Check MongoDB Atlas connection
3. Whitelist the Render IP range in Atlas
4. Check backend logs for detailed error

### Free Tier Spinning Down
- Free Render services spin down after 15 minutes of inactivity
- First request will take 30-50 seconds to wake up
- Upgrade to Starter ($7/month) for always-on service

---

## Summary of URLs

| Service | Type | Render URL |
|---------|------|-----------|
| Backend | Web Service | `https://mohana-pyro-park-backend.onrender.com` |
| Frontend | Static Site | `https://mohana-pyro-park-frontend.onrender.com` |
| MongoDB | Atlas Cloud | `mongodb+srv://...` (already configured) |

---

## Important Notes

✅ **Keep Secure:**
- Don't commit `.env` files with secrets
- Use Render environment variables for sensitive data
- Rotate API keys regularly

✅ **For Production:**
- Upgrade from Free to Paid plan for better uptime
- Set up custom domain (optional)
- Enable automatic deploys on git push

✅ **Monitoring:**
- Check Render dashboard logs regularly
- Set up error notifications
- Monitor MongoDB Atlas usage

---

## Next Steps
1. Complete Steps 1-4 for backend deployment
2. Complete Steps 1-4 for frontend deployment
3. Run verification tests (Part 4)
4. Update any hardcoded URLs to use Render URLs
5. Test full user flow: Register → Login → Browse Products
