import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import { sendDeliveryOtpMailResend } from "../utils/resendMail.js";
import { sendDeliveryOtpMailSendGrid } from "../utils/sendgridMail.js";
import stripe from "../config/stripe.js";
import dotenv from "dotenv";

dotenv.config();

// Helper function to assign delivery boys
const assignDeliveryBoys = async (order, io) => {
  try {
    console.log("🚀 Starting delivery boy assignment for order:", order._id);
    
    for (const shopOrder of order.shopOrders) {
      const { longitude, latitude } = order.deliveryAddress;
      console.log(`📍 Order location: lat=${latitude}, lon=${longitude}`);
      
      // First, check all delivery boys
      const allDeliveryBoys = await User.find({ role: "deliveryBoy" });
      console.log(`👥 Total delivery boys in database: ${allDeliveryBoys.length}`);
      allDeliveryBoys.forEach(boy => {
        console.log(`  - ${boy._id}: location=${JSON.stringify(boy.location.coordinates)}, online=${boy.isOnline}, socketId=${boy.socketId}`);
      });
      
      // Find nearby delivery boys (increased to 50km for testing)
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 50000, // 50km radius (increased for testing)
          },
        },
      });

      console.log(`📍 Delivery boys within 50km: ${nearByDeliveryBoys.length}`);
      
      if (nearByDeliveryBoys.length === 0) {
        console.log("❌ No delivery boys found nearby");
        continue;
      }

      const nearByIds = nearByDeliveryBoys.map((b) => b._id);
      
      // Find busy delivery boys
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["brodcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));
      
      // Filter available delivery boys
      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id))
      );

      if (availableBoys.length === 0) {
        console.log("No available delivery boys");
        continue;
      }

      const candidates = availableBoys.map((b) => b._id);

      // Create delivery assignment
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        brodcastedTo: candidates,
        status: "brodcasted",
      });

      shopOrder.assignment = deliveryAssignment._id;
      await order.save();

      await deliveryAssignment.populate("order");
      await deliveryAssignment.populate("shop");

      // Notify delivery boys
      console.log(`📢 Broadcasting to ${availableBoys.length} delivery boys`);
      availableBoys.forEach((boy) => {
        const boySocketId = boy.socketId;
        console.log(`📱 Delivery boy ${boy._id} socketId: ${boySocketId}, isOnline: ${boy.isOnline}`);
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
          console.log(`✅ Notification sent to delivery boy ${boy._id}`);
        } else {
          console.log(`❌ Cannot send to delivery boy ${boy._id} - No socket connection`);
        }
      });
    }
  } catch (error) {
    console.error("Error assigning delivery boys:", error);
  }
};

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
    if (cartItems.length == 0 || !cartItems) {
      return res.status(400).json({ message: "cart is empty" });
    }
    if (
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.status(400).json({ message: "send complete deliveryAddress" });
    }

    const groupItemsByShop = {};

    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) {
          return res.status(400).json({ message: "shop not found" });
        }
        const items = groupItemsByShop[shopId];
        const subtotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0
        );
        return {
          shop: shop._id,
          owner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map((i) => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      })
    );

    // Create order (payment will be verified later for online payments)
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
      payment: paymentMethod === "cod" ? true : false,
    });

    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price"
    );
    await newOrder.populate("shopOrders.shop", "name");
    await newOrder.populate("shopOrders.owner", "name socketId");
    await newOrder.populate("user", "name email mobile");

    const io = req.app.get("io");

    // Notify owners and assign delivery boys for COD orders immediately
    if (paymentMethod === "cod" && io) {
      console.log("🛵 COD Order - Assigning delivery boys...");
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
          console.log(`✅ Owner ${shopOrder.owner._id} notified`);
        }
      });

      // Assign delivery boys
      await assignDeliveryBoys(newOrder, io);
    } else {
      console.log("⏳ Online payment - Delivery assignment will happen after payment verification");
    }

    return res.status(201).json(newOrder);
  } catch (error) {
    return res.status(500).json({ message: `place order error ${error}` });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role == "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      return res.status(200).json(orders);
    } else if (user.role == "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

      const filteredOrders = orders.map((order) => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        shopOrders: order.shopOrders.find((o) => o.owner._id == req.userId),
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress,
        payment: order.payment,
      }));

      return res.status(200).json(filteredOrders);
    }
  } catch (error) {
    return res.status(500).json({ message: `get User order error ${error}` });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);

    const shopOrder = order.shopOrders.find((o) => o.shop == shopId);
    if (!shopOrder) {
      return res.status(400).json({ message: "shop order not found" });
    }
    shopOrder.status = status;
    let deliveryBoysPayload = [];
    if (status == "out of delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000,
          },
        },
      });

      const nearByIds = nearByDeliveryBoys.map((b) => b._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["brodcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));

      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id))
      );
      const candidates = availableBoys.map((b) => b._id);

      if (candidates.length == 0) {
        await order.save();
        return res.json({
          message:
            "order status updated but there is no available delivery boys",
        });
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order?._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder?._id,
        brodcastedTo: candidates,
        status: "brodcasted",
      });

      shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;
      shopOrder.assignment = deliveryAssignment._id;
      deliveryBoysPayload = availableBoys.map((b) => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile,
      }));

      await deliveryAssignment.populate("order");
      await deliveryAssignment.populate("shop");
      const io = req.app.get("io");
      if (io) {
        availableBoys.forEach((boy) => {
          const boySocketId = boy.socketId;
          if (boySocketId) {
            io.to(boySocketId).emit("newAssignment", {
              sentTo: boy._id,
              assignmentId: deliveryAssignment._id,
              orderId: deliveryAssignment.order._id,
              shopName: deliveryAssignment.shop.name,
              deliveryAddress: deliveryAssignment.order.deliveryAddress,
              items:
                deliveryAssignment.order.shopOrders.find((so) =>
                  so._id.equals(deliveryAssignment.shopOrderId)
                ).shopOrderItems || [],
              subtotal: deliveryAssignment.order.shopOrders.find((so) =>
                so._id.equals(deliveryAssignment.shopOrderId)
              )?.subtotal,
            });
          }
        });
      }
    }

    await order.save();
    const updatedShopOrder = order.shopOrders.find((o) => o.shop == shopId);
    await order.populate("shopOrders.shop", "name");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullName email mobile"
    );
    await order.populate("user", "socketId");

    const io = req.app.get("io");
    if (io) {
      const userSocketId = order.user.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit("update-status", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          status: updatedShopOrder.status,
          userId: order.user._id,
        });
      }
    }

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment?._id,
    });
  } catch (error) {
    return res.status(500).json({ message: `order status error ${error}` });
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    console.log(`📋 Fetching assignments for delivery boy: ${deliveryBoyId}`);
    
    const assignments = await DeliveryAssignment.find({
      brodcastedTo: deliveryBoyId,
      status: "brodcasted",
    })
      .populate("order")
      .populate("shop");

    console.log(`📦 Found ${assignments.length} assignments for delivery boy ${deliveryBoyId}`);

    const formated = assignments.map((a) => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      deliveryAddress: a.order.deliveryAddress,
      items:
        a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
          .shopOrderItems || [],
      subtotal: a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
        ?.subtotal,
    }));

    return res.status(200).json(formated);
  } catch (error) {
    console.error("❌ Get Assignment error:", error);
    return res.status(500).json({ message: `get Assignment error ${error}` });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    console.log(`🤝 Delivery boy ${req.userId} attempting to accept assignment ${assignmentId}`);
    
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      console.log(`❌ Assignment ${assignmentId} not found`);
      return res.status(400).json({ message: "assignment not found" });
    }
    
    console.log(`📋 Assignment status: ${assignment.status}`);
    if (assignment.status !== "brodcasted") {
      console.log(`❌ Assignment is not brodcasted, current status: ${assignment.status}`);
      return res.status(400).json({ message: "assignment is expired" });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["brodcasted", "completed"] },
    });

    if (alreadyAssigned) {
      console.log(`❌ Delivery boy ${req.userId} already assigned to order ${alreadyAssigned.order}`);
      return res
        .status(400)
        .json({ message: "You are already assigned to another order" });
    }

    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();
    console.log(`✅ Assignment ${assignmentId} accepted by delivery boy ${req.userId}`);

    const order = await Order.findById(assignment.order);
    if (!order) {
      console.log(`❌ Order ${assignment.order} not found`);
      return res.status(400).json({ message: "order not found" });
    }

    let shopOrder = order.shopOrders.id(assignment.shopOrderId);
    shopOrder.assignedDeliveryBoy = req.userId;
    await order.save();
    console.log(`✅ Order ${order._id} updated with delivery boy ${req.userId}`);

    return res.status(200).json({
      message: "order accepted",
    });
  } catch (error) {
    console.error(`❌ Accept order error:`, error);
    return res.status(500).json({ message: `accept order error ${error.message}` });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName email location mobile" }],
      });

    if (!assignment) {
      return res.status(400).json({ message: "assignment not found" });
    }
    if (!assignment.order) {
      return res.status(400).json({ message: "order not found" });
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => String(so._id) == String(assignment.shopOrderId)
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "shopOrder not found" });
    }

    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }

    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {}
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .lean();

    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: `get by id order error ${error}` });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "enter valid order/shopOrderid" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;
    await order.save();
    
    // Print OTP in console for testing
    console.log("=".repeat(50));
    console.log("🔐 DELIVERY OTP GENERATED");
    console.log("Order ID:", orderId);
    console.log("Customer:", order.user.fullName);
    console.log("Customer Email:", order.user.email);
    console.log("OTP:", otp);
    console.log("Expires in: 5 minutes");
    console.log("=".repeat(50));
    
    // Send email via SendGrid (can send to any email)
    try {
      await sendDeliveryOtpMailSendGrid(order.user, otp);
      console.log(`✅ Delivery OTP email sent successfully to ${order.user.email} via SendGrid`);
    } catch (emailError) {
      console.error("❌ SendGrid failed:", emailError.message);
      console.log(`💡 OTP available in logs above for manual sharing`);
    }
    
    return res
      .status(200)
      .json({ 
        message: `OTP sent successfully to ${order?.user?.fullName}`,
        otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only in dev mode
      });
  } catch (error) {
    return res.status(500).json({ message: `delivery otp error ${error}` });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("shopOrders.owner", "socketId");
      
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "enter valid order/shopOrderid" });
    }
    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid/Expired Otp" });
    }

    // Update order status
    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();
    await order.save();
    
    // Delete delivery assignment
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });

    console.log("✅ Order Delivered:", orderId);

    // Send real-time notifications via Socket.IO
    const io = req.app.get("io");
    if (io) {
      // Notify owner
      const owner = order.shopOrders.find(so => so._id.toString() === shopOrderId)?.owner;
      if (owner?.socketId) {
        io.to(owner.socketId).emit("orderDelivered", {
          orderId: order._id,
          shopOrderId: shopOrder._id,
          message: "Order has been delivered successfully!",
        });
        console.log("📢 Owner notified:", owner.socketId);
      }

      // Notify user
      const userSocketId = order.user.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit("orderDelivered", {
          orderId: order._id,
          shopOrderId: shopOrder._id,
          message: "Your order has been delivered!",
        });
        console.log("📢 User notified:", userSocketId);
      }
    }

    return res.status(200).json({ 
      message: "Order Delivered Successfully!",
      orderId: order._id,
      status: "delivered"
    });
  } catch (error) {
    console.error("Verify delivery OTP error:", error);
    return res
      .status(500)
      .json({ message: `verify delivery otp error ${error}` });
  }
};

export const getTodayDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const startsOfDay = new Date();
    startsOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startsOfDay },
    }).lean();

    let todaysDeliveries = [];

    orders.forEach((order) => {
      order.shopOrders.forEach((shopOrder) => {
        if (
          shopOrder.assignedDeliveryBoy == deliveryBoyId &&
          shopOrder.status == "delivered" &&
          shopOrder.deliveredAt &&
          shopOrder.deliveredAt >= startsOfDay
        ) {
          todaysDeliveries.push(shopOrder);
        }
      });
    });

    let stats = {};

    todaysDeliveries.forEach((shopOrder) => {
      const hour = new Date(shopOrder.deliveredAt).getHours();
      stats[hour] = (stats[hour] || 0) + 1;
    });

    let formattedStats = Object.keys(stats).map((hour) => ({
      hour: parseInt(hour),
      count: stats[hour],
    }));

    formattedStats.sort((a, b) => a.hour - b.hour);

    return res.status(200).json(formattedStats);
  } catch (error) {
    return res.status(500).json({ message: `today deliveries error ${error}` });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this order" });
    }

    // Only allow deletion if order is in pending status
    const canDelete = order.shopOrders.every(
      (shopOrder) => shopOrder.status === "pending"
    );

    if (!canDelete) {
      return res.status(400).json({ 
        message: "Cannot delete order that is being prepared or delivered" 
      });
    }

    await Order.findByIdAndDelete(orderId);
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `delete order error ${error}` });
  }
};

export const rateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to rate this order" });
    }

    // Check if all shop orders are delivered
    const allDelivered = order.shopOrders.every(
      (shopOrder) => shopOrder.status === "delivered"
    );

    if (!allDelivered) {
      return res.status(400).json({ 
        message: "Can only rate completed orders" 
      });
    }

    // Update order rating
    order.orderRating = {
      rating: rating,
      review: review || "",
      ratedAt: new Date(),
    };

    await order.save();

    return res.status(200).json({ 
      message: "Order rated successfully",
      orderRating: order.orderRating 
    });
  } catch (error) {
    return res.status(500).json({ message: `rate order error ${error}` });
  }
};

export const createStripePaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ message: "Stripe not configured. Please use COD." });
    }

    const { amount, orderId } = req.body;
    const user = await User.findById(req.userId);

    // Create Stripe Checkout Session for Card payments
    // Note: UPI is supported via Payment Intent API, not Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Vingo Food Order",
              description: `Order ID: ${orderId}`,
              images: ["https://t3.ftcdn.net/jpg/03/33/90/46/360_F_333904627_tnCepUpc3Uynb6stmEbverr8HeWS2VZl.jpg"],
            },
            unit_amount: Math.round(amount * 100), // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/order-placed?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/checkout`,
      customer_email: user.email,
      client_reference_id: orderId,
      metadata: {
        orderId: orderId,
        userId: req.userId,
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe payment error:", error);
    return res.status(500).json({ message: `stripe payment error ${error.message}` });
  }
};

export const verifyStripePayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ message: "Stripe not configured" });
    }

    const { sessionId, orderId } = req.body;

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }

    // Update order payment status
    order.payment = true;
    order.razorpayPaymentId = session.payment_intent; // Store Stripe payment intent ID
    await order.save();

    await order.populate("shopOrders.shopOrderItems.item", "name image price");
    await order.populate("shopOrders.shop", "name");
    await order.populate("shopOrders.owner", "name socketId");
    await order.populate("user", "name email mobile");

    console.log("💳 Stripe Payment Verified for Order:", orderId);

    // Update owner earnings
    for (const shopOrder of order.shopOrders) {
      const owner = await User.findById(shopOrder.owner._id);
      if (owner) {
        owner.totalEarnings = (owner.totalEarnings || 0) + shopOrder.subtotal;
        await owner.save();
        console.log(`💰 Owner earnings updated: ${owner.fullName} +₹${shopOrder.subtotal}`);
      }
    }

    const io = req.app.get("io");

    // Notify restaurant owners and assign delivery boys
    if (io) {
      console.log("📢 Sending notifications...");
      
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
          console.log(`✅ Owner notified: ${shopOrder.owner.name}`);
        }
      });

      // Assign delivery boys after successful payment
      console.log("🏍️ Assigning delivery boys...");
      await assignDeliveryBoys(order, io);
      console.log("✅ Delivery boy assignment complete");
    } else {
      console.error("❌ Socket.IO not available!");
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Verify stripe payment error:", error);
    return res.status(500).json({ message: `verify stripe payment error ${error.message}` });
  }
};
