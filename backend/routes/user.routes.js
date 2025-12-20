import express from "express";
import {
  getCurrentUser,
  updateUserLocation,
  updateBankDetails,
  getBankDetails,
  addAddress,
  updateAddress,
  removeAddress,
  updateProfile,
  getProfileStats,
} from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update-location", isAuth, updateUserLocation);
userRouter.post("/update-bank-details", isAuth, updateBankDetails);
userRouter.get("/get-bank-details", isAuth, getBankDetails);
userRouter.post("/add-address", isAuth, addAddress);
userRouter.put("/update-address", isAuth, updateAddress);
userRouter.delete("/remove-address/:addressId", isAuth, removeAddress);
userRouter.put("/update-profile", isAuth, updateProfile);
userRouter.get("/profile-stats", isAuth, getProfileStats);

export default userRouter;
