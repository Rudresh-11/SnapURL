"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            await api.post("/auth/register", {
                username: form.username,
                email: form.email,
                password: form.password,
            });

            router.push("/login");
        } catch (err) {
            console.log("err: ",err.response);
            alert(err.response?.data?.message || "resgistration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-6">
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border">

                {/* Title */}
                <h2 className="text-3xl font-bold text-center text-gray-900">
                    Create Your Account
                </h2>
                <p className="text-center text-gray-600 mt-2">
                    Join <span className="text-indigo-600 font-semibold">SnapURL</span> today
                </p>

                {/* Username */}
                <div className="mt-8">
                    <label className="text-gray-700 font-medium">Username</label>
                    <div className="relative mt-1">
                        <User className="absolute left-3 top-3 text-gray-500" size={20} />
                        <input
                            type="text"
                            name="username"
                            placeholder="john_doe"
                            value={form.username}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border focus:border-indigo-600 outline-none"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="mt-5">
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

                {/* Password */}
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

                {/* Confirm Password */}
                <div className="mt-5">
                    <label className="text-gray-700 font-medium">Confirm Password</label>
                    <div className="relative mt-1">
                        <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
                        <input
                            type={showConfirm ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="••••••••••"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="w-full pl-10 pr-10 py-3 rounded-lg border focus:border-indigo-600 outline-none"
                        />

                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {/* Register Button */}
                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {loading ? "Creating account..." : "Register"}
                </button>

                {/* Divider */}
                <div className="text-center my-6 text-gray-500">— or —</div>

                {/* Login Link */}
                <p className="text-center text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-indigo-600 font-medium hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
