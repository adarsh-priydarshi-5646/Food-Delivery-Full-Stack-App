import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useDispatch, useSelector } from "react-redux";
import useGetMyshop from "./hooks/useGetMyShop";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { setSocket, hydrateCart } from "./redux/userSlice";

// Lazy-loaded components
const SignUp = lazy(() => import("./pages/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Home = lazy(() => import("./pages/Home"));
const CreateEditShop = lazy(() => import("./pages/CreateEditShop"));
const AddItem = lazy(() => import("./pages/AddItem"));
const EditItem = lazy(() => import("./pages/EditItem"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckOut = lazy(() => import("./pages/CheckOut"));
const OrderPlaced = lazy(() => import("./pages/OrderPlaced"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const TrackOrderPage = lazy(() => import("./pages/TrackOrderPage"));
const Shop = lazy(() => import("./pages/Shop"));
const BankDetails = lazy(() => import("./pages/BankDetails"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#E23744] border-r-transparent align-[-0.125em]"></div>
      <p className="mt-4 text-lg text-gray-700 font-medium">Loading...</p>
    </div>
  </div>
);

export const serverUrl = import.meta.env.PROD 
  ? "https://food-delivery-full-stack-app-3.onrender.com"
  : "http://localhost:8000";
function App() {
  const { userData, authLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  useGetCurrentUser();
  // Geolocation hooks removed from here to prevent permission request on page load
  // They should be triggered by user action instead
  useGetMyshop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();

  
  useEffect(() => {
    dispatch(hydrateCart());
  }, [dispatch]);

  useEffect(() => {
    const socketInstance = io(serverUrl, { withCredentials: true });
    dispatch(setSocket(socketInstance));
    socketInstance.on("connect", () => {
      if (userData) {
        socketInstance.emit("identity", { userId: userData._id });
      }
    });
    return () => {
      socketInstance.disconnect();
    };
  }, [userData?._id]);

  
  if (authLoading) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          path="/signup"
          element={!userData ? <SignUp /> : <Navigate to={"/"} />}
        />
        <Route
          path="/signin"
          element={!userData ? <SignIn /> : <Navigate to={"/"} />}
        />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <LandingPage />}
        />
        <Route
          path="/create-edit-shop"
          element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/add-item"
          element={userData ? <AddItem /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/edit-item/:itemId"
          element={userData ? <EditItem /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/cart"
          element={userData ? <CartPage /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/checkout"
          element={userData ? <CheckOut /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/order-placed"
          element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/my-orders"
          element={userData ? <MyOrders /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/track-order/:orderId"
          element={userData ? <TrackOrderPage /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/shop/:shopId"
          element={userData ? <Shop /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/category/:categoryName"
          element={userData ? <CategoryPage /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/bank-details"
          element={userData ? <BankDetails /> : <Navigate to={"/signin"} />}
        />
      </Routes>
    </Suspense>
  );
}

export default App;

