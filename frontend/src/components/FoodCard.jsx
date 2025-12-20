import React, { memo } from "react";
import { FaStar } from "react-icons/fa";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQuantity, removeCartItem } from "../redux/userSlice";

const FoodCard = memo(({ data }) => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.user);
  
  
  const cartItem = cartItems.find((i) => i.id === data._id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: data._id,
        name: data.name,
        price: data.price,
        image: data.image,
        shop: data.shop,
        quantity: 1, 
        foodType: data.foodType,
      })
    );
  };

  const handleIncrement = () => {
    const newQty = currentQuantity + 1;
    dispatch(updateQuantity({ id: data._id, quantity: newQty }));
  };

  const handleDecrement = () => {
    if (currentQuantity > 1) {
      const newQty = currentQuantity - 1;
      dispatch(updateQuantity({ id: data._id, quantity: newQty }));
    } else if (currentQuantity === 1) {
      
      dispatch(removeCartItem(data._id));
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover-lift">
      {}
      <div className="relative w-full h-48 hover-zoom-image bg-gray-100">
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover"
          loading="lazy"
          width="380"
          height="192"
        />
        
        {}
        <div className="absolute top-3 left-3">
          {data.foodType === "veg" ? (
            <div className="bg-white rounded-md p-1 shadow-sm border-2 border-green-600 flex items-center justify-center w-6 h-6">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-md p-1 shadow-sm border-2 border-red-600 flex items-center justify-center w-6 h-6">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
            </div>
          )}
        </div>

        {}
        {data.rating && data.rating.average > 0 && (
          <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-lg">
            <FaStar className="text-[10px]" />
            {data.rating.average.toFixed(1)}
          </div>
        )}

        {}
        {data.deliveryTime && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-md text-xs font-semibold shadow-sm">
            {data.deliveryTime} mins
          </div>
        )}
      </div>

      {}
      <div className="p-4">
        {}
        <h3 className="text-gray-900 font-bold text-base mb-1 line-clamp-2">
          {data.name}
        </h3>

        {}
        {data.shop && data.shop.name && (
          <p className="text-gray-500 text-sm mb-2 line-clamp-1">
            {data.shop.name}
          </p>
        )}

        {}
        {data.description && (
          <p className="text-gray-600 text-xs mb-2 line-clamp-2">
            {data.description}
          </p>
        )}

        {}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-gray-900 font-bold text-lg">
              ₹{data.price}
            </span>
            {data.category && (
              <span className="text-gray-500 text-xs">
                {data.category}
              </span>
            )}
          </div>
          
          {}
          {data.rating && data.rating.average > 0 && (
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-500 text-sm" />
              <span className="text-sm font-semibold text-gray-700">
                {data.rating.average.toFixed(1)}
              </span>
              {data.rating.count > 0 && (
                <span className="text-xs text-gray-400">
                  ({data.rating.count})
                </span>
              )}
            </div>
          )}
        </div>

        {}
        {currentQuantity === 0 ? (
          <button
            onClick={handleAddToCart}
            className="w-full bg-white border-2 border-[#E23744] text-[#E23744] font-bold py-2.5 px-4 rounded-lg hover:bg-[#E23744] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
          >
            ADD
          </button>
        ) : (
          <div className="w-full bg-[#E23744] text-white rounded-lg py-2 px-3 flex items-center justify-between shadow-md">
            <button
              onClick={handleDecrement}
              className="hover:bg-white/20 w-8 h-8 rounded-md flex items-center justify-center transition-colors"
            >
              <FaMinus className="text-sm" />
            </button>
            <span className="font-bold text-lg">{currentQuantity}</span>
            <button
              onClick={handleIncrement}
              className="hover:bg-white/20 w-8 h-8 rounded-md flex items-center justify-center transition-colors"
            >
              <FaPlus className="text-sm" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.data._id === nextProps.data._id &&
    prevProps.data.name === nextProps.data.name &&
    prevProps.data.price === nextProps.data.price
  );
});

FoodCard.displayName = 'FoodCard';

export default FoodCard;
