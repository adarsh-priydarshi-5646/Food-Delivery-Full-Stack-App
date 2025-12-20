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
  const { currentCity } = useSelector((state) => state.user);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  
  const getCity = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          if (!apiKey) {
            console.warn("VITE_GEOAPIKEY is missing. Falling back to default city.");
            dispatch(setCurrentCity("Delhi NCR"));
            resolve({ city: "Delhi NCR" });
            return;
          }

          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          dispatch(setLocation({ lat: latitude, lon: longitude }));
          
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          );
          
          if (result.data && result.data.results && result.data.results.length > 0) {
            const city = result.data.results[0].city || result.data.results[0].county || result.data.results[0].suburb;
            const state = result.data.results[0].state;
            const address = result.data.results[0].address_line2 || result.data.results[0].address_line1;
            
            dispatch(setCurrentCity(city));
            dispatch(setCurrentState(state));
            dispatch(setCurrentAddress(address));
            dispatch(setAddress(result.data.results[0].address_line2));
            
            resolve({ city, state, address });
          } else {
            console.warn("No results from Geoapify");
            resolve({ city: "Delhi NCR" });
          }
        } catch (error) {
          console.error("Error in getCity details fetch:", error);
          dispatch(setCurrentCity("Delhi NCR")); // Fallback
          reject(error);
        }
      }, (error) => {
        console.error("Geolocation permission/error:", error);
        dispatch(setCurrentCity("Delhi NCR")); // Fallback
        reject(error);
      }, { timeout: 10000, enableHighAccuracy: true });
    });
  };

  useEffect(() => {
    if (auto && !currentCity) {
      getCity().catch(err => console.error("Auto city fetch failed:", err));
    }
  }, [auto]);

  return { getCity };
}

export default useGetCity;
