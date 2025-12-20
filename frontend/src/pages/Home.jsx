import React from "react";
import { useSelector } from "react-redux";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import DeliveryBoy from "../components/DeliveryBoy";
import Footer from "../components/Footer";

function Home() {
  const { userData } = useSelector((state) => state.user);
  return (
    <div className="w-[100vw] min-h-[100vh] pt-[65px] flex flex-col bg-[#F8F8F8]">
      <div className="flex-1 flex flex-col items-center">
        {userData.role == "user" && <UserDashboard />}
        {userData.role == "owner" && <OwnerDashboard />}
        {userData.role == "deliveryBoy" && <DeliveryBoy />}
      </div>
      <Footer />
    </div>
  );
}

export default Home;
