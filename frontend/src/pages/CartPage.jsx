import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaShoppingCart, FaReceipt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CartItemCard from "../components/CartItemCard";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useSelector((state) => state.user);

  const deliveryFee = 40;
  const platformFee = 5;
  const gst = Math.round(totalAmount * 0.05); 
  const grandTotal = totalAmount + deliveryFee + platformFee + gst;

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex justify-center px-4 py-6">
      <div className="w-full max-w-6xl">
        {}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-white rounded-full transition-colors"
            aria-label="Go back"
          >
            <IoIosArrowRoundBack size={32} className="text-[#E23744]" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
            <p className="text-gray-600 text-sm mt-1">
              {cartItems?.length || 0} items in your cart
            </p>
          </div>
        </div>

        {cartItems?.length === 0 ? (
          
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <FaShoppingCart className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-gray-900 text-xl font-bold mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added anything to your cart yet
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-[#E23744] text-white font-semibold rounded-lg hover:bg-[#c02a35] transition-colors"
            >
              Browse Food Items
            </button>
          </div>
        ) : (
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {}
            <div className="lg:col-span-2 space-y-4">
              {cartItems?.map((item, index) => (
                <CartItemCard data={item} key={index} />
              ))}
            </div>

            {}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                  <FaReceipt className="text-[#E23744]" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Bill Details
                  </h2>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Item Total</span>
                    <span className="font-semibold">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span className="flex items-center gap-1">
                      Delivery Fee
                      <span className="text-xs text-gray-400">(Standard)</span>
                    </span>
                    <span className="font-semibold">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Platform Fee</span>
                    <span className="font-semibold">₹{platformFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span className="flex items-center gap-1">
                      GST
                      <span className="text-xs text-gray-400">(5%)</span>
                    </span>
                    <span className="font-semibold">₹{gst}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-gray-900">
                    <span className="text-lg font-bold">TO PAY</span>
                    <span className="text-xl font-bold text-[#E23744]">
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-[#E23744] text-white px-6 py-3.5 rounded-lg text-lg font-bold hover:bg-[#c02a35] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Proceed to Checkout
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
