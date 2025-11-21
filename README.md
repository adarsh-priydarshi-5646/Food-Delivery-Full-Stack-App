# Vingo - Food Delivery Application

A full-stack food delivery platform with real-time tracking, multiple payment options, and role-based dashboards.

## Tech Stack

**Frontend:** React.js, Redux Toolkit, Tailwind CSS, Socket.IO Client  
**Backend:** Node.js, Express.js, MongoDB, Socket.IO, JWT, Stripe

## Features

- Email/Password & Google OAuth authentication
- City-based restaurant browsing
- Shopping cart and checkout
- Stripe & Cash on Delivery payments
- Real-time order tracking
- Rating system
- Restaurant owner dashboard
- Delivery partner tracking with OTP verification

---

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- Stripe Account
- Cloudinary Account

### Setup

1. Clone repository
```bash
git clone https://github.com/adarsh-priydarshi-5646/Food-Delivery-Full-Stack-App.git
cd Food-Delivery-Full-Stack-App
```

2. Backend setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

3. Frontend setup
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

4. Seed default restaurant
```bash
cd backend
node seedDefaultRestaurant.js
```

5. Start application
```bash
cd backend && npm run dev
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:8000

## Default Accounts

Owner: `default@owner.com` / `password123`  
Stripe Test Card: `4242 4242 4242 4242`

## License

MIT License

## Author

Adarsh Priydarshi - [@adarsh-priydarshi-5646](https://github.com/adarsh-priydarshi-5646)
