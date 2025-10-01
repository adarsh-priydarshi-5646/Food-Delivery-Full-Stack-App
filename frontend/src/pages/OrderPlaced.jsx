import React, { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
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

      console.log("=".repeat(50));
      console.log("📍 OrderPlaced Page Loaded");
      console.log("Full URL:", window.location.href);
      console.log("URL Params:", { orderId, sessionId });
      console.log("=".repeat(50));

      if (orderId && sessionId) {
        setVerifying(true);
        console.log("🔄 Starting Stripe payment verification...");
        console.log("API URL:", `${serverUrl}/api/order/verify-stripe-payment`);
        
        try {
          const result = await axios.post(
            `${serverUrl}/api/order/verify-stripe-payment`,
            { orderId, sessionId },
            { withCredentials: true }
          );
          
          console.log("✅ Payment verified successfully!");
          console.log("Order Data:", result.data);
          console.log("Payment Status:", result.data.payment);
          console.log("Owner Earnings Should Be Updated");
          console.log("Delivery Boy Should Be Notified");
          
          dispatch(addMyOrder(result.data));
          dispatch(clearCart());
          
          console.log("✅ Redux updated, cart cleared");
          console.log("=".repeat(50));
        } catch (error) {
          console.error("=".repeat(50));
          console.error("❌ PAYMENT VERIFICATION FAILED");
          console.error("Error:", error.message);
          console.error("Response:", error.response?.data);
          console.error("Status:", error.response?.status);
          console.error("=".repeat(50));
          alert(`Payment verification failed: ${error.response?.data?.message || error.message}\n\nPlease contact support with Order ID: ${orderId}`);
        } finally {
          setVerifying(false);
        }
      } else {
        console.error("⚠️ MISSING PARAMETERS!");
        console.error("orderId:", orderId || "MISSING");
        console.error("sessionId:", sessionId || "MISSING");
        console.error("This means Stripe redirect URL is incorrect");
      }
    };

    // Small delay to ensure URL params are loaded
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
      alert("✅ Payment verified successfully!\nCheck owner dashboard and delivery boy notifications.");
      console.log("Manual verification result:", result.data);
      dispatch(addMyOrder(result.data));
      dispatch(clearCart());
    } catch (error) {
      alert(`❌ Verification failed: ${error.response?.data?.message || error.message}`);
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden">
      {verifying ? (
        <>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff4d2d] mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment...</h1>
          <p className="text-gray-600">Please wait</p>
        </>
      ) : (
        <>
          <FaCircleCheck className="text-green-500 text-6xl mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed!</h1>
          <p className="text-gray-600 max-w-md mb-6">
            Thank you for your purchase. Your order is being prepared. You can track
            your order status in the "My Orders" section.
          </p>
          
          {/* Debug Info */}
          {searchParams.get("session_id") && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg max-w-md">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Debug Info:</strong>
              </p>
              <p className="text-xs text-gray-500 break-all">
                Order ID: {searchParams.get("orderId") || "Missing"}
              </p>
              <p className="text-xs text-gray-500 break-all">
                Session ID: {searchParams.get("session_id") || "Missing"}
              </p>
              <button
                className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                onClick={manualVerify}
              >
                🔄 Retry Verification
              </button>
            </div>
          )}
          
          <button
            className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg font-medium transition"
            onClick={() => navigate("/my-orders")}
          >
            Back to my orders
          </button>
        </>
      )}
    </div>
  );
}

export default OrderPlaced;
