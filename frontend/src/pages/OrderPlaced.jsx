import React, { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { FaBox } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { addMyOrder, clearCart } from "../redux/userSlice";

function OrderPlaced() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const verifyStripePayment = async () => {
      const orderId = searchParams.get("orderId");
      const sessionId = searchParams.get("session_id");

      if (orderId && sessionId) {
        setVerifying(true);
        
        try {
          const result = await axios.post(
            `${serverUrl}/api/order/verify-stripe-payment`,
            { orderId, sessionId },
            { withCredentials: true }
          );
          
          dispatch(addMyOrder(result.data));
          dispatch(clearCart());
        } catch (error) {
          console.error("Payment verification failed:", error);
          alert(`Payment verification failed: ${error.response?.data?.message || error.message}\n\nPlease contact support with Order ID: ${orderId}`);
        } finally {
          setVerifying(false);
        }
      }
    };

    const timer = setTimeout(() => {
      verifyStripePayment();
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams, dispatch]);

  const manualVerify = async () => {
    const orderId = searchParams.get("orderId");
    const sessionId = searchParams.get("session_id");
    
    if (!orderId || !sessionId) {
      alert("Missing orderId or sessionId in URL!");
      return;
    }

    setVerifying(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-stripe-payment`,
        { orderId, sessionId },
        { withCredentials: true }
      );
      alert("✅ Payment verified successfully!");
      dispatch(addMyOrder(result.data));
      dispatch(clearCart());
    } catch (error) {
      alert(`❌ Verification failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col justify-center items-center px-4 text-center">
      {verifying ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#E23744] mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
          <p className="text-gray-600">Please wait while we confirm your payment</p>
        </div>
      ) : (
        <div className="max-w-lg">
          {}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-green-100 rounded-full blur-3xl opacity-50"></div>
            <div className="relative bg-white rounded-full p-8 shadow-lg inline-block">
              <FaCircleCheck className="text-green-500 text-7xl" />
            </div>
          </div>

          {}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Thank you for your order! Your food is being prepared and will be delivered soon. 
            Track your order status in "My Orders".
          </p>

          {}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FaBox className="text-[#E23744] text-2xl" />
              <h3 className="text-xl font-bold text-gray-900">What's Next?</h3>
            </div>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#E23744] mt-1">✓</span>
                <span>Restaurant is preparing your order</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E23744] mt-1">✓</span>
                <span>You'll receive updates via notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E23744] mt-1">✓</span>
                <span>Delivery partner will be assigned soon</span>
              </li>
            </ul>
          </div>

          {}
          {searchParams.get("session_id") && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-gray-700 mb-2 font-semibold">
                Payment Information
              </p>
              <p className="text-xs text-gray-600 break-all mb-1">
                Order ID: {searchParams.get("orderId") || "Processing..."}
              </p>
              <button
                className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                onClick={manualVerify}
                disabled={verifying}
              >
                {verifying ? "Verifying..." : "🔄 Retry Verification"}
              </button>
            </div>
          )}

          {}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-8 py-3.5 bg-[#E23744] text-white font-bold rounded-lg hover:bg-[#c02a35] transition-all duration-300 shadow-md hover:shadow-lg"
              onClick={() => navigate("/my-orders")}
            >
              View My Orders
            </button>
            <button
              className="px-8 py-3.5 bg-white border-2 border-[#E23744] text-[#E23744] font-bold rounded-lg hover:bg-red-50 transition-colors"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderPlaced;
