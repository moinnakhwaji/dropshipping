
// ============================================
// FILE 1: ProductCard.jsx
// ============================================

import React from 'react';

// You can add more styles if you want
const sourceStyles = {
  Amazon: 'bg-orange-500 text-white',
  eBay: 'bg-red-600 text-white',
  Instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  AliExpress: 'bg-red-500 text-white',
  Alibaba: 'bg-orange-600 text-white',
  Facebook: 'bg-blue-600 text-white',
  Default: 'bg-gray-500 text-white',
};

const ProductCard = ({ product }) => {
  // Destructure all potential new props
  const { title, source, price, imageUrl, productUrl, trendScore, soldCount, rating } = product;
  const badgeStyle = sourceStyles[source] || sourceStyles.Default;

  return (
    <a 
      href={productUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl no-underline"
    >
      <div className="relative">
        {imageUrl && (
          <div className="w-full h-48 bg-gray-200">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full self-start ${badgeStyle}`}>
            {source}
          </span>
          {trendScore > 1 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500 text-white">
              Trend Score: {trendScore}
            </span>
          )}
        </div>
        
        <h2 className="text-md font-bold text-slate-800 mt-3 mb-2 flex-grow">
          {title}
        </h2>
        
        {/* --- NEW DATA DISPLAY --- */}
        <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
          <div className="flex flex-col text-left">
            {/* Display Rating if it exists */}
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-bold text-slate-700">{rating.toFixed(1)}</span>
              </div>
            )}
            {/* Display Sold Count if it exists */}
            {soldCount > 0 && (
              <div className="text-xs text-slate-500">
                {soldCount.toLocaleString()} sold
              </div>
            )}
          </div>

          <div className="text-right">
            {price && price !== 'N/A' && (
              <p className="text-slate-900 font-bold text-lg">{price}</p>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};

export default ProductCard;