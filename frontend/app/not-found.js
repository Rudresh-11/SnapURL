"use client";
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>

      <p className="text-lg text-gray-600 mb-8">
        The page you're looking for doesn’t exist or has been removed.
      </p>

      <a
        href="/"
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        Go Back Home
      </a>
    </div>
  );
}
