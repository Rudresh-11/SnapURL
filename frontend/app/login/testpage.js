"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Add your Google OAuth logic here
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    console.log('Email login:', { email, password });
    // Add your email login logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-orange-500">snapurl</h1>
          </div>

          {/* Login Form */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Log in and start sharing
            </h2>
            <p className="text-gray-600 mb-8">
              Don't have an account?{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </p>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="text-right mb-6">
                <a href="#" className="text-blue-600 text-sm hover:underline">
                  Forgot your password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log in
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-6">
              By logging in with an account, you agree to SnapURL's{' '}
              <a href="#" className="underline">
                Terms of Service
              </a>
              ,{' '}
              <a href="#" className="underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="#" className="underline">
                Acceptable Use Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-50 to-blue-50 items-center justify-center p-8">
        <div className="text-center">
          {/* Placeholder for illustration */}
          <Image width={500} height={500} src={"/vector/qr.jpg"}/>
          <h3 className="text-2xl font-bold text-gray-900">
            Connect SnapURL to the Links you use every day
          </h3>
        </div>
      </div>
    </div>
  );
}