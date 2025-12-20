import axios from "axios";
import React, { useState } from "react";
import { MdPhone, MdDeliveryDining, MdAccessTime, MdPerson } from "react-icons/md";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";

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
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'preparing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ready': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'out of delivery': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 border-b border-gray-100 pb-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#ff4d2d]">
                 <MdPerson size={20} />
              </div>
              <div>
                 <h2 className="text-lg font-bold text-gray-900">{data.user.fullName}</h2>
                 <span className="text-xs font-mono text-gray-400">ID: #{data._id.slice(-6).toUpperCase()}</span>
              </div>
           </div>
        </div>
        <div className="text-right">
           <div className="text-2xl font-extrabold text-[#ff4d2d]">₹{data.shopOrders.subtotal}</div>
           <div className="flex items-center justify-end gap-1 text-xs text-gray-400 mt-1">
              <MdAccessTime />
              {new Date(data.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
           </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
        {data.shopOrders.shopOrderItems.map((item, index) => (
           <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                 <div className="bg-white text-gray-800 font-bold w-6 h-6 flex items-center justify-center rounded-md text-xs border border-gray-200 shadow-sm">
                    {item.quantity}x
                 </div>
                 <span className="text-gray-700 font-medium">{item.name}</span>
              </div>
              <span className="text-gray-500 font-mono">₹{item.price * item.quantity}</span>
           </div>
        ))}
        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-widest">
           <span>Payment</span>
           <span className={data.paymentMethod === 'cod' ? 'text-orange-600' : 'text-green-600'}>
              {data.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
           </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
         <div className="flex items-center justify-between gap-4 bg-white p-1 rounded-lg">
            <div className={`px-4 py-2 rounded-lg border text-sm font-bold capitalize flex items-center gap-2 ${getStatusColor(data.shopOrders.status)}`}>
               <div className={`w-2 h-2 rounded-full bg-current`}></div>
               {data.shopOrders.status}
            </div>

            {data.shopOrders.status !== 'delivered' && data.shopOrders.status !== 'cancelled' && (
               <select
                 className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 px-4 rounded-xl focus:border-[#ff4d2d] focus:ring-2 focus:ring-[#ff4d2d]/20 outline-none cursor-pointer transition-all hover:border-gray-300"
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
                 <option value="ready">Ready for Pickup</option>
                 <option value="out of delivery">Out for Delivery</option>
                 <option value="delivered">Delivered</option>
               </select>
            )}
         </div>

         {(data.shopOrders.status === "preparing" || data.shopOrders.status === "ready" || data.shopOrders.status === "out of delivery") && (
            <div className="text-xs flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-800">
               <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                  <MdDeliveryDining size={16} />
               </div>
               <div className="flex-1">
                  <span className="block text-[10px] text-blue-400 font-bold uppercase tracking-wider">Delivery Partner</span>
                  {data.shopOrders.assignedDeliveryBoy ? (
                     <span className="font-bold text-sm">
                        {data.shopOrders.assignedDeliveryBoy.fullName}
                     </span>
                  ) : (
                     <span className="text-blue-600 italic font-medium animate-pulse">Assigning nearby partner...</span>
                  )}
               </div>
               {data.shopOrders.assignedDeliveryBoy && (
                  <button className="bg-white p-2 rounded-lg text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 transition-colors">
                     <MdPhone />
                  </button>
               )}
            </div>
         )}
      </div>
    </div>
  );
}

export default OwnerOrderCard;
