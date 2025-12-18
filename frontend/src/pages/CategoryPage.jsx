import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Nav from "../components/Nav";
import FilterSidebar from "../components/FilterSidebar";
import FoodCard from "../components/FoodCard";
import { FaHome, FaChevronRight } from "react-icons/fa";

function CategoryPage() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { 
    itemsInMyCity, 
    selectedCategories,
    priceRange,
    sortBy,
    quickFilters 
  } = useSelector((state) => state.user);
  
  const [filteredItems, setFilteredItems] = useState([]);

  
  useEffect(() => {
    if (!itemsInMyCity) {
      setFilteredItems([]);
      return;
    }

    let result = [...itemsInMyCity];

    
    result = result.filter(item => item.category === categoryName);

    
    if (selectedCategories.length > 0) {
      result = result.filter(item => selectedCategories.includes(item.category));
    }

    
    result = result.filter(item => 
      item.price >= priceRange.min && item.price <= priceRange.max
    );

    
    if (quickFilters.veg) {
      result = result.filter(item => item.isVeg === true);
    }
    if (quickFilters.fastDelivery) {
      result = result.filter(item => item.deliveryTime <= 30);
    }
    if (quickFilters.topRated) {
      result = result.filter(item => item.rating >= 4.0);
    }

    
    switch (sortBy) {
      case 'popularity':
        result.sort((a, b) => (b.orders || 0) - (a.orders || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'delivery-time':
        result.sort((a, b) => (a.deliveryTime || 60) - (b.deliveryTime || 60));
        break;
      default:
        break;
    }

    setFilteredItems(result);
  }, [itemsInMyCity, categoryName, selectedCategories, priceRange, sortBy, quickFilters]);

  return (
    <div className="w-full flex flex-col items-center bg-[#F8F8F8] min-h-screen pt-[84px]">
      <Nav />
      
      <div className="w-full max-w-7xl px-4 mt-6">
        {}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1 hover:text-[#E23744] transition-colors"
          >
            <FaHome />
            <span>Home</span>
          </button>
          <FaChevronRight className="text-xs" />
          <span className="text-gray-800 font-semibold">{categoryName}</span>
        </div>

        {}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {categoryName}
          </h1>
          <p className="text-gray-600">
            Explore delicious {categoryName.toLowerCase()} available in your area
          </p>
        </div>

        {}
        <div className="flex gap-6 mb-8">
          {}
          <div className="hidden lg:block flex-shrink-0">
            <FilterSidebar hideCategoryFilter={true} />
          </div>

          {}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-gray-800 text-xl font-semibold">
                All {categoryName} Items
              </h2>
              <span className="text-gray-600 text-sm">
                {filteredItems.length} items found
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg">No {categoryName.toLowerCase()} items found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or explore other categories</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 px-6 py-2 bg-[#E23744] text-white rounded-lg hover:bg-[#c02a35] transition-colors"
                >
                  Back to Home
                </button>
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
    </div>
  );
}

export default CategoryPage;
