
# 🍔 Vingo - Food Delivery Application

<img src="https://t4.ftcdn.net/jpg/02/92/20/37/360_F_292203735_CSsyqyS6A4Z9Czd4Msf7qZEhoxjpzZl1.jpg" alt="Vingo Banner" width="1000" height="400" />



A full-stack, feature-rich food delivery platform built with the MERN stack. Vingo connects users with their favorite local restaurants, offering real-time order tracking, secure payments, and distinct dashboards for users, restaurant owners, and delivery partners.

---

## 🚀 Features

### 👤 User Features
- **Authentication**: Secure Login/Signup with Email & Password or Google OAuth (Firebase).
- **Restaurant Discovery**: Browse top restaurants by city and categories.
- **Search & Filter**: Advanced search for food items and filtering by price, veg/non-veg, and rating.
- **Cart & Checkout**: Seamless shopping cart experience with persistent state.
- **Payments**: Integrated Stripe for credit card payments and Cash on Delivery support.
- **Real-time Tracking**: Live order status updates using Socket.IO.
- **Responsive Design**: Mobile-first UI for ordering on the go.

### 🏪 Restaurant Owner Features
- **Dashboard**: Comprehensive overview of orders, earnings, and menu items.
- **Menu Management**: Add, edit, and delete food items with images (Cloudinary integration).
- **Order Management**: Accept or reject incoming orders in real-time.
- **Sales Analytics**: Track best-selling items and total revenue.

### 🛵 Delivery Partner Features
- **Delivery Dashboard**: View assigned orders and delivery route details.
- **Order Updates**: Update order status (Picked Up, Delivered) to notify customers.
- **Secure Verification**: OTP-based order delivery verification.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React.js, Redux Toolkit, Tailwind CSS, Vite |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | MongoDB, Mongoose |
| **Authentication** | Firebase Auth, JWT (JSON Web Tokens) |
| **Payments** | Stripe API |
| **Media** | Cloudinary (Image Uploads) |
| **Real-time** | Socket.IO |

---

## 📂 Project Structure

```
Food-Delivery-Full-Stack-App/
├── backend/                 # Node.js & Express Server
│   ├── controllers/         # Request handlers
│   ├── models/              # MongoDB Schemas
│   ├── routes/              # API Routes
│   ├── middleware/          # Auth & Error handling
│   ├── utils/               # Helper functions
│   └── index.js             # Entry point
│
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application views/pages
│   │   ├── redux/           # Global state management
│   │   ├── hooks/           # Custom React hooks
│   │   └── App.jsx          # Main App component
│   └── index.css            # Global styles (Tailwind imports)
└── README.md                # Project Documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Stripe Account
- Cloudinary Account
- Firebase Project

### 1. Clone the Repository
```bash
git clone https://github.com/adarsh-priydarshi-5646/Food-Delivery-Full-Stack-App.git
cd Food-Delivery-Full-Stack-App
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the frontend folder and install dependencies:
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

Start the frontend development server:
```bash
npm run dev
```

---

## 🌐 Usage

1.  **Home Page**: Visitors land on the new animated landing page.
2.  **Sign Up**: Create an account as a "User" to order food.
3.  **Owner Mode**: Sign up as "Owner" to create a restaurant and manage a menu.
4.  **Order Food**: Add items to cart -> Checkout -> Pay via Stripe.
5.  **Track Order**: Watch your order status update in real-time.

---

## 🔐 Default Credentials

Use these credentials to test the application logic (Password for all: `password123`).

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **User** | `user@vingo.com` | `password123` | Order food, track delivery |
| **Owner** | `owner@vingo.com` | `password123` | Manage menu, accept orders |
| **Delivery Boy** | `rider@vingo.com` | `password123` | View assigned orders, deliver |

> **Note**: For OTP verification during delivery or password reset, use the Master OTP: **`5646`**.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

> **Note**: This project uses a `seedDefaultRestaurant.js` script in the backend to populate initial data if needed.
