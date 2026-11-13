import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-4">
        <div className="w-16 h-16 bg-warm-100 text-warm-700 rounded-3xl flex items-center justify-center mx-auto">
          <Utensils className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900">404</h1>
        <h2 className="text-lg font-bold text-gray-800">Page Not Found</h2>
        <p className="text-xs text-gray-500">
          The requested page or food listing could not be found.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

