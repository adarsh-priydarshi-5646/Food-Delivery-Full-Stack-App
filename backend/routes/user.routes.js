import express from "express";
import {
  getCurrentUser,
  updateUserLocation,
  updateBankDetails,
  getBankDetails,
} from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update-location", isAuth, updateUserLocation);
userRouter.post("/update-bank-details", isAuth, updateBankDetails);
userRouter.get("/get-bank-details", isAuth, getBankDetails);

export default userRouter;
