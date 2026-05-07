# Render Deployment Checklist

## Quick Reference - Copy & Paste Values

### Backend Environment Variables
Copy from your local `.env` file. They should include:
```
MONGODB_URI=mongodb+srv://your_user:your_pass@your_cluster.mongodb.net/?appName=Cluster0
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=Your Company <your_email@gmail.com>
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=your_twilio_number
TWILIO_WHATSAPP_FROM=whatsapp:your_whatsapp_number
```

**⚠️ IMPORTANT:** Copy values from your local `.env` file, not from examples.

---

## Backend Deployment Steps

- [ ] **1. Create Web Service**
  - Render Dashboard → New → Web Service
  - Select GitHub repo: `mohana_pyro_park`
  - Root Directory: `backend`

- [ ] **2. Configure Build**
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Environment: Node

- [ ] **3. Add All Environment Variables**
  - Paste values above into Render environment

- [ ] **4. Deploy & Copy URL**
  - Click "Create Web Service"
  - Wait 5-10 minutes for deployment
  - Copy backend URL (e.g., `https://mohana-pyro-park-backend.onrender.com`)

- [ ] **5. Whitelist IP in MongoDB Atlas**
  - MongoDB Atlas → Network Access
  - Add: `0.0.0.0/0` (or Render IP)
  - Confirm

- [ ] **6. Test Backend**
  ```
  curl https://[backend-url]/api/health
  ```

---

## Frontend Deployment Steps

- [ ] **1. Create Static Site**
  - Render Dashboard → New → Static Site
  - Select GitHub repo: `mohana_pyro_park`
  - Root Directory: `frontend`

- [ ] **2. Configure Build**
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`

- [ ] **3. Add Environment Variable**
  ```
  VITE_API_URL=https://[backend-url]/api
  ```
  (Replace `[backend-url]` with your backend URL from above)

- [ ] **4. Deploy & Copy URL**
  - Click "Create Static Site"
  - Wait 3-5 minutes
  - Copy frontend URL

- [ ] **5. Test Frontend**
  - Open frontend URL in browser
  - Should load without errors

---

## End-to-End Testing

- [ ] **Test API Health**
  ```
  curl https://[backend-url]/api/health
  ```

- [ ] **Test Registration**
  1. Open frontend URL
  2. Go to Register
  3. Enter test data:
     - Name: John Doe
     - Email: test@example.com
     - Phone: 9876543210 (10 digits, starts with 6-9)
     - Password: password123
  4. Click Register
  5. Should see success message

- [ ] **Test Login**
  1. Use registered credentials
  2. Should login successfully

- [ ] **Test Product Browse**
  1. Go to Products
  2. Should display list of products
  3. Can add to cart

---

## Troubleshooting Checklist

If Backend Won't Start:
- [ ] Check Logs in Render dashboard
- [ ] Verify MongoDB URI is correct
- [ ] Check IP whitelist in MongoDB Atlas
- [ ] Verify all env vars are set

If Frontend Won't Load:
- [ ] Check browser console for errors
- [ ] Verify VITE_API_URL is set
- [ ] Check backend is online
- [ ] Clear browser cache

If Registration Fails:
- [ ] Backend should return actual error (not "Registration failed")
- [ ] Check phone format: 10 digits, starts with 6-9
- [ ] Verify MongoDB connection
- [ ] Check backend logs

---

## Important Reminders

⚠️ **Free Tier Limitation:**
- Spins down after 15 min inactivity
- First request takes 30-50 sec to wake
- Upgrade to Starter ($7/mo) for always-on

🔒 **Security:**
- Don't commit `.env` files
- Use Render environment variables only
- Rotate secrets quarterly

📊 **Monitoring:**
- Check logs daily
- Monitor MongoDB usage
- Watch for failed requests

---

## Deployment Complete When:

✅ Backend URL returns health check
✅ Frontend URL loads without errors
✅ Registration works end-to-end
✅ Products display correctly
✅ No console errors in browser

---

## Support Links

- Render Docs: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Node.js Best Practices: https://nodejs.org/en/docs
