
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-10">
      <div className="relative h-16 w-16">
        <div className="absolute top-0 left-0 h-full w-full border-4 border-gray-600 rounded-full"></div>
        <div className="absolute top-0 left-0 h-full w-full border-t-4 border-purple-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-purple-400 font-semibold">Analyzing trends and crafting content...</p>
      <p className="text-gray-400 text-sm">This may take a moment.</p>
    </div>
  );
};
