
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import homeImage from "../assets/home.png"; // Using home.png as background

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-[60vh] lg:h-[70vh] w-full bg-black">
        <img
          src={homeImage}
          alt="Delicious Food"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        
        {/* Navbar Overlay */}
        <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-10 text-white">
          <div className="hidden md:flex gap-6 text-lg font-medium">
            <button className="hover:text-gray-200 transition">Add Restaurant</button>
            <button className="hover:text-gray-200 transition">View Cities</button>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate("/signin")}
              className="text-lg font-medium hover:text-gray-200 transition"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate("/signup")}
              className="text-lg font-medium hover:text-gray-200 transition"
            >
              Sign up
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg italic font-serif">
            Vingo
          </h1>
          <p className="text-xl md:text-3xl text-white mb-10 font-light tracking-wide drop-shadow-md">
            Discover the best food & drinks in your city
          </p>
          
          {/* Search Bar Visual Only */}
          <div className="w-full max-w-2xl bg-white rounded-xl flex items-center p-3 shadow-2xl transform transition hover:scale-[1.01] duration-300">
             <div className="flex items-center text-gray-500 px-3 gap-2 border-r border-gray-300 w-1/3">
                <div className="text-[#E23744]">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                </div>
                <span className="truncate">Select City</span>
             </div>
             <div className="flex items-center flex-1 px-4 gap-3">
                <FaSearch className="text-gray-400 text-lg" />
                <input 
                  type="text" 
                  placeholder="Search for restaurant, cuisine or a dish" 
                  className="w-full outline-none text-gray-700 placeholder-gray-400 text-lg"
                  readOnly 
                  onClick={() => navigate("/signin")} // Redirect to login on interaction
                />
             </div>
          </div>
        </div>
      </div>

      {/* Features / Content Preview Section */}
      <div className="flex-1 bg-white py-16 px-6 md:px-20">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">
               Why choose Vingo?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {/* Feature 1 */}
               <div className="group p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition duration-300 cursor-pointer" onClick={() => navigate("/signup")}>
                  <div className="h-48 rounded-xl overflow-hidden mb-6 relative">
                     <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Order Online" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E23744] transition">Order Online</h3>
                  <p className="text-gray-600">Stay home and order to your doorstep. Browse menus and track your delivery.</p>
               </div>

               {/* Feature 2 */}
               <div className="group p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition duration-300 cursor-pointer" onClick={() => navigate("/signup")}>
                  <div className="h-48 rounded-xl overflow-hidden mb-6 relative">
                     <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Dining" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E23744] transition">Dining</h3>
                  <p className="text-gray-600">View the city's favorite dining venues with reviews and photos.</p>
               </div>

               {/* Feature 3 */}
               <div className="group p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition duration-300 cursor-pointer" onClick={() => navigate("/signup")}>
                   <div className="h-48 rounded-xl overflow-hidden mb-6 relative">
                     <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Nightlife" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E23744] transition">Nightlife and Clubs</h3>
                  <p className="text-gray-600">Explore the city’s top nightlife outlets and trending parties.</p>
               </div>
            </div>
         </div>
      </div>

       {/* Footer Lite */}
       <div className="bg-gray-50 py-8 text-center border-t border-gray-200">
          <p className="text-gray-500">© 2024 Vingo Technologies Pvt. Ltd.</p>
       </div>
    </div>
  );
};

export default LandingPage;
