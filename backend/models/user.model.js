import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    mobile: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "owner", "deliveryBoy"],
      required: true,
    },
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
    socketId: {
      type: String,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
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
    addresses: [
      {
        label: { type: String, default: "Home" },
        flatNo: { type: String, required: true },
        area: { type: String, required: true },
        landmark: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        lat: { type: Number },
        lon: { type: Number },
        isDefault: { type: Boolean, default: false },
      },
    ],
    totalEarnings: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;
