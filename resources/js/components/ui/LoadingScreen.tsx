import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message, 
  fullScreen = false 
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-100 dark:border-blue-900/30 rounded-full" />
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin absolute top-0 left-0" />
        </div>
        {message && (
          <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  }

  // Skeleton placeholder for page loading
  return (
    <div className="w-full h-full min-h-[400px] animate-pulse p-4">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"></div>
        ))}
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-[300px] p-4">
         <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
         <div className="space-y-3">
           <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
           <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
           <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
         </div>
      </div>
    </div>
  );
};
