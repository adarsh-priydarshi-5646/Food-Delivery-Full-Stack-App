import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import { useSelector, useDispatch } from "react-redux";
import { updateRealtimeOrderStatus } from "../redux/userSlice";
import { 
  FaUtensils, 
  FaPen, 
  FaStore, 
  FaBoxOpen, 
  FaRupeeSign, 
  FaChartLine, 
  FaStar, 
  FaUniversity,
  FaPlus 
} from "react-icons/fa";
import { MdRestaurantMenu, MdDeliveryDining, MdTrendingUp } from "react-icons/md";
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
             // Logic for new order notification could go here
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

  // Filter live orders
  const activeOrders = myOrders?.filter(o => 
    Array.isArray(o.shopOrders) && 
    o.shopOrders.some(so => so.shop._id === myShopData?._id && so.status !== 'delivered' && so.status !== 'cancelled')
  ) || [];

  return (
    <div className="w-full min-h-screen bg-gray-50/50 flex flex-col items-center pb-12">
      <Nav />
      
      {!myShopData ? (
        <div className="flex flex-1 justify-center items-center w-full p-6">
          <div className="relative group max-w-lg w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-full bg-white ring-1 ring-gray-900/5 sm:rounded-2xl p-8 sm:p-12 text-center shadow-xl">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                 <FaStore className="text-[#ff4d2d] text-4xl" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                Launch Your Restaurant
              </h2>
              <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                Partner with us to reach more customers, streamline your operations, and grow your business effortlessly.
              </p>
              <button
                className="w-full sm:w-auto bg-[#ff4d2d] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                onClick={() => navigate("/create-edit-shop")}
              >
                <FaStore /> Create Restaurant
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 mt-8">
          
          {/* Dashboard Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#ff4d2d] to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 text-white text-4xl font-bold transform hover:rotate-3 transition-transform duration-300">
                      {myShopData.name?.charAt(0).toUpperCase()}
                   </div>
                   <div>
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{myShopData.name}</h1>
                      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                        <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                           <FaStore className="text-gray-400" /> {myShopData.city}, {myShopData.state}
                        </span>
                        <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
                           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Open for Orders
                        </span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => navigate("/create-edit-shop")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                       <FaPen size={14} /> Edit Shop
                    </button>
                    <button 
                      onClick={() => navigate("/bank-details")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                    >
                       <FaUniversity size={16} /> Banking
                    </button>
                </div>
             </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Revenue Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                 <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FaRupeeSign size={80} />
                 </div>
                 <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                       <FaRupeeSign size={24} />
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                       <MdTrendingUp /> +12%
                    </span>
                 </div>
                 <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Revenue</h3>
                 <p className="text-3xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString()}</p>
              </div>

              {/* Orders Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                 <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FaBoxOpen size={80} />
                 </div>
                 <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                       <FaBoxOpen size={24} />
                    </div>
                 </div>
                 <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Orders</h3>
                 <p className="text-3xl font-bold text-gray-900 mt-1">{totalOrders}</p>
              </div>

              {/* Items Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                 <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FaUtensils size={80} />
                 </div>
                 <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                       <FaUtensils size={24} />
                    </div>
                 </div>
                 <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Menu Items</h3>
                 <p className="text-3xl font-bold text-gray-900 mt-1">{totalItems}</p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
             {/* Menu Section */}
             <div className="lg:col-span-1 flex flex-col h-full">
                <div className="flex items-center justify-between mb-5">
                   <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg text-[#ff4d2d]">
                        <MdRestaurantMenu /> 
                      </div>
                      Menu Items
                   </h2>
                   <button
                     className="text-sm font-bold text-white bg-[#ff4d2d] hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                     onClick={() => navigate("/add-item")}
                   >
                     <FaPlus size={12} /> Add New
                   </button>
                </div>
                
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4 min-h-[400px] max-h-[800px] overflow-y-auto custom-scrollbar">
                   {myShopData.items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <FaUtensils size={24} />
                         </div>
                         <p className="font-medium text-gray-600 mb-1">Your menu is empty</p>
                         <p className="text-sm">Add items to start selling!</p>
                      </div>
                   ) : (
                      myShopData.items.map((item, index) => (
                         <OwnerItemCard data={item} key={index} />
                      ))
                   )}
                </div>
             </div>

             {/* Live Orders Section */}
             <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex items-center justify-between mb-5">
                   <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <MdDeliveryDining />
                      </div>
                      Live Orders
                   </h2>
                   {activeOrders.length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse shadow-red-200 shadow-lg">
                        {activeOrders.length} Active
                      </span>
                   )}
                </div>

                <div className="flex-1 pb-4">
                   {myOrders && myOrders.length > 0 ? (
                      <div className="space-y-4">
                        {[...myOrders]
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                          .filter(order => Array.isArray(order.shopOrders) && order.shopOrders.some(so => so.shop._id === myShopData._id)) 
                          .map((order, index) => (
                             <OwnerOrderCard data={order} key={index} />
                          ))}
                      </div>
                   ) : (
                      <div className="bg-white h-[400px] rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-8">
                         <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-200">
                            <FaBoxOpen size={40} />
                         </div>
                         <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Orders</h3>
                         <p className="text-gray-500 max-w-xs mx-auto">
                            Waiting for customers to place orders. They will appear here in real-time.
                         </p>
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
