import React from 'react';
export const PageSkeleton = () => (
  <div className="max-w-7xl mx-auto p-6 lg:p-8 animate-pulse">
    <div className="mb-8 flex justify-between">
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {[1,2,3,4].map(i => (
        <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"></div>
      ))}
    </div>
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[400px]">
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded w-full mb-6"></div>
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex gap-4 mb-4">
          <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded w-12"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
