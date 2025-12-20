import React from "react";
import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
function SignUp() {
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const handleSignUp = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullName,
          email,
          password,
          mobile,
          role,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      setErr("");
      setLoading(false);
      navigate("/");
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!mobile) {
      return setErr("Please enter your mobile number first");
    }
    const provider = new GoogleAuthProvider();
    const { auth } = await import("../firebase");
    try {
      const result = await signInWithPopup(auth, provider);
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName || result.user.email.split('@')[0],
          email: result.user.email,
          role,
          mobile,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
      setErr("");
      navigate("/");
    } catch (error) {
      console.error(error);
      setErr(error?.response?.data?.message || "Google sign up failed");
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white relative">
        {}
       <div className="absolute top-6 left-6 cursor-pointer" onClick={() => navigate("/")}>
          <h1 className="text-3xl font-extrabold italic text-[#E23744] tracking-tight">Vingo</h1>
       </div>

      <div className="w-full max-w-[440px] bg-white p-2">
        <div className="text-center mb-6">
           <h2 className="text-3xl font-medium text-gray-800 tracking-wide mb-2">Sign up</h2>
           <p className="text-gray-500 text-sm">to continue to Vingo</p>
        </div>

        <div className="space-y-4">
           {}
           <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#E23744] focus-within:ring-1 focus-within:ring-[#E23744] transition-all">
             <input
              type="text"
              className="w-full px-4 py-3 outline-none text-gray-700 placeholder-gray-400"
              placeholder="Full Name"
              onChange={(e) => setFullName(e.target.value)}
              value={fullName}
              required
            />
          </div>

          {}
          <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#E23744] focus-within:ring-1 focus-within:ring-[#E23744] transition-all">
             <input
              type="email"
              className="w-full px-4 py-3 outline-none text-gray-700 placeholder-gray-400"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

           {}
           <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#E23744] focus-within:ring-1 focus-within:ring-[#E23744] transition-all">
             <input
              type="tel"
              className="w-full px-4 py-3 outline-none text-gray-700 placeholder-gray-400"
              placeholder="Mobile Number"
              onChange={(e) => setMobile(e.target.value)}
              value={mobile}
              required
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          {}
          <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#E23744] focus-within:ring-1 focus-within:ring-[#E23744] transition-all relative">
             <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 outline-none text-gray-700 placeholder-gray-400 pr-12"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#E23744] text-sm font-medium"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {!showPassword ? "Show" : "Hide"}
              </button>
          </div>

           {}
           <div className="pt-2">
             <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-semibold">Join as</p>
             <div className="flex gap-3">
               {["user", "owner", "deliveryBoy"].map((r) => (
                 <button
                   key={r}
                   className={`flex-1 rounded-lg px-2 py-2 text-center text-sm font-medium transition-all border ${
                     role === r
                       ? "bg-[#E23744] text-white border-[#E23744]"
                       : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                   }`}
                   onClick={() => setRole(r)}
                 >
                   {r === 'deliveryBoy' ? 'Delivery Partner' : r.charAt(0).toUpperCase() + r.slice(1)}
                 </button>
               ))}
             </div>
           </div>

          <button
            className="w-full bg-[#E23744] hover:bg-[#d02433] text-white font-medium py-3 rounded-lg shadow-sm transition-all flex justify-center items-center gap-2 mt-4"
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Create Account"}
          </button>

          {err && (
            <div className="text-red-500 text-sm text-center py-1">
              {err}
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
             className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
             onClick={handleGoogleAuth}
           >
             <FcGoogle size={22} />
             <span>Continue with Google</span>
           </button>
        </div>

        <div className="mt-8 text-center text-gray-600">
           Already have an account? <span className="text-[#E23744] cursor-pointer" onClick={() => navigate("/signin")}>Login</span>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
