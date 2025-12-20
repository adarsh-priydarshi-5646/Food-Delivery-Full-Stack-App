import React, { useEffect, useRef, useState, useMemo } from "react";
import Nav from "./Nav";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import { FaCircleChevronLeft, FaCircleChevronRight, FaUtensils } from "react-icons/fa6";
import { FaSearch, FaStore } from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import FoodCard from "./FoodCard";
import { useNavigate } from "react-router-dom";
import FilterSidebar from "./FilterSidebar";
import RestaurantCard from "./RestaurantCard";
import { toggleCategory } from "../redux/userSlice";

function UserDashboard() {
  const dispatch = useDispatch();
  const { 
    currentCity, 
    shopInMyCity, 
    itemsInMyCity, 
    searchItems, 
    selectedCategories,
    priceRange,
    sortBy,
    quickFilters
  } = useSelector((state) => state.user);
  
  const cateScrollRef = useRef();
  const navigate = useNavigate();
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);

  // Optimize filtering with useMemo to prevent recalculations
  const filteredItems = useMemo(() => {
    if (!itemsInMyCity) return [];

    let result = [...itemsInMyCity];

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(item => selectedCategories.includes(item.category));
    }

    // Price range filter
    result = result.filter(item => 
      item.price >= priceRange.min && item.price <= priceRange.max
    );

    // Quick filters
    if (quickFilters.veg) {
      result = result.filter(item => item.isVeg === true);
    }
    if (quickFilters.fastDelivery) {
      result = result.filter(item => item.deliveryTime <= 30);
    }
    if (quickFilters.topRated) {
      result = result.filter(item => item.rating >= 4.0);
    }

    // Sorting
    switch (sortBy) {
      case 'popularity':
        return result.sort((a, b) => (b.orders || 0) - (a.orders || 0));
      case 'rating':
        return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'price-low':
        return result.sort((a, b) => a.price - b.price);
      case 'price-high':
        return result.sort((a, b) => b.price - a.price);
      case 'delivery-time':
        return result.sort((a, b) => (a.deliveryTime || 60) - (b.deliveryTime || 60));
      default:
        return result;
    }
  }, [itemsInMyCity, selectedCategories, priceRange, sortBy, quickFilters]);

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(
        element.scrollLeft + element.clientWidth < element.scrollWidth
      );
    }
  };
  
  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction == "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (cateScrollRef.current) {
      updateButton(
        cateScrollRef,
        setShowLeftCateButton,
        setShowRightCateButton
      );
      cateScrollRef.current.addEventListener("scroll", () => {
        updateButton(
          cateScrollRef,
          setShowLeftCateButton,
          setShowRightCateButton
        );
      });
    }

    return () => {
      cateScrollRef?.current?.removeEventListener("scroll", () => {
        updateButton(
          cateScrollRef,
          setShowLeftCateButton,
          setShowRightCateButton
        );
      });
    };
  }, [categories]);

  const handleCategoryClick = (category) => {
    
    if (category !== "All") {
      navigate(`/category/${category}`);
    }
  };

  return (
    <main className="w-full flex flex-col items-center bg-[#F8F8F8] min-h-screen pt-5">
      <Nav />
      
      <div className="w-full max-w-7xl px-4 mt-6">
        {}
        {searchItems && searchItems.length > 0 && (
          <div className="mb-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-6">
              <FaSearch className="text-[#E23744]" /> Search Results
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchItems.map((item) => (
                <FoodCard data={item} key={item._id} />
              ))}
            </div>
          </div>
        )}

        {}
        {(!searchItems || searchItems.length === 0) && (
          <>
            {}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <MdCategory className="text-[#E23744] text-2xl" />
                <h2 className="text-gray-800 text-2xl font-bold">
                  Explore by Category
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Browse our curated collection of delicious food categories
              </p>
              
              <div className="relative">
                {showLeftCateButton && (
                  <button
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white text-[#E23744] p-3 rounded-full shadow-lg hover:bg-gray-50 z-10 border border-gray-200 transition-colors"
                    onClick={() => scrollHandler(cateScrollRef, "left")}
                  >
                    <FaCircleChevronLeft />
                  </button>
                )}

                <div
                  className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide"
                  ref={cateScrollRef}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {categories.filter(cat => cat.category !== 'All').map((cate, index) => (
                    <CategoryCard
                      name={cate.category}
                      image={cate.image}
                      key={index}
                      onClick={() => handleCategoryClick(cate.category)}
                    />
                  ))}
                </div>
                
                {showRightCateButton && (
                  <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white text-[#E23744] p-3 rounded-full shadow-lg hover:bg-gray-50 z-10 border border-gray-200 transition-colors"
                    onClick={() => scrollHandler(cateScrollRef, "right")}
                  >
                    <FaCircleChevronRight />
                  </button>
                )}
              </div>
            </div>

            {}
            {shopInMyCity && shopInMyCity.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <FaStore className="text-[#E23744] text-2xl" />
                  <h2 className="text-gray-800 text-2xl font-bold">
                    Top Restaurants in {currentCity}
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Discover the best restaurants near you
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {shopInMyCity.slice(0, 8).map((shop, index) => (
                    <RestaurantCard key={index} restaurant={shop} />
                  ))}
                </div>

                {shopInMyCity.length > 8 && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => {}}
                      className="px-6 py-2 text-[#E23744] border-2 border-[#E23744] rounded-lg hover:bg-[#E23744] hover:text-white transition-colors font-semibold"
                    >
                      View All Restaurants
                    </button>
                  </div>
                )}
              </div>
            )}

            {}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <FaUtensils className="text-[#E23744] text-2xl" />
                <h2 className="text-gray-800 text-2xl font-bold">
                  Popular Dishes
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Explore our handpicked selection of delicious food items
              </p>

              <div className="flex gap-6">
                {}
                <div className="hidden lg:block flex-shrink-0">
                  <FilterSidebar />
                </div>

                {}
                <div className="flex-1">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-gray-800 text-lg font-semibold">
                      {selectedCategories.length > 0 
                        ? `${selectedCategories.join(', ')}` 
                        : 'All Dishes'}
                    </h3>
                    <span className="text-gray-600 text-sm bg-gray-100 px-3 py-1 rounded-full">
                      {filteredItems.length} items
                    </span>
                  </div>

                  {filteredItems.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                      <FaUtensils className="text-gray-300 text-5xl mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No items found matching your filters</p>
                      <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or explore other categories</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredItems.map((item, index) => (
                        <FoodCard key={index} data={item} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default UserDashboard;
