import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { FaRupeeSign, FaUniversity, FaCreditCard, FaMobileAlt, FaShieldAlt } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import { ClipLoader } from "react-spinners";

function BankDetails() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
  });

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/get-bank-details`, {
        withCredentials: true,
      });
      if (result.data.bankDetails) {
        setBankDetails(result.data.bankDetails);
      }
      setTotalEarnings(result.data.totalEarnings || 0);
      setFetchingData(false);
    } catch (error) {
      console.error(error);
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    setBankDetails({
      ...bankDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/user/update-bank-details`,
        bankDetails,
        { withCredentials: true }
      );
      alert("Bank details updated successfully!");
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update bank details");
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ClipLoader size={50} color="#ff4d2d" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md border border-gray-100 transition-all"
          >
            <IoIosArrowRoundBack size={24} className="text-gray-600 group-hover:text-[#ff4d2d]" />
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Financial Center
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
           {/* Left Column: Stats & Visa Card Preview */}
           <div className="space-y-6">
              {/* Earnings Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                 <div className="relative z-10">
                    <p className="text-gray-400 font-medium mb-1">Total Lifetime Earnings</p>
                    <h2 className="text-5xl font-bold flex items-center gap-1 mb-6">
                      <span className="text-3xl text-[#ff4d2d]"><FaRupeeSign /></span>
                      {totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/10 w-fit px-3 py-1 rounded-full">
                       <FaShieldAlt className="text-green-400" /> Secure Payments
                    </div>
                 </div>
              </div>

              {/* Visual Credit Card */}
              <div className="w-full aspect-[1.586/1] bg-gradient-to-bl from-[#ff4d2d] to-orange-600 rounded-2xl shadow-xl p-8 flex flex-col justify-between text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="flex justify-between items-start z-10">
                      <FaCreditCard size={32} className="opacity-80" />
                      <span className="font-mono text-lg font-bold tracking-widest opacity-80">DEBIT</span>
                  </div>
                  
                  <div className="z-10">
                      <div className="text-2xl font-mono tracking-widest mb-2">
                        {bankDetails.accountNumber ? 
                          '**** **** **** ' + bankDetails.accountNumber.slice(-4) : 
                          '**** **** **** ****'}
                      </div>
                      <div className="flex justify-between items-end">
                          <div>
                             <p className="text-xs opacity-70 uppercase tracking-wider mb-1">Account Holder</p>
                             <p className="font-medium tracking-wide uppercase">
                                {bankDetails.accountHolderName || "YOUR NAME"}
                             </p>
                          </div>
                      </div>
                  </div>
              </div>
           </div>

           {/* Right Column: Update Form */}
           <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
                 <div className="p-3 bg-orange-50 rounded-xl text-[#ff4d2d]">
                    <FaUniversity size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-gray-900">Bank Information</h2>
                    <p className="text-sm text-gray-500">Update your payout details securely</p>
                 </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        name="accountHolderName"
                        value={bankDetails.accountHolderName}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none font-medium"
                        placeholder="e.g. Adarsh Priydarshi"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Account Number
                      </label>
                      <div className="relative">
                         <span className="absolute left-4 top-3.5 text-gray-400"><FaCreditCard /></span>
                         <input
                           type="text"
                           name="accountNumber"
                           value={bankDetails.accountNumber}
                           onChange={handleChange}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none font-mono"
                           placeholder="0000 0000 0000 0000"
                           required
                         />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">
                           IFSC Code
                         </label>
                         <input
                           type="text"
                           name="ifscCode"
                           value={bankDetails.ifscCode}
                           onChange={handleChange}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none font-mono uppercase"
                           placeholder="SBIN0001234"
                           required
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">
                           Bank Name
                         </label>
                         <div className="relative">
                           <span className="absolute left-4 top-3.5 text-gray-400"><FaUniversity /></span>
                           <input
                             type="text"
                             name="bankName"
                             value={bankDetails.bankName}
                             onChange={handleChange}
                             className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none"
                             placeholder="SBI, HDFC..."
                             required
                           />
                         </div>
                       </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        UPI ID <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                         <span className="absolute left-4 top-3.5 text-gray-400"><FaMobileAlt /></span>
                         <input
                           type="text"
                           name="upiId"
                           value={bankDetails.upiId}
                           onChange={handleChange}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none"
                           placeholder="username@bank"
                         />
                      </div>
                    </div>
                 </div>

                 <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#ff4d2d] hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <ClipLoader size={20} color="white" />
                          Processing Securely...
                        </>
                      ) : (
                        "Save Bank Details"
                      )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                       <FaShieldAlt /> data is encrypted and stored securely
                    </p>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
}

export default BankDetails;
