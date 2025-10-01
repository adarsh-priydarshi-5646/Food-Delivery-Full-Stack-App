import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyOrders } from "../redux/userSlice";

function UserOrderCard({ data, allOrders }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedRating, setSelectedRating] = useState({}); //itemId:rating
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
    });
  };

  const handleRating = async (itemId, rating) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/item/rating`,
        { itemId, rating },
        { withCredentials: true }
      );
      setSelectedRating((prev) => ({
        ...prev,
        [itemId]: rating,
      }));
      alert(`Thanks for rating! You gave ${rating} stars ⭐`);
    } catch (error) {
      console.log(error);
      alert("Failed to submit rating");
    }
  };

  const handleDeleteOrder = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    setDeleting(true);
    try {
      const result = await axios.delete(
        `${serverUrl}/api/order/delete-order/${data._id}`,
        { withCredentials: true }
      );
      
      // Remove order from Redux state
      const updatedOrders = allOrders.filter((order) => order._id !== data._id);
      dispatch(setMyOrders(updatedOrders));
      
      alert(result.data.message);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmitOrderRating = async () => {
    if (orderRating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmittingRating(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/rate-order/${data._id}`,
        { rating: orderRating, review: orderReview },
        { withCredentials: true }
      );
      
      // Update order in Redux state
      const updatedOrders = allOrders.map((order) => {
        if (order._id === data._id) {
          return { ...order, orderRating: result.data.orderRating };
        }
        return order;
      });
      dispatch(setMyOrders(updatedOrders));
      
      setShowRatingModal(false);
      alert("Thank you for your feedback! ⭐");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  const isDelivered = data.shopOrders.every((so) => so.status === "delivered");

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between border-b pb-2">
        <div>
          <p className="font-semibold">order #{data._id.slice(-6)}</p>
          <p className="text-sm text-gray-500">
            Date: {formatDate(data.createdAt)}
          </p>
        </div>
        <div className="text-right">
          {data.paymentMethod == "cod" ? (
            <p className="text-sm text-gray-500">
              {data.paymentMethod?.toUpperCase()}
            </p>
          ) : (
            <p className="text-sm text-gray-500 font-semibold">
              Payment: {data.payment ? "true" : "false"}
            </p>
          )}

          <p className="font-medium text-blue-600">
            {data.shopOrders?.[0].status}
          </p>
        </div>
      </div>

      {data.shopOrders.map((shopOrder, index) => (
        <div
          className='"border rounded-lg p-3 bg-[#fffaf7] space-y-3'
          key={index}
        >
          <p>{shopOrder.shop.name}</p>

          <div className="flex space-x-4 overflow-x-auto pb-2">
            {shopOrder.shopOrderItems.map((orderItem, itemIndex) => (
              <div
                key={itemIndex}
                className="flex-shrink-0 w-40 border rounded-lg p-2 bg-white"
              >
                <img
                  src={orderItem.item?.image || "https://via.placeholder.com/150"}
                  alt={orderItem.name}
                  className="w-full h-24 object-cover rounded"
                />
                <p className="text-sm font-semibold mt-1">{orderItem.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {orderItem.quantity} x ₹{orderItem.price}
                </p>

                {shopOrder.status == "delivered" && orderItem.item && (
                  <div className="flex space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`text-lg ${
                          selectedRating[orderItem.item._id] >= star
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }`}
                        onClick={() => handleRating(orderItem.item._id, star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <p className="font-semibold">Subtotal: {shopOrder.subtotal}</p>
            <span className="text-sm font-medium text-blue-600">
              {shopOrder.status}
            </span>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center border-t pt-2">
        <p className="font-semibold">Total: ₹{data.totalAmount}</p>
        <div className="flex gap-2 flex-wrap">
          {data.shopOrders.every((so) => so.status === "pending") && (
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              onClick={handleDeleteOrder}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
          
          {isDelivered && !data.orderRating?.rating && (
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              onClick={() => setShowRatingModal(true)}
            >
              Rate Order ⭐
            </button>
          )}

          {data.orderRating?.rating && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold">{data.orderRating.rating}/5</span>
            </div>
          )}
          
          <button
            className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm"
            onClick={() => navigate(`/track-order/${data._id}`)}
          >
            Track Order
          </button>
        </div>
      </div>

      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Rate Your Order</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">How was your experience?</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`text-4xl transition-all ${
                      orderRating >= star ? "text-yellow-400 scale-110" : "text-gray-300"
                    }`}
                    onClick={() => setOrderRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-center mt-2 text-sm font-semibold text-gray-700">
                {orderRating === 0 && "Select rating"}
                {orderRating === 1 && "Poor"}
                {orderRating === 2 && "Fair"}
                {orderRating === 3 && "Good"}
                {orderRating === 4 && "Very Good"}
                {orderRating === 5 && "Excellent"}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write a review (optional)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] resize-none"
                rows="4"
                placeholder="Share your experience..."
                value={orderReview}
                onChange={(e) => setOrderReview(e.target.value)}
                maxLength="500"
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {orderReview.length}/500
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"
                onClick={() => {
                  setShowRatingModal(false);
                  setOrderRating(data.orderRating?.rating || 0);
                  setOrderReview(data.orderRating?.review || "");
                }}
                disabled={submittingRating}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-[#ff4d2d] hover:bg-[#e64526] text-white py-2 rounded-lg font-medium disabled:opacity-50"
                onClick={handleSubmitOrderRating}
                disabled={submittingRating || orderRating === 0}
              >
                {submittingRating ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserOrderCard;
