# 🍕 Vingo - Full Stack Food Delivery Application

<div align="center">

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge)
![Production Ready](https://img.shields.io/badge/Production-Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A modern, full-stack food delivery platform with real-time tracking, multiple payment options, and role-based dashboards**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [User Roles](#-user-roles)
- [Payment Integration](#-payment-integration)
- [Folder Structure](#-folder-structure)

---

## 🌟 Overview

**Vingo** is a production-ready food delivery application built with the MERN stack. It features real-time order tracking, multiple payment methods, location-based restaurant discovery, and comprehensive dashboards for users, restaurant owners, and delivery partners.

### Key Highlights

- ✨ Modern UI with animated backgrounds
- 🏪 Default Restaurant (Vingo Express) available in all cities
- 💳 Multiple Payment Methods - Stripe & Cash on Delivery
- 📍 Location-Based restaurant and delivery boy assignment
- 🔔 Real-Time Notifications using Socket.IO
- ⭐ Rating System for orders and items
- 🏦 Bank Account Management for owners
- 🔐 Secure Authentication with JWT

---

## ✨ Features

### For Customers
- 🔐 Email/Password & Google OAuth authentication
- 🏙️ City-based restaurant browsing
- 🔍 Search & filter food items
- 🛒 Shopping cart management
- 💳 Stripe (Card) & COD payment options
- 📦 Real-time order tracking
- ⭐ Rate orders and food items
- 🗑️ Delete pending orders

### For Restaurant Owners
- 🏪 Create and manage restaurant
- 🍽️ Add/edit/delete menu items
- 📊 Dashboard with statistics
- 🏦 Bank account management
- 💰 Automatic earnings tracking
- 🔔 Real-time order notifications
- 📈 Revenue analytics

### For Delivery Partners
- 🏍️ Location-based order assignment (5km radius)
- 📍 Real-time GPS tracking
- 📦 Accept and deliver orders
- 🔐 OTP-based delivery verification
- 🔄 Resend OTP with cooldown
- 💰 Daily earnings dashboard
- 📊 Performance statistics

---

## 🛠️ Tech Stack

### Frontend
- React.js, Redux Toolkit, React Router
- Tailwind CSS, React Icons
- Socket.IO Client, Axios
- Recharts, React Spinners

### Backend
- Node.js, Express.js
- MongoDB, Mongoose
- Socket.IO, JWT, Bcrypt
- Nodemailer, Cloudinary, Stripe

---

## 📥 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Stripe Account
- Cloudinary Account

### Step 1: Clone Repository
```bash
git clone https://github.com/adarsh-priydarshi-5646/Food-Delivery-Full-Stack-App.git
cd Food-Delivery-Full-Stack-App-main
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
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

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file in frontend directory:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Step 4: Seed Default Restaurant
```bash
cd backend
node seedDefaultRestaurant.js
```

This creates:
- Default owner account (email: `default@owner.com`, password: `password123`)
- Vingo Express restaurant
- 12 food items with real images

### Step 5: Start Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Application will run on:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

---

## 🔐 Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017/vingo` |
| `JWT_SECRET` | JWT secret key | `your_secret_key` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` |
| `MAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USER` | Email address | `your@email.com` |
| `MAIL_PASS` | Email app password | `your_app_password` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:5173` |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |

---

## 🚀 Usage

### 1. User Flow
1. Sign up / Sign in
2. Select city
3. Browse restaurants
4. Add items to cart
5. Checkout with Stripe or COD
6. Track order in real-time
7. Rate order after delivery

### 2. Owner Flow
1. Login with owner account
2. Create restaurant
3. Add food items
4. Add bank account details
5. Receive orders
6. Track earnings

### 3. Delivery Boy Flow
1. Login as delivery boy
2. View available orders
3. Accept order
4. Navigate to customer
5. Mark as delivered with OTP
6. View earnings

---

## 👥 User Roles

### User (Customer)
- Browse and order food
- Track deliveries
- Rate orders

### Owner (Restaurant)
- Manage restaurant and menu
- View orders and earnings
- Bank account management

### Delivery Boy
- Accept delivery assignments
- Real-time location tracking
- OTP-based delivery confirmation

---

## 💳 Payment Integration

### Stripe (Online Payment)
- Test Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVV: Any 3 digits
- Automatic payment verification
- Owner earnings auto-updated

### Cash on Delivery (COD)
- Instant order confirmation
- Payment collected by delivery boy
- Manual earnings tracking

---

## 📁 Folder Structure

```
Food-Delivery-Full-Stack-App-main/
│
├── backend/
│   ├── config/
│   │   └── stripe.js
│   ├── controllers/
│   │   ├── auth.controllers.js
│   │   ├── order.controllers.js
│   │   ├── shop.controllers.js
│   │   └── user.controllers.js
│   ├── middlewares/
│   │   └── isAuth.js
│   ├── models/
│   │   ├── deliveryAssignment.model.js
│   │   ├── item.model.js
│   │   ├── order.model.js
│   │   ├── shop.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── item.routes.js
│   │   ├── order.routes.js
│   │   ├── shop.routes.js
│   │   └── user.routes.js
│   ├── utils/
│   │   └── mail.js
│   ├── index.js
│   ├── seedDefaultRestaurant.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeliveryBoy.jsx
│   │   │   ├── Nav.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   └── UserDashboard.jsx
│   │   ├── pages/
│   │   │   ├── BankDetails.jsx
│   │   │   ├── CheckOut.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── MyOrders.jsx
│   │   │   ├── OrderPlaced.jsx
│   │   │   ├── SignIn.jsx
│   │   │   └── SignUp.jsx
│   │   ├── redux/
│   │   │   ├── ownerSlice.js
│   │   │   └── userSlice.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## 🎯 Key Features Explained

### Real-Time Notifications
- Socket.IO for instant updates
- Order status changes
- New order alerts for owners
- Delivery assignments for delivery boys

### Location-Based Services
- MongoDB geospatial queries
- 5km radius for delivery boy assignment
- City-based restaurant filtering

### OTP Verification
- Secure delivery confirmation
- Email-based OTP
- 30-second resend cooldown
- 5-minute expiration

### Payment Flow
```
Order Placed → Payment → Verification → Owner Notified → Delivery Boy Assigned → Delivered
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Blank Page**
- Check browser console for errors
- Verify all environment variables
- Restart both servers

**2. Payment Not Working**
- Verify Stripe keys
- Check browser console logs
- Use "Retry Verification" button

**3. Delivery Boy Not Getting Orders**
- Enable location permission
- Check 5km radius
- Ensure not already assigned

---

## 📝 Default Accounts

### Owner Account
- Email: `default@owner.com`
- Password: `password123`
- Restaurant: Vingo Express

### Test Cards (Stripe)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Adarsh Priydarshi**

- GitHub: [@adarsh-priydarshi-5646](https://github.com/adarsh-priydarshi-5646)

---

## 🙏 Acknowledgments

- Stripe for payment processing
- Cloudinary for image storage
- MongoDB for database
- React community for amazing libraries

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by Adarsh Priydarshi

</div>
