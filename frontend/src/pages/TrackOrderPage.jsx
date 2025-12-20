import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import { useSelector } from "react-redux";
import { FaPhone, FaMotorcycle, FaCheckCircle, FaStore, FaMapMarkerAlt, FaUtensils, FaClock } from "react-icons/fa";

function TrackOrderPage() {
  const { orderId } = useParams();
  const [currentOrder, setCurrentOrder] = useState();
  const navigate = useNavigate();
  const { socket } = useSelector((state) => state.user);
  const [liveLocations, setLiveLocations] = useState({});

  const handleGetOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true }
      );
      setCurrentOrder(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on(
        "updateDeliveryLocation",
        ({ deliveryBoyId, latitude, longitude }) => {
          setLiveLocations((prev) => ({
            ...prev,
            [deliveryBoyId]: { lat: latitude, lon: longitude },
          }));
        }
      );
    }
  }, [socket]);

  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#E23744]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-24 px-4 pb-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/my-orders")}
            className="p-2 hover:bg-white rounded-full transition-colors bg-white shadow-sm"
          >
            <IoIosArrowRoundBack size={32} className="text-[#E23744]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
            <p className="text-sm text-gray-500">Order #{currentOrder._id.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        {currentOrder.shopOrders?.map((shopOrder, index) => (
          <div key={index} className="space-y-6">
            {}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{shopOrder.shop.name}</h2>
                  <p className="text-sm text-green-600 font-bold uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    {shopOrder.status}
                  </p>
                </div>
                {shopOrder.status === "on the way" && (
                  <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    <FaMotorcycle /> Arriving Soon
                  </div>
                )}
              </div>

              {}
              <div className="relative mb-8">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-[#E23744] -translate-y-1/2 rounded-full transition-all duration-1000"
                  style={{ width: shopOrder.status === 'delivered' ? '100%' : shopOrder.status === 'on the way' ? '75%' : '25%' }}
                ></div>
                <div className="relative flex justify-between">
                  {['preparing', 'on the way', 'delivered'].map((step, i) => {
                    const isActive = 
                      (shopOrder.status === 'preparing' && i === 0) ||
                      (shopOrder.status === 'on the way' && i <= 1) ||
                      (shopOrder.status === 'delivered');
                    
                    return (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${isActive ? 'bg-[#E23744] border-[#E23744] text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                          {i === 0 && <FaUtensils />}
                          {i === 1 && <FaMotorcycle />}
                          {i === 2 && <FaCheckCircle />}
                        </div>
                        <span className={`text-xs font-medium capitalize ${isActive ? 'text-[#E23744]' : 'text-gray-400'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {}
              {shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered" && (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                      👮‍♂️
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{shopOrder.assignedDeliveryBoy.fullName}</p>
                      <p className="text-xs text-gray-500">Your Delivery Partner</p>
                    </div>
                  </div>
                  <a 
                    href={`tel:${shopOrder.assignedDeliveryBoy.mobile}`}
                    className="w-10 h-10 rounded-full bg-[#E23744] flex items-center justify-center text-white hover:bg-[#c02a35] transition-colors shadow-sm"
                  >
                    <FaPhone />
                  </a>
                </div>
              )}
            </div>

            {}
            {shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered" && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 h-[400px]">
                 <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation: liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                      lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                      lon: shopOrder.assignedDeliveryBoy.location.coordinates[0],
                    },
                    customerLocation: {
                      lat: currentOrder.deliveryAddress.latitude,
                      lon: currentOrder.deliveryAddress.longitude,
                    },
                  }}
                />
              </div>
            )}

            {}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Order Details</h3>
              <div className="space-y-3">
                {shopOrder.shopOrderItems?.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs font-medium text-gray-600">
                        {item.quantity}x
                      </span>
                      <span className="text-gray-800">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-[#E23744]">₹{shopOrder.subtotal}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-[#E23744] mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Delivery Address</p>
                    <p className="text-sm text-gray-600 mt-0.5">{currentOrder.deliveryAddress?.text}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrackOrderPage;
