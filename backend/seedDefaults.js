import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Shop from "./models/shop.model.js";

dotenv.config();

const users = [
  {
    fullName: "Vingo Owner",
    email: "owner@vingo.com",
    password: "password123",
    mobile: "9999999999",
    role: "owner",
  },
  {
    fullName: "John Doe",
    email: "john@example.com",
    password: "password123",
    mobile: "7777777777",
    role: "user",
  },
  {
    fullName: "Delivery Guy",
    email: "delivery@vingo.com",
    password: "password123",
    mobile: "6666666666",
    role: "deliveryBoy",
  },
];

const seedDefaults = async () => {
  try {
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URL);
      console.log("Connected to MongoDB");
    }

    for (const u of users) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        user = await User.create({
          fullName: u.fullName,
          email: u.email,
          password: hashedPassword,
          mobile: u.mobile,
          role: u.role,
          isOtpVerified: true,
        });
        console.log(`Created default user: ${u.email} (${u.role})`);
      } else {
        console.log(`User ${u.email} exists.`);
      }

      
      if (u.role === "owner") {
        const shop = await Shop.findOne({ owner: user._id });
        if (!shop) {
          await Shop.create({
            name: "Vingo HQ Eats",
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
            owner: user._id,
            city: "New Delhi",
            state: "Delhi",
            address: "Connaught Place, Central Delhi",
            isDefault: true
          });
          console.log(`Created default shop for ${u.email}`);
        } else {
           console.log(`Shop already exists for ${u.email}`);
        }
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDefaults();
