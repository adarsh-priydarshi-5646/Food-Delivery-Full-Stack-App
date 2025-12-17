import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  acceptOrder,
  getCurrentOrder,
  getDeliveryBoyAssignment,
  getMyOrders,
  getOrderById,
  getTodayDeliveries,
  placeOrder,
  sendDeliveryOtp,
  updateOrderStatus,
  verifyDeliveryOtp,
  deleteOrder,
  rateOrder,
  createStripePaymentIntent,
  verifyStripePayment,
  cancelOrder, // Added cancelOrder
} from "../controllers/order.controllers.js";

const orderRouter = express.Router();

orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.post("/cancel-order", isAuth, cancelOrder); // New route added here
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssignment);
orderRouter.get("/get-current-order", isAuth, getCurrentOrder);
orderRouter.post("/send-delivery-otp", isAuth, sendDeliveryOtp);
orderRouter.post("/verify-delivery-otp", isAuth, verifyDeliveryOtp);
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);
orderRouter.get("/get-today-deliveries", isAuth, getTodayDeliveries);
orderRouter.delete("/delete-order/:orderId", isAuth, deleteOrder);
orderRouter.post("/rate-order/:orderId", isAuth, rateOrder);
orderRouter.post("/create-stripe-payment", isAuth, createStripePaymentIntent);
orderRouter.post("/verify-stripe-payment", isAuth, verifyStripePayment);

export default orderRouter;
