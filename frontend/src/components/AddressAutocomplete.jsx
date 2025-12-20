import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function AddressAutocomplete({ onSelect, placeholder, initialValue = "" }) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  const dropdownRef = useRef(null);

  useEffect(() => {
    setQuery(initialValue || "");
  }, [initialValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2 && !loading && isFocused) {
        fetchSuggestions();
      } else if (query.length <= 2) {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isFocused]);

  const fetchSuggestions = async () => {
    if (!apiKey) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${apiKey}&limit=5`
      );
      setSuggestions(response.data.features || []);
      setShowDropdown(true);
    } catch (error) {
      console.error("Autocomplete error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (feature) => {
    const { properties } = feature;
    const formatted = properties.formatted;
    setQuery(formatted);
    setShowDropdown(false);
    onSelect({
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
      city: properties.city || properties.county || "",
      state: properties.state || "",
      pincode: properties.postcode || "",
      area: properties.suburb || properties.neighbourhood || properties.district || properties.city || "",
      address: formatted,
      house_number: properties.housenumber || "",
      street: properties.street || ""
    });
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Small delay to allow click on suggestions
          placeholder={placeholder || "Search your area or locality..."}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-10 py-3 outline-none focus:border-[#E23744] focus:ring-1 focus:ring-[#E23744] transition-all font-medium"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <FaSearch size={14} />
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-0"
              >
                <div className="mt-1 text-[#E23744]">
                  <FaMapMarkerAlt size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 line-clamp-1">
                    {suggestion.properties.address_line1}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {suggestion.properties.address_line2}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AddressAutocomplete;
