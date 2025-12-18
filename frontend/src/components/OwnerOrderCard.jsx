import axios from "axios";
import React from "react";
import { MdPhone, MdDeliveryDining } from "react-icons/md";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";
import { useState } from "react";
import { useEffect } from "react";
function OwnerOrderCard({ data }) {
  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch();
  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );
      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(result.data.availableBoys);
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-3">
        <div>
           <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{data.user.fullName}</h2>
              <span className="text-xs text-gray-400">#{data._id.slice(-6)}</span>
           </div>
           <p className="text-sm text-gray-500 font-medium">{data.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}</p>
        </div>
        <div className="text-right">
           <p className="text-lg font-bold text-[#ff4d2d]">₹{data.shopOrders.subtotal}</p>
           <p className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded inline-block mt-1">
              {new Date(data.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
           </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {data.shopOrders.shopOrderItems.map((item, index) => (
           <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                 <div className="bg-orange-50 text-orange-600 font-bold w-6 h-6 flex items-center justify-center rounded text-xs">
                    {item.quantity}x
                 </div>
                 <span className="text-gray-700 font-medium">{item.name}</span>
              </div>
              <span className="text-gray-500">₹{item.price * item.quantity}</span>
           </div>
        ))}
      </div>
      
      {}
      <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between gap-3">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
               data.shopOrders.status === 'delivered' ? 'bg-green-500' : 
               data.shopOrders.status === 'cancelled' ? 'bg-red-500' :
               data.shopOrders.status === 'preparing' ? 'bg-orange-500' : 'bg-blue-500'
            }`}></div>
            <span className="text-sm font-bold uppercase text-gray-700">{data.shopOrders.status}</span>
         </div>

         {data.shopOrders.status !== 'delivered' && data.shopOrders.status !== 'cancelled' && (
            <select
              className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold py-1.5 px-3 rounded-lg focus:border-[#ff4d2d] focus:ring-1 focus:ring-[#ff4d2d] outline-none cursor-pointer"
              value={data.shopOrders.status}
              onChange={(e) =>
                handleUpdateStatus(
                  data._id,
                  data.shopOrders.shop._id,
                  e.target.value
                )
              }
            >
              <option value="pending">Pending</option>
              <option value="preparing">Accept (Preparing)</option>
              <option value="ready">Ready to Pickup</option>
              <option value="out of delivery">Out for Delivery</option>
            </select>
         )}
      </div>

      {}
      {(data.shopOrders.status === "preparing" || data.shopOrders.status === "ready" || data.shopOrders.status === "out of delivery") && (
         <div className="mt-3 text-xs text-gray-500 flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-100">
            <span>Delivery Partner:</span>
            {data.shopOrders.assignedDeliveryBoy ? (
               <span className="font-bold text-blue-700 flex items-center gap-1">
                  <MdDeliveryDining /> {data.shopOrders.assignedDeliveryBoy.fullName}
               </span>
            ) : (
               <span className="text-orange-600 italic">Assigning...</span>
            )}
         </div>
      )}
    </div>
  );
}

export default OwnerOrderCard;
