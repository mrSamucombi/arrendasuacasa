import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;