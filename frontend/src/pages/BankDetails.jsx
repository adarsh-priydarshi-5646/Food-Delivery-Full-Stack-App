import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { FaRupeeSign, FaUniversity, FaCreditCard, FaMobileAlt } from "react-icons/fa";
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
      <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center">
        <ClipLoader size={50} color="#ff4d2d" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff9f6] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-[#ff4d2d] hover:bg-orange-100 p-2 rounded-full transition-all"
          >
            <IoIosArrowRoundBack size={35} />
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaUniversity className="text-[#ff4d2d]" />
            Bank Account Details
          </h1>
        </div>

        {/* Earnings Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Total Earnings</p>
              <h2 className="text-4xl font-bold flex items-center gap-2">
                <FaRupeeSign className="text-3xl" />
                {totalEarnings.toFixed(2)}
              </h2>
              <p className="text-white/80 text-sm mt-2">
                From all completed orders
              </p>
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <FaRupeeSign className="text-4xl" />
            </div>
          </div>
        </div>

        {/* Bank Details Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaUniversity className="text-[#ff4d2d]" />
            Account Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={bankDetails.accountHolderName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
                placeholder="Enter account holder name"
                required
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaCreditCard className="text-[#ff4d2d]" />
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
                placeholder="Enter account number"
                required
              />
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                name="ifscCode"
                value={bankDetails.ifscCode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] uppercase"
                placeholder="Enter IFSC code"
                required
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaUniversity className="text-[#ff4d2d]" />
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={bankDetails.bankName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
                placeholder="Enter bank name"
                required
              />
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaMobileAlt className="text-[#ff4d2d]" />
                UPI ID (Optional)
              </label>
              <input
                type="text"
                name="upiId"
                value={bankDetails.upiId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
                placeholder="yourname@upi"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff4d2d] text-white py-3 rounded-lg font-semibold hover:bg-[#e64526] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <ClipLoader size={20} color="white" />
                  Updating...
                </>
              ) : (
                "Save Bank Details"
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your bank details are securely stored and will be used for
              transferring your earnings. Make sure all information is accurate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BankDetails;
