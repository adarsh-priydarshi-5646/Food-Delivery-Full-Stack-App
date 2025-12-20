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
      // Permission check to avoid redundant prompts or violations
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            updateLocation(pos.coords.latitude, pos.coords.longitude);
          },
          (err) => {
            // Silently handle location errors in background
          },
          { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 }
        );
      }
    };

    // Fix: Only request geolocation after a user gesture if permission not already granted
    const handleFirstInteraction = () => {
      startWatching();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') {
          startWatching();
        } else {
          window.addEventListener('click', handleFirstInteraction);
          window.addEventListener('touchstart', handleFirstInteraction);
        }
      });
    } else {
      // Fallback: wait for interaction to be safe
      window.addEventListener('click', handleFirstInteraction);
      window.addEventListener('touchstart', handleFirstInteraction);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [userData?._id]);
}

export default useUpdateLocation;
