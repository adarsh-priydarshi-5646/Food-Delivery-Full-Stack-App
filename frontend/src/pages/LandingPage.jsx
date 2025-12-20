import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaCaretDown, FaChevronRight, FaChevronDown, FaMobileAlt, FaEnvelope } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentCity } from "../redux/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import useGetCity from "../hooks/useGetCity";

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);
  const { getCity } = useGetCity();
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [locating, setLocating] = useState(false);
  const [activeExplore, setActiveExplore] = useState(null);
  const [contactType, setContactType] = useState("email");

  const cities = ['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

  const handleCitySelect = (city) => {
    dispatch(setCurrentCity(city));
    setShowCityDropdown(false);
  };

  const handleDetectLocation = async () => {
    setLocating(true);
    try {
      await getCity();
      setShowCityDropdown(false);
    } catch (error) {
      console.error("Error detecting location:", error);
      alert("Could not detect location. Please select manually.");
    } finally {
      setLocating(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col font-sans text-[#1c1c1c] bg-white selection:bg-red-50">
      
      {/* Top Navbar (Absolute over Hero) */}
      <nav className="absolute top-0 w-full z-50 flex justify-between items-center px-4 md:px-12 py-5 text-white max-w-[1100px] mx-auto left-0 right-0 font-[400]">
        <div className="flex items-center gap-6">
          <button className="hover:opacity-80 text-sm hidden md:block">Get the App</button>
        </div>
        <div className="flex items-center gap-6 md:gap-10 text-[17px]">
          <button className="hover:opacity-80 text-sm hidden lg:block">Investor Relations</button>
          <button className="hover:opacity-80 text-sm hidden lg:block">Add restaurant</button>
          <button onClick={() => navigate("/signin")} className="px-4 py-2 border border-white rounded-md hover:bg-white hover:text-[#1c1c1c] transition-all font-medium">Log in</button>
          <button onClick={() => navigate("/signup")} className="px-4 py-2 bg-white text-[#1c1c1c] rounded-md hover:bg-opacity-90 transition-all font-semibold">Sign up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[420px] md:h-[500px] w-full flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://b.zmtcdn.com/web_assets/81f3ff974d82520780078ba1cfbd453a1583259680.png"
            alt="Hero Background"
            className="w-full h-full object-cover"
            width="1920"
            height="500"
          />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-[800px]">
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[60px] md:text-[80px] font-[900] text-white italic tracking-tight leading-none mb-4"
          >
            Vingo
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[24px] md:text-[36px] text-white font-[400] mb-8 leading-tight"
          >
            Find the best restaurants, cafés and bars in <span className="font-bold">{currentCity || "India"}</span>
          </motion.p>
          
          {/* Dual Input Search Bar */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-white rounded-[8px] flex flex-col md:flex-row items-center p-1 md:h-[54px] shadow-sm overflow-visible"
          >
            <div 
              className="relative flex items-center flex-[0.4] px-3 gap-2 h-full md:border-r border-[#cfcfcf] cursor-pointer w-full"
              onClick={() => setShowCityDropdown(!showCityDropdown)}
            >
              <FaMapMarkerAlt className="text-[#d9263a] text-[18px]" />
              <input 
                type="text" 
                readOnly 
                value={currentCity || "Select City"} 
                className="w-full outline-none text-[#5a5a5a] text-[15px] bg-transparent cursor-pointer"
                aria-label="Select City"
              />
              <FaCaretDown className={`text-[#4f4f4f] transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
              
              <AnimatePresence>
                {showCityDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[calc(100%+10px)] left-0 w-full bg-white border border-[#e8e8e8] rounded-[6px] shadow-lg py-1 z-[100] text-left"
                  >
                    <div 
                      className="px-4 py-3 hover:bg-[#f8f8f8] cursor-pointer text-[#d9263a] text-[14px] font-medium border-b border-[#f3f3f3] flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDetectLocation();
                      }}
                    >
                      <FaMapMarkerAlt className="text-[12px]" />
                      {locating ? "Detecting..." : "Detect current location"}
                    </div>
                    {cities.map((city) => (
                      <div 
                        key={city} 
                        className="px-4 py-3 hover:bg-[#f8f8f8] cursor-pointer text-[#4f4f4f] text-[14px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCitySelect(city);
                        }}
                      >
                        {city}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center flex-[0.6] px-4 gap-3 h-full w-full py-3 md:py-0">
              <FaSearch className="text-[#5a5a5a] text-[18px]" />
              <input 
                type="text" 
                placeholder="Search for restaurant, cuisine or a dish" 
                className="w-full outline-none text-[#1c1c1c] text-[15px] placeholder-[#5a5a5a]"
                onClick={() => navigate("/signin")}
                aria-label="Search for restaurant, cuisine or a dish"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-[1100px] mx-auto w-full px-4 py-12">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { title: "Order Online", desc: "Stay home and order to your doorstep", img: "https://b.zmtcdn.com/webFrontend/e5b8785c257af2a7f354f1addaf37e4e1647364814.jpeg" },
            { title: "Dining", desc: "View the city's favourite dining venues", img: "https://b.zmtcdn.com/webFrontend/d026b357feb0d63c997549f6398da8cc1647364915.jpeg" },
            { title: "Nightlife and Clubs", desc: "Explore the city’s top nightlife outlets", img: "https://b.zmtcdn.com/webFrontend/d9d80ef91cb552e3fdfadb3d4f4379761647365057.jpeg" }
          ].map((card, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              whileHover={{ scale: 1.03 }}
              className="group rounded-[12px] border border-[#e8e8e8] overflow-hidden cursor-pointer bg-white transition-all shadow-hover"
              onClick={() => navigate("/signup")}
            >
              <div className="h-[160px] overflow-hidden">
                <img src={card.img} alt={card.title} className="w-full h-full object-cover" width="350" height="160" />
              </div>
              <div className="p-4">
                <h2 className="text-[20px] font-[500] text-[#1c1c1c] mb-1">{card.title}</h2>
                <p className="text-[#4f4f4f] text-[14px] font-[300]">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Collections */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[36px] font-[500] text-[#1c1c1c]">Collections</h2>
              <p className="text-[#4f4f4f] text-[18px] font-[300]">
                Explore curated lists of top restaurants, cafes, pubs, and bars in {currentCity || "Delhi NCR"}, based on trends
              </p>
            </div>
            <button className="text-[#d9263a] text-[16px] flex items-center gap-1 hover:opacity-80">
              All collections in {currentCity || "Delhi NCR"} <FaCaretDown className="-rotate-90" />
            </button>
          </div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { title: "Top Trending Spots", places: "32 Places", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=500" },
              { title: "Best Insta-worthy Cafes", places: "18 Places", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=500" },
              { title: "Winners of 2024", places: "25 Places", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=500" },
              { title: "The Legends of City", places: "21 Places", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=500" }
            ].map((col, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                className="relative h-[320px] rounded-[6px] overflow-hidden cursor-pointer group"
              >
                <img src={col.img} alt={col.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" width="260" height="320" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-[18px] font-[500]">{col.title}</h3>
                  <p className="text-[14px] flex items-center gap-1 font-[300]">{col.places} <FaCaretDown className="-rotate-90" /></p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 3D Floating Food Animation Section */}
      <div className="relative py-28 overflow-hidden bg-white">
        <div className="max-w-[1100px] mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-[40px] md:text-[50px] font-[600] text-[#1c1c1c] tracking-tight">
              A Symphony of Flavors
            </h2>
            <p className="text-[#4f4f4f] text-[18px] font-[300] mt-4 max-w-[600px] mx-auto">
              Savor the art of culinary excellence with our curated selections, delivered right to your doorstep.
            </p>
          </motion.div>
          
          <div className="relative h-[500px] flex items-center justify-center">
            {/* Main Center Image - 3D Perspective */}
            <motion.div
              style={{ perspective: 1000 }}
              animate={{ 
                y: [0, -20, 0],
                rotateX: [5, -5, 5],
                rotateY: [5, -5, 5],
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-20"
            >
              <img 
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400" 
                alt="Delicious Pizza" 
                className="w-[320px] h-[320px] object-cover rounded-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[10px] border-white"
                width="320"
                height="320"
              />
            </motion.div>

            {/* Floating Orbiting Elements */}
            {[
              { img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=150", left: "10%", top: "20%", rotate: -15, scale: 1.1 },
              { img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=150", right: "10%", top: "15%", rotate: 12, scale: 0.9 },
              { img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=150", left: "15%", bottom: "20%", rotate: 8, scale: 1.2 },
              { img: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=150", right: "15%", bottom: "15%", rotate: -10, scale: 1.0 }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: item.scale }}
                animate={{ 
                  y: [0, -40, 0],
                  rotate: [item.rotate, item.rotate + 10, item.rotate],
                  rotateX: [0, 15, 0],
                  rotateY: [0, 15, 0]
                }}
                transition={{ 
                  y: { duration: 5 + idx, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 7 + idx, repeat: Infinity, ease: "easeInOut" },
                  rotateX: { duration: 4 + idx, repeat: Infinity, ease: "easeInOut" },
                  rotateY: { duration: 6 + idx, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 1 }
                }}
                className="absolute hidden md:block"
                style={{ 
                  left: item.left, 
                  right: item.right, 
                  top: item.top, 
                  bottom: item.bottom,
                  perspective: 800
                }}
              >
                <img 
                  src={item.img} 
                  alt="Floating Food" 
                  className="w-[140px] h-[140px] object-cover rounded-3xl shadow-2xl border-4 border-white transform-gpu hover:scale-110 transition-transform duration-300"
                  width="140"
                  height="140"
                />
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ef4f5f] rounded-full blur-[120px] opacity-[0.03]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff7e8b] rounded-full blur-[150px] opacity-[0.05]" />
        </div>
      </div>

      {/* App Download Section */}
      <div className="bg-[#fffbf7] py-20 px-4 mt-20 border-t border-b border-[#e8e8e8]">
        <div className="max-w-[850px] mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="hidden md:block w-[280px]">
            <img src="https://b.zmtcdn.com/data/o2_assets/f773629053b24263e69f601925790f301680693809.png" alt="App Mockup" className="w-full" width="280" height="500" />
          </div>
          <div className="flex-1">
            <h2 className="text-[44px] font-[500] text-[#1c1c1c] mb-4">Get the Vingo app</h2>
            <p className="text-[#4f4f4f] text-[16px] font-[300] mb-8">We will send you a link, open it on your phone to download the app</p>
            
            <div className="flex gap-10 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="contact" 
                  checked={contactType === "email"} 
                  onChange={() => setContactType("email")}
                  className="w-5 h-5 accent-[#d9263a]" 
                />
                <span className="text-[16px] text-[#1c1c1c]">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="contact" 
                  checked={contactType === "phone"} 
                  onChange={() => setContactType("phone")}
                  className="w-5 h-5 accent-[#d9263a]" 
                />
                <span className="text-[16px] text-[#1c1c1c]">Phone</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <input 
                type="text" 
                placeholder={contactType === "email" ? "Email" : "Phone"} 
                className="flex-1 p-3 border border-[#cfcfcf] rounded-[6px] outline-none text-[16px] focus:border-[#d9263a] transition-all" 
              />
              <button className="bg-[#d9263a] text-white px-6 py-3 rounded-[6px] text-[16px] font-[400] hover:bg-[#c02a35] transition-all whitespace-nowrap">
                Share App Link
              </button>
            </div>
            
            <p className="text-[#5a5a5a] text-[14px] mb-4">Download app from</p>
            <div className="flex gap-4">
              <img src="https://b.zmtcdn.com/data/webuikit/23e930757c3df49840c482a8638bf5c31556001144.png" alt="App Store" className="h-10 cursor-pointer" width="137" height="40" />
              <img src="https://b.zmtcdn.com/data/webuikit/9f0c85a5e33adb783fa0aef667075f9e1556003622.png" alt="Google Play" className="h-10 cursor-pointer" width="137" height="40" />
            </div>
          </div>
        </div>
      </div>

      {/* Explore Options Accordions */}
      <div className="max-w-[1100px] mx-auto w-full px-4 py-20 bg-white">
        <h2 className="text-[30px] font-[500] text-[#1c1c1c] mb-8">Explore options near me</h2>
        <div className="flex flex-col gap-4">
          {[
            { id: 1, title: "Popular cuisines near me", content: "Bakery, Beverages, Biryani, Burger, Chinese, Desserts, Ice Cream, Italian, Mithai, Momos, Mugali, North Indian, Pizza, Rolls, Sandwich, Shake, South Indian, Street Food." },
            { id: 2, title: "Popular restaurant types near me", content: "Bakeries, Bars, Beverage Shops, Cafes, Casual Dining, Dessert Parlors, Dhabas, Fine Dining, Food Courts, Kiosks, Lounges, Meat Shops, Microbreweries, Quick Bites, Sweet Shops." },
            { id: 3, title: "Top Restaurant Chains", content: "Bikanervala, Burger King, Burger Singh, Dominos, KFC, Krispy Kreme, McDonald's, Pizza Hut, Subway, Starbucks, WOW! Momo." },
            { id: 4, title: "Cities We Deliver To", content: "Delhi NCR, Mumbai, Pune, Bengaluru, Hyderabad, Chennai, Kolkata, Ahmedabad, Chandigarh, Jaipur, Kochi, Coimbatore, Lucknow, Nagpur, Vadodara, Indore, Guwahati." }
          ].map((item) => (
            <div key={item.id} className="border border-[#e8e8e8] rounded-[9px] overflow-hidden">
              <button 
                onClick={() => setActiveExplore(activeExplore === item.id ? null : item.id)}
                className="w-full flex justify-between items-center p-6 text-left text-[20px] text-[#1c1c1c] font-[400] bg-white"
              >
                {item.title}
                {activeExplore === item.id ? <FaChevronDown className="text-[12px]" /> : <FaChevronRight className="text-[12px]" />}
              </button>
              <AnimatePresence>
                {activeExplore === item.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-white px-6 pb-6 text-[#5a5a5a] text-[16px] font-[300] leading-relaxed"
                  >
                    {item.content}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#f8f8f8] pt-12 pb-6 w-full">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <p className="text-[34px] font-[900] italic tracking-tight text-[#000000]">Vingo</p>
            <div className="flex gap-4">
              <button className="border border-[#cfcfcf] px-4 py-2 rounded-[6px] text-[#1c1c1c] flex items-center gap-2 bg-white text-[15px]">🇮🇳 India <FaChevronDown className="text-[10px]" /></button>
              <button className="border border-[#cfcfcf] px-4 py-2 rounded-[6px] text-[#1c1c1c] flex items-center gap-2 bg-white text-[15px]">🌐 English <FaChevronDown className="text-[10px]" /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {[
              { title: "ABOUT VINGO", links: ['Who We Are', 'Blog', 'Work With Us', 'Investor Relations', 'Report Fraud', 'Press Kit', 'Contact Us'] },
              { title: "VINGOVERSE", links: ['Vingo', 'Blinkit', 'Feeding India', 'Hyperpure', 'Vingoland'] },
              { title: "FOR RESTAURANTS", links: ['Partner With Us', 'Apps For You'] },
              { title: "FOR ENTERPRISES", links: ['Vingo For Enterprise'] },
              { title: "LEARN MORE", links: ['Privacy', 'Security', 'Terms', 'Sitemap'] }
            ].map((section, idx) => (
              <div key={idx}>
                <h2 className="text-[14px] font-[500] text-[#000000] mb-4 tracking-widest">{section.title}</h2>
                <ul className="flex flex-col gap-2">
                  {section.links.map(link => (
                    <li key={link} className="text-[#4f4f4f] text-[14px] font-[300] hover:text-[#1c1c1c] cursor-pointer transition-colors">{link}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-[#cfcfcf] pt-6 text-[13px] text-[#4f4f4f] font-[300] leading-tight">
            <p>By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners. 2008-2025 © Vingo™ Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
