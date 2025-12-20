import axios from "axios";
import React, { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import { FaStore, FaLocationDot, FaStar, FaClock, FaArrowLeft } from "react-icons/fa6";
import FoodCard from "../components/FoodCard";

function Shop() {
  const { shopId } = useParams();
  const [items, setItems] = useState([]);
  const [shop, setShop] = useState(null);
  const navigate = useNavigate();

  const handleShop = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/get-by-shop/${shopId}`,
        { withCredentials: true }
      );
      setShop(result.data.shop);
      setItems(result.data.items);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleShop();
  }, [shopId]);

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {}
      <button
        className="fixed top-6 left-6 z-30 flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2.5 rounded-full shadow-lg transition-all hover:shadow-xl border border-gray-200"
        onClick={() => navigate("/")}
      >
        <FaArrowLeft className="text-[#E23744]" />
        <span className="font-semibold">Back</span>
      </button>

      {}
      {shop && (
        <div className="relative w-full h-72 md:h-80 lg:h-96">
          <img
            src={shop.image}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          
          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-8 md:px-12 md:pb-12">
            <div className="max-w-7xl mx-auto w-full">
              {}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
                <FaStore className="text-[#E23744] text-2xl" />
              </div>

              {}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 drop-shadow-lg">
                {shop.name}
              </h1>

              {}
              <div className="flex flex-wrap items-center gap-4 text-white">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <FaLocationDot className="text-red-400" />
                  <span className="font-medium">{shop.address}</span>
                </div>
                
                {shop.rating && (
                  <div className="flex items-center gap-2 bg-green-600 px-3 py-1.5 rounded-full">
                    <FaStar className="text-white text-sm" />
                    <span className="font-bold">{shop.rating}</span>
                  </div>
                )}

                {shop.deliveryTime && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <FaClock className="text-yellow-400" />
                    <span className="font-medium">{shop.deliveryTime} mins</span>
                  </div>
                )}
              </div>

              {}
              {shop.cuisine && (
                <p className="text-gray-200 mt-3 text-lg">
                  {shop.cuisine}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Our Menu
          </h2>
          <p className="text-gray-600">
            {items.length} items available
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <FoodCard data={item} key={item._id} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <FaStore className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-gray-900 text-xl font-bold mb-2">
              No Items Available
            </h3>
            <p className="text-gray-500 mb-6">
              This restaurant hasn't added any items yet
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-[#E23744] text-white font-semibold rounded-lg hover:bg-[#c02a35] transition-colors"
            >
              Explore Other Restaurants
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;
