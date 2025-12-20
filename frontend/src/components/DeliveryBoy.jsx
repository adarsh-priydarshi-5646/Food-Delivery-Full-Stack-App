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
import { IoMdClose, IoMdWarning } from "react-icons/io";

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
  
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const cancelReasons = [
    "Customer unreachable",
    "Address not found",
    "Customer refused delivery",
    "Accident/Vehicle Issue",
    "Other"
  ];

  
  useEffect(() => {
    if (userData?.role === "deliveryBoy" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [userData]);

  
  useEffect(() => {
    if (userData?.role === "deliveryBoy") {
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
          console.error(error);
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
      console.error(error);
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
      console.error(error);
    }
  };

  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        { withCredentials: true }
      );
      await getCurrentOrder();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    
    socket.on("newAssignment", (data) => {
      setAvailableAssignments((prev) => {
        const updated = [...prev, data];
        return updated;
      });
      
      if (Notification.permission === "granted") {
        new Notification("New Delivery Order!", {
          body: `New order from ${data.shopName}`,
          icon: "/vite.svg"
        });
      }
    });

    return () => {
      socket.off("newAssignment");
    };
  }, [socket]);

  const sendOtp = async (isResend = false) => {
    
    setShowOtpBox(true);
    setResendTimer(300); 

    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true }
      );
      
      
      // OTP is sent to user mobile/email

    } catch (error) {
      console.error("Background OTP send failed:", error);
      
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
      
      setMessage(result.data.message);
      
      
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error("OTP Verification Error:", error);
      const errorMessage = error.response?.data?.message || "Wrong OTP. Please try again.";
      
      setMessage("Wrong OTP ❌");
      alert(errorMessage);
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      alert("Please select a reason");
      return;
    }
    const finalReason = cancelReason === "Other" ? customReason : cancelReason;
    if (!finalReason) {
       alert("Please specify the reason");
       return;
    }

    if(!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")){
        return;
    }

    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/order/cancel-order`, {
        orderId: currentOrder._id,
        shopOrderId: currentOrder.shopOrder._id,
        reason: finalReason
      }, { withCredentials: true });
      
      alert("Order cancelled successfully");
      window.location.reload();
      
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to cancel order");
      setLoading(false);
    }
  };

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-today-deliveries`,
        { withCredentials: true }
      );
      setTodayDeliveries(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAssignments();
    getCurrentOrder();
    handleTodayDeliveries();
  }, [userData]);

  
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);
  return (
    <main className="w-full min-h-screen bg-gray-50 flex flex-col items-center pb-32 font-sans">
      <Nav />
      
      <div className="w-full max-w-[800px] flex flex-col gap-6 items-center px-4 mt-8">
        
        {}
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

        {}
        {currentOrder && (
          <div className="w-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Delivery
            </h2>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
               {}
               <div className="h-[300px] w-full bg-gray-100 relative z-0">
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
               
               {}
               <div className="p-6 flex flex-col gap-6 bg-white relative z-10">
                  {}
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start border-b border-gray-100 pb-6">
                     <div className="flex-1">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Pickup From</p>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{currentOrder?.shopOrder.shop.name}</h3>
                        <div className="flex mt-1">
                           <p className="text-sm text-gray-600 flex items-start gap-2 max-w-[250px] text-left">
                              <FaMapMarkerAlt className="text-blue-500 mt-1 shrink-0" />
                              {currentOrder?.shopOrder.shop.address}
                           </p>
                        </div>
                     </div>
                     <div className="flex-1 md:text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1 md:justify-end"><span className="w-2 h-2 rounded-full bg-green-500"></span> Deliver To</p>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{currentOrder.user.fullName}</h3>
                        <div className="flex md:justify-end mt-1">
                           <p className="text-sm text-gray-600 flex items-start gap-2 max-w-[250px] text-left md:text-right">
                              <FaMapMarkerAlt className="text-[#E23744] mt-1 shrink-0" />
                              {currentOrder.deliveryAddress.text}
                           </p>
                        </div>
                     </div>
                  </div>

                  {}
                  <div className="w-full">
                    {!showOtpBox ? (
                      <button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                        onClick={sendOtp}
                        disabled={loading}
                      >
                        {loading ? (
                          <ClipLoader size={20} color="white" />
                        ) : (
                          <>
                           <FaMotorcycle /> Arrived & Verify OTP
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
                        <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
                          Ask <span className="text-[#E23744] font-bold">{currentOrder.user.fullName}</span> for the OTP
                        </p>
                        
                        <div className="flex justify-center mb-6">
                          <input
                            type="text"
                            maxLength="4"
                            className="w-48 border-2 border-gray-200 rounded-lg px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:border-[#E23744] outline-none transition bg-white"
                            placeholder="••••"
                            onChange={(e) => setOtp(e.target.value)}
                            value={otp}
                            autoFocus
                          />
                        </div>
                        
                        {message && (
                          <p className="text-center text-green-600 font-medium mb-4 bg-green-50 p-2 rounded-lg">
                            ✨ {message}
                          </p>
                        )}

                        <div className="flex flex-col gap-3">
                           <button
                             className="w-full bg-[#E23744] text-white py-4 rounded-xl font-bold hover:bg-[#c02a35] transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                             onClick={verifyOtp}
                             disabled={loading}
                           >
                             {loading ? <ClipLoader size={20} color="white" /> : "Complete Delivery"}
                           </button>
                           
                           <button
                             className="w-full bg-white border border-red-200 text-red-500 py-3 rounded-xl font-bold hover:bg-red-50 transition-all active:scale-95 disabled:opacity-70"
                             onClick={() => setShowCancelModal(true)}
                             disabled={loading}
                           >
                              Cancel Order
                           </button>

                           <button
                              className="w-full text-xs text-gray-500 font-medium hover:text-gray-800 py-2"
                              onClick={() => sendOtp(true)}
                              disabled={resendTimer > 0 || loading}
                            >
                              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                            </button>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in duration-200">
             <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50">
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                   <IoMdWarning /> Cancel Order
                </h3>
                <button onClick={() => setShowCancelModal(false)} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200 transition">
                   <IoMdClose size={20} />
                </button>
             </div>
             
             <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">Please select a reason for cancellation. This will be logged.</p>
                
                <div className="space-y-3 mb-4">
                   {cancelReasons.map((reason) => (
                      <label key={reason} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${cancelReason === reason ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-200'}`}>
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${cancelReason === reason ? 'border-red-500' : 'border-gray-300'}`}>
                            {cancelReason === reason && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                         </div>
                         <input 
                            type="radio" 
                            name="cancelReason" 
                            className="hidden" 
                            value={reason} 
                            onChange={(e) => setCancelReason(e.target.value)} 
                         />
                         <span className={`text-sm font-medium ${cancelReason === reason ? 'text-red-700' : 'text-gray-700'}`}>{reason}</span>
                      </label>
                   ))}
                </div>
                
                {cancelReason === "Other" && (
                   <textarea
                     className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none mb-4"
                     placeholder="Please specify the reason..."
                     rows="2"
                     value={customReason}
                     onChange={(e) => setCustomReason(e.target.value)}
                   ></textarea>
                )}

                <button
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCancelOrder}
                  disabled={loading || !cancelReason || (cancelReason === "Other" && !customReason)}
                >
                   {loading ? <ClipLoader size={20} color="white" /> : "Confirm Cancellation"}
                </button>
             </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default DeliveryBoy;
