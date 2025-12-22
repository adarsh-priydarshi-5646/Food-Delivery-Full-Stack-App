import React, { useEffect, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useDispatch, useSelector } from "react-redux";
import useGetMyshop from "./hooks/useGetMyShop";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";
import { io } from "socket.io-client";
import { setSocket, hydrateCart } from "./redux/userSlice";
import useGetCity from "./hooks/useGetCity";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load all page components for code splitting
const SignUp = React.lazy(() => import("./pages/SignUp"));
const SignIn = React.lazy(() => import("./pages/SignIn"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const Home = React.lazy(() => import("./pages/Home"));
const CreateEditShop = React.lazy(() => import("./pages/CreateEditShop"));
const AddItem = React.lazy(() => import("./pages/AddItem"));
const EditItem = React.lazy(() => import("./pages/EditItem"));
const CartPage = React.lazy(() => import("./pages/CartPage"));
const CheckOut = React.lazy(() => import("./pages/CheckOut"));
const OrderPlaced = React.lazy(() => import("./pages/OrderPlaced"));
const MyOrders = React.lazy(() => import("./pages/MyOrders"));
const TrackOrderPage = React.lazy(() => import("./pages/TrackOrderPage"));
const Shop = React.lazy(() => import("./pages/Shop"));
const BankDetails = React.lazy(() => import("./pages/BankDetails"));
const CategoryPage = React.lazy(() => import("./pages/CategoryPage"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Documentation = React.lazy(() => import("./pages/Documentation"));

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
  
  // Authentication & Initial Data
  useGetCurrentUser();
  useGetMyshop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();

  // Re-enabled auto-geolocation for production correctness
  useUpdateLocation();
  // Location fetch is better handled selectively to avoid browser "User Gesture" violations
  
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
    <ErrorBoundary>
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
          <Route
            path="/profile"
            element={userData ? <Profile /> : <Navigate to={"/signin"} />}
          />
          <Route path="/docs" element={<Documentation />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
