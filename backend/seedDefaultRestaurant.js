import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Shop from "./models/shop.model.js";
import Item from "./models/item.model.js";
import bcrypt from "bcryptjs";

dotenv.config();

const seedDefaultRestaurant = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected");

    
    const existingDefaultShop = await Shop.findOne({ isDefault: true });
    if (existingDefaultShop) {
      console.log("Default restaurant already exists!");
      process.exit(0);
    }

    
    let defaultOwner = await User.findOne({ email: "default@vingo.com" });
    
    if (!defaultOwner) {
      const hashedPassword = await bcrypt.hash("default123", 10);
      defaultOwner = await User.create({
        fullName: "Vingo Default Restaurant",
        email: "default@vingo.com",
        password: hashedPassword,
        mobile: "0000000000",
        role: "owner",
      });
      console.log("Default owner created");
    }

    
    const defaultShop = await Shop.create({
      name: "Vingo Express",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      owner: defaultOwner._id,
      city: "All Cities",
      state: "All States",
      address: "Available Everywhere",
      isDefault: true,
      items: [],
    });

    console.log("Default restaurant created:", defaultShop.name);

    
    const defaultItems = [
      {
        name: "Margherita Pizza",
        category: "Pizza",
        foodType: "veg",
        price: 299,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
        shop: defaultShop._id,
      },
      {
        name: "Chicken Burger",
        category: "Burgers",
        foodType: "non veg",
        price: 199,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
        shop: defaultShop._id,
      },
      {
        name: "Veg Biryani",
        category: "North Indian",
        foodType: "veg",
        price: 249,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
        shop: defaultShop._id,
      },
      {
        name: "Chicken Biryani",
        category: "North Indian",
        foodType: "non veg",
        price: 299,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
        shop: defaultShop._id,
      },
      {
        name: "Masala Dosa",
        category: "South Indian",
        foodType: "veg",
        price: 149,
        image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&q=80",
        shop: defaultShop._id,
      },
      {
        name: "Paneer Tikka",
        category: "Snacks",
        foodType: "veg",
        price: 179,
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80",
        shop: defaultShop._id,
      },
      {
        name: "Chicken Tikka",
        category: "Snacks",
        foodType: "non veg",
        price: 199,
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80",
        shop: defaultShop._id,
      },
      {
        name: "Veg Sandwich",
        category: "Sandwiches",
        foodType: "veg",
        price: 99,
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
        shop: defaultShop._id,
      },
      {
        name: "Chowmein",
        category: "Chinese",
        foodType: "veg",
        price: 129,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80",
        shop: defaultShop._id,
      },
      {
        name: "French Fries",
        category: "Fast Food",
        foodType: "veg",
        price: 79,
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
        shop: defaultShop._id,
      },
      {
        name: "Gulab Jamun",
        category: "Desserts",
        foodType: "veg",
        price: 59,
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80",
        shop: defaultShop._id,
      },
      {
        name: "Dal Makhani",
        category: "Main Course",
        foodType: "veg",
        price: 189,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80",
        shop: defaultShop._id,
      },
    ];

    const createdItems = await Item.insertMany(defaultItems);
    console.log(`${createdItems.length} default food items created`);

    
    defaultShop.items = createdItems.map((item) => item._id);
    await defaultShop.save();

    console.log("✅ Default restaurant and food items seeded successfully!");
    console.log(`Restaurant: ${defaultShop.name}`);
    console.log(`Total Items: ${createdItems.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding default restaurant:", error);
    process.exit(1);
  }
};

seedDefaultRestaurant();
