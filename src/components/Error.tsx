import React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  message?: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-center p-6">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
      <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
      <p className="text-gray-600 mt-2">{message || "An unexpected error occurred. Please try again later."}</p>
      <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
        Retry
      </button>
    </div>
  );
};

export default Error;
