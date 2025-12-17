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
function SignIn() {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
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
    const provider = new GoogleAuthProvider();
    const { auth } = await import("../../firebase");
    const result = await signInWithPopup(auth, provider);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName || result.user.email.split('@')[0],
          email: result.user.email,
          mobile: result.user.phoneNumber || "0000000000",
          role: "user",
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
      navigate("/");
    } catch (error) {
      console.log(error);
      setErr(error?.response?.data?.message || "Google sign in failed");
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#fff9f6]">
      {/* Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Glass Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 border border-white/50 relative z-10 transition-all hover:shadow-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2 text-[#E23744] tracking-tight">
            Vingo
          </h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-sm">
            Sign in to continue your delicious journey
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E23744]/20 focus:border-[#E23744] transition-all"
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E23744]/20 focus:border-[#E23744] transition-all pr-12"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {!showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
              </button>
            </div>
            <div className="text-right mt-2">
              <span
                className="text-sm text-[#E23744] hover:text-[#c02a35] font-medium cursor-pointer transition-colors"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </span>
            </div>
          </div>

          <button
            className="w-full bg-[#E23744] hover:bg-[#c02a35] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/30 transform transition-all active:scale-[0.98] flex justify-center items-center gap-2"
            onClick={handleSignIn}
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Sign In"}
          </button>

          {err && (
            <div className="bg-red-50 text-red-500 text-sm text-center py-2 rounded-lg border border-red-100">
              {err}
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#fff9f6] text-gray-500 rounded">Or continue with</span>
            </div>
          </div>

          <button
            className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
            onClick={handleGoogleAuth}
          >
            <FcGoogle size={22} />
            <span>Sign in with Google</span>
          </button>
        </div>

        <p className="text-center mt-8 text-gray-600">
          Don't have an account?{" "}
          <span
            className="text-[#E23744] font-bold cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
