import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { FaUtensils, FaPen, FaStore, FaBoxOpen, FaRupeeSign, FaChartLine, FaStar, FaUniversity } from "react-icons/fa";
import { MdRestaurantMenu, MdDeliveryDining } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./OwnerItemCard";

function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.owner);
  const { myOrders, userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  // Calculate stats
  const totalOrders = myOrders?.length || 0;
  const totalRevenue = myOrders?.reduce((sum, order) => {
    if (!order.shopOrders || !Array.isArray(order.shopOrders)) return sum;
    const shopOrder = order.shopOrders.find(so => so.shop?._id === myShopData?._id);
    return sum + (shopOrder?.subtotal || 0);
  }, 0) || 0;
  const totalItems = myShopData?.items?.length || 0;

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
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
          {/* Enhanced Profile Header */}
          <div className="bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] rounded-2xl shadow-lg p-6 w-full max-w-3xl text-white mt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#ff4d2d] text-3xl font-bold shadow-md">
                {myShopData.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{myShopData.name}</h1>
                <p className="text-white/90 flex items-center gap-2 mt-1">
                  <FaStore /> Restaurant Owner
                </p>
                <p className="text-sm text-white/80 mt-1">
                  {myShopData.city}, {myShopData.state}
                </p>
              </div>
              <button
                className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all"
                onClick={() => navigate("/create-edit-shop")}
              >
                <FaPen size={18} />
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                <MdDeliveryDining className="mx-auto text-2xl mb-1" />
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-xs text-white/80">Orders</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                <FaRupeeSign className="mx-auto text-2xl mb-1" />
                <p className="text-2xl font-bold">{totalRevenue}</p>
                <p className="text-xs text-white/80">Revenue</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                <MdRestaurantMenu className="mx-auto text-2xl mb-1" />
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-xs text-white/80">Menu Items</p>
              </div>
            </div>

            {/* Bank Details Button */}
            <button
              onClick={() => navigate("/bank-details")}
              className="w-full mt-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <FaUniversity /> Manage Bank Account
            </button>
          </div>

          {/* Restaurant Image Card */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 w-full max-w-3xl">
            <img
              src={myShopData.image}
              alt={myShopData.name}
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">Restaurant Details</h2>
                <div className="flex items-center gap-1 text-yellow-500">
                  <FaStar />
                  <span className="font-semibold">4.5</span>
                </div>
              </div>
              <p className="text-gray-600 flex items-center gap-2">
                <FaStore className="text-[#ff4d2d]" />
                {myShopData.address}
              </p>
            </div>
          </div>

          {myShopData.items.length == 0 && (
            <div className="flex justify-center items-center p-4 sm:p-6">
              <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Add Your Food Item
                  </h2>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Share your delicious creations with our customers by adding
                    them to the menu.
                  </p>
                  <button
                    className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200"
                    onClick={() => navigate("/add-item")}
                  >
                    Add Food
                  </button>
                </div>
              </div>
            </div>
          )}

          {myShopData.items.length > 0 && (
            <div className="w-full max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <MdRestaurantMenu className="text-[#ff4d2d]" />
                  Menu Items ({totalItems})
                </h2>
                <button
                  className="bg-[#ff4d2d] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#e64526] shadow-md transition-all flex items-center gap-2"
                  onClick={() => navigate("/add-item")}
                >
                  <FaUtensils /> Add Item
                </button>
              </div>
              <div className="flex flex-col items-center gap-4">
                {myShopData.items.map((item, index) => (
                  <OwnerItemCard data={item} key={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
