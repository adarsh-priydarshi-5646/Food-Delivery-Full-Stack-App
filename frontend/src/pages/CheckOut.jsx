import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline, IoLocationSharp } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { setAddress, setLocation } from "../redux/mapSlice";
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard, FaReceipt } from "react-icons/fa";
import axios from "axios";
import { FaMobileScreenButton } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { addMyOrder, clearCart } from "../redux/userSlice";
import { loadStripe } from "@stripe/stripe-js";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function RecenterMap({ location }) {
  if (location.lat && location.lon) {
    const map = useMap();
    map.setView([location.lat, location.lon], 16, { animate: true });
  }
  return null;
}

function CheckOut() {
  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount, userData } = useSelector((state) => state.user);
  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const AmountWithDeliveryFee = totalAmount + deliveryFee;

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
  };

  const getCurrentLocation = () => {
    const latitude = userData.location.coordinates[1];
    const longitude = userData.location.coordinates[0];
    dispatch(setLocation({ lat: latitude, lon: longitude }));
    getAddressByLatLng(latitude, longitude);
  };

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
      );
      dispatch(setAddress(result?.data?.results[0].address_line2));
    } catch (error) {
      console.error(error);
    }
  };

  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          addressInput
        )}&apiKey=${apiKey}`
      );
      const { lat, lon } = result.data.features[0].properties;
      dispatch(setLocation({ lat, lon }));
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!addressInput || addressInput.trim() === "") {
      alert("Please enter a delivery address");
      return;
    }
    if (!location.lat || !location.lon) {
      alert("Please select a location on the map");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    try {
      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.lon,
          },
          totalAmount: AmountWithDeliveryFee,
          cartItems,
        },
        { withCredentials: true }
      );

      if (paymentMethod == "cod") {
        dispatch(addMyOrder(result.data));
        dispatch(clearCart());
        navigate("/order-placed");
      } else {
        const orderId = result.data._id;
        handleStripePayment(orderId, AmountWithDeliveryFee);
      }
    } catch (error) {
      console.error("Order placement error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to place order. Please try again.";
      alert(errorMessage);
    }
  };

  const handleStripePayment = async (orderId, amount) => {
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/order/create-stripe-payment`,
        { amount, orderId },
        { withCredentials: true }
      );

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create payment session. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.response?.data?.message || "Payment failed. Please try again.");
    }
  };

  useEffect(() => {
    setAddressInput(address);
  }, [address]);

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex justify-center px-4 py-6">
      <div className="w-full max-w-5xl">
        {}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="p-2 hover:bg-white rounded-full transition-colors"
            aria-label="Go back"
          >
            <IoIosArrowRoundBack size={32} className="text-[#E23744]" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 text-sm mt-1">Complete your order</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2 space-y-6">
            {}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                <IoLocationSharp className="text-[#E23744]" />
                Delivery Location
              </h2>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E23744] focus:border-transparent"
                  placeholder="Enter your delivery address"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                />
                <button
                  className="bg-[#E23744] hover:bg-[#c02a35] text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={getLatLngByAddress}
                >
                  <IoSearchOutline size={20} />
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={getCurrentLocation}
                >
                  <TbCurrentLocation size={20} />
                </button>
              </div>

              <div className="rounded-xl border border-gray-300 overflow-hidden">
                <div className="h-64 w-full">
                  <MapContainer
                    className="w-full h-full"
                    center={[location?.lat, location?.lon]}
                    zoom={16}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterMap location={location} />
                    <Marker
                      position={[location?.lat, location?.lon]}
                      draggable
                      eventHandlers={{ dragend: onDragEnd }}
                    />
                  </MapContainer>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Drag the marker to adjust your exact delivery location
              </p>
            </div>

            {}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Payment Method
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    paymentMethod === "cod"
                      ? "border-[#E23744] bg-red-50 ring-2 ring-[#E23744] ring-opacity-20"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <MdDeliveryDining className="text-green-600 text-2xl" />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when food arrives</p>
                  </div>
                </button>

                <button
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    paymentMethod === "online"
                      ? "border-[#E23744] bg-red-50 ring-2 ring-[#E23744] ring-opacity-20"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setPaymentMethod("online")}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <FaCreditCard className="text-purple-600 text-xl" />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">UPI / Card</p>
                    <p className="text-xs text-gray-500">Pay securely online</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                <FaReceipt className="text-[#E23744]" />
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              </div>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm text-gray-700">
                    <span className="flex-1 line-clamp-1">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-semibold ml-2">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">
                    {deliveryFee == 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-gray-900">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-xl font-bold text-[#E23744]">
                    ₹{AmountWithDeliveryFee}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-[#E23744] text-white px-6 py-3.5 rounded-lg text-lg font-bold hover:bg-[#c02a35] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {paymentMethod == "cod" ? "Place Order" : "Pay & Place Order"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing order, you agree to our terms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckOut;
