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
      console.log("Loading delivery boy data...");
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
      console.log("Socket not available for delivery boy");
      return;
    }

    console.log("Setting up newAssignment listener for delivery boy");
    
    socket.on("newAssignment", (data) => {
      console.log("New assignment received:", data);
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
      console.log("Removing newAssignment listener");
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
        alert(`OTP ${isResend ? 'Resent' : 'Sent'}: ${result.data.otp}\n\nThis is shown only in development mode.`);
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
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center pb-20 font-sans">
      <Nav />
      
      <div className="w-full max-w-[800px] flex flex-col gap-6 items-center px-4 mt-8">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#ffecf0] rounded-full flex items-center justify-center text-[#E23744] text-2xl font-bold shadow-sm border border-[#ffecf0]">
                {userData.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{userData.fullName}</h1>
                <div className="flex items-center gap-2 mt-1">
                   <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Online
                   </span>
                   <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FaMapMarkerAlt /> {deliveryBoyLocation ? "Location Active" : "Locating..."}
                   </p>
                </div>
              </div>
           </div>
           
           <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-semibold">Today's Earnings</p>
              <p className="text-2xl font-extrabold text-[#E23744]">₹{totalEarning}</p>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition">
               <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
                  <FaBox />
               </div>
               <p className="text-lg font-bold text-gray-800">{todayDeliveries.reduce((sum, d) => sum + d.count, 0)}</p>
               <p className="text-xs text-gray-500">Orders</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition">
               <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-2">
                  <FaRupeeSign />
               </div>
               <p className="text-lg font-bold text-gray-800">₹{totalEarning}</p>
               <p className="text-xs text-gray-500">Earned</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition">
               <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500 mb-2">
                  <FaStar />
               </div>
               <p className="text-lg font-bold text-gray-800">4.8</p>
               <p className="text-xs text-gray-500">Rating</p>
            </div>
             <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition">
               <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 mb-2">
                  <FaClock />
               </div>
               <p className="text-lg font-bold text-gray-800">5.2h</p>
               <p className="text-xs text-gray-500">Online</p>
            </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-full">
          <h1 className="text-sm font-bold mb-4 text-gray-700 flex items-center gap-2 uppercase tracking-wide">
             Performance Trend
          </h1>
          <div className="h-[180px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={todayDeliveries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="count" fill="#E23744" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
          </div>
        </div>

        {/* Available Orders Section */}
        {!currentOrder && (
          <div className="w-full">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">New Orders</h2>
                <span className="bg-[#E23744] text-white text-xs px-2 py-0.5 rounded-full">{availableAssignments.length}</span>
             </div>

            <div className="space-y-4">
              {availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#E23744] hover:shadow-md transition-all cursor-pointer group"
                    key={index}
                  >
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#E23744] transition">{a?.shopName}</h3>
                           <p className="text-xs text-gray-500">Order #{a?.assignmentId?.slice(-6)}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-lg font-bold text-gray-900">₹{ratePerDelivery}</p>
                           <p className="text-xs text-gray-500">Earnings</p>
                        </div>
                     </div>
                    
                     <div className="flex items-start gap-3 mb-4">
                        <div className="mt-1 min-w-[16px]"><FaMapMarkerAlt className="text-gray-400" /></div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                           {a?.deliveryAddress.text}
                        </p>
                     </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                           <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded bg-opacity-60 font-medium">
                              {a.items.length} Items
                           </span>
                           <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded bg-opacity-60 font-medium">
                              ~2.5 km
                           </span>
                        </div>
                        <button
                          className="bg-[#E23744] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#c02a35] transition-all shadow-sm active:scale-95"
                          onClick={() => acceptOrder(a.assignmentId)}
                        >
                          Accept Order
                        </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-10 text-center border border-gray-100 border-dashed">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 transform rotate-12">
                     <MdDeliveryDining className="text-3xl" />
                  </div>
                  <h3 className="text-gray-800 font-medium mb-1">No orders available</h3>
                  <p className="text-gray-400 text-sm">We're looking for new delivery requests near you.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Order Card */}
        {currentOrder && (
          <div className="w-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Delivery
            </h2>
            
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
               {/* Map/Tracking Placeholder or Component */}
               <div className="h-[200px] w-full bg-gray-100 relative">
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
               </div>
               
               <div className="p-5">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Pickup From</p>
                        <h3 className="text-lg font-bold text-gray-900">{currentOrder?.shopOrder.shop.name}</h3>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Deliver To</p>
                        <h3 className="text-lg font-bold text-gray-900">{currentOrder.user.fullName}</h3>
                     </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                     <p className="text-sm text-gray-600 flex gap-2">
                        <FaMapMarkerAlt className="text-[#E23744] mt-0.5" />
                        {currentOrder.deliveryAddress.text}
                     </p>
                  </div>
                  
                  {!showOtpBox ? (
                    <button
                      className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all"
                      onClick={sendOtp}
                      disabled={loading}
                    >
                      {loading ? (
                        <ClipLoader size={20} color="white" />
                      ) : (
                        "Arrived & Verify OTP"
                      )}
                    </button>
                  ) : (
                    <div className="bg-white border-2 border-orange-100 rounded-xl p-5">
                      <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                        Ask <span className="text-[#E23744]">{currentOrder.user.fullName}</span> for the OTP
                      </p>
                      
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          maxLength="4"
                          className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 text-center text-lg font-bold tracking-widest focus:border-[#E23744] outline-none transition"
                          placeholder="••••"
                          onChange={(e) => setOtp(e.target.value)}
                          value={otp}
                        />
                      </div>
                      
                      {message && (
                        <p className="text-center text-green-600 font-medium mb-3">
                          ✨ {message}
                        </p>
                      )}

                      <button
                        className="w-full bg-[#E23744] text-white py-3 rounded-lg font-bold hover:bg-[#c02a35] transition-all shadow-md disabled:opacity-70 mb-3"
                        onClick={verifyOtp}
                        disabled={loading}
                      >
                        {loading ? "Verifying..." : "Complete Delivery"}
                      </button>
                      
                      <button
                         className="w-full text-xs text-gray-400 font-medium hover:text-gray-600"
                         onClick={() => sendOtp(true)}
                         disabled={resendTimer > 0 || loading}
                       >
                         {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                       </button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoy;
