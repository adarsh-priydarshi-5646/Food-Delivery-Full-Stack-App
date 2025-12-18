import React from "react";
import { MdRestaurant, MdPerson, MdAccessTime, MdCheckCircle, MdCancel } from "react-icons/md";
import { FaRupeeSign, FaMapMarkerAlt } from "react-icons/fa";

function DeliveryHistoryCard({ data }) {
  const ratePerDelivery = 50; 
  const isDelivered = data.shopOrders?.status === "delivered";
  const isCancelled = data.shopOrders?.status === "cancelled";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
      {}
      <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-3">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isDelivered ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {isDelivered ? <MdCheckCircle size={24} /> : <MdCancel size={24} />}
            </div>
            <div>
                <h3 className="font-bold text-gray-900">{data.shopOrders?.shop.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MdAccessTime /> {new Date(data.createdAt).toLocaleString()}
                </p>
            </div>
        </div>
        <div className="text-right">
             <div className="text-lg font-bold text-[#E23744] flex items-center justify-end gap-1">
                <FaRupeeSign size={14} /> {isDelivered ? ratePerDelivery : 0}
             </div>
             <span className="text-xs text-gray-400 font-medium">Earned</span>
        </div>
      </div>

      {}
      <div className="space-y-4">
          <div className="flex justify-between items-start">
             <div className="flex-1">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Customer</p>
                <div className="flex items-center gap-2">
                    <MdPerson className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-800">{data.user.fullName}</span>
                </div>
                <p className="text-xs text-gray-500 ml-6 flex items-start gap-1 mt-1">
                    <FaMapMarkerAlt className="shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{data.deliveryAddress.text}</span>
                </p>
             </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
             <p className="text-xs text-gray-400 font-bold uppercase mb-2">Order Items</p>
             <div className="space-y-2">
                 {data.shopOrders?.shopOrderItems?.map((item, idx) => (
                     <div key={idx} className="flex justify-between text-sm">
                         <span className="text-gray-700">{item.quantity} x {item.item?.name || item.name || "Unknown Item"}</span>
                     </div>
                 ))}
             </div>
          </div>
      </div>

      {}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <div className={`text-sm font-bold uppercase px-3 py-1 rounded-full ${
                isDelivered ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
                {data.shopOrders?.status}
            </div>
            <span className="text-xs text-gray-400">Order #{data._id.slice(-6).toUpperCase()}</span>
      </div>
    </div>
  );
}

export default DeliveryHistoryCard;
