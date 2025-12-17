import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShopsInMyCity, setUserData } from "../redux/userSlice";

function useGetShopByCity() {
  const dispatch = useDispatch();
  const { currentCity, userData } = useSelector((state) => state.user);
  useEffect(() => {
    const fetchShops = async () => {
      try {
        if (!currentCity) return; // Optional: don't fetch if no city
        const result = await axios.get(
          `${serverUrl}/api/shop/get-by-city/${currentCity}`,
          { withCredentials: true }
        );
        dispatch(setShopsInMyCity(result.data));
        console.log(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchShops();
  }, [currentCity, userData, dispatch]);
}

export default useGetShopByCity;
