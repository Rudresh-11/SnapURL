"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api"; 
import { useRouter } from "next/navigation";
import useApi from "@/hooks/useApi";


export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, request } = useApi(`/auth/login`, {
  method: "POST",
});

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const data = await request(form);
    
    if (data) {
      router.push("/dashboard/links");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-200 px-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border">
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 mt-2">
          Login to continue with <span className="text-indigo-600 font-semibold">SnapURL</span>
        </p>

        {/* Email Field */}
        <div className="mt-8">
          <label className="text-gray-700 font-medium">Email</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border focus:border-indigo-600 outline-none"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="mt-5">
          <label className="text-gray-700 font-medium">Password</label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 rounded-lg border focus:border-indigo-600 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        {/* Divider */}
        <div className="text-center my-6 text-gray-500">— or —</div>

        {/* Register Link */}
        <p className="text-center text-gray-600">
          Don’t have an account?{" "}
          <Link href="/register" className="text-indigo-600 font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
