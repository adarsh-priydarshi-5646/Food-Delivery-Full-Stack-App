
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
// import homeImage from "../assets/home.png"; // Using home.png as background

import { useDispatch, useSelector } from "react-redux";
import { setCurrentCity } from "../redux/userSlice";

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);
  const [showCityDropdown, setShowCityDropdown] = React.useState(false);
  
  const cities = ['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai'];

  const handleCitySelect = (city) => {
    dispatch(setCurrentCity(city));
    setShowCityDropdown(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      {/* Hero Section */}
      <div className="relative h-[60vh] lg:h-[70vh] w-full bg-black">
        <img
          src="https://t4.ftcdn.net/jpg/02/92/20/37/360_F_292203735_CSsyqyS6A4Z9Czd4Msf7qZEhoxjpzZl1.jpg"
          alt="Delicious Food"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        
        {/* Navbar Overlay */}
        <nav className="absolute top-0 w-full p-4 lg:p-6 flex justify-between items-center z-50 text-white max-w-7xl mx-auto left-0 right-0">
           <div className="hidden md:flex gap-6 text-lg font-light">
             <button className="hover:text-gray-200 transition cursor-pointer">Add Restaurant</button>
             <button className="hover:text-gray-200 transition cursor-pointer">View Cities</button>
           </div>
           <div className="flex gap-4 md:gap-6 text-lg font-light items-center">
             <button 
                onClick={() => navigate("/signin")} 
                className="text-white hover:text-gray-200 transition cursor-pointer text-lg"
             >
               Log in
             </button>
             <button 
                onClick={() => navigate("/signup")} 
                className="bg-[#E23744] hover:bg-[#c02a35] text-white px-5 py-2 rounded-full transition cursor-pointer text-lg font-medium shadow-md hover:shadow-lg active:scale-95"
             >
               Sign up
             </button>
           </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tighter italic font-serif">
            Vingo
          </h1>
          <p className="text-xl md:text-3xl text-white mb-10 font-normal tracking-wide">
            Discover the best food & drinks in your city
          </p>
          
          {/* Search Bar */}
          <div className="w-full max-w-3xl bg-white rounded-lg flex items-center p-3 shadow-lg">
             <div className="relative md:flex items-center text-gray-500 px-3 gap-2 border-r border-gray-300 w-1/3 cursor-pointer hover:bg-gray-50 transition p-2 rounded-l-lg hidden" onClick={() => setShowCityDropdown(!showCityDropdown)}>
                <div className="text-[#ff7e8b]">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                   </svg>
                </div>
                <span className="truncate">{currentCity || "Select City"}</span>
                <svg className={`w-4 h-4 ml-auto transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                
                {showCityDropdown && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-2 py-2 z-50">
                    {cities.map((city) => (
                      <div 
                        key={city} 
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCitySelect(city);
                        }}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
             </div>
             <div className="flex items-center flex-1 px-4 gap-3">
                <FaSearch className="text-gray-400 text-lg" />
                <input 
                  type="text" 
                  placeholder="Search for restaurant, cuisine or a dish" 
                  className="w-full outline-none text-gray-700 placeholder-gray-400 text-lg font-light cursor-pointer"
                  readOnly 
                  onClick={() => navigate("/signin")}
                />
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto w-full px-4 lg:px-8">
        
        {/* Category Cards */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Order Online */}
           <div className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/signup")}>
              <div className="h-40 overflow-hidden">
                 <img src="https://b.zmtcdn.com/webFrontend/e5b8785c257af2a7f354f1addaf37e4e1647364814.jpeg" alt="Order Online" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="p-4">
                 <h3 className="text-xl font-medium text-gray-900">Order Online</h3>
                 <p className="text-gray-600 mt-1 font-light">Stay home and order to your doorstep</p>
              </div>
           </div>

           {/* Dining */}
           <div className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/signup")}>
              <div className="h-40 overflow-hidden">
                 <img src="https://b.zmtcdn.com/webFrontend/d026b357feb0d63c997549f6398da8cc1647364915.jpeg" alt="Dining" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="p-4">
                 <h3 className="text-xl font-medium text-gray-900">Dining</h3>
                 <p className="text-gray-600 mt-1 font-light">View the city's favourite dining venues</p>
              </div>
           </div>

           {/* Nightlife */}
           <div className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/signup")}>
              <div className="h-40 overflow-hidden">
                <img src="https://b.zmtcdn.com/webFrontend/d9d80ef91cb552e3fdfadb3d4f4379761647365057.jpeg" alt="Nightlife" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="p-4">
                 <h3 className="text-xl font-medium text-gray-900">Nightlife and Clubs</h3>
                 <p className="text-gray-600 mt-1 font-light">Explore the city’s top nightlife outlets</p>
              </div>
           </div>
        </div>

        {/* Popular Localities */}
        <div className="py-12">
           <h2 className="text-3xl md:text-4xl text-gray-800 mb-8 font-normal">
              Popular localities in and around <span className="font-semibold">Delhi NCR</span>
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Connaught Place', 'Sector 29, Gurgaon', 'Rajouri Garden', 'Saket', 'Cyber Hub', 'Indirapuram'].map((loc, i) => (
                 <div key={i} className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer flex justify-between items-center group bg-white">
                    <div>
                      <h4 className="text-xl text-gray-800 group-hover:text-[#E23744]">{loc}</h4>
                      <p className="text-gray-500 font-light mt-1">200+ places</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Get the App Section */}
      <div className="bg-[#fffbf7] py-20 px-4">
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="w-full md:w-1/2 flex justify-center">
               <img src="https://b.zmtcdn.com/data/o2_assets/f773629053b24263e69f601925790f301680693809.png" alt="App Preview" className="w-[300px]" />
            </div>
            <div className="w-full md:w-1/2">
               <h2 className="text-4xl md:text-5xl font-medium text-gray-900 mb-4">Get the Vingo App</h2>
               <p className="text-gray-600 text-lg mb-8 font-light leading-relaxed">
                  We will send you a link, open it on your phone to download the app. 
                  Experience the fastest delivery in your city.
               </p>
               
               <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-2 cursor-pointer">
                     <input type="radio" name="contact" id="email" defaultChecked className="accent-[#E23744] cursor-pointer" />
                     <label htmlFor="email" className="text-gray-700 cursor-pointer">Email</label>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer">
                     <input type="radio" name="contact" id="phone" className="accent-[#E23744] cursor-pointer" />
                     <label htmlFor="phone" className="text-gray-700 cursor-pointer">Phone</label>
                  </div>
               </div>

               <div className="flex gap-3 mb-8">
                  <input type="text" placeholder="Email" className="p-3 border border-gray-300 rounded-lg w-2/3 focus:outline-none focus:border-[#E23744]" />
                  <button className="bg-[#E23744] hover:bg-[#c02a35] text-white px-6 py-3 rounded-lg w-1/3 transition cursor-pointer">Share App Link</button>
               </div>
               
               <p className="text-gray-400 mb-4 text-sm">Download app from</p>
               <div className="flex gap-4">
                  <img src="https://b.zmtcdn.com/data/webuikit/23e930757c3df49840c482a8638bf5c31556001144.png" alt="Google Play" className="h-10 cursor-pointer" />
                  <img src="https://b.zmtcdn.com/data/webuikit/9f0c85a5e33adb783fa0aef667075f9e1556003622.png" alt="App Store" className="h-10 cursor-pointer" />
               </div>
            </div>
         </div>
      </div>

       {/* Footer */}
       <footer className="bg-gray-100 pt-16 pb-8 border-t border-gray-200">
         <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
               <h2 className="text-3xl font-black italic tracking-tighter text-gray-900">Vingo</h2>
               <div className="flex gap-4">
                 <button className="border border-gray-300 px-4 py-2 rounded-lg text-gray-800 flex items-center gap-2 bg-white"><span className="text-xl">🇮🇳</span> India</button>
                 <button className="border border-gray-300 px-4 py-2 rounded-lg text-gray-800 flex items-center gap-2 bg-white">🌐 English</button>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-gray-500 text-sm">
               <div>
                  <h4 className="text-gray-900 font-medium mb-4 uppercase tracking-wider">About Vingo</h4>
                  <ul className="space-y-2">
                     <li className="hover:text-gray-800 cursor-pointer">Who We Are</li>
                     <li className="hover:text-gray-800 cursor-pointer">Blog</li>
                     <li className="hover:text-gray-800 cursor-pointer">Work With Us</li>
                     <li className="hover:text-gray-800 cursor-pointer">Investor Relations</li>
                     <li className="hover:text-gray-800 cursor-pointer">Report Fraud</li>
                  </ul>
               </div>
               <div>
                  <h4 className="text-gray-900 font-medium mb-4 uppercase tracking-wider">Zomaverse</h4>
                  <ul className="space-y-2">
                     <li className="hover:text-gray-800 cursor-pointer">Vingo</li>
                     <li className="hover:text-gray-800 cursor-pointer">Carona</li>
                     <li className="hover:text-gray-800 cursor-pointer">Feeding India</li>
                     <li className="hover:text-gray-800 cursor-pointer">Hyperpure</li>
                  </ul>
               </div>
               <div>
                  <h4 className="text-gray-900 font-medium mb-4 uppercase tracking-wider">For Restaurants</h4>
                  <ul className="space-y-2">
                     <li className="hover:text-gray-800 cursor-pointer">Partner With Us</li>
                     <li className="hover:text-gray-800 cursor-pointer">Apps For You</li>
                  </ul>
               </div>
               <div>
                  <h4 className="text-gray-900 font-medium mb-4 uppercase tracking-wider">Learn More</h4>
                  <ul className="space-y-2">
                     <li className="hover:text-gray-800 cursor-pointer">Privacy</li>
                     <li className="hover:text-gray-800 cursor-pointer">Security</li>
                     <li className="hover:text-gray-800 cursor-pointer">Terms</li>
                     <li className="hover:text-gray-800 cursor-pointer">Sitemap</li>
                  </ul>
               </div>
            </div>

            <div className="border-t border-gray-300 pt-8 text-center text-sm text-gray-500">
               <p>By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners. 2008-2024 © Vingo™ Ltd. All rights reserved.</p>
            </div>
         </div>
       </footer>
    </div>
  );
};

export default LandingPage;
