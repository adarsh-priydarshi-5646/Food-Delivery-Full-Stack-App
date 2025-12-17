import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import { useSelector, useDispatch } from "react-redux";
import { updateRealtimeOrderStatus } from "../redux/userSlice";
import { FaUtensils, FaPen, FaStore, FaBoxOpen, FaRupeeSign, FaChartLine, FaStar, FaUniversity } from "react-icons/fa";
import { MdRestaurantMenu, MdDeliveryDining } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./OwnerItemCard";
import OwnerOrderCard from "./OwnerOrderCard";

function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.owner);
  const { myOrders, userData, socket } = useSelector((state) => state.user); 
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  useEffect(() => {
    if (!socket) return;
    
    
    socket.on("newOrder", (data) => {
      
      
      if (data.shopOrders && data.shopOrders.owner && data.shopOrders.owner._id === userData._id) {
          
          const exists = myOrders.some(o => o._id === data._id);
          if (!exists) {
             
             
             
             
             
             
          }
      }
    });

    
    socket.on("orderDelivered", ({ orderId, shopOrderId }) => {
        const order = myOrders?.find((o) => o._id === orderId);
        if (order) {
            const shopOrder = order.shopOrders.find((so) => so._id === shopOrderId);
            if (shopOrder) {
                dispatch(updateRealtimeOrderStatus({ orderId, shopId: shopOrder.shop._id, status: "delivered" }));
            }
        }
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderDelivered");
    };
  }, [socket, myOrders, dispatch, userData]);
  
  
  const totalOrders = myOrders?.length || 0;
  const totalRevenue = myOrders?.reduce((sum, order) => {
    if (!order.shopOrders || !Array.isArray(order.shopOrders)) return sum;
    const shopOrder = order.shopOrders.find(so => so.shop?._id === myShopData?._id);
    return sum + (shopOrder?.subtotal || 0);
  }, 0) || 0;
  const totalItems = myShopData?.items?.length || 0;

  return (
    <div className="w-full flex flex-col items-center">
      <Nav />
      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Add Your Restaurant
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Join our food delivery platform and reach thousands of hungry
                customers every day.
              </p>
              <button
                className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200"
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {myShopData && (
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6 pb-8">
          {}
          <div className="w-full max-w-5xl bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-wrap gap-6 justify-between items-center mt-6">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#ff4d2d]/10 rounded-full flex items-center justify-center text-[#ff4d2d] text-2xl font-bold">
                   {myShopData.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                   <h1 className="text-2xl font-bold text-gray-800">{myShopData.name}</h1>
                   <p className="text-sm text-gray-500 flex items-center gap-2">
                     <FaStore /> {myShopData.city}, {myShopData.state}
                   </p>
                </div>
             </div>
             
             <div className="flex gap-8 text-center">
                <div>
                   <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                   <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Orders</p>
                </div>
                <div>
                   <p className="text-2xl font-bold text-gray-900">₹{totalRevenue}</p>
                   <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Revenue</p>
                </div>
                <div>
                   <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                   <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Items</p>
                </div>
             </div>

             <div className="flex gap-3">
                <button onClick={() => navigate("/create-edit-shop")} className="p-2 text-gray-500 hover:text-[#ff4d2d] hover:bg-[#ff4d2d]/5 rounded-lg transition">
                   <FaPen size={18} />
                </button>
                <button onClick={() => navigate("/bank-details")} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
                   <FaUniversity /> Bank
                </button>
             </div>
          </div>

          {}
          <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
             {}
             <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <MdRestaurantMenu className="text-[#ff4d2d]" /> Menu
                   </h2>
                   <button
                     className="text-sm font-semibold text-[#ff4d2d] hover:bg-[#ff4d2d]/10 px-3 py-1 rounded-lg transition"
                     onClick={() => navigate("/add-item")}
                   >
                     + Add Item
                   </button>
                </div>
                
                <div className="space-y-4">
                   {myShopData.items.length === 0 ? (
                      <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                         <p className="text-gray-500 mb-4">No items yet</p>
                         <button onClick={() => navigate("/add-item")} className="bg-[#ff4d2d] text-white px-4 py-2 rounded-lg font-semibold">Add Food</button>
                      </div>
                   ) : (
                      myShopData.items.map((item, index) => (
                         <OwnerItemCard data={item} key={index} />
                      ))
                   )}
                </div>
             </div>

             {}
             <div className="flex-[1.5]">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <MdDeliveryDining className="text-[#ff4d2d]" /> Live Orders
                   </h2>
                   <span className="bg-[#ff4d2d] text-white text-xs px-2 py-1 rounded-full font-bold">
                      {myOrders?.filter(o => Array.isArray(o.shopOrders) && o.shopOrders.some(so => so.shop._id === myShopData._id && so.status !== 'delivered' && so.status !== 'cancelled')).length || 0}
                   </span>
                </div>

                <div className="space-y-4">
                   {myOrders && myOrders.length > 0 ? (
                      [...myOrders]
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .filter(order => Array.isArray(order.shopOrders) && order.shopOrders.some(so => so.shop._id === myShopData._id)) 
                      .map((order, index) => {
                         return <OwnerOrderCard data={order} key={index} />;
                      })
                   ) : (
                      <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <FaBoxOpen size={30} />
                         </div>
                         <h3 className="text-gray-800 font-medium">No Active Orders</h3>
                         <p className="text-gray-500 text-sm">New orders will pop up here instantly.</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
