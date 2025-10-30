
import React, { useState, useEffect } from 'react';
import ProductCard from './components/ProductCard';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

// --- Configuration ---
const API_URL = 'http://localhost:4000/api/trending-products';
const RETRY_INTERVAL = 5000; // Ask for data every 5 seconds
const ITEMS_PER_PAGE = 12; // Products per page

// Loader Component
const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-800"></div>
  </div>
);

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedSource, setSelectedSource] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('none');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      // Log every attempt
      console.log("----------\n[FETCH] Attempting to fetch data from API...");

      try {
        const response = await fetch(API_URL);
        
        // Log the single most important piece of information: the status code
        console.log(`[FETCH] API Response Status: ${response.status} (${response.statusText})`);

        // Case 1: The data is ready and sent successfully! (200 OK)
        if (response.ok && response.status === 200) {
          console.log("[FETCH] Status is 200 OK. Parsing JSON data...");
          const finalData = await response.json();
          
          // Log the data we received before trying to render it
          console.log("[FETCH] Success! Final data received:", finalData);
          
          setProducts(finalData);
          setLoading(false); // Stop loading, show products
          return; // IMPORTANT: Stop the polling
        }

        // Case 2: The backend is still working. (202 Accepted)
        if (response.status === 202) {
          console.log(`[FETCH] Status is 202. Backend is still processing. Retrying in ${RETRY_INTERVAL / 1000} seconds.`);
          setTimeout(fetchProducts, RETRY_INTERVAL);
        } else {
          // Case 3: A real, unexpected error occurred.
          throw new Error(`Unexpected HTTP status: ${response.status}`);
        }
      } catch (e) {
        console.error("[FETCH] An error occurred in the fetch process:", e);
        setError('Failed to load products from the API. Check the console and ensure the backend is running.');
        setLoading(false);
      }
    };

    // Initial call to start the fetching process
    fetchProducts();

  }, []); // Empty array ensures this runs only once on mount

  // Get unique sources for filter dropdown
  const uniqueSources = ['All', ...new Set(products.map(p => p.source))];

  // Filter and sort products
  const filteredProducts = products
    .filter(p => selectedSource === 'All' || p.source === selectedSource)
    .filter(p => !minRating || (p.rating && p.rating >= minRating))
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price') {
        const priceA = parseFloat(a.price?.replace(/[^0-9.]/g, '') || 0);
        const priceB = parseFloat(b.price?.replace(/[^0-9.]/g, '') || 0);
        return priceA - priceB;
      }
      if (sortBy === 'sold') return (b.soldCount || 0) - (a.soldCount || 0);
      if (sortBy === 'trend') return (b.trendScore || 0) - (a.trendScore || 0);
      return 0;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSource, minRating, sortBy]);

  return (
    <div className="bg-slate-100 min-h-screen font-sans">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-4xl font-extrabold text-center text-slate-800">
            🔥 Australian Trending Products
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {loading && <Loader />}
        {error && <p className="text-center text-red-500 font-semibold p-4">{error}</p>}
        
        {!loading && !error && (
          <>
            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-slate-700 font-semibold mb-3 md:hidden"
              >
                <Filter size={20} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Source</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {uniqueSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Min Rating</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>All Ratings</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">Default</option>
                    <option value="rating">Highest Rating</option>
                    <option value="price">Lowest Price</option>
                    <option value="sold">Most Sold</option>
                    <option value="trend">Trend Score</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedSource('All');
                      setMinRating(0);
                      setSortBy('none');
                    }}
                    className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors font-medium"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-600">
                Showing {paginatedProducts.length} of {filteredProducts.length} products
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product, index) => (
                <ProductCard key={`${product.title}-${index}`} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 bg-white rounded-md shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-md transition-all ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 bg-white rounded-md shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;