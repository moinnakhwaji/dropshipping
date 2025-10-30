import React from 'react';

const Loader = () => {
  return (
    // Flex container to center the spinner
    <div className="flex justify-center items-center py-20">
      {/* The spinner element with Tailwind CSS classes */}
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;