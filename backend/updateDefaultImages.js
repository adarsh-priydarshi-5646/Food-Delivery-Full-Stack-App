import mongoose from "mongoose";
import dotenv from "dotenv";
import Shop from "./models/shop.model.js";
import Item from "./models/item.model.js";

dotenv.config();

const updateDefaultImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected");

    
    const defaultShop = await Shop.findOne({ isDefault: true });
    
    if (!defaultShop) {
      console.log("Default restaurant not found!");
      process.exit(1);
    }

    
    defaultShop.image = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";
    await defaultShop.save();
    console.log("Restaurant image updated");

    
    const imageMap = {
      "Margherita Pizza": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
      "Chicken Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
      "Veg Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
      "Chicken Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
      "Masala Dosa": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&q=80",
      "Paneer Tikka": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80",
      "Chicken Tikka": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80",
      "Veg Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
      "Chowmein": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80",
      "French Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
      "Gulab Jamun": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80",
      "Dal Makhani": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80",
    };

    for (const [itemName, imageUrl] of Object.entries(imageMap)) {
      await Item.updateOne(
        { name: itemName, shop: defaultShop._id },
        { $set: { image: imageUrl } }
      );
      console.log(`Updated: ${itemName}`);
    }

    console.log("\n All images updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

updateDefaultImages();
