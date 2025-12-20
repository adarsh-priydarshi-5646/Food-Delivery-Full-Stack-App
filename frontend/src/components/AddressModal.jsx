import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaMapMarkerAlt, FaHome, FaBriefcase, FaEllipsisH, FaCompass, FaCheckCircle } from "react-icons/fa";
import useGetCity from "../hooks/useGetCity";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import AddressAutocomplete from "./AddressAutocomplete";

function AddressModal({ onClose, addressToEdit }) {
  const dispatch = useDispatch();
  const { getCity } = useGetCity();
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    label: "Home",
    flatNo: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    lat: null,
    lon: null,
    isDefault: false
  });

  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        label: addressToEdit.label || "Home",
        flatNo: addressToEdit.flatNo || "",
        area: addressToEdit.area || "",
        landmark: addressToEdit.landmark || "",
        city: addressToEdit.city || "",
        state: addressToEdit.state || "",
        pincode: addressToEdit.pincode || "",
        lat: addressToEdit.lat || null,
        lon: addressToEdit.lon || null,
        isDefault: addressToEdit.isDefault || false
      });
    }
  }, [addressToEdit]);

  const handleDetectLocation = async () => {
    setDetecting(true);
    setError("");
    try {
      const data = await getCity();
      setFormData(prev => ({
        ...prev,
        city: data.city || "",
        state: data.state || "",
        area: data.street ? `${data.street}, ${data.suburb}` : data.address || "",
        flatNo: data.house_number || prev.flatNo,
        pincode: data.postcode || "",
        lat: data.lat || null,
        lon: data.lon || null
      }));
    } catch (err) {
      setError("Failed to detect location. Please fill manually.");
    } finally {
      setDetecting(false);
    }
  };

  const handleAutocompleteSelect = (data) => {
    setFormData(prev => ({
      ...prev,
      city: data.city || "",
      state: data.state || "",
      area: data.address || "",
      pincode: data.pincode || "",
      lat: data.lat || null,
      lon: data.lon || null,
      flatNo: data.house_number ? `${data.house_number}` : prev.flatNo
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      let response;
      if (addressToEdit) {
        response = await axios.put(`${serverUrl}/api/user/update-address`, {
          addressId: addressToEdit._id,
          updatedAddress: formData
        }, { withCredentials: true });
      } else {
        response = await axios.post(`${serverUrl}/api/user/add-address`, {
          address: formData
        }, { withCredentials: true });
      }
      
      dispatch(setUserData(response.data.user));
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const labelOptions = [
    { id: "Home", icon: <FaHome /> },
    { id: "Work", icon: <FaBriefcase /> },
    { id: "Other", icon: <FaEllipsisH /> }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {addressToEdit ? "Edit Address" : "Add New Address"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar">
          <button 
            type="button"
            onClick={handleDetectLocation}
            disabled={detecting}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border relative overflow-hidden active:scale-95 disabled:opacity-70 ${
              detecting ? "bg-red-100 border-red-200 text-[#E23744]" : "bg-red-50 border-red-100 text-[#E23744] hover:bg-red-100"
            }`}
          >
            {detecting && (
              <motion.div 
                className="absolute inset-0 bg-[#E23744]/10"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <FaCompass className={detecting ? "animate-spin" : ""} size={18} />
            <span className="relative z-10">{detecting ? "Detecting exact location..." : "Detect Current Location"}</span>
          </button>

          <div className="grid grid-cols-3 gap-3">
            {labelOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFormData({ ...formData, label: option.id })}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  formData.label === option.id 
                    ? "border-[#E23744] bg-red-50/50" 
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <span className={`text-xl ${formData.label === option.id ? "text-[#E23744]" : "text-gray-400"}`}>
                  {option.icon}
                </span>
                <span className={`text-xs font-bold ${formData.label === option.id ? "text-[#E23744]" : "text-gray-500"}`}>
                  {option.id}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Search Area / Locality</label>
              <AddressAutocomplete 
                onSelect={handleAutocompleteSelect}
                initialValue={formData.area}
                placeholder="Type to search your area..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Flat / House No / Floor</label>
              <input 
                required
                type="text"
                placeholder="e.g. Flat 402, 4th Floor"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#E23744] focus:ring-1 focus:ring-[#E23744] transition-all font-medium"
                value={formData.flatNo}
                onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Landmark (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. Next to HDFC Bank"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#E23744] focus:ring-1 focus:ring-[#E23744] transition-all font-medium"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Pincode</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. 110001"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#E23744] focus:ring-1 focus:ring-[#E23744] transition-all font-medium"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">City</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. New Delhi"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#E23744] focus:ring-1 focus:ring-[#E23744] transition-all font-medium"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading || detecting}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Saving..." : (addressToEdit ? "Update Address" : "Save Address")}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default AddressModal;
