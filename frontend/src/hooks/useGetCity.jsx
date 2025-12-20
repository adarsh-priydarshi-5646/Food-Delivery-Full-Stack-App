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

function useGetCity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  
  const getCity = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          dispatch(setLocation({ lat: latitude, lon: longitude }));
          
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          );
          
          const city = result?.data?.results[0].city || result?.data?.results[0].county;
          const state = result?.data?.results[0].state;
          const address = result?.data?.results[0].address_line2 || result?.data?.results[0].address_line1;
          
          dispatch(setCurrentCity(city));
          dispatch(setCurrentState(state));
          dispatch(setCurrentAddress(address));
          dispatch(setAddress(result?.data?.results[0].address_line2));
          
          resolve({ city, state, address });
        } catch (error) {
          reject(error);
        }
      }, (error) => {
        reject(error);
      });
    });
  };

  return { getCity };
}

export default useGetCity;
