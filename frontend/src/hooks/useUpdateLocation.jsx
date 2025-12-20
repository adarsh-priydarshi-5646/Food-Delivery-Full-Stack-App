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

function useUpdateLocation() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData) return;

    let lastUpdate = 0;
    const updateInterval = 60000; // Update server every 60 seconds at most

    const updateLocation = async (lat, lon) => {
      const now = Date.now();
      if (now - lastUpdate < updateInterval) return;
      
      try {
        await axios.post(
          `${serverUrl}/api/user/update-location`,
          { lat, lon },
          { withCredentials: true }
        );
        lastUpdate = now;
      } catch (err) {
        // Silent error for background updates
      }
    };

    let watchId;
    const startWatching = () => {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          updateLocation(pos.coords.latitude, pos.coords.longitude);
        },
        null, // Silent fail for background watch
        { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 }
      );
    };

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') {
          startWatching();
        }
      });
    } else {
      startWatching();
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [userData?._id]);
}

export default useUpdateLocation;
