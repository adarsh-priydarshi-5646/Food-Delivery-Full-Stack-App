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
    // Check if shopOrders is an object (single shop order structure)
    if (order.shopOrders && typeof order.shopOrders === 'object' && !Array.isArray(order.shopOrders)) {
       // Correctly match the shop ID (handling populated object vs string ID)
       const orderShopId = order.shopOrders.shop?._id || order.shopOrders.shop;
       if (orderShopId === myShopData?._id && order.shopOrders.status !== 'cancelled') {
           return sum + (order.shopOrders.subtotal || 0);
       }
       return sum;
    }
    
    // Fallback: Check if shopOrders is an array (multi-shop order structure)
    if (order.shopOrders && Array.isArray(order.shopOrders)) {
        const shopOrder = order.shopOrders.find(so => {
            const soShopId = so.shop?._id || so.shop;
            return soShopId === myShopData?._id;
        });
        
        if (shopOrder && shopOrder.status !== 'cancelled') {
            return sum + (shopOrder.subtotal || 0);
        }
    }
    return sum;
  }, 0) || 0;
  const totalItems = myShopData?.items?.length || 0;

  // Filter live orders
  const activeOrders = myOrders?.filter(o => {
    // Handle single object structure
    if (o.shopOrders && typeof o.shopOrders === 'object' && !Array.isArray(o.shopOrders)) {
        const orderShopId = o.shopOrders.shop?._id || o.shopOrders.shop;
        return orderShopId === myShopData?._id && 
               o.shopOrders.status !== 'delivered' && 
               o.shopOrders.status !== 'cancelled';
    }
    
    // Handle array structure
    if (o.shopOrders && Array.isArray(o.shopOrders)) {
        return o.shopOrders.some(so => {
             const soShopId = so.shop?._id || so.shop;
             return soShopId === myShopData?._id && so.status !== 'delivered' && so.status !== 'cancelled';
        });
    }
    return false;
  }) || [];

  return (
    <main className="w-full min-h-screen bg-gray-50/50 flex flex-col items-center pb-12">
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
             
             {/* Menu Section - COMPACT REDESIGN */}
             <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[600px] overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center justify-between">
                   <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <div className="p-2 bg-orange-50 rounded-lg text-[#ff4d2d]">
                        <MdRestaurantMenu /> 
                      </div>
                      Menu Items
                   </h2>
                   <button
                     className="text-xs font-bold text-white bg-[#ff4d2d] hover:bg-orange-600 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                     onClick={() => navigate("/add-item")}
                   >
                     <FaPlus size={10} /> Add
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                   {myShopData.items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                         <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <FaUtensils size={20} />
                         </div>
                         <p className="font-medium text-gray-600 mb-1 text-sm">Your menu is empty</p>
                      </div>
                   ) : (
                      myShopData.items.map((item, index) => (
                         <div key={index} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-orange-50/50 border border-transparent hover:border-orange-100 transition-all group cursor-pointer" onClick={() => navigate(`/edit-item/${item._id}`)}>
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative shadow-sm group-hover:shadow transition-all">
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                               {item.foodType === 'veg' ? (
                                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500 border border-white shadow-sm"></div>
                               ) : (
                                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 border border-white shadow-sm"></div>
                               )}
                            </div>
                            <div className="flex-1 min-w-0">
                               <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-[#ff4d2d] transition-colors">{item.name}</h4>
                               <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider truncate">{item.category}</p>
                            </div>
                            <div className="text-right">
                               <span className="block text-sm font-extrabold text-gray-900">₹{item.price}</span>
                               <button 
                                  onClick={(e) => { e.stopPropagation(); navigate(`/edit-item/${item._id}`); }}
                                  className="text-[10px] text-gray-400 hover:text-[#ff4d2d] font-semibold mt-1"
                               >
                                  EDIT
                               </button>
                            </div>
                         </div>
                      ))
                   )}
                </div>
             </div>

             {/* Live Orders Section - Fixed Height Panel */}
             <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[600px] overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center justify-between">
                   <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <div className="p-2 bg-green-50 rounded-lg text-green-600">
                        <MdDeliveryDining />
                      </div>
                      Live Orders
                   </h2>
                   {activeOrders.length > 0 && (
                      <span className="bg-red-500 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold animate-pulse shadow-red-200 shadow-lg">
                        {activeOrders.length} Active
                      </span>
                   )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-gray-50/30">
                   {myOrders && myOrders.length > 0 ? (
                      <div className="space-y-4">
                        {[...myOrders]
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                          .filter(order => {
                              // Ensure object structure handling for shopOrders
                              if (order.shopOrders && typeof order.shopOrders === 'object' && !Array.isArray(order.shopOrders)) {
                                  const orderShopId = order.shopOrders.shop?._id || order.shopOrders.shop;
                                  return orderShopId === myShopData?._id;
                              }
                              // Ensure array structure handling
                              if (order.shopOrders && Array.isArray(order.shopOrders)) {
                                  return order.shopOrders.some(so => (so.shop?._id || so.shop) === myShopData?._id);
                              }
                              return false;
                          }) 
                          .map((order, index) => (
                             <OwnerOrderCard data={order} key={index} />
                          ))}
                      </div>
                   ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                         <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-200">
                            <FaBoxOpen size={30} />
                         </div>
                         <h3 className="text-lg font-bold text-gray-800 mb-1">No Active Orders</h3>
                         <p className="text-gray-400 text-sm max-w-xs mx-auto">
                            Waiting for customers to place new orders.
                         </p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default OwnerDashboard;
