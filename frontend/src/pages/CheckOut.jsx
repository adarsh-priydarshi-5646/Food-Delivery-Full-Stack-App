import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline, IoLocationSharp } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { setAddress, setLocation } from "../redux/mapSlice";
import { MdDeliveryDining, MdOutlineAddLocationAlt } from "react-icons/md";
import { FaCreditCard, FaReceipt, FaCheckCircle, FaPlus } from "react-icons/fa";
import axios from "axios";
import { FaMobileScreenButton } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { addMyOrder, clearCart, setSelectedAddressId } from "../redux/userSlice";
import { loadStripe } from "@stripe/stripe-js";
import AddressModal from "../components/AddressModal";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { FiShoppingCart } from "react-icons/fi";
import { AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import AddressAutocomplete from "../components/AddressAutocomplete";
import useGetCity from "../hooks/useGetCity";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function RecenterMap({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location.lat != null && location.lon != null) {
      map.setView([location.lat, location.lon], 16, { animate: true });
    }
  }, [location.lat, location.lon, map]);
  return null;
}

function CheckOut() {
  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount, userData, selectedAddressId, authLoading } = useSelector((state) => state.user);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getCity } = useGetCity();
  const [isDetecting, setIsDetecting] = useState(false);

  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const AmountWithDeliveryFee = totalAmount + deliveryFee;
  const selectedAddress = userData?.addresses?.find(a => a._id === selectedAddressId);

  useEffect(() => {
    // If user has addresses and none selected, select default or first one
    if (userData?.addresses?.length > 0 && !selectedAddressId) {
      const defaultAddr = userData.addresses.find(a => a.isDefault) || userData.addresses[0];
      dispatch(setSelectedAddressId(defaultAddr._id));
    }
  }, [userData, selectedAddressId, dispatch]);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(setLocation({ lat: selectedAddress.lat, lon: selectedAddress.lon }));
      dispatch(setAddress(`${selectedAddress.flatNo}, ${selectedAddress.area}, ${selectedAddress.city}`));
    }
  }, [selectedAddress, dispatch]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
      <div className="w-12 h-12 border-4 border-[#E23744] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  const handleDetectCurrentLocation = async () => {
    setIsDetecting(true);
    try {
      const data = await getCity();
      dispatch(setSelectedAddressId(null));
      dispatch(setLocation({ lat: data.lat, lon: data.lon }));
      dispatch(setAddress(data.address));
      toast.success("Location detected!");
    } catch (_err) {
      toast.error("Failed to detect location");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAutocompleteSelect = (data) => {
    dispatch(setSelectedAddressId(null));
    dispatch(setLocation({ lat: data.lat, lon: data.lon }));
    dispatch(setAddress(data.address));
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && !address) {
      toast.error("Please select or search a delivery address");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const deliveryAddressText = selectedAddress 
        ? `${selectedAddress.flatNo}, ${selectedAddress.area}, ${selectedAddress.landmark ? selectedAddress.landmark + ', ' : ''}${selectedAddress.city} - ${selectedAddress.pincode}`
        : address;

      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: deliveryAddressText,
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
      toast.error(error.response?.data?.message || "Failed to place order");
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
        toast.error("Failed to create payment session");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };


  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center justify-center p-4">
        <Nav />
        <div className="text-center bg-white p-12 rounded-[2rem] shadow-xl max-w-md w-full border border-gray-100">
           <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#E23744]">
              <FiShoppingCart size={32} />
           </div>
           <h2 className="text-2xl font-black text-gray-900 mb-2">Cart is empty</h2>
           <p className="text-gray-500 font-medium mb-8">Add some delicious food items to proceed with checkout</p>
           <button 
             onClick={() => navigate("/")}
             className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl"
           >
             Explore Restaurants
           </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col font-sans">
      <Nav />
      <div className="flex-1 flex justify-center px-4 py-24">
        <Toaster />
        <div className="w-full max-w-6xl">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate("/cart")}
            className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all text-[#E23744]"
          >
            <IoIosArrowRoundBack size={28} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
            <p className="text-gray-500 font-medium">Safe and touchless delivery available</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                  <IoLocationSharp className="text-[#E23744]" />
                  Delivery Address
                </h2>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="text-[#E23744] font-bold text-sm bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-all flex items-center gap-2"
                >
                  <FaPlus size={12} /> Add New
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userData?.addresses?.length === 0 ? (
                  <button 
                    onClick={() => setShowAddressModal(true)}
                    className="col-span-full border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-3 text-gray-400 hover:border-[#E23744] hover:text-[#E23744] transition-all group"
                  >
                    <MdOutlineAddLocationAlt size={40} className="group-hover:scale-110 transition-transform" />
                    <span className="font-bold">Add a delivery address to proceed</span>
                  </button>
                ) : (
                  userData?.addresses?.map((addr) => (
                    <div 
                      key={addr._id}
                      onClick={() => dispatch(setSelectedAddressId(addr._id))}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedAddressId === addr._id 
                          ? "border-[#E23744] bg-red-50/30 ring-4 ring-red-50" 
                          : "border-gray-100 hover:border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${
                          selectedAddressId === addr._id ? "bg-[#E23744] text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          {addr.label}
                        </span>
                        {selectedAddressId === addr._id && <FaCheckCircle className="text-[#E23744]" size={16} />}
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-[#E23744] transition-colors">{addr.flatNo}</h3>
                      <p className="text-gray-500 text-xs line-clamp-2 mt-1">{addr.area}, {addr.city}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="mb-4 space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Search or detect delivery location</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <AddressAutocomplete 
                        onSelect={handleAutocompleteSelect}
                        initialValue={address}
                        placeholder="Search for a building, street or area..."
                      />
                    </div>
                    <button 
                      onClick={handleDetectCurrentLocation}
                      disabled={isDetecting}
                      className={`px-4 rounded-xl bg-gray-900 text-white hover:bg-black transition-all shadow-lg flex items-center justify-center ${isDetecting ? 'animate-pulse opacity-70' : ''}`}
                      title="Detect Current Location"
                    >
                      <TbCurrentLocation size={20} />
                    </button>
                  </div>
                </div>

                <div className="h-64 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative">
                  {(location.lat || selectedAddress?.lat) && (
                    <MapContainer
                      className="w-full h-full z-0"
                      center={[location.lat || selectedAddress?.lat || 0, location.lon || selectedAddress?.lon || 0]}
                      zoom={16}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <RecenterMap location={{ lat: location.lat || selectedAddress?.lat, lon: location.lon || selectedAddress?.lon }} />
                      <Marker position={[location.lat || selectedAddress?.lat || 0, location.lon || selectedAddress?.lon || 0]} />
                    </MapContainer>
                  )}
                  
                  {!selectedAddress && address && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-gray-100 z-[1000]">
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Delivering to:</p>
                       <p className="text-gray-900 font-bold text-sm line-clamp-2">{address}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-8 text-gray-900 flex items-center gap-3">
                <FaCreditCard className="text-[#E23744]" />
                Payment Method
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                    paymentMethod === "cod"
                      ? "border-[#E23744] bg-red-50 ring-4 ring-red-50"
                      : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${
                    paymentMethod === "cod" ? "bg-[#E23744] text-white shadow-lg shadow-red-200" : "bg-gray-100 text-gray-400"
                  }`}>
                    <MdDeliveryDining />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Cash on Delivery</p>
                    <p className="text-xs text-gray-500 font-medium">Pay when food arrives</p>
                  </div>
                </button>

                <button
                  className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                    paymentMethod === "online"
                      ? "border-[#E23744] bg-red-50 ring-4 ring-red-50"
                      : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                  onClick={() => setPaymentMethod("online")}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${
                    paymentMethod === "online" ? "bg-[#E23744] text-white shadow-lg shadow-red-200" : "bg-gray-100 text-gray-400"
                  }`}>
                    <FaCreditCard />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Cards / Wallet / UPI</p>
                    <p className="text-xs text-gray-500 font-medium">Secure online payment</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-extrabold text-gray-900">Summary</h2>
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                   <FaReceipt />
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center group">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">{item.name}</span>
                      <span className="text-xs text-gray-400 font-medium">Quantity: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-gray-700">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Delivery Charges</span>
                  <span className={`${deliveryFee === 0 ? "text-green-500" : "text-gray-900"}`}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>
              </div>

              <div className="mb-8 p-4 bg-gray-50 rounded-2xl">
                <div className="flex justify-between items-center text-gray-900">
                  <span className="font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-[#E23744]">₹{AmountWithDeliveryFee}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.98]"
              >
                {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
              </button>

              <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest leading-relaxed">
                  By placing the order, you agree to Vingo's terms & conditions and privacy policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddressModal && (
          <AddressModal 
            onClose={() => setShowAddressModal(false)}
          />
        )}
      </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}

export default CheckOut;
