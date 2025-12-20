import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
  setUserData,
} from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

function useGetCity(auto = false) {
  const dispatch = useDispatch();
const { currentCity, userData } = useSelector((state) => state.user);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  
  const getCity = (isSilent = false) => {
    return new Promise(async (resolve, reject) => {
      // Priority 1: Check for cached data (instant)
      const cachedCity = localStorage.getItem("last_known_city");
      const cachedAddress = localStorage.getItem("last_known_address");

      // Priority 2: Use Profile Default Address if exists
      const defaultAddress = userData?.addresses?.find(a => a.isDefault) || userData?.addresses?.[0];
      const profileFallback = defaultAddress ? {
        city: defaultAddress.city,
        state: defaultAddress.state,
        address: `${defaultAddress.flatNo}, ${defaultAddress.area}`,
        lat: defaultAddress.lat,
        lon: defaultAddress.lon
      } : null;

      const useFallbacks = () => {
        const fallback = profileFallback || { city: cachedCity || "Delhi NCR", address: cachedAddress };
        if (fallback.city) dispatch(setCurrentCity(fallback.city));
        if (fallback.address) {
          dispatch(setCurrentAddress(fallback.address));
          dispatch(setAddress(fallback.address));
        }
        if (fallback.lat) dispatch(setLocation({ lat: fallback.lat, lon: fallback.lon }));
        resolve(fallback);
      };

      if (!navigator.geolocation) {
        useFallbacks();
        return;
      }

      // Check permission for silent mode to avoid violation warning
      if (isSilent && navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({ name: 'geolocation' });
          if (status.state !== 'granted') {
            useFallbacks();
            return;
          }
        } catch (e) {}
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          if (!apiKey) {
            const fallback = profileFallback || (cachedCity ? { city: cachedCity, address: cachedAddress } : { city: "Delhi NCR" });
            dispatch(setCurrentCity(fallback.city));
            if (fallback.address) {
              dispatch(setCurrentAddress(fallback.address));
              dispatch(setAddress(fallback.address));
            }
            if (fallback.lat) dispatch(setLocation({ lat: fallback.lat, lon: fallback.lon }));
            resolve(fallback);
            return;
          }

          const { latitude, longitude } = position.coords;
          dispatch(setLocation({ lat: latitude, lon: longitude }));
          
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          );
          
          if (result.data?.results?.length > 0) {
            const res = result.data.results[0];
            const city = res.city || res.county || res.suburb || profileFallback?.city || cachedCity || "Delhi NCR";
            const state = res.state;
            const address = res.address_line2 || res.address_line1;
            
            localStorage.setItem("last_known_city", city);
            localStorage.setItem("last_known_address", address);

            dispatch(setCurrentCity(city));
            dispatch(setCurrentState(state));
            dispatch(setCurrentAddress(address));
            dispatch(setAddress(address));
            
            resolve({ 
              city, state, address, lat: latitude, lon: longitude,
              house_number: res.house_number || "",
              street: res.street || "",
              suburb: res.suburb || "",
              postcode: res.postcode || ""
            });
          } else {
            const finalFallback = profileFallback || { city: cachedCity || "Delhi NCR", address: cachedAddress };
            if (finalFallback.city) dispatch(setCurrentCity(finalFallback.city));
            resolve(finalFallback);
          }
        } catch (error) {
          const finalFallback = profileFallback || { city: cachedCity || "Delhi NCR", address: cachedAddress };
          if (finalFallback.city) dispatch(setCurrentCity(finalFallback.city));
          resolve(finalFallback);
        }
      }, (error) => {
        // Fallback sequentially: Profile -> Cache -> Default
        const fallback = profileFallback || { city: cachedCity || "Delhi NCR", address: cachedAddress };
        if (fallback.city) dispatch(setCurrentCity(fallback.city));
        if (fallback.address) {
          dispatch(setCurrentAddress(fallback.address));
          dispatch(setAddress(fallback.address));
        }
        if (fallback.lat) dispatch(setLocation({ lat: fallback.lat, lon: fallback.lon }));
        resolve(fallback);
      }, { timeout: 8000, enableHighAccuracy: true, maximumAge: 300000 });
    });
  };

  useEffect(() => {
    // If we have userData, we might want to override a generic fallback with a profile address
    const isGenericFallback = currentCity === "Delhi NCR";
    if (auto && (!currentCity || (userData && isGenericFallback))) {
      getCity(true).catch(() => {});
    }
  }, [auto, currentCity, userData]);

  return { getCity };
}

export default useGetCity;
