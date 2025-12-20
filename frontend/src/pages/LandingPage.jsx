import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaCaretDown, FaChevronRight, FaChevronDown, FaMobileAlt, FaEnvelope, FaUtensils, FaStore, FaLink, FaCity } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentCity } from "../redux/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import useGetCity from "../hooks/useGetCity";

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);
  const { getCity } = useGetCity(true);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [locating, setLocating] = useState(false);
  const [activeExplore, setActiveExplore] = useState(null);
  const [contactType, setContactType] = useState("email");
  const [trendingItems, setTrendingItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [collections, setCollections] = useState([
    { id: 1, title: "Trending this Week", count: "30 Places", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600" },
    { id: 2, title: "Best of Pune", count: "25 Places", img: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600" },
    { id: 3, title: "Newly Opened", count: "15 Places", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600" },
    { id: 4, title: "Pocket Friendly", count: "20 Places", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600" }
  ]);

  useEffect(() => {
    const fetchTrendingItems = async () => {
      try {
        const { data } = await axios.get(`${serverUrl}/api/item/all-items`);
        // Filter for high rated items (simulating trending)
        const items = data.data || data; // Handle likely response structure
        const highRated = Array.isArray(items) ? items.filter(item => (item.rating?.average || item.rating || 0) >= 4.0) : [];
        setTrendingItems(highRated.length > 0 ? highRated : (Array.isArray(items) ? items : []));
      } catch (error) {
        console.error("Error fetching trending items:", error);
      } finally {
        setItemsLoading(false);
      }
    };
    fetchTrendingItems();
  }, []);

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
      <div className="relative h-[500px] md:h-[600px] w-full flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('bg-hero-fallback');
            }}
            className="w-full h-full object-cover"
            poster="https://b.zmtcdn.com/web_assets/81f3ff974d82520780078ba1cfbd453a1583259680.png"
          >
            <source src="https://b.zmtcdn.com/web_assets/b40b97e677bc7b2ca77c58c61db266fe1603954218.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-[900px]">
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-[75px] md:text-[110px] font-[900] text-transparent bg-clip-text bg-gradient-to-r from-white via-red-50 to-white italic tracking-tighter leading-none mb-6 drop-shadow-2xl"
            style={{ 
              textShadow: "0 10px 30px rgba(0,0,0,0.5)",
              WebkitTextStroke: "1px rgba(255,255,255,0.2)"
            }}
          >
            Vingo
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-[22px] md:text-[40px] text-white font-[300] mb-10 leading-tight tracking-wide drop-shadow-md"
          >
            Find the best restaurants, cafés and bars in <span className="font-bold border-b-2 border-red-500 pb-1">{currentCity || "India"}</span>
          </motion.p>
          
          {/* Dual Input Search Bar */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-white rounded-[12px] flex flex-col md:flex-row items-center p-2 md:h-[60px] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-visible relative z-50 transform hover:-translate-y-1"
          >
            <div 
              className="relative flex items-center flex-[0.35] px-4 gap-3 h-full md:border-r-2 border-[#f3f3f3] cursor-pointer w-full hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setShowCityDropdown(!showCityDropdown)}
            >
              <motion.div
                animate={{ scale: locating ? [1, 1.2, 1] : 1 }}
                transition={{ repeat: locating ? Infinity : 0, duration: 1 }}
              >
                <FaMapMarkerAlt className="text-[#ff7e8b] text-[22px]" />
              </motion.div>
              <input 
                type="text" 
                readOnly 
                value={currentCity || "Select City"} 
                className="w-full outline-none text-[#363636] text-[16px] bg-transparent cursor-pointer font-medium"
                aria-label="Select City"
              />
              <FaCaretDown className={`text-[#4f4f4f] transition-transform duration-300 ${showCityDropdown ? 'rotate-180' : ''}`} />
              
              <AnimatePresence>
                {showCityDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute top-[calc(100%+15px)] left-0 w-[240px] bg-white border border-[#e8e8e8] rounded-[10px] shadow-2xl py-2 z-[100] text-left overflow-hidden"
                  >
                    <div 
                      className="px-5 py-3.5 hover:bg-[#fff5f6] cursor-pointer text-[#d9263a] text-[15px] font-medium border-b border-[#f3f3f3] flex items-center gap-3 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDetectLocation();
                      }}
                    >
                      <FaMapMarkerAlt className="text-[14px]" />
                      {locating ? "Detecting..." : "Detect current location"}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {cities.map((city) => (
                        <div 
                          key={city} 
                          className="px-5 py-3 hover:bg-[#f8f8f8] cursor-pointer text-[#363636] text-[15px] font-light transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCitySelect(city);
                          }}
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center flex-[0.65] px-4 gap-4 h-full w-full py-3 md:py-0">
              <FaSearch className="text-[#828282] text-[20px]" />
              <input 
                type="text" 
                placeholder="Search for restaurant, cuisine or a dish" 
                className="w-full outline-none text-[#1c1c1c] text-[16px] placeholder-[#828282] font-light"
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
      </div> {/* Closing Feature Cards Container */}

      {/* Collections Section (Zomato Style) */}
      <div className="max-w-[1100px] mx-auto w-full px-4 py-16">
        <div className="mb-10">
          <h2 className="text-[36px] font-[500] text-[#1c1c1c] mb-2 leading-tight">Collections</h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-[#363636] text-[18px] font-[300]">
              Explore curated lists of top restaurants, cafes, pubs, and bars in {currentCity || "India"}, based on trends
            </p>
            <button className="text-[#d9263a] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all group">
              All collections in {currentCity || "India"} <FaChevronRight className="text-[12px]" />
            </button>
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {collections.map((col, i) => (
            <motion.div 
              key={col.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="group relative h-[320px] rounded-[10px] overflow-hidden cursor-pointer shadow-md"
              onClick={() => navigate("/signup")}
            >
              <img 
                src={col.img} 
                alt={col.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-5">
                <h3 className="text-[20px] font-bold text-white mb-1 leading-tight">{col.title}</h3>
                <p className="text-white/80 text-[14px] flex items-center gap-2">
                  {col.count} <FaChevronRight className="text-[10px]"/>
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Trending Collections (Refined Redesign) */}
      <div className="max-w-[1100px] mx-auto w-full px-4 py-16">
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
          <div className="flex-1">
             <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 text-[#d9263a] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] inline-block mb-3"
              >
                  🔥 Most loved items in {currentCity || "India"}
              </motion.div>
            <h2 className="text-[32px] md:text-[40px] font-[800] text-[#1c1c1c] leading-tight mb-3">Trending This Week</h2>
            <p className="text-[#5a5a5a] text-[16px] md:text-[18px] font-[300] max-w-[600px]">
              Top picks by our foodies this week.
            </p>
          </div>
          <button className="text-[#d9263a] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all group md:mb-1">
            View all <FaChevronRight className="text-[12px]" />
          </button>
        </div>

        {itemsLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                  <div key={i} className="h-[300px] bg-gray-50 rounded-[20px] animate-pulse"></div>
              ))}
           </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {(trendingItems.length > 0 ? trendingItems : []).slice(0, 4).map((item, i) => (
              <motion.div 
                key={item._id || i}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="group relative h-[360px] rounded-[20px] overflow-hidden cursor-pointer shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_60px_rgba(217,38,58,0.12)] transition-all duration-500"
                onClick={() => navigate("/signup")}
              >
                <img 
                  src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent group-hover:via-black/80 transition-all duration-500 z-10" />
                
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                   <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="bg-white/95 backdrop-blur-sm text-[#1c1c1c] px-3 py-1 rounded-full text-[13px] font-[800] shadow-xl border border-white/20"
                   >
                      ₹{item.price}
                   </motion.div>
                </div>

                <div className="absolute top-4 right-4 z-20">
                   <div className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[13px] font-bold border border-white/20 group-hover:bg-[#d9263a] group-hover:border-[#d9263a] transition-all duration-300 shadow-lg">
                      <span className="text-yellow-400">★</span>
                      <span>{item.rating?.average?.toFixed(1) || "4.2"}</span>
                   </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 z-20 transform group-hover:-translate-y-2 transition-transform duration-500">
                  <span className="text-red-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-2 block opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    {item.category || "Best Seller"}
                  </span>
                  <h3 className="text-[24px] font-[800] text-white mb-2 leading-tight group-hover:text-red-50 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{item.name}</h3>
                  <p className="text-white text-[14px] font-[500] line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75 leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    {item.description || "Freshly prepared with premium ingredients and authentic spices."}
                  </p>
                  <button className="w-full py-3.5 bg-[#d9263a] text-white rounded-xl font-[800] text-sm flex items-center justify-center gap-2 transition-all duration-500 active:scale-95 group-hover:bg-[#ff4d61] shadow-lg group-hover:shadow-red-500/40">
                    <span>Order Now</span>
                    <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
            
            {trendingItems.length === 0 && (
                [1, 2, 3, 4].map(i => (
                  <motion.div 
                    key={i} 
                    variants={fadeInUp}
                    whileHover={{ y: -8 }}
                    className="h-[360px] bg-gray-100 rounded-[20px] overflow-hidden cursor-pointer relative group shadow-lg"
                    onClick={() => navigate("/signup")}
                  >
                     <img 
                        src={`https://images.unsplash.com/photo-${[
                          '1546069901-ba9599a7e63c',
                          '1565299624946-b28f40a0ae38',
                          '1565958011703-44f9829ba187',
                          '1512621776951-a57141f2eefd'
                        ][i-1]}?auto=format&fit=crop&q=80&w=600`}
                        alt="Delicious food"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                     />
                     <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent group-hover:via-black/80 transition-all duration-500" />
                     
                     <div className="absolute top-4 left-4 z-20">
                        <div className="bg-white/95 backdrop-blur-sm text-[#1c1c1c] px-3 py-1 rounded-full text-[13px] font-[800] border border-white/20">
                           ₹{(299 + i * 50)}
                        </div>
                     </div>

                     <div className="absolute bottom-0 left-0 w-full p-6 z-20 transform group-hover:-translate-y-2 transition-transform duration-500">
                        <span className="text-red-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-2 block opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                          Pune Special
                        </span>
                        <h3 className="text-[24px] font-[800] text-white mb-2 leading-tight group-hover:text-red-50 transition-colors">
                          {[
                            'Signature Pizza',
                            'Classic Burger',
                            'Gourmet Pasta',
                            'Healthy Buddha Bowl'
                          ][i-1]}
                        </h3>
                        <p className="text-white/70 text-[14px] line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
                          A local favorite in {currentCity || "Pune"}, prepared fresh daily with the finest local ingredients.
                        </p>
                        <button className="w-full py-3.5 bg-[#d9263a] text-white rounded-xl font-[800] text-sm flex items-center justify-center gap-2 transition-all duration-500 active:scale-95 group-hover:bg-[#ff4d61] shadow-lg group-hover:shadow-red-500/40">
                          <span>Order Now</span>
                          <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                        </button>
                     </div>
                  </motion.div>
                ))
            )}
          </motion.div>
        )}
      </div>

      {/* Enhanced 3D Food & Character Section */}
      <div className="relative py-32 overflow-hidden bg-white border-b border-[#f3f3f3]">
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Content Area */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:w-1/2 text-left"
            >
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-[#d9263a] font-bold tracking-[0.2em] text-[14px] uppercase mb-4 block"
              >
                Beyond Just Delivery
              </motion.span>
              <h2 className="text-[48px] md:text-[64px] font-[800] text-[#1c1c1c] leading-[1.1] mb-6">
                A Symphony of <br/> 
                <span className="text-[#d9263a]">Taste & Tech</span>
              </h2>
              <p className="text-[#5a5a5a] text-[20px] font-[300] leading-relaxed mb-8">
                Experience the future of dining. Our intelligent routing and curated restaurant partnerships ensure that every meal is a celebration of flavor, delivered with surgical precision to your doorstep.
              </p>
              
              <div className="flex flex-wrap gap-12 mb-10">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[32px] font-[800] text-[#1c1c1c]">2.5k+</h3>
                  <p className="text-[#828282] text-[14px] uppercase tracking-wider font-semibold">Active Partners</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[32px] font-[800] text-[#1c1c1c]">18 Mins</h3>
                  <p className="text-[#828282] text-[14px] uppercase tracking-wider font-semibold">Fastest Drop</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[32px] font-[800] text-[#1c1c1c]">4.9/5</h3>
                  <p className="text-[#828282] text-[14px] uppercase tracking-wider font-semibold">User Rating</p>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/signup")} 
                className="bg-[#d9263a] text-white px-12 py-5 rounded-full text-[18px] font-bold hover:bg-[#c02a35] transition-all shadow-[0_20px_40px_-10px_rgba(217,38,58,0.3)]"
              >
                Join the Foodie Club
              </motion.button>
            </motion.div>

            {/* Right Animation Area */}
            <div className="lg:w-1/2 relative h-[550px] w-full flex items-center justify-center">
              
              {/* Main Center Dish - 3D Perspective */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  y: [0, -15, 0]
                }}
                transition={{ 
                  rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative z-20"
              >
                <div className="relative group">
                  <div className="absolute inset-[-15px] bg-gradient-to-br from-red-100 to-orange-50 rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
                  <img 
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=450" 
                    alt="Signature Pizza" 
                    className="w-[180px] h-[180px] object-cover rounded-full border-[8px] border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] relative z-10"
                  />
                </div>
              </motion.div>

              {/* Orbit Lines - Visible Paths with Glow */}
              {[120, 190, 260].map((radius, i) => (
                <div 
                  key={`orbit-${i}`}
                  className="absolute rounded-full border border-dashed border-[#d9263a]/30"
                  style={{
                    width: radius * 2,
                    height: radius * 2,
                    zIndex: 10
                  }}
                />
              ))}

              {/* Orbiting & Floating Food Symphony - Massive Collection */}
              {[
                { 
                  orbit: "inner", 
                  radius: 120, 
                  items: [
                    { img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150", speed: 20, scale: 0.7 },
                    { img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150", speed: 20, scale: 0.7 },
                    { img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=150", speed: 20, scale: 0.7 }
                  ]
                },
                { 
                  orbit: "middle", 
                  radius: 190, 
                  items: [
                    { img: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=150", speed: 30, scale: 0.8 },
                    { img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=150", speed: 30, scale: 0.8 },
                    { img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=150", speed: 30, scale: 0.8 },
                    { img: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=150", speed: 30, scale: 0.8 },
                    { img: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=150", speed: 30, scale: 0.8 }
                  ]
                },
                { 
                  orbit: "outer", 
                  radius: 260, 
                  items: [
                    { img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=150", speed: 40, scale: 0.9 },
                    { img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=150", speed: 40, scale: 0.9 },
                    { img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=150", speed: 40, scale: 0.9 },
                    { img: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=150", speed: 40, scale: 0.9 },
                    { img: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=150", speed: 40, scale: 0.9 },
                    { img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=150", speed: 40, scale: 0.9 }
                  ]
                }
              ].flatMap((orbitGroup, groupIdx) => 
                orbitGroup.items.map((item, itemIdx) => {
                  const totalInOrbit = orbitGroup.items.length;
                  const angleStep = (Math.PI * 2) / totalInOrbit;
                  // Stagger start angles slightly for natural look, but keep even spacing
                  const orbitOffset = groupIdx * (Math.PI / 3); 
                  const angle = (itemIdx * angleStep) + orbitOffset;
                  
                  return { ...item, r: orbitGroup.radius, angle, delay: itemIdx * 0.2 };
                })
              ).map((item, idx) => {
                // Determine direction: Outer & Inner clockwise, Middle counter-clockwise for contrast
                const isClockwise = item.r === 190 ? -1 : 1; 

                return (
                  <motion.div
                    key={idx}
                    animate={{ rotate: [0, 360 * isClockwise] }}
                    transition={{ 
                      duration: item.speed, 
                      repeat: Infinity, 
                      ease: "linear",
                      delay: 0 // Remove delay from container rotation to keep them synchronized in the ring
                    }}
                    className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                    style={{ zIndex: 15 }}
                  >
                    <div
                      className="absolute flex items-center justify-center"
                      style={{ 
                        transform: `translate(${Math.cos(item.angle) * item.r}px, ${Math.sin(item.angle) * item.r}px)` 
                      }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, -360 * isClockwise], // Counter-rotate to keep image upright
                          scale: [item.scale, item.scale * 1.1, item.scale],
                          y: [-5, 5, -5] // Subtle bobbing
                        }}
                        transition={{ 
                          rotate: { duration: item.speed, repeat: Infinity, ease: "linear" }, // Match orbit speed
                          scale: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: idx * 0.5 },
                          y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }
                        }}
                      >
                        <img 
                          src={item.img} 
                          alt="Delicious Item" 
                          className="w-[70px] h-[70px] md:w-[90px] md:h-[90px] object-cover rounded-full border-[3px] border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md hover:scale-110 hover:shadow-orange-500/20 transition-all duration-300"
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] bg-red-50 rounded-full blur-[150px] opacity-[0.4]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-orange-50 rounded-full blur-[180px] opacity-[0.5]" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-red-50 rounded-full"
          />
        </div>
      </div>

      {/* Get the Vingo App (Premium Redesign - Compact) */}
      <section className="bg-[#1c1c1c] py-16 px-4 mt-16 relative overflow-hidden">
        <div className="max-w-[1000px] mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="lg:w-1/2 flex justify-center">
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-[500px]"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                <img 
                  src="/assets/app_mockup.png" 
                  alt="Vingo App Interface" 
                  className="w-full h-auto object-cover" 
                />
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-[36px] md:text-[44px] font-[800] text-white leading-tight mb-4">
              Get the <span className="text-[#d9263a]">Vingo</span> Experience
            </h2>
            <p className="text-white/60 text-[16px] md:text-[18px] mb-8 leading-relaxed max-w-[450px] mx-auto lg:mx-0">
               We’ll send you a link to download. Open it on your phone for exclusive rewards.
            </p>
            
            <div className="flex gap-8 mb-8 justify-center lg:justify-start">
              {["email", "phone"].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer group" onClick={() => setContactType(type)}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${contactType === type ? "border-[#d9263a] bg-[#d9263a]" : "border-white/20"}`}>
                      {contactType === type && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className={`text-[15px] font-medium transition-colors ${contactType === type ? "text-white" : "text-white/40"}`}>{type}</span>
                </label>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-10 max-w-[500px] mx-auto lg:mx-0">
              <input 
                type="text" 
                placeholder={contactType === "email" ? "Enter email" : "Enter phone"} 
                className="flex-1 py-4 px-6 bg-white/5 border border-white/10 rounded-xl outline-none text-white text-[15px] focus:border-[#d9263a] transition-all" 
              />
              <button className="bg-[#d9263a] text-white px-8 py-4 rounded-xl font-[800] hover:bg-[#ff4d61] transition-all text-sm">
                Get the Link
              </button>
            </div>
            
            <div className="flex gap-4 justify-center lg:justify-start">
                  <img src="https://b.zmtcdn.com/data/webuikit/23e930757c3df49840c482a8638bf5c31556001144.png" alt="App Store" className="h-[36px] opacity-60 hover:opacity-100 transition-opacity cursor-pointer" />
                  <img src="https://b.zmtcdn.com/data/webuikit/9f0c85a5e33adb783fa0aef667075f9e1556003622.png" alt="Google Play" className="h-[36px] opacity-60 hover:opacity-100 transition-opacity cursor-pointer" />
            </div>
          </div>
        </div>
      </section>

      {/* Explore Options (Refined & Compact) */}
      <section className="max-w-[1100px] mx-auto w-full px-4 py-16 bg-white">
        <h2 className="text-[32px] font-[800] text-[#1c1c1c] mb-10">Explore options near me</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 1, title: "Popular cuisines near me", content: "Bakery, Beverages, Biryani, Burger, Chinese, Desserts, Ice Cream, Italian, Mithai, Momos, Mugali, North Indian, Pizza, Rolls, Sandwich, Shake, South Indian, Street Food.", icon: <FaUtensils /> },
            { id: 2, title: "Popular restaurant types near me", content: "Bakeries, Bars, Beverage Shops, Cafes, Casual Dining, Dessert Parlors, Dhabas, Fine Dining, Food Courts, Kiosks, Lounges, Meat Shops, Microbreweries, Quick Bites, Sweet Shops.", icon: <FaStore /> },
            { id: 3, title: "Top Restaurant Chains", content: "Bikanervala, Burger King, Burger Singh, Dominos, KFC, Krispy Kreme, McDonald's, Pizza Hut, Subway, Starbucks, WOW! Momo.", icon: <FaLink /> },
            { id: 4, title: "Cities We Deliver To", content: "Delhi NCR, Mumbai, Pune, Bengaluru, Hyderabad, Chennai, Kolkata, Ahmedabad, Chandigarh, Jaipur, Kochi, Coimbatore, Lucknow, Nagpur, Vadodara, Indore, Guwahati.", icon: <FaCity /> }
          ].map((item) => (
            <div 
              key={item.id} 
              className="bg-[#fafafa] rounded-[16px] overflow-hidden border border-gray-100 hover:border-gray-200 transition-all"
            >
              <button 
                onClick={() => setActiveExplore(activeExplore === item.id ? null : item.id)}
                className="w-full flex justify-between items-center p-6 text-left"
              >
                <div className="flex items-center gap-4">
                   <div className="text-[#d9263a] text-[18px]">
                      {item.icon}
                   </div>
                   <span className="text-[18px] text-[#1c1c1c] font-[600]">{item.title}</span>
                </div>
                <motion.div
                    animate={{ rotate: activeExplore === item.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400"
                >
                    <FaChevronDown className="text-[12px]" />
                </motion.div>
              </button>
              <AnimatePresence>
                {activeExplore === item.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0 text-[#7a7a7a] text-[15px] leading-relaxed ml-9">
                       {item.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

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
