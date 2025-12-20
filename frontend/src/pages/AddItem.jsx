import React, { useState, useRef } from "react";
import { IoIosArrowRoundBack, IoMdCloudUpload } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaRupeeSign, FaTag, FaLeaf, FaDrumstickBite } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

function AddItem() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("veg");
  
  const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ];
  const dispatch = useDispatch();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);
      if (backendImage) {
        formData.append("image", backendImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/item/add-item`,
        formData,
        { withCredentials: true }
      );
      dispatch(setMyShopData(result.data));
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
           <button
             onClick={() => navigate("/")}
             className="group flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md border border-gray-100 transition-all"
           >
             <IoIosArrowRoundBack size={24} className="text-gray-600 group-hover:text-[#ff4d2d]" />
           </button>
           <h1 className="text-3xl font-extrabold text-gray-900">Add New Item</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px]">
           {/* Left Side - Form */}
           <div className="flex-1 p-8 lg:p-12">
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-orange-50 rounded-xl text-[#ff4d2d]">
                    <FaUtensils size={20} />
                 </div>
                 <h2 className="text-xl font-bold text-gray-800">Item Details</h2>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Butter Chicken, Paneer Tikka..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none font-medium"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                      <div className="relative">
                         <select
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none appearance-none cursor-pointer"
                           onChange={(e) => setCategory(e.target.value)}
                           value={category}
                           required
                         >
                           <option value="">Select...</option>
                           {categories.map((cate, index) => (
                             <option value={cate} key={index}>{cate}</option>
                           ))}
                         </select>
                         <div className="absolute right-4 top-4 text-gray-400 pointer-events-none">
                            <FaTag size={12} />
                         </div>
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                      <div className="flex gap-2">
                         <button
                           type="button"
                           onClick={() => setFoodType("veg")}
                           className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${foodType === 'veg' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                         >
                            <FaLeaf size={14} /> Veg
                         </button>
                         <button
                           type="button"
                           onClick={() => setFoodType("non veg")}
                           className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${foodType === 'non veg' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                         >
                            <FaDrumstickBite size={14} /> Non-Veg
                         </button>
                      </div>
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                  <div className="relative">
                     <span className="absolute left-4 top-3.5 text-gray-400"><FaRupeeSign /></span>
                     <input
                       type="number"
                       placeholder="0.00"
                       className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none font-mono font-medium"
                       onChange={(e) => setPrice(e.target.value)}
                       value={price}
                       required
                       min="0"
                     />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Upload Image</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden group">
                     {frontendImage ? (
                        <img src={frontendImage} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                           <IoMdCloudUpload className="text-gray-400 group-hover:text-[#ff4d2d] mb-2 transform group-hover:scale-110 transition-transform" size={32} />
                           <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        </div>
                     )}
                     <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    className="w-full bg-[#ff4d2d] text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-orange-600 hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? <ClipLoader size={20} color="white" /> : "Add Item to Menu"}
                  </button>
                </div>
              </form>
           </div>

           {/* Right Side - Live Preview */}
           <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-50 to-white p-12 flex-col items-center justify-center border-l border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d2d] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob"></div>
               <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-2000"></div>

               <div className="relative z-10 w-full max-w-sm">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center mb-8">Live Preview</h3>
                  
                  {/* Card Preview */}
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                     <div className="relative h-56 bg-gray-100">
                        {frontendImage ? (
                            <img src={frontendImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <FaUtensils size={40} />
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
                           {category || 'Category'}
                        </div>
                     </div>
                     
                     <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{name || 'Item Name'}</h3>
                           <div className={`p-1.5 rounded border ${foodType === 'veg' ? 'border-green-500' : 'border-red-500'}`}>
                              <div className={`w-2.5 h-2.5 rounded-full ${foodType === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                           </div>
                        </div>
                        
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                           Delicious {foodType} dish prepared fresh. Add this to your cart and enjoy!
                        </p>
                        
                        <div className="flex items-center justify-between">
                           <span className="text-2xl font-extrabold text-[#ff4d2d]">₹{price || 0}</span>
                           <button className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-200">
                              Add +
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default AddItem;
