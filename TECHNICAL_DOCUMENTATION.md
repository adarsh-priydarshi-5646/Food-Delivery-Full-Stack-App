# 📚 Technical Documentation - Vingo Food Delivery App

## Complete Code Explanation & Working Flow

---

## 📋 Table of Contents

1. [Project Architecture](#project-architecture)
2. [Backend Deep Dive](#backend-deep-dive)
3. [Frontend Deep Dive](#frontend-deep-dive)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Real-Time Communication](#real-time-communication)
7. [Payment Flow](#payment-flow)
8. [Authentication Flow](#authentication-flow)
9. [Order Flow](#order-flow)
10. [Deployment Guide](#deployment-guide)

---

## 🏗️ Project Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   User     │  │   Owner    │  │ Delivery   │        │
│  │ Dashboard  │  │ Dashboard  │  │    Boy     │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                  EXPRESS.JS SERVER                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Middleware Layer                     │   │
│  │  • CORS  • Body Parser  • Auth  • File Upload   │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Routes Layer                         │   │
│  │  /api/auth  /api/order  /api/shop  /api/user    │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Controllers Layer                      │   │
│  │  Business Logic & Request Handling               │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Models Layer                         │   │
│  │  Mongoose Schemas & Database Operations          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐     │
│  │Users │  │Shops │  │Items │  │Orders│  │Assign│     │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend Deep Dive

### 1. Entry Point: `index.js`

```javascript
// backend/index.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { Server } from "socket.io";
import { createServer } from "http";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Create HTTP server for Socket.IO
const server = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Make io accessible in routes
app.set("io", io);

// Middleware Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Allow cookies
  })
);
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies

// Import Routes
import authRouter from "./routes/auth.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";
import userRouter from "./routes/user.routes.js";

// Mount Routes
app.use("/api/auth", authRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);
app.use("/api/user", userRouter);

// Socket.IO Connection Handler
const userSocketMap = new Map(); // userId -> socketId mapping

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // User identifies themselves
  socket.on("identity", ({ userId }) => {
    userSocketMap.set(userId, socket.id);
    
    // Update user's socketId in database
    User.findByIdAndUpdate(userId, { 
      socketId: socket.id,
      isOnline: true 
    }).catch(err => console.error(err));
  });

  // Delivery boy location update
  socket.on("updateLocation", async ({ latitude, longitude, userId }) => {
    try {
      await User.findByIdAndUpdate(userId, {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      });
    } catch (error) {
      console.error("Location update error:", error);
    }
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    // Find and remove user from map
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        
        // Update database
        User.findByIdAndUpdate(userId, { 
          isOnline: false 
        }).catch(err => console.error(err));
        break;
      }
    }
    console.log("Client disconnected:", socket.id);
  });
});

// Connect to Database
connectDB();

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Key Points:**
- Express app with HTTP server for Socket.IO
- CORS enabled for frontend communication
- Cookie parser for JWT authentication
- Socket.IO for real-time features
- User-socket mapping for targeted notifications

---

### 2. Database Connection: `config/db.js`

```javascript
// backend/config/db.js

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1); // Exit if database connection fails
  }
};
```

**Key Points:**
- Mongoose for MongoDB ODM
- Connection string from environment variables
- Error handling with process exit

---

### 3. User Model: `models/user.model.js`

```javascript
// backend/models/user.model.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Unique index for email
    },
    password: {
      type: String,
      // Not required for Google OAuth users
    },
    mobile: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "owner", "deliveryBoy"], // Only these 3 roles allowed
      required: true,
    },
    // Password reset fields
    resetOtp: {
      type: String,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    otpExpires: {
      type: Date,
    },
    // Socket.IO fields
    socketId: {
      type: String,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    // Geospatial location for delivery boys
    location: {
      type: { 
        type: String, 
        enum: ["Point"], 
        default: "Point" 
      },
      coordinates: { 
        type: [Number], 
        default: [0, 0] // [longitude, latitude]
      },
    },
    // Bank details for restaurant owners
    bankDetails: {
      accountHolderName: {
        type: String,
        default: "",
      },
      accountNumber: {
        type: String,
        default: "",
      },
      ifscCode: {
        type: String,
        default: "",
      },
      bankName: {
        type: String,
        default: "",
      },
      upiId: {
        type: String,
        default: "",
      },
    },
    // Total earnings for owners
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

// Create 2dsphere index for geospatial queries
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;
```

**Key Points:**
- Three user roles: user, owner, deliveryBoy
- Geospatial indexing for location-based queries
- Bank details for payment settlements
- Socket.IO integration fields
- Timestamps for audit trail

---

### 4. Authentication Controller: `controllers/auth.controllers.js`

#### Sign Up Flow

```javascript
// backend/controllers/auth.controllers.js

import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    // Step 1: Validate input
    if (!fullName || !email || !password || !mobile || !role) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    // Step 2: Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists with this email" 
      });
    }

    // Step 3: Hash password
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 4: Create new user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      role,
    });

    // Step 5: Generate JWT token
    const token = generateToken(newUser._id);

    // Step 6: Set cookie with token
    res.cookie("token", token, {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Step 7: Return user data (without password)
    const userResponse = {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      mobile: newUser.mobile,
      role: newUser.role,
    };

    return res.status(201).json(userResponse);
  } catch (error) {
    console.error("SignUp Error:", error);
    return res.status(500).json({ 
      message: `Sign up error: ${error.message}` 
    });
  }
};
```

**Sign Up Flow Diagram:**
```
User submits form
    ↓
Validate all fields
    ↓
Check if email exists
    ↓
Hash password (bcrypt)
    ↓
Create user in database
    ↓
Generate JWT token
    ↓
Set HTTP-only cookie
    ↓
Return user data
```

#### Sign In Flow

```javascript
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Step 2: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid email or password" 
      });
    }

    // Step 3: Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        message: "Invalid email or password" 
      });
    }

    // Step 4: Generate JWT token
    const token = generateToken(user._id);

    // Step 5: Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Step 6: Return user data
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    };

    return res.status(200).json(userResponse);
  } catch (error) {
    console.error("SignIn Error:", error);
    return res.status(500).json({ 
      message: `Sign in error: ${error.message}` 
    });
  }
};
```

**Sign In Flow Diagram:**
```
User submits credentials
    ↓
Validate input
    ↓
Find user by email
    ↓
Compare password hash
    ↓
Generate JWT token
    ↓
Set HTTP-only cookie
    ↓
Return user data
```

---

### 5. Authentication Middleware: `middlewares/isAuth.js`

```javascript
// backend/middlewares/isAuth.js

import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    // Step 1: Get token from cookie
    const token = req.cookies.token;

    // Step 2: Check if token exists
    if (!token) {
      return res.status(401).json({ 
        message: "Unauthorized - No token provided" 
      });
    }

    // Step 3: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Attach userId to request object
    req.userId = decoded.userId;

    // Step 5: Continue to next middleware/controller
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        message: "Unauthorized - Invalid token" 
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Unauthorized - Token expired" 
      });
    }

    return res.status(500).json({ 
      message: "Authentication error" 
    });
  }
};

export default isAuth;
```

**Authentication Flow:**
```
Request received
    ↓
Extract token from cookie
    ↓
Verify JWT signature
    ↓
Decode userId from token
    ↓
Attach userId to request
    ↓
Call next middleware/controller
```

---

### 6. Order Model: `models/order.model.js`

```javascript
// backend/models/order.model.js

import mongoose from "mongoose";

// Sub-schema for shop order items
const shopOrderItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item", // Reference to Item model
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  // Rating for individual items
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
});

// Sub-schema for shop orders (one order can have multiple shop orders)
const shopOrderSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shopOrderItems: [shopOrderItemSchema], // Array of items
  subtotal: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "preparing", "out for delivery", "delivered"],
    default: "pending",
  },
  // Delivery boy assignment
  assignedDeliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryAssignment",
  },
  // OTP for delivery verification
  deliveryOtp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
});

// Main order schema
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopOrders: [shopOrderSchema], // Array of shop orders
    deliveryAddress: {
      text: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    payment: {
      type: Boolean,
      default: false, // True when payment is confirmed
    },
    razorpayPaymentId: {
      type: String, // Stripe payment intent ID
    },
    // Order rating
    orderRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
```

**Order Structure:**
```
Order (Main)
  ├── User (Customer)
  ├── Delivery Address
  ├── Payment Info
  └── Shop Orders (Array)
        ├── Shop 1
        │   ├── Owner
        │   ├── Items (Array)
        │   ├── Delivery Boy
        │   └── Status
        └── Shop 2
            ├── Owner
            ├── Items (Array)
            ├── Delivery Boy
            └── Status
```

---

### 7. Order Controller: `controllers/order.controllers.js`

#### Place Order Flow

```javascript
// backend/controllers/order.controllers.js

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    // Step 1: Validate cart
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Step 2: Validate delivery address
    if (!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
      return res.status(400).json({ message: "Invalid delivery address" });
    }

    // Step 3: Group items by shop
    const shopOrdersMap = new Map();
    
    for (const cartItem of cartItems) {
      const item = await Item.findById(cartItem.itemId).populate("shop");
      
      if (!item) {
        return res.status(400).json({ 
          message: `Item not found: ${cartItem.itemId}` 
        });
      }

      const shopId = item.shop._id.toString();
      
      if (!shopOrdersMap.has(shopId)) {
        shopOrdersMap.set(shopId, {
          shop: item.shop._id,
          owner: item.shop.owner,
          shopOrderItems: [],
          subtotal: 0,
        });
      }

      const shopOrder = shopOrdersMap.get(shopId);
      shopOrder.shopOrderItems.push({
        item: item._id,
        quantity: cartItem.quantity,
        price: item.price,
      });
      shopOrder.subtotal += item.price * cartItem.quantity;
    }

    const shopOrders = Array.from(shopOrdersMap.values());

    // Step 4: Create order
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
      payment: paymentMethod === "cod" ? true : false, // COD is pre-paid
    });

    // Step 5: Populate order data
    await newOrder.populate("shopOrders.shopOrderItems.item", "name image price");
    await newOrder.populate("shopOrders.shop", "name");
    await newOrder.populate("shopOrders.owner", "name socketId");
    await newOrder.populate("user", "name email mobile");

    const io = req.app.get("io");

    // Step 6: For COD, notify owner and assign delivery boy immediately
    if (paymentMethod === "cod" && io) {
      // Notify owners
      newOrder.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            user: newOrder.user,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            deliveryAddress: newOrder.deliveryAddress,
            payment: newOrder.payment,
          });
        }
      });

      // Assign delivery boys
      await assignDeliveryBoys(newOrder, io);
    }

    return res.status(201).json(newOrder);
  } catch (error) {
    console.error("Place Order Error:", error);
    return res.status(500).json({ 
      message: `Place order error: ${error.message}` 
    });
  }
};
```

**Place Order Flow:**
```
User clicks "Place Order"
    ↓
Validate cart items
    ↓
Group items by shop
    ↓
Calculate subtotals
    ↓
Create order in database
    ↓
If COD:
  ├── Notify owners (Socket.IO)
  └── Assign delivery boys
If Online:
  └── Wait for payment verification
    ↓
Return order data
```

---

### 8. Delivery Boy Assignment Logic

```javascript
// Helper function to assign delivery boys
const assignDeliveryBoys = async (order, io) => {
  try {
    for (const shopOrder of order.shopOrders) {
      const { longitude, latitude } = order.deliveryAddress;
      
      // Step 1: Find nearby delivery boys using geospatial query
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000, // 5km radius
          },
        },
      });

      if (nearByDeliveryBoys.length === 0) {
        console.log("No delivery boys found nearby");
        continue;
      }

      const nearByIds = nearByDeliveryBoys.map((b) => b._id);
      
      // Step 2: Find busy delivery boys
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["brodcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));
      
      // Step 3: Filter available delivery boys
      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id))
      );

      if (availableBoys.length === 0) {
        console.log("No available delivery boys");
        continue;
      }

      const candidates = availableBoys.map((b) => b._id);

      // Step 4: Create delivery assignment
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        brodcastedTo: candidates, // Array of delivery boy IDs
        status: "brodcasted",
      });

      shopOrder.assignment = deliveryAssignment._id;
      await order.save();

      await deliveryAssignment.populate("order");
      await deliveryAssignment.populate("shop");

      // Step 5: Notify all available delivery boys
      availableBoys.forEach((boy) => {
        const boySocketId = boy.socketId;
        if (boySocketId && io) {
          io.to(boySocketId).emit("newAssignment", {
            sentTo: boy._id,
            assignmentId: deliveryAssignment._id,
            orderId: deliveryAssignment.order._id,
            shopName: deliveryAssignment.shop.name,
            deliveryAddress: deliveryAssignment.order.deliveryAddress,
            items: shopOrder.shopOrderItems.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal: shopOrder.subtotal,
          });
        }
      });
    }
  } catch (error) {
    console.error("Error assigning delivery boys:", error);
  }
};
```

**Delivery Boy Assignment Flow:**
```
Order confirmed
    ↓
For each shop order:
  ├── Find delivery boys within 5km (MongoDB geospatial query)
  ├── Filter out busy delivery boys
  ├── Create delivery assignment
  └── Broadcast to all available boys (Socket.IO)
    ↓
First to accept gets the order
```

---

### 9. Stripe Payment Integration

#### Create Payment Intent

```javascript
// backend/controllers/order.controllers.js

export const createStripePaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ 
        message: "Stripe not configured" 
      });
    }

    const { amount, orderId } = req.body;
    const user = await User.findById(req.userId);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Vingo Food Order",
              description: `Order ID: ${orderId}`,
              images: ["https://example.com/food-image.jpg"],
            },
            unit_amount: Math.round(amount * 100), // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/order-placed?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
      customer_email: user.email,
      client_reference_id: orderId,
      metadata: {
        orderId: orderId,
        userId: req.userId,
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url, // Redirect URL
    });
  } catch (error) {
    console.error("Stripe payment error:", error);
    return res.status(500).json({ 
      message: `Stripe payment error: ${error.message}` 
    });
  }
};
```

#### Verify Payment

```javascript
export const verifyStripePayment = async (req, res) => {
  try {
    const { sessionId, orderId } = req.body;

    // Step 1: Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Step 2: Verify payment status
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // Step 3: Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }

    // Step 4: Update order payment status
    order.payment = true;
    order.razorpayPaymentId = session.payment_intent;
    await order.save();

    // Step 5: Populate order data
    await order.populate("shopOrders.shopOrderItems.item", "name image price");
    await order.populate("shopOrders.shop", "name");
    await order.populate("shopOrders.owner", "name socketId");
    await order.populate("user", "name email mobile");

    // Step 6: Update owner earnings
    for (const shopOrder of order.shopOrders) {
      const owner = await User.findById(shopOrder.owner._id);
      if (owner) {
        owner.totalEarnings = (owner.totalEarnings || 0) + shopOrder.subtotal;
        await owner.save();
      }
    }

    const io = req.app.get("io");

    // Step 7: Notify owners and assign delivery boys
    if (io) {
      // Notify owners
      order.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: order._id,
            paymentMethod: order.paymentMethod,
            user: order.user,
            shopOrders: shopOrder,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
            payment: order.payment,
          });
        }
      });

      // Assign delivery boys
      await assignDeliveryBoys(order, io);
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Verify stripe payment error:", error);
    return res.status(500).json({ 
      message: `Verify stripe payment error: ${error.message}` 
    });
  }
};
```

**Payment Flow:**
```
User clicks "Pay with Card"
    ↓
Create Stripe Checkout Session
    ↓
Redirect to Stripe payment page
    ↓
User completes payment
    ↓
Stripe redirects back with session_id
    ↓
Frontend calls verify API
    ↓
Backend verifies with Stripe
    ↓
Update order.payment = true
    ↓
Update owner.totalEarnings
    ↓
Notify owner (Socket.IO)
    ↓
Assign delivery boys
```

---

## 🎨 Frontend Deep Dive

### 1. Entry Point: `main.jsx`

```javascript
// frontend/src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
```

**Key Points:**
- Redux Provider for global state
- React Router for navigation
- Strict Mode for development warnings

---

### 2. Redux Store: `redux/store.js`

```javascript
// frontend/src/redux/store.js

import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import ownerReducer from './ownerSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    owner: ownerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for Socket.IO
    }),
})
```

---

### 3. User Slice: `redux/userSlice.js`

```javascript
// frontend/src/redux/userSlice.js

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userData: null,
  currentCity: null,
  shopInMyCity: [],
  itemsInMyCity: [],
  searchItems: null,
  myOrders: [],
  cartItems: [],
  socket: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set user data after login
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    
    // Set current city
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload
    },
    
    // Set shops in city
    setShopInMyCity: (state, action) => {
      state.shopInMyCity = action.payload
    },
    
    // Set items in city
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload
    },
    
    // Add to cart
    addToCart: (state, action) => {
      const existingItem = state.cartItems.find(
        item => item.itemId === action.payload.itemId
      )
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.cartItems.push({ ...action.payload, quantity: 1 })
      }
    },
    
    // Remove from cart
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        item => item.itemId !== action.payload
      )
    },
    
    // Clear cart
    clearCart: (state) => {
      state.cartItems = []
    },
    
    // Set Socket.IO instance
    setSocket: (state, action) => {
      state.socket = action.payload
    },
    
    // Set my orders
    setMyOrders: (state, action) => {
      state.myOrders = action.payload
    },
    
    // Add new order
    addMyOrder: (state, action) => {
      state.myOrders.unshift(action.payload)
    },
  },
})

export const {
  setUserData,
  setCurrentCity,
  setShopInMyCity,
  setItemsInMyCity,
  addToCart,
  removeFromCart,
  clearCart,
  setSocket,
  setMyOrders,
  addMyOrder,
} = userSlice.actions

export default userSlice.reducer
```

**Redux State Structure:**
```javascript
{
  user: {
    userData: { _id, fullName, email, role, ... },
    currentCity: "Mumbai",
    shopInMyCity: [{ shop1 }, { shop2 }],
    itemsInMyCity: [{ item1 }, { item2 }],
    cartItems: [{ itemId, quantity, price }],
    myOrders: [{ order1 }, { order2 }],
    socket: SocketIOInstance,
  },
  owner: {
    myShopData: { shop details },
  }
}
```

---

### 4. Custom Hook: `useGetCurrentUser.jsx`

```javascript
// frontend/src/hooks/useGetCurrentUser.jsx

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'

const useGetCurrentUser = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Call API to get current user
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true, // Send cookies
        })
        
        // Update Redux state
        dispatch(setUserData(result.data))
      } catch (error) {
        console.error('Get current user error:', error)
        // User not logged in
      }
    }

    fetchCurrentUser()
  }, [dispatch])
}

export default useGetCurrentUser
```

**Usage in App.jsx:**
```javascript
function App() {
  useGetCurrentUser() // Fetch user on app load
  useGetCity()
  useGetMyshop()
  // ... other hooks

  return <Routes>...</Routes>
}
```

---

### 5. Sign In Page: `pages/SignIn.jsx`

```javascript
// frontend/src/pages/SignIn.jsx (Simplified)

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSignIn = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Call sign in API
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true } // Send/receive cookies
      )
      
      // Update Redux state
      dispatch(setUserData(result.data))
      
      // Navigate to home
      navigate('/')
    } catch (error) {
      setError(error?.response?.data?.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-8">Sign In</h1>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2 rounded-lg"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}
```

**Sign In Flow (Frontend):**
```
User enters email/password
    ↓
Click "Sign In"
    ↓
POST /api/auth/signin with credentials
    ↓
Backend validates & returns user data + cookie
    ↓
Update Redux state with user data
    ↓
Navigate to home page
```

---

### 6. User Dashboard: `components/UserDashboard.jsx`

```javascript
// frontend/src/components/UserDashboard.jsx (Simplified)

import { useSelector } from 'react-redux'
import FoodCard from './FoodCard'
import CategoryCard from './CategoryCard'

function UserDashboard() {
  // Get data from Redux store
  const { currentCity, shopInMyCity, itemsInMyCity } = useSelector(
    (state) => state.user
  )

  return (
    <div className="w-screen min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 p-12 text-white">
        <h1 className="text-5xl font-bold">Craving Something Delicious?</h1>
        <p className="text-xl mt-4">
          Order from {shopInMyCity?.length || 0} restaurants in {currentCity}
        </p>
      </div>

      {/* Categories */}
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-4">Categories</h2>
        <div className="flex gap-4 overflow-x-auto">
          {categories.map((category) => (
            <CategoryCard key={category.name} data={category} />
          ))}
        </div>
      </div>

      {/* Food Items */}
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-4">Popular Dishes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {itemsInMyCity?.map((item) => (
            <FoodCard key={item._id} data={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

### 7. Food Card Component: `components/FoodCard.jsx`

```javascript
// frontend/src/components/FoodCard.jsx (Simplified)

import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/userSlice'

function FoodCard({ data }) {
  const dispatch = useDispatch()

  const handleAddToCart = () => {
    dispatch(addToCart({
      itemId: data._id,
      name: data.name,
      price: data.price,
      image: data.image,
    }))
    
    alert('Added to cart!')
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <img 
        src={data.image} 
        alt={data.name}
        className="w-full h-48 object-cover"
      />
      
      <div className="p-4">
        <h3 className="text-xl font-bold">{data.name}</h3>
        <p className="text-gray-600">{data.category}</p>
        <p className="text-2xl font-bold text-orange-500 mt-2">
          ₹{data.price}
        </p>
        
        <button
          onClick={handleAddToCart}
          className="w-full bg-orange-500 text-white py-2 rounded-lg mt-4"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}
```

---

### 8. Checkout Page: `pages/CheckOut.jsx`

```javascript
// frontend/src/pages/CheckOut.jsx (Simplified)

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function CheckOut() {
  const { cartItems, userData } = useSelector((state) => state.user)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [deliveryAddress, setDeliveryAddress] = useState({
    text: '',
    latitude: 0,
    longitude: 0,
  })
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()

  // Calculate total
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const handlePlaceOrder = async () => {
    setLoading(true)
    
    try {
      // Step 1: Place order
      const orderResult = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          cartItems,
          paymentMethod,
          deliveryAddress,
          totalAmount,
        },
        { withCredentials: true }
      )

      const orderId = orderResult.data._id

      // Step 2: Handle payment
      if (paymentMethod === 'online') {
        // Create Stripe payment
        const paymentResult = await axios.post(
          `${serverUrl}/api/order/create-stripe-payment`,
          { amount: totalAmount, orderId },
          { withCredentials: true }
        )

        // Redirect to Stripe
        window.location.href = paymentResult.data.url
      } else {
        // COD - Navigate to success page
        navigate('/order-placed')
      }
    } catch (error) {
      console.error('Place order error:', error)
      alert('Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Cart Items */}
      <div className="bg-white p-6 rounded-xl mb-6">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.itemId} className="flex justify-between mb-2">
            <span>{item.name} x {item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold text-xl">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white p-6 rounded-xl mb-6">
        <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
        <input
          type="text"
          placeholder="Enter address"
          value={deliveryAddress.text}
          onChange={(e) => setDeliveryAddress({
            ...deliveryAddress,
            text: e.target.value
          })}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      {/* Payment Method */}
      <div className="bg-white p-6 rounded-xl mb-6">
        <h2 className="text-xl font-bold mb-4">Payment Method</h2>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            Cash on Delivery
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            Online Payment (Card)
          </label>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full bg-orange-500 text-white py-3 rounded-lg text-xl font-bold"
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  )
}
```

**Checkout Flow:**
```
User reviews cart
    ↓
Enters delivery address
    ↓
Selects payment method
    ↓
Clicks "Place Order"
    ↓
POST /api/order/place-order
    ↓
If COD:
  └── Navigate to success page
If Online:
  ├── POST /api/order/create-stripe-payment
  └── Redirect to Stripe
```

---

### 9. Order Placed Page: `pages/OrderPlaced.jsx`

```javascript
// frontend/src/pages/OrderPlaced.jsx (Simplified)

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { addMyOrder, clearCart } from '../redux/userSlice'

function OrderPlaced() {
  const [searchParams] = useSearchParams()
  const [verifying, setVerifying] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    const verifyPayment = async () => {
      const orderId = searchParams.get('orderId')
      const sessionId = searchParams.get('session_id')

      // If coming from Stripe, verify payment
      if (orderId && sessionId) {
        setVerifying(true)
        
        try {
          const result = await axios.post(
            `${serverUrl}/api/order/verify-stripe-payment`,
            { orderId, sessionId },
            { withCredentials: true }
          )
          
          // Update Redux
          dispatch(addMyOrder(result.data))
          dispatch(clearCart())
        } catch (error) {
          console.error('Payment verification failed:', error)
          alert('Payment verification failed')
        } finally {
          setVerifying(false)
        }
      }
    }

    verifyPayment()
  }, [searchParams, dispatch])

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
          <h1 className="text-2xl font-bold">Verifying Payment...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-6">
          Your order is being prepared
        </p>
        <button
          onClick={() => navigate('/my-orders')}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg"
        >
          View My Orders
        </button>
      </div>
    </div>
  )
}
```

---

### 10. Socket.IO Integration in App.jsx

```javascript
// frontend/src/App.jsx (Socket.IO part)

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { setSocket } from './redux/userSlice'
import { serverUrl } from './App'

function App() {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(serverUrl, { 
      withCredentials: true 
    })
    
    // Store socket in Redux
    dispatch(setSocket(socketInstance))

    // When connected, send user identity
    socketInstance.on('connect', () => {
      if (userData) {
        socketInstance.emit('identity', { userId: userData._id })
      }
    })

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [userData?._id, dispatch])

  return <Routes>...</Routes>
}
```

---

## 📊 Database Schema

### Collections Overview

```
MongoDB Database: vingo
├── users
│   ├── _id (ObjectId)
│   ├── fullName (String)
│   ├── email (String, unique)
│   ├── password (String, hashed)
│   ├── mobile (String)
│   ├── role (String: user/owner/deliveryBoy)
│   ├── location (GeoJSON Point)
│   ├── bankDetails (Object)
│   └── totalEarnings (Number)
│
├── shops
│   ├── _id (ObjectId)
│   ├── name (String)
│   ├── owner (ObjectId -> users)
│   ├── city (String)
│   ├── address (String)
│   ├── image (String, URL)
│   ├── isDefault (Boolean)
│   └── items (Array of ObjectId -> items)
│
├── items
│   ├── _id (ObjectId)
│   ├── name (String)
│   ├── category (String)
│   ├── foodType (String: veg/non veg)
│   ├── price (Number)
│   ├── image (String, URL)
│   └── shop (ObjectId -> shops)
│
├── orders
│   ├── _id (ObjectId)
│   ├── user (ObjectId -> users)
│   ├── shopOrders (Array)
│   │   ├── shop (ObjectId -> shops)
│   │   ├── owner (ObjectId -> users)
│   │   ├── shopOrderItems (Array)
│   │   │   ├── item (ObjectId -> items)
│   │   │   ├── quantity (Number)
│   │   │   └── price (Number)
│   │   ├── subtotal (Number)
│   │   ├── status (String)
│   │   ├── assignedDeliveryBoy (ObjectId -> users)
│   │   └── deliveryOtp (String)
│   ├── deliveryAddress (Object)
│   ├── totalAmount (Number)
│   ├── paymentMethod (String: cod/online)
│   └── payment (Boolean)
│
└── deliveryassignments
    ├── _id (ObjectId)
    ├── order (ObjectId -> orders)
    ├── shop (ObjectId -> shops)
    ├── shopOrderId (ObjectId)
    ├── brodcastedTo (Array of ObjectId -> users)
    ├── assignedTo (ObjectId -> users)
    └── status (String: brodcasted/assigned/completed)
```

---

## 🔄 Complete Order Flow

### Step-by-Step Process

```
1. USER BROWSES
   ├── Select city
   ├── View restaurants
   └── Browse food items

2. ADD TO CART
   ├── Click "Add to Cart"
   ├── Redux: addToCart action
   └── Cart updated in state

3. CHECKOUT
   ├── Review cart
   ├── Enter delivery address
   ├── Select payment method
   └── Click "Place Order"

4. ORDER CREATION
   ├── POST /api/order/place-order
   ├── Group items by shop
   ├── Calculate subtotals
   └── Create order in database

5. PAYMENT PROCESSING
   ├── If COD:
   │   ├── payment = true
   │   ├── Notify owner (Socket.IO)
   │   └── Assign delivery boy
   └── If Online:
       ├── Create Stripe session
       ├── Redirect to Stripe
       ├── User pays
       ├── Stripe redirects back
       ├── Verify payment
       ├── Update order.payment = true
       ├── Update owner.totalEarnings
       ├── Notify owner
       └── Assign delivery boy

6. OWNER RECEIVES ORDER
   ├── Socket.IO: "newOrder" event
   ├── Dashboard shows new order
   ├── Owner marks "preparing"
   └── Owner marks "out for delivery"

7. DELIVERY BOY ASSIGNMENT
   ├── Find nearby boys (5km)
   ├── Filter available boys
   ├── Create delivery assignment
   └── Broadcast to all (Socket.IO)

8. DELIVERY BOY ACCEPTS
   ├── Click "Accept"
   ├── POST /api/order/accept-order
   ├── Update assignment.assignedTo
   └── Update order.assignedDeliveryBoy

9. DELIVERY PROCESS
   ├── Navigate to customer
   ├── Click "Mark as Delivered"
   ├── OTP sent to customer email
   ├── Customer provides OTP
   ├── Delivery boy enters OTP
   ├── POST /api/order/verify-delivery-otp
   ├── Verify OTP
   ├── Update status = "delivered"
   ├── Notify owner & user (Socket.IO)
   └── Delete delivery assignment

10. ORDER COMPLETE
    ├── User can rate order
    ├── User can rate items
    └── Delivery boy earnings updated
```

---

## 🚀 Deployment Guide

### Backend Deployment (Railway/Render)

1. **Prepare for deployment:**
```bash
# Add start script in package.json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

2. **Environment variables:**
```
PORT=8000
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your_secret
STRIPE_SECRET_KEY=sk_live_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=app_password
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

3. **Deploy:**
- Push to GitHub
- Connect to Railway/Render
- Set environment variables
- Deploy

### Frontend Deployment (Vercel)

1. **Build configuration:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

2. **Environment variables:**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

3. **Update API URL:**
```javascript
// src/App.jsx
export const serverUrl = import.meta.env.PROD 
  ? "https://your-backend.railway.app"
  : "http://localhost:8000"
```

4. **Deploy:**
- Push to GitHub
- Import to Vercel
- Set environment variables
- Deploy

---

## 🎯 Key Takeaways

### Backend Architecture
- **MVC Pattern**: Models, Controllers, Routes
- **Middleware**: Authentication, File Upload, CORS
- **Real-Time**: Socket.IO for notifications
- **Geospatial**: MongoDB 2dsphere index
- **Payment**: Stripe integration
- **Security**: JWT, bcrypt, HTTP-only cookies

### Frontend Architecture
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **API Calls**: Axios with credentials
- **Real-Time**: Socket.IO client
- **Styling**: Tailwind CSS
- **Icons**: React Icons

### Best Practices
- ✅ Environment variables for secrets
- ✅ HTTP-only cookies for JWT
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Code organization
- ✅ Comments and documentation

---

## 📝 Conclusion

This documentation covers the complete technical implementation of the Vingo Food Delivery App. The application demonstrates:

- Full-stack development with MERN
- Real-time features with Socket.IO
- Payment integration with Stripe
- Location-based services
- Role-based access control
- Modern UI/UX practices

**For questions or contributions, please refer to the main README.md**

---

<div align="center">

**Made with ❤️ by Adarsh Priydarshi**

</div>
