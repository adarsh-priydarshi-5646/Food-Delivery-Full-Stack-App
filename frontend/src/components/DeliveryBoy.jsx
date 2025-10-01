import React from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { useEffect } from "react";
import { useState } from "react";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { ClipLoader } from "react-spinners";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FaMotorcycle, FaMapMarkerAlt, FaRupeeSign, FaBox, FaStar, FaClock } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";

function DeliveryBoy() {
  const { userData, socket } = useSelector((state) => state.user);
  const [currentOrder, setCurrentOrder] = useState();
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [otp, setOtp] = useState("");
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Request notification permission
  useEffect(() => {
    if (userData?.role === "deliveryBoy" && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
      });
    }
  }, [userData]);

  // Load initial data
  useEffect(() => {
    if (userData?.role === "deliveryBoy") {
      console.log("📱 Loading delivery boy data...");
      getAssignments();
      getCurrentOrder();
    }
  }, [userData]);

  useEffect(() => {
    if (!socket || userData.role !== "deliveryBoy") return;
    let watchId;
    if (navigator.geolocation) {
      (watchId = navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setDeliveryBoyLocation({ lat: latitude, lon: longitude });
        socket.emit("updateLocation", {
          latitude,
          longitude,
          userId: userData._id,
        });
      })),
        (error) => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
        };
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, userData]);

  const ratePerDelivery = 50;
  const totalEarning = todayDeliveries.reduce(
    (sum, d) => sum + d.count * ratePerDelivery,
    0
  );

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });

      setAvailableAssignments(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true }
      );
      setCurrentOrder(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        { withCredentials: true }
      );
      console.log(result.data);
      await getCurrentOrder();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!socket) {
      console.log("❌ Socket not available for delivery boy");
      return;
    }

    console.log("✅ Setting up newAssignment listener for delivery boy");
    
    socket.on("newAssignment", (data) => {
      console.log("🔔 New assignment received:", data);
      setAvailableAssignments((prev) => {
        const updated = [...prev, data];
        console.log("Updated assignments:", updated);
        return updated;
      });
      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification("New Delivery Order!", {
          body: `New order from ${data.shopName}`,
          icon: "/vite.svg"
        });
      }
    });

    return () => {
      console.log("🔌 Removing newAssignment listener");
      socket.off("newAssignment");
    };
  }, [socket]);

  const sendOtp = async (isResend = false) => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true }
      );
      setLoading(false);
      setShowOtpBox(true);
      setResendTimer(30); // 30 seconds cooldown
      console.log("OTP Response:", result.data);
      
      // Show OTP in alert for testing (development mode)
      if (result.data.otp) {
        alert(`🔐 OTP ${isResend ? 'Resent' : 'Sent'}: ${result.data.otp}\n\nThis is shown only in development mode.`);
      } else if (isResend) {
        alert("OTP resent successfully! Check your email.");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to send OTP");
      setLoading(false);
    }
  };
  const verifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      alert("Please enter a valid 4-digit OTP");
      return;
    }

    setMessage("");
    setLoading(true);
    
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true }
      );
      
      console.log("OTP Verification Success:", result.data);
      setMessage(result.data.message);
      
      // Wait 2 seconds to show success message
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error("OTP Verification Error:", error);
      const errorMessage = error.response?.data?.message || "Invalid OTP. Please try again.";
      alert(errorMessage);
      setLoading(false);
    }
  };

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-today-deliveries`,
        { withCredentials: true }
      );
      console.log(result.data);
      setTodayDeliveries(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAssignments();
    getCurrentOrder();
    handleTodayDeliveries();
  }, [userData]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);
  return (
    <div className="w-full flex flex-col gap-5 items-center">
      <Nav />
      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
        <div className="bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] rounded-2xl shadow-lg p-6 w-[90%] text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#ff4d2d] text-3xl font-bold shadow-md">
              {userData.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{userData.fullName}</h1>
              <p className="text-white/90 flex items-center gap-2 mt-1">
                <FaMotorcycle /> Delivery Partner
              </p>
              <p className="text-sm text-white/80 flex items-center gap-1 mt-1">
                <FaMapMarkerAlt className="text-xs" />
                {deliveryBoyLocation ? `${deliveryBoyLocation.lat.toFixed(4)}, ${deliveryBoyLocation.lon.toFixed(4)}` : "Fetching location..."}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <FaBox className="mx-auto text-2xl mb-1" />
              <p className="text-2xl font-bold">{todayDeliveries.reduce((sum, d) => sum + d.count, 0)}</p>
              <p className="text-xs text-white/80">Deliveries</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <FaRupeeSign className="mx-auto text-2xl mb-1" />
              <p className="text-2xl font-bold">{totalEarning}</p>
              <p className="text-xs text-white/80">Earned</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <FaStar className="mx-auto text-2xl mb-1" />
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-xs text-white/80">Rating</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100">
          <h1 className="text-lg font-bold mb-3 text-[#ff4d2d] flex items-center gap-2">
            <FaClock /> Today's Performance
          </h1>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={todayDeliveries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, "orders"]}
                labelFormatter={(label) => `${label}:00`}
              />
              <Bar dataKey="count" fill="#ff4d2d" />
            </BarChart>
          </ResponsiveContainer>

          <div className="max-w-sm mx-auto mt-6 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg text-center border-2 border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaRupeeSign className="text-green-600 text-2xl" />
              <h1 className="text-xl font-semibold text-gray-800">
                Today's Earning
              </h1>
            </div>
            <span className="text-4xl font-bold text-green-600">
              ₹{totalEarning}
            </span>
            <p className="text-sm text-gray-600 mt-2">
              ₹{ratePerDelivery} per delivery
            </p>
          </div>
        </div>

        {!currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h1 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#ff4d2d]">
              <MdDeliveryDining className="text-2xl" /> Available Orders
            </h1>

            <div className="space-y-4">
              {availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div
                    className="border-2 border-orange-200 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition-all bg-gradient-to-r from-orange-50 to-white"
                    key={index}
                  >
                    <div className="flex-1">
                      <p className="text-base font-bold text-gray-800">{a?.shopName}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <FaMapMarkerAlt className="text-[#ff4d2d]" />
                        {a?.deliveryAddress.text}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                          {a.items.length} items
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                          ₹{a.subtotal}
                        </span>
                      </div>
                    </div>
                    <button
                      className="bg-[#ff4d2d] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#e64526] shadow-md hover:shadow-lg transition-all active:scale-95"
                      onClick={() => acceptOrder(a.assignmentId)}
                    >
                      Accept
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MdDeliveryDining className="mx-auto text-6xl text-gray-300 mb-3" />
                  <p className="text-gray-400 text-base font-medium">No Available Orders</p>
                  <p className="text-gray-400 text-sm mt-1">Check back soon for new deliveries</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border-2 border-green-200">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-green-600">
              <FaBox className="text-xl" /> Current Order
            </h2>
            <div className="border-2 border-green-200 rounded-xl p-4 mb-3 bg-gradient-to-r from-green-50 to-white">
              <p className="font-bold text-base text-gray-800">
                {currentOrder?.shopOrder.shop.name}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                <FaMapMarkerAlt className="text-green-600" />
                {currentOrder.deliveryAddress.text}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                  {currentOrder.shopOrder.shopOrderItems.length} items
                </span>
                <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">
                  ₹{currentOrder.shopOrder.subtotal}
                </span>
              </div>
            </div>

            <DeliveryBoyTracking
              data={{
                deliveryBoyLocation: deliveryBoyLocation || {
                  lat: userData.location.coordinates[1],
                  lon: userData.location.coordinates[0],
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude,
                },
              }}
            />
            {!showOtpBox ? (
              <button
                className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ClipLoader size={20} color="white" />
                ) : (
                  "Mark As Delivered"
                )}
              </button>
            ) : (
              <div className="mt-4 p-4 border rounded-xl bg-gray-50">
                <p className="text-sm font-semibold mb-2">
                  Enter Otp send to{" "}
                  <span className="text-orange-500">
                    {currentOrder.user.fullName}
                  </span>
                </p>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Enter OTP"
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                />
                {message && (
                  <p className="text-center text-green-400 text-2xl mb-4">
                    {message}
                  </p>
                )}

                <div className="flex gap-2 mb-3">
                  <button
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    onClick={verifyOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <ClipLoader size={20} color="white" />
                        Verifying...
                      </>
                    ) : (
                      "Submit OTP"
                    )}
                  </button>
                  
                  <button
                    className="px-4 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => sendOtp(true)}
                    disabled={resendTimer > 0 || loading}
                  >
                    {resendTimer > 0 ? `${resendTimer}s` : "Resend"}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Didn't receive OTP? Click Resend after {resendTimer > 0 ? `${resendTimer} seconds` : 'clicking Submit'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoy;
