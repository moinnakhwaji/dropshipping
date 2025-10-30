import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { runAllScrapers } from './src/controllers/scraper.js';
import { analyzeProductTrends } from './src/controllers/trendAnalyzer.js';
import { fileURLToPath } from 'url';

/// --- Fix __dirname in ESM ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const PORT = 4000;
const TRENDING_PRODUCTS_PATH = path.join(__dirname, 'trending_products.json');

// --- In-Memory Cache ---
let productDataCache = null;
let isDataProcessing = false; // Prevent multiple concurrent scrapes

// --- Initialize Express App ---
const app = express();

// --- Middleware ---
app.use(cors());

// --- Main Data Processing Function ---
async function updateProductData() {
  if (isDataProcessing) {
    console.log('🔄 Data processing is already in progress. Skipping new run.');
    return;
  }

  console.log('🚀 Starting the product research process...');
  isDataProcessing = true;

  try {
    // Step 1: Scrape data from all sources
    await runAllScrapers();

    // Step 2: Analyze the scraped data for trends
    await analyzeProductTrends();

    // Step 3: Load data into cache
    const data = await fs.readFile(TRENDING_PRODUCTS_PATH, 'utf8');
    productDataCache = JSON.parse(data);

    console.log('✅ Backend data processing finished. Cache is updated!');
  } catch (error) {
    console.error('❌ Error during data update process:', error);
  } finally {
    isDataProcessing = false;
  }
}

// --- API Endpoint ---
app.get('/api/trending-products', (req, res) => {
  console.log('GET /api/trending-products -> Request received');

  if (productDataCache === null) {
    return res.status(202).json({
      message: 'Data is being generated. Please try again in a moment.',
      data: [],
    });
  }

  res.status(200).json(productDataCache);
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`🎉 Backend server is running at http://localhost:${PORT}`);

  // Run the data update process once immediately on server start
  updateProductData();

  // Optional: Schedule scraper to run periodically (e.g., every 6 hours)
  // setInterval(updateProductData, 6 * 60 * 60 * 1000);
});