import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { serverUrl } from "../App";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { FaPlus } from "react-icons/fa6";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import useGetCity from "../hooks/useGetCity";

function Nav() {
  const { userData, currentCity, cartItems } = useSelector((state) => state.user);
  useGetCity(true); // Auto-fetch location on mount
  const { myShopData } = useSelector((state) => state.owner);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchItems = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,
        { withCredentials: true }
      );
      dispatch(setSearchItems(result.data));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearchItems();
    } else {
      dispatch(setSearchItems(null));
    }
  }, [query]);

  return (
    <nav className="w-full h-20 flex items-center justify-between md:justify-center gap-8 px-6 fixed top-0 z-50 bg-[#F8F8F8] shadow-sm">
      {}
      {showSearch && userData.role == "user" && (
        <div className="w-[90%] h-16 bg-[#F8F8F8] shadow-xl rounded-xl items-center gap-4 flex fixed top-20 left-[5%] md:hidden px-4 border border-gray-200">
          <div className="flex items-center w-[30%] gap-2 border-r-2 border-gray-200 pr-3">
            <FaLocationDot size={20} className="text-[#E23744]" />
            <div className="w-full truncate text-gray-700 text-sm font-medium">
              {currentCity || <span className="text-gray-400 italic">Detecting...</span>}
            </div>
          </div>
          <div className="w-[70%] flex items-center gap-2">
            <IoIosSearch size={22} className="text-[#E23744]" />
            <input
              type="text"
              placeholder="Search delicious food..."
              className="outline-none w-full text-gray-700 placeholder-gray-400"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
              aria-label="Search delicious food"
            />
          </div>
        </div>
      )}

      {}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <img
          src="/branding-logo.png"
          alt="Vingo Logo"
          className="w-16 h-16 md:w-18 md:h-18 object-contain rounded-full"
        />
        <h1 className="text-3xl font-bold text-[#E23744]">
          Vingo
        </h1>
      </div>

      {}
      {userData.role == "user" && (
        <div className="md:w-[60%] lg:w-[40%] h-14 bg-white shadow-md rounded-xl items-center gap-4 hidden md:flex px-4 border border-gray-200">
          <div className="flex items-center w-[30%] gap-2 border-r-2 border-gray-200 pr-3">
            <FaLocationDot size={20} className="text-[#E23744]" />
            <div className="w-full truncate text-gray-700 font-medium">
              {currentCity || <span className="text-gray-400 italic text-sm">Detecting location...</span>}
            </div>
          </div>
          <div className="w-[70%] flex items-center gap-2">
            <IoIosSearch size={22} className="text-[#E23744]" />
            <input
              type="text"
              placeholder="Search delicious food..."
              className="outline-none w-full text-gray-700 placeholder-gray-400"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
              aria-label="Search delicious food"
            />
          </div>
        </div>
      )}

      {}
      <div className="flex items-center gap-4">
        {}
        {userData.role == "user" &&
          (showSearch ? (
            <RxCross2
              size={24}
              className="text-[#E23744] md:hidden cursor-pointer"
              onClick={() => setShowSearch(false)}
            />
          ) : (
            <IoIosSearch
              size={24}
              className="text-[#E23744] md:hidden cursor-pointer"
              onClick={() => setShowSearch(true)}
            />
          ))}

        {}
        {userData.role == "owner" ? (
          <>
            {myShopData && (
              <>
                <button
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E23744] text-white font-semibold hover:bg-[#c02a35] transition-colors"
                  onClick={() => navigate("/add-item")}
                >
                  <FaPlus size={16} />
                  <span>Add Item</span>
                </button>
                <button
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#E23744] text-white hover:bg-[#c02a35] transition-colors"
                  onClick={() => navigate("/add-item")}
                >
                  <FaPlus size={18} />
                </button>
              </>
            )}

            <button
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#E23744] text-[#E23744] font-semibold hover:bg-red-50 transition-colors"
              onClick={() => navigate("/my-orders")}
            >
              <TbReceipt2 size={18} />
              <span>Orders</span>
            </button>
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border-2 border-[#E23744] text-[#E23744] hover:bg-red-50 transition-colors"
              onClick={() => navigate("/my-orders")}
            >
              <TbReceipt2 size={18} />
            </button>
          </>
        ) : (
          <>
            {}
            {userData.role == "user" && (
              <div className="relative cursor-pointer" onClick={() => navigate("/cart")}>
                <FiShoppingCart size={24} className="text-[#E23744]" />
                {cartItems.length > 0 && (
                  <span className="absolute -right-2 -top-2 w-5 h-5 bg-[#E23744] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </div>
            )}

            <button
              className="hidden md:block px-4 py-2 rounded-lg border-2 border-[#E23744] text-[#E23744] font-semibold hover:bg-red-50 transition-colors"
              onClick={() => navigate("/my-orders")}
            >
              My Orders
            </button>
          </>
        )}

        {}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#E23744] text-white text-lg font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow"
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {userData?.fullName?.slice(0, 1).toUpperCase() || "?"}
        </div>

        {}
        {showInfo && (
          <div
            className={`fixed top-20 right-4 ${
              userData.role == "deliveryBoy"
                ? "md:right-[20%] lg:right-[40%]"
                : "md:right-[10%] lg:right-[25%]"
            } w-48 bg-white shadow-2xl rounded-xl p-5 flex flex-col gap-3 z-50 border border-gray-100`}
          >
            <div className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-200">
              {userData.fullName}
            </div>
            <div
              className="text-gray-700 font-semibold cursor-pointer hover:bg-gray-100 py-2 px-3 rounded-lg transition-colors"
              onClick={() => navigate("/profile")}
            >
              My Profile
            </div>
            {userData.role == "user" && (
              <div
                className="md:hidden text-[#E23744] font-semibold cursor-pointer hover:bg-red-50 py-2 px-3 rounded-lg transition-colors"
                onClick={() => navigate("/my-orders")}
              >
                My Orders
              </div>
            )}
            <div
              className="text-[#E23744] font-semibold cursor-pointer hover:bg-red-50 py-2 px-3 rounded-lg transition-colors"
              onClick={handleLogOut}
            >
              Log Out
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Nav;
