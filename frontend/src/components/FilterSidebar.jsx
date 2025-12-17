import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleCategory, setPriceRange, setSortBy, toggleQuickFilter, clearFilters } from "../redux/userSlice";
import { categories } from "../category";
import { FaFilter, FaTimes, FaLeaf, FaBolt, FaStar } from "react-icons/fa";

function FilterSidebar({ hideCategoryFilter = false }) {
  const dispatch = useDispatch();
  const { selectedCategories, priceRange, sortBy, quickFilters } = useSelector(
    (state) => state.user
  );

  const handleCategoryToggle = (category) => {
    dispatch(toggleCategory(category));
  };

  const handleSortChange = (sort) => {
    dispatch(setSortBy(sort));
  };

  const handleQuickFilter = (filterKey) => {
    dispatch(toggleQuickFilter(filterKey));
  };

  const handleClearAll = () => {
    dispatch(clearFilters());
  };

  return (
    <div className="w-full lg:w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      {}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FaFilter className="text-[#E23744]" />
          Filters
        </h3>
        {(selectedCategories.length > 0 || quickFilters.veg || quickFilters.fastDelivery || quickFilters.topRated) && (
          <button
            onClick={handleClearAll}
            className="text-sm text-[#E23744] hover:text-[#c02a35] font-medium transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Filters</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickFilter('veg')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              quickFilters.veg
                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <FaLeaf className="text-xs" />
            Veg Only
          </button>
          <button
            onClick={() => handleQuickFilter('fastDelivery')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              quickFilters.fastDelivery
                ? 'bg-orange-100 text-orange-700 border-2 border-orange-500'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <FaBolt className="text-xs" />
            Fast Delivery
          </button>
          <button
            onClick={() => handleQuickFilter('topRated')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              quickFilters.topRated
                ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <FaStar className="text-xs" />
            Top Rated
          </button>
        </div>
      </div>

      {}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Sort By</h4>
        <div className="space-y-2">
          {['popularity', 'rating', 'price-low', 'price-high', 'delivery-time'].map((sort) => (
            <label key={sort} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="sortBy"
                checked={sortBy === sort}
                onChange={() => handleSortChange(sort)}
                className="w-4 h-4 text-[#E23744] border-gray-300 focus:ring-[#E23744] cursor-pointer"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                {sort === 'popularity' && 'Popularity'}
                {sort === 'rating' && 'Rating'}
                {sort === 'price-low' && 'Price: Low to High'}
                {sort === 'price-high' && 'Price: High to Low'}
                {sort === 'delivery-time' && 'Delivery Time'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {}
      {!hideCategoryFilter && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Categories</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.filter(cat => cat.category !== 'All').map((cat) => (
              <label key={cat.category} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.category)}
                  onChange={() => handleCategoryToggle(cat.category)}
                  className="w-4 h-4 text-[#E23744] border-gray-300 rounded focus:ring-[#E23744] cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {cat.category}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterSidebar;
