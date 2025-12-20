import axios from "axios";
import React from "react";
import { FaPen, FaTrashAlt, FaTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";

function OwnerItemCard({ data }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/delete/${data._id}`,
          { withCredentials: true }
        );
        dispatch(setMyShopData(result.data));
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden">
         <img 
            src={data.image} 
            alt={data.name} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
         />
         <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1">
            <FaTag className="text-[#ff4d2d]" size={10} /> {data.category}
         </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
           <h2 className="text-lg font-bold text-gray-800 line-clamp-1 flex-1 pr-2">
             {data.name}
           </h2>
           <div className={`w-3 h-3 rounded-full mt-1.5 ${data.foodType === 'veg' ? 'bg-green-500' : 'bg-red-500'} ring-2 ring-offset-1 ${data.foodType === 'veg' ? 'ring-green-100' : 'ring-red-100'}`}></div>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 capitalize">{data.foodType}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
           <div className="text-xl font-extrabold text-[#ff4d2d]">₹{data.price}</div>
           
           <div className="flex items-center gap-2">
             <button
               className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 transition-all"
               onClick={() => navigate(`/edit-item/${data._id}`)}
               title="Edit Item"
             >
               <FaPen size={14} />
             </button>
             <button
               className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:scale-105 transition-all"
               onClick={handleDelete}
               title="Delete Item"
             >
               <FaTrashAlt size={14} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerItemCard;
