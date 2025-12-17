import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import DeliveryHistoryCard from "../components/DeliveryHistoryCard"; 
import {
  setMyOrders,
  updateOrderStatus,
  updateRealtimeOrderStatus,
} from "../redux/userSlice";

function MyOrders() {
  const { userData, myOrders, socket } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    socket?.on("newOrder", (data) => {
      if (data.shopOrders?.owner._id == userData._id) {
        dispatch(setMyOrders([data, ...myOrders]));
      }
    });

    socket?.on("update-status", ({ orderId, shopId, status, userId }) => {
      if (userId == userData._id) {
        dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }));
      }
    });

    socket?.on("orderDelivered", ({ orderId, shopOrderId, message }) => {
      
      
      
      
      
      
      
      const order = myOrders.find((o) => o._id === orderId);
      if (order) {
        const shopOrder = order.shopOrders.find((so) => so._id === shopOrderId);
        if (shopOrder) {
             dispatch(updateRealtimeOrderStatus({ orderId, shopId: shopOrder.shop._id, status: "delivered" }));
             
             
        }
      }
    });

    return () => {
      socket?.off("newOrder");
      socket?.off("update-status");
    };
  }, [socket]);

  return (
    <div className="w-full min-h-screen bg-[#F8F8F8] flex justify-center px-4 py-6 pt-10">
      <div className="w-full max-w-5xl">
        {}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <IoIosArrowRoundBack size={32} className="text-[#E23744]" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 text-sm mt-1">Track your order history and status</p>
            </div>
            {myOrders && myOrders.length > 0 && (
              <div className="bg-[#E23744] text-white px-4 py-2 rounded-full">
                <span className="font-bold text-lg">{myOrders.length}</span>
                <span className="text-sm ml-1">Orders</span>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="space-y-4">
          {myOrders && myOrders.length > 0 ? (
            myOrders.map((order, index) =>
              userData.role == "user" ? (
                <UserOrderCard data={order} allOrders={myOrders} key={index} />
              ) : userData.role == "owner" ? (
                <OwnerOrderCard data={order} key={index} />
              ) : userData.role == "deliveryBoy" ? (
                <DeliveryHistoryCard data={order} key={index} />
              ) : null
            )
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
              <FaClipboardList className="text-gray-300 text-6xl mx-auto mb-4" />
              <h3 className="text-gray-900 text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">
                Your order history will appear here once you place your first order
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-[#E23744] text-white font-semibold rounded-lg hover:bg-[#c02a35] transition-colors"
              >
                Explore Food Items
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyOrders;
