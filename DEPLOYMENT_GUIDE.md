# 🚀 Deployment Guide - Vingo Food Delivery App

## Complete Step-by-Step Deployment Instructions

---

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account
- ✅ Render account (for backend)
- ✅ Vercel account (for frontend)
- ✅ MongoDB Atlas account
- ✅ Stripe account
- ✅ Cloudinary account
- ✅ Gmail account (for emails)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Click "Build a Database"
4. Select "Free" tier (M0)
5. Choose cloud provider and region (closest to your users)
6. Click "Create Cluster"

### 1.2 Configure Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `vingo_admin`
5. Password: Generate secure password (save it!)
6. Database User Privileges: "Atlas admin"
7. Click "Add User"

### 1.3 Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.4 Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with `vingo`

**Example:**
```
mongodb+srv://vingo_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/vingo?retryWrites=true&w=majority
```

---

## ☁️ Step 2: Setup Cloudinary (Image Storage)

### 2.1 Create Cloudinary Account
1. Go to https://cloudinary.com
2. Sign up for free account
3. Verify email

### 2.2 Get API Credentials
1. Go to Dashboard
2. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

---

## 💳 Step 3: Setup Stripe (Payment)

### 3.1 Create Stripe Account
1. Go to https://stripe.com
2. Sign up / Log in
3. Complete account setup

### 3.2 Get API Keys
1. Go to Dashboard
2. Click "Developers" → "API keys"
3. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

**Note:** Use test keys for now. Switch to live keys when ready for production.

---

## 📧 Step 4: Setup Gmail App Password

### 4.1 Enable 2-Factor Authentication
1. Go to Google Account settings
2. Security → 2-Step Verification
3. Enable it

### 4.2 Generate App Password
1. Go to Security → App passwords
2. Select app: "Mail"
3. Select device: "Other" → Enter "Vingo App"
4. Click "Generate"
5. Copy the 16-character password

---

## 🖥️ Step 5: Deploy Backend to Render

### 5.1 Prepare Backend
1. Ensure `package.json` has:
```json
{
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

2. Commit and push to GitHub:
```bash
cd /Users/adarshpriydarshi/Desktop/Food-Delivery-Full-Stack-App-main
git add .
git commit -m "🚀 Prepare for deployment"
git push origin main
```

### 5.2 Create Render Web Service
1. Go to https://render.com
2. Sign up / Log in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select `Food-Delivery-Full-Stack-App`

### 5.3 Configure Web Service
**Basic Settings:**
- Name: `vingo-backend`
- Region: Choose closest to your users
- Branch: `main`
- Root Directory: `backend`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

**Instance Type:**
- Select "Free" tier

### 5.4 Add Environment Variables
Click "Advanced" → "Add Environment Variable"

Add these variables:

```
PORT=8000

MONGODB_URL=mongodb+srv://vingo_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/vingo?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_12345

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

CLOUDINARY_API_KEY=your_cloudinary_api_key

CLOUDINARY_API_SECRET=your_cloudinary_api_secret

MAIL_HOST=smtp.gmail.com

MAIL_PORT=587

MAIL_USER=your.email@gmail.com

MAIL_PASS=your_16_character_app_password

FRONTEND_URL=https://vingo-food-delivery.vercel.app

NODE_ENV=production
```

**Important:**
- Replace all placeholder values with actual credentials
- `FRONTEND_URL` will be updated after frontend deployment

### 5.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL (e.g., `https://vingo-backend.onrender.com`)

### 5.6 Seed Default Restaurant
After deployment, run seed command:
1. Go to Render dashboard
2. Click on your service
3. Go to "Shell" tab
4. Run: `node seedDefaultRestaurant.js`
5. Wait for completion

---

## 🌐 Step 6: Deploy Frontend to Vercel

### 6.1 Prepare Frontend

1. Update API URL in `frontend/src/App.jsx`:
```javascript
export const serverUrl = import.meta.env.PROD 
  ? "https://vingo-backend.onrender.com"  // Your Render URL
  : "http://localhost:8000"
```

2. Create `vercel.json` in frontend directory:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

3. Commit and push:
```bash
git add .
git commit -m "🚀 Configure frontend for deployment"
git push origin main
```

### 6.2 Deploy to Vercel
1. Go to https://vercel.com
2. Sign up / Log in with GitHub
3. Click "Add New" → "Project"
4. Import `Food-Delivery-Full-Stack-App` repository
5. Configure project:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 6.3 Add Environment Variables
Click "Environment Variables" and add:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 6.4 Deploy
1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Copy your frontend URL (e.g., `https://vingo-food-delivery.vercel.app`)

---

## 🔄 Step 7: Update Backend with Frontend URL

### 7.1 Update Render Environment Variable
1. Go to Render dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` with your Vercel URL
5. Click "Save Changes"
6. Service will auto-redeploy

---

## ✅ Step 8: Verify Deployment

### 8.1 Test Backend
1. Open: `https://vingo-backend.onrender.com`
2. Should see: "Cannot GET /" (This is normal)
3. Test API: `https://vingo-backend.onrender.com/api/user/current`
4. Should see: "Unauthorized" (This is correct)

### 8.2 Test Frontend
1. Open: `https://vingo-food-delivery.vercel.app`
2. Should see login page with animations
3. Try signing up
4. Try logging in

### 8.3 Test Complete Flow
1. **Sign Up:**
   - Create new user account
   - Should redirect to home

2. **Browse:**
   - Select city
   - View restaurants
   - See Vingo Express (default restaurant)

3. **Order (COD):**
   - Add items to cart
   - Checkout
   - Select "Cash on Delivery"
   - Place order
   - Should see success page

4. **Order (Stripe):**
   - Add items to cart
   - Checkout
   - Select "Online Payment"
   - Use test card: `4242 4242 4242 4242`
   - Complete payment
   - Should redirect back and verify

5. **Owner Dashboard:**
   - Login with: `default@owner.com` / `password123`
   - Should see Vingo Express restaurant
   - Check if new orders appear

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Backend not starting
- Check Render logs
- Verify all environment variables
- Check MongoDB connection string

**Problem:** CORS errors
- Verify `FRONTEND_URL` in backend env
- Check CORS configuration in `index.js`

**Problem:** Database connection failed
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check database user permissions

### Frontend Issues

**Problem:** API calls failing
- Check `serverUrl` in `App.jsx`
- Verify backend is running
- Check browser console for errors

**Problem:** Stripe not working
- Verify `VITE_STRIPE_PUBLISHABLE_KEY`
- Check Stripe dashboard for errors
- Use test card numbers

**Problem:** Images not loading
- Check Cloudinary credentials
- Verify image URLs
- Check browser console

---

## 🔐 Security Checklist

Before going live:

- [ ] Change JWT_SECRET to strong random string
- [ ] Use Stripe live keys (not test keys)
- [ ] Enable HTTPS only
- [ ] Set secure cookie options
- [ ] Limit MongoDB IP whitelist
- [ ] Enable rate limiting
- [ ] Add input validation
- [ ] Sanitize user inputs
- [ ] Enable CORS only for your domain
- [ ] Use environment variables for all secrets
- [ ] Enable 2FA on all accounts
- [ ] Regular security audits

---

## 📊 Monitoring

### Render Monitoring
- Go to Render dashboard
- Check "Metrics" tab
- Monitor CPU, Memory, Response time

### Vercel Monitoring
- Go to Vercel dashboard
- Check "Analytics" tab
- Monitor page views, performance

### Database Monitoring
- Go to MongoDB Atlas
- Check "Metrics" tab
- Monitor connections, operations

---

## 🔄 Continuous Deployment

Both Render and Vercel support automatic deployments:

1. **Push to GitHub:**
```bash
git add .
git commit -m "Update feature"
git push origin main
```

2. **Auto Deploy:**
   - Render: Automatically deploys backend
   - Vercel: Automatically deploys frontend

---

## 💰 Cost Breakdown

### Free Tier Limits

**Render (Free):**
- ✅ 750 hours/month
- ✅ 512 MB RAM
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ Cold start: 30-60 seconds

**Vercel (Free):**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Always on (no sleep)

**MongoDB Atlas (Free):**
- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ Good for 1000+ users

**Cloudinary (Free):**
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month

**Stripe:**
- ✅ No monthly fees
- 💰 2.9% + ₹3 per transaction

---

## 🚀 Upgrade Options

### When to Upgrade

**Render:**
- Upgrade when you need:
  - No sleep (always on)
  - More RAM/CPU
  - Custom domains
- Cost: $7/month

**MongoDB Atlas:**
- Upgrade when you need:
  - More storage
  - Better performance
  - Backups
- Cost: $9/month

**Vercel:**
- Upgrade when you need:
  - More bandwidth
  - Team collaboration
  - Advanced analytics
- Cost: $20/month

---

## 📝 Post-Deployment Tasks

### 1. Custom Domain (Optional)
**Render:**
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records

**Vercel:**
1. Go to Settings → Domains
2. Add your domain
3. Update DNS records

### 2. SSL Certificate
- Both Render and Vercel provide free SSL
- Automatically enabled

### 3. Email Configuration
- Verify Gmail app password working
- Test OTP emails
- Check spam folder

### 4. Payment Testing
- Test with Stripe test cards
- Verify webhook events
- Check payment logs

### 5. Performance Optimization
- Enable caching
- Optimize images
- Minify assets
- Use CDN

---

## 📞 Support

### Render Support
- Docs: https://render.com/docs
- Community: https://community.render.com

### Vercel Support
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

### MongoDB Support
- Docs: https://docs.mongodb.com
- Community: https://community.mongodb.com

---

## 🎉 Congratulations!

Your Vingo Food Delivery App is now live! 🚀

**URLs:**
- Frontend: `https://vingo-food-delivery.vercel.app`
- Backend: `https://vingo-backend.onrender.com`

**Next Steps:**
1. Share with users
2. Monitor performance
3. Collect feedback
4. Iterate and improve

---

<div align="center">

**Made with ❤️ by Adarsh Priydarshi**

**⭐ Star the repo if you found this helpful!**

</div>
