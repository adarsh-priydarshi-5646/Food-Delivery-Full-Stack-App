import React from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaClock, FaMapMarkerAlt } from "react-icons/fa";

function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/shop/${restaurant._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      {}
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          width="300"
          height="192"
        />
        {}
        {restaurant.rating && (
          <div className="absolute top-3 right-3 bg-green-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold text-sm shadow-lg">
            <FaStar className="text-xs" />
            {restaurant.rating}
          </div>
        )}
      </div>

      {}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-[#E23744] transition-colors">
          {restaurant.name}
        </h3>

        {}
        {restaurant.cuisine && (
          <div className="flex flex-wrap gap-1 mb-3">
            {restaurant.cuisine.split(',').slice(0, 3).map((cuisine, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {cuisine.trim()}
              </span>
            ))}
          </div>
        )}

        {}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FaClock className="text-[#E23744] text-xs" />
            <span>{restaurant.deliveryTime || '30-40'} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-[#E23744] text-xs" />
            <span>{restaurant.city}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;
