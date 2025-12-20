import React, { useState } from "react";
import { IoIosArrowRoundBack, IoMdCloudUpload } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaStore, FaMapMarkerAlt, FaCity } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

function CreateEditShop() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user
  );
  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(myShopData?.address || currentAddress || "");
  const [city, setCity] = useState(myShopData?.city || currentCity || "");
  const [state, setState] = useState(myShopData?.state || currentState || "");
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false);
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
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);
      if (backendImage) {
        formData.append("image", backendImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
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
           <h1 className="text-3xl font-extrabold text-gray-900">
              {myShopData ? "Edit Restaurant" : "Create Restaurant"}
           </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px]">
           {/* Left Side - Form */}
           <div className="flex-1 p-8 lg:p-12">
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-orange-50 rounded-xl text-[#ff4d2d]">
                    <FaStore size={20} />
                 </div>
                 <h2 className="text-xl font-bold text-gray-800">Restaurant Details</h2>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    placeholder="e.g. The Spicy Spoon"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none font-medium"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                      <div className="relative">
                         <span className="absolute left-4 top-3.5 text-gray-400"><FaCity /></span>
                         <input
                           type="text"
                           placeholder="City"
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none"
                           onChange={(e) => setCity(e.target.value)}
                           value={city}
                           required
                         />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none"
                        onChange={(e) => setState(e.target.value)}
                        value={state}
                        required
                      />
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
                  <div className="relative">
                     <span className="absolute left-4 top-3.5 text-gray-400"><FaMapMarkerAlt /></span>
                     <input
                       type="text"
                       placeholder="Complete address including pincode"
                       className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none"
                       onChange={(e) => setAddress(e.target.value)}
                       value={address}
                       required
                     />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden group">
                     {frontendImage ? (
                        <div className="relative w-full h-full">
                           <img src={frontendImage} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                           <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white font-medium flex items-center gap-2"><IoMdCloudUpload /> Change Image</span>
                           </div>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                           <IoMdCloudUpload className="text-gray-400 group-hover:text-[#ff4d2d] mb-2 transform group-hover:scale-110 transition-transform" size={32} />
                           <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> restaurant cover</p>
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
                    {loading ? <ClipLoader size={20} color="white" /> : "Save Restaurant Details"}
                  </button>
                </div>
              </form>
           </div>

           {/* Right Side - Live Preview */}
           <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-50 to-white p-12 flex-col items-center justify-center border-l border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d2d] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob"></div>
               <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-2000"></div>

               <div className="relative z-10 w-full max-w-sm">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center mb-8">Card Preview</h3>
                  
                  {/* Shop Card Preview */}
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                     <div className="relative h-56 bg-gray-100">
                        {frontendImage ? (
                            <img src={frontendImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <FaStore size={40} />
                            </div>
                        )}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#ff4d2d] shadow-sm">
                           OPEN
                        </div>
                     </div>
                     
                     <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{name || 'Restaurant Name'}</h3>
                        <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                           <FaMapMarkerAlt className="text-gray-300" /> {city || 'City'}, {state || 'State'}
                        </p>
                        
                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm font-medium text-gray-600">
                           <span>{address || 'Complete Address'}</span>
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

export default CreateEditShop;
