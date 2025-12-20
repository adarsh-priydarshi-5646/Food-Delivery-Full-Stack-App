import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaPlus, FaTrash, 
  FaEdit, FaCheckCircle, FaChevronRight, FaStar, FaShoppingBag, 
  FaClock, FaCreditCard, FaLock, FaBell, FaHeadset, FaInfoCircle
} from "react-icons/fa";
import AddressModal from "../components/AddressModal";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function Profile() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  // Real stats state
  const [profileStats, setProfileStats] = useState({
    totalOrders: 0,
    totalReviews: 0,
    points: 0,
    savedTime: "0 hrs"
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Profile Edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: userData?.fullName || "",
    email: userData?.email || "",
    mobile: userData?.mobile || ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchProfileStats();
  }, [userData]);

  const fetchProfileStats = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/user/profile-stats`, {
        withCredentials: true
      });
      setProfileStats(data);
    } catch (error) {
      console.error("Failed to fetch profile stats", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (userData) {
      setProfileForm({
        fullName: userData.fullName || "",
        email: userData.email || "",
        mobile: userData.mobile || ""
      });
    }
  }, [userData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const { data } = await axios.put(`${serverUrl}/api/user/update-profile`, profileForm, {
        withCredentials: true
      });
      dispatch(setUserData(data.user));
      setIsEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const { data } = await axios.delete(`${serverUrl}/api/user/remove-address/${addressId}`, {
        withCredentials: true
      });
      dispatch(setUserData(data.user));
      toast.success("Address removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove address");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const address = userData.addresses.find(a => a._id === addressId);
      const { data } = await axios.put(`${serverUrl}/api/user/update-address`, {
        addressId,
        updatedAddress: { ...address, isDefault: true }
      }, {
        withCredentials: true
      });
      dispatch(setUserData(data.user));
      toast.success("Default address updated");
    } catch (error) {
      toast.error("Failed to update default address");
    }
  };

  const stats = [
    { label: "Total Orders", value: profileStats.totalOrders, icon: <FaShoppingBag />, color: "bg-blue-50 text-blue-600" },
    { label: "Reviews", value: profileStats.totalReviews, icon: <FaStar />, color: "bg-yellow-50 text-yellow-600" },
    { label: "Vingo Points", value: profileStats.points, icon: <FaStar />, color: "bg-purple-50 text-purple-600" },
    { label: "Saved Time", value: profileStats.savedTime, icon: <FaClock />, color: "bg-green-50 text-green-600" },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col font-sans overflow-x-hidden">
      <Nav />
      <div className="flex-1 pt-24 pb-12">
        <Toaster />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Card */}
        <motion.div {...fadeInUp} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full opacity-50 -mr-8 -mt-8" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-gray-50 relative z-10">
             <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#E23744] to-[#ff5c6b] flex items-center justify-center text-white text-4xl font-black border-4 border-white shadow-xl">
                {userData?.fullName?.charAt(0).toUpperCase()}
             </div>
             <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{userData?.fullName}</h1>
                    <p className="text-gray-500 font-bold flex items-center justify-center md:justify-start gap-2 text-xs uppercase tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Member Since {new Date(userData?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="self-center md:self-start flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all border border-gray-100 text-sm shadow-sm"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100/50 transition-all hover:bg-white hover:shadow-md group">
               <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#E23744] shadow-sm group-hover:scale-110 transition-transform">
                  <FaEnvelope />
               </div>
               <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Email Address</p>
                  <p className="text-gray-700 font-bold text-sm">{userData?.email}</p>
               </div>
            </div>
            <div className="flex items-center gap-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100/50 transition-all hover:bg-white hover:shadow-md group">
               <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#E23744] shadow-sm group-hover:scale-110 transition-transform">
                  <FaPhone />
               </div>
               <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Mobile Number</p>
                  <p className="text-gray-700 font-bold text-sm">{userData?.mobile || "Not provided"}</p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              {...fadeInUp} 
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 rounded-3xl border border-gray-100 text-center hover:shadow-lg transition-all"
            >
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 text-lg`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Address Section */}
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-[#E23744]">
                  <FaMapMarkerAlt size={20} />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-none">Saved Addresses</h2>
                  <p className="text-gray-400 text-sm font-medium mt-1">Manage your delivery locations</p>
               </div>
            </div>
            <button 
              onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95 text-sm"
            >
              <FaPlus size={12} />
              <span>Add New</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {userData?.addresses?.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
                  <FaMapMarkerAlt size={24} />
                </div>
                <p className="text-gray-800 font-bold">No saved addresses yet</p>
                <p className="text-gray-400 text-xs mt-1 px-8">Add your home or office address for faster checkout</p>
              </div>
            ) : (
              userData?.addresses?.map((address) => (
                <div 
                  key={address._id}
                  className={`relative group p-6 rounded-[1.5rem] border-2 transition-all hover:bg-red-50/5 ${address.isDefault ? 'border-[#E23744] bg-red-50/20' : 'border-gray-50 hover:border-gray-100 bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${address.isDefault ? 'bg-[#E23744] text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-500'}`}>
                          {address.label}
                       </span>
                       {address.isDefault && <FaCheckCircle className="text-[#E23744]" size={16} />}
                    </div>
                    <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingAddress(address); setShowAddressModal(true); }}
                        className="w-10 h-10 flex items-center justify-center bg-white text-gray-400 hover:text-[#E23744] rounded-xl shadow-sm border border-gray-100 transition-all"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteAddress(address._id)}
                        className="w-10 h-10 flex items-center justify-center bg-white text-gray-400 hover:text-red-500 rounded-xl shadow-sm border border-gray-100 transition-all"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-gray-900 font-black text-xl mb-1">{address.flatNo}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed mb-5 text-sm">
                    {address.area}{address.landmark && ` • ${address.landmark}`}<br />
                    {address.city}, {address.pincode}
                  </p>

                  {!address.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(address._id)}
                      className="text-[#E23744] text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      Set as Default <FaChevronRight size={10} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions / Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div {...fadeInUp} transition={{ delay: 0.4 }} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><FaLock size={14}/></div>
              Security & Privacy
            </h3>
            <div className="space-y-4">
              {['Change Password', 'Two-Factor Auth', 'Privacy Settings'].map((action, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-50">
                  <span className="text-gray-700 font-bold text-sm">{action}</span>
                  <FaChevronRight className="text-gray-300 group-hover:text-gray-900 transition-colors" size={12} />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ delay: 0.5 }} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center"><FaBell size={14}/></div>
              Notifications
            </h3>
            <div className="space-y-4">
              {['Order Updates', 'Promotions', 'Account Alerts'].map((action, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
                  <span className="text-gray-700 font-bold text-sm">{action}</span>
                  <div className="w-10 h-6 bg-[#E23744] rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Help & Support */}
        <motion.div {...fadeInUp} transition={{ delay: 0.6 }} className="mt-8 bg-gray-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Need any help?</h3>
              <p className="text-white/60 font-medium">Our 24/7 dedicated support team is here to assist you.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-black hover:bg-gray-100 transition-all shadow-xl text-sm flex items-center gap-2">
                <FaHeadset /> Support Center
              </button>
            </div>
          </div>
        </motion.div>

        {/* Legal Info */}
        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
           <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
           <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
           <a href="#" className="hover:text-gray-900 transition-colors">Cookies</a>
           <span className="opacity-50 inline-block px-2">VERSION 2.4.0</span>
        </div>
      </div>

      <AnimatePresence>
        {isEditingProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-16 -mt-16 opacity-50" />
              
              <h2 className="text-2xl font-black text-gray-900 mb-6">Edit Profile</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-5 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-[#E23744] focus:ring-1 focus:ring-[#E23744] transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-[#E23744] focus:ring-1 focus:ring-[#E23744] transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.mobile}
                    onChange={(e) => setProfileForm({...profileForm, mobile: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-[#E23744] focus:ring-1 focus:ring-[#E23744] transition-all font-bold"
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-sm text-white bg-gray-900 hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showAddressModal && (
          <AddressModal 
            onClose={() => setShowAddressModal(false)} 
            addressToEdit={editingAddress}
          />
        )}
      </AnimatePresence>

      </div>
      <Footer />
    </div>
  );
}

export default Profile;
