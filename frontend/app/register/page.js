"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, Lock, AlertCircle, Loader2, User, Eye, EyeOff } from "lucide-react";
import useApi from "@/hooks/useApi";
import Image from "next/image";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const googleAuthApi = useApi("/auth/login/google", { method: "POST" });
    const registerApi = useApi("/auth/register", { method: "POST" });

    const googleBtnRef = useRef(null);

    // GOOGLE LOGIN INITIALIZATION
    useEffect(() => {
        if (!window.google || !googleBtnRef.current) return;

        window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleCredential,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            width: 450,
            shape: "rectangular",
        });
    }, []);

    // GOOGLE CALLBACK
    const handleGoogleCredential = async (response) => {
        setError(null);
        setLoading(true);

        const res = await googleAuthApi.request({
            provider: "google",
            idToken: response.credential,
        });

        if (!res) {
            setError(googleAuthApi.error || "Something went wrong with Google signup");
            setLoading(false);
            return;
        }

        window.location.href = "/dashboard";
    };

    // EMAIL REGISTER SUBMIT
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        if (!(username || email || password || confirmPassword)) {
            setError("All fields are required");
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        const res = await registerApi.request({ username, email, password });

        if (!res) {
            setError(registerApi.error || "Registration failed");
            setLoading(false);
            return;
        }

        window.location.href = "/dashboard";
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-blue-50 flex">
            {/* Left Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo with enhanced styling */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2">
                            <h1 className="text-4xl font-bold bg-linear-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                                snapurl
                            </h1>
                        </div>
                    </div>

                    {/* Title with better spacing */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Create your account
                        </h2>
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                                Log in
                            </a>
                        </p>
                    </div>

                    {/* GOOGLE SIGNUP BUTTON */}
                    <div
                        ref={googleBtnRef}
                        className={`mb-6 ${loading ? "pointer-events-none opacity-50" : ""}`}
                    />

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="text-gray-500 text-sm font-medium">OR</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* EMAIL REGISTER FORM */}
                    <div className="space-y-5">
                        {/* Username Input with Icon */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                Username
                            </label>
                            <div className="relative">
                                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedInput === 'username' ? 'text-blue-500' : 'text-gray-400'
                                    }`} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedInput('username')}
                                    onBlur={() => setFocusedInput(null)}
                                    placeholder="Choose a username"
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Input with Icon */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedInput === 'email' ? 'text-blue-500' : 'text-gray-400'
                                    }`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput(null)}
                                    placeholder="you@example.com"
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input with Icon and Toggle */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedInput === 'password' ? 'text-blue-500' : 'text-gray-400'
                                    }`} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
                                    placeholder="Create a strong password"
                                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        {/* Confirm Password Input with Icon and Toggle */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedInput === 'confirmPassword' ? 'text-blue-500' : 'text-gray-400'
                                    }`} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onFocus={() => setFocusedInput('confirmPassword')}
                                    onBlur={() => setFocusedInput(null)}
                                    placeholder="Confirm your password"
                                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}
                        {/* Submit Button */}
                        <button
                            onClick={handleRegister}
                            disabled={loading}
                            className={`w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 transition-all
              ${loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>

                    {/* Terms */}
                    <p className="text-xs text-gray-500 mt-8 text-center leading-relaxed">
                        By creating an account, you agree to SnapURL's{" "}
                        <a href="#" className="text-gray-700 underline hover:text-gray-900 transition-colors">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-gray-700 underline hover:text-gray-900 transition-colors">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#F3F4EF] items-center justify-center p-8">
                <div className="text-center">
                    <Image width={500} height={500} src="/vector/connect2.png" alt="" />
                    <h3 className="text-2xl font-bold text-gray-900">
                        Connect SnapURL to the Links you use every day
                    </h3>
                </div>
            </div>
        </div>
    );
}