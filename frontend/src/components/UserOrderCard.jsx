import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyOrders } from "../redux/userSlice";
import { FaCalendar, FaClock, FaCheckCircle, FaStar, FaTrash, FaMapMarkerAlt } from "react-icons/fa";

function UserOrderCard({ data, allOrders }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedRating, setSelectedRating] = useState({});
  const [deleting, setDeleting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [orderRating, setOrderRating] = useState(data.orderRating?.rating || 0);
  const [orderReview, setOrderReview] = useState(data.orderRating?.review || "");
  const [submittingRating, setSubmittingRating] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "preparing": return "bg-blue-50 text-blue-700 border-blue-200";
      case "on the way": return "bg-purple-50 text-purple-700 border-purple-200";
      case "delivered": return "bg-green-50 text-green-700 border-green-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleRating = async (itemId, rating) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/item/rating`,
        { itemId, rating },
        { withCredentials: true }
      );
      setSelectedRating((prev) => ({ ...prev, [itemId]: rating }));
      alert(`Thanks for rating! You gave ${rating} stars ⭐`);
    } catch (error) {
      console.error(error);
      alert("Failed to submit rating");
    }
  };

  const handleDeleteOrder = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    setDeleting(true);
    try {
      const result = await axios.delete(
        `${serverUrl}/api/order/delete-order/${data._id}`,
        { withCredentials: true }
      );
      const updatedOrders = allOrders.filter((order) => order._id !== data._id);
      dispatch(setMyOrders(updatedOrders));
      alert(result.data.message);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmitOrderRating = async () => {
    if (orderRating === 0) { alert("Please select a rating"); return; }
    setSubmittingRating(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/rate-order/${data._id}`,
        { rating: orderRating, review: orderReview },
        { withCredentials: true }
      );
      const updatedOrders = allOrders.map((order) => {
        if (order._id === data._id) return { ...order, orderRating: result.data.orderRating };
        return order;
      });
      dispatch(setMyOrders(updatedOrders));
      setShowRatingModal(false);
      alert("Thank you for your feedback! ⭐");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  const isDelivered = data.shopOrders.every((so) => so.status === "delivered");
  const currentStatus = data.shopOrders?.[0]?.status || "pending";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow mb-4">
      {}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-900 text-base">#{data._id.slice(-6).toUpperCase()}</span>
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <FaCalendar className="text-gray-400" /> {formatDate(data.createdAt)}
          </span>
        </div>
        <span className={`px-3 py-1 rounded-md text-sm font-semibold border capitalize ${getStatusColor(currentStatus)}`}>
          {currentStatus}
        </span>
      </div>

      {}
      <div className="p-6 space-y-6">
        {data.shopOrders.map((shopOrder, index) => (
          <div key={index} className="space-y-4">
            <div>
              <p className="font-bold text-gray-900 text-lg mb-1">{shopOrder.shop.name}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaMapMarkerAlt className="text-[#E23744]" /> {shopOrder.shop.address}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shopOrder.shopOrderItems.map((orderItem, itemIndex) => (
                <div key={itemIndex} className="flex gap-4 p-3 border border-gray-200 rounded-xl bg-white hover:border-[#E23744]/30 transition-colors">
                  <img
                    src={orderItem.item?.image || "https://via.placeholder.com/150"}
                    alt={orderItem.name}
                    className="w-20 h-20 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-base font-semibold text-gray-900 line-clamp-1 mb-1">{orderItem.name}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        Qty: {orderItem.quantity}
                      </span>
                      <span className="text-base font-bold text-[#E23744]">
                        ₹{orderItem.quantity * orderItem.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
        <div>
          <p className="text-sm text-gray-500 mb-1">Total Amount</p>
          <p className="text-xl font-bold text-[#E23744]">₹{data.totalAmount}</p>
        </div>

        <div className="flex gap-3">
          {data.shopOrders.every((so) => so.status === "pending") && (
            <button
              className="px-5 py-2.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              onClick={handleDeleteOrder}
              disabled={deleting}
            >
              <FaTrash size={14} /> Cancel
            </button>
          )}
          
          {isDelivered && !data.orderRating?.rating && (
            <button
              className="px-5 py-2.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              onClick={() => setShowRatingModal(true)}
            >
              <FaStar size={14} /> Rate Order
            </button>
          )}

          {data.orderRating?.rating && (
            <div className="flex items-center gap-2 px-5 py-2.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm font-bold">
              <span>{data.orderRating.rating}</span> <FaStar className="text-yellow-500" />
            </div>
          )}
          
          <button
            className="px-6 py-2.5 bg-[#E23744] hover:bg-[#c02a35] text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
            onClick={() => navigate(`/track-order/${data._id}`)}
          >
            Track Order
          </button>
        </div>
      </div>

      {}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-900">Rate Your Experience</h2>
            <div className="mb-6 flex flex-col items-center">
              <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className={`text-3xl transition-transform hover:scale-110 ${orderRating >= star ? "text-yellow-400" : "text-gray-200"}`} onClick={() => setOrderRating(star)}>★</button>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-600">{orderRating > 0 ? "Thanks!" : "Tap to rate"}</p>
            </div>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#E23744] bg-gray-50 resize-none mb-4"
              rows="3"
              placeholder="Tell us more (optional)..."
              value={orderReview}
              onChange={(e) => setOrderReview(e.target.value)}
              maxLength="200"
            />
            <div className="flex gap-3">
              <button className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100" onClick={() => setShowRatingModal(false)}>Cancel</button>
              <button className="flex-1 bg-[#E23744] hover:bg-[#c02a35] text-white py-2 rounded-lg text-sm font-bold shadow-md" onClick={handleSubmitOrderRating}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserOrderCard;
