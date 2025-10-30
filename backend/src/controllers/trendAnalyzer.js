import { promises as fs } from 'fs';

// --- NEW INTELLIGENT TITLE CLEANING ---
function getCleanKeywords(title) {
  // Common junk phrases found in Instagram alt text
  const stopWords = [
    'photo', 'by', 'on', 'instagram', 'may', 'be', 'an', 'image', 'of', 'and', 
    'link', 'in', 'my', 'bio', 'to', 'shop', 'amazon', 'home', 'finds', '✨',
    'amazonhome', 'amazoninfluencer', 'founditonamazon', 'amazonmusthaves',
    'amazonfavorites', 'amazonprime', 'amazonfinds', 'ltkhome', 'ltkunder', 'ad'
  ];

  let cleanedTitle = title.toLowerCase();

  // Remove hashtags, user mentions, and punctuation
  cleanedTitle = cleanedTitle.replace(/#[^\s]+/g, '').replace(/@[^\s]+/g, '').replace(/[^\w\s]/gi, '');

  // Split into words and filter out the stop words
  const keywords = cleanedTitle.split(' ').filter(word => {
    return word && !stopWords.includes(word) && isNaN(word); // Also remove standalone numbers
  });

  return new Set(keywords); // Return a Set for efficient comparison
}

function areTitlesSimilar(title1, title2, source1, source2) {
  const keywords1 = getCleanKeywords(title1);
  const keywords2 = getCleanKeywords(title2);

  if (keywords1.size === 0 || keywords2.size === 0) {
    return false;
  }

  // Find the intersection (common keywords)
  const intersection = new Set([...keywords1].filter(word => keywords2.has(word)));
  
  // A high intersection score means they are likely the same product
  // For example, if they share 2 or more specific keywords, it's a good match.
  // This is more robust than a percentage when dealing with cleaned keywords.
  if (intersection.size >= 2) {
    return true;
  }
  
  // Fallback for very short titles (e.g., "sandwich cutter")
  if (keywords1.size <= 2 || keywords2.size <= 2) {
      return intersection.size > 0;
  }

  return false;
}

export async function analyzeProductTrends() {
  console.log('📊 Starting data processing and SMART trend analysis...');
  try {
    const data = await fs.readFile('scraped_products.json', 'utf8');
    const products = JSON.parse(data);

    if (products.length === 0) {
      console.log('⚠️ No products found in scraped_products.json. Skipping.');
      await fs.writeFile('trending_products.json', JSON.stringify([], null, 2));
      return;
    }

    // --- REVISED TREND SCORE LOGIC ---
    const processedProducts = products.map((product, index) => {
      let trendScore = 1; // Start with a base score of 1

      for (let i = 0; i < products.length; i++) {
        if (i === index) continue;

        // Pass titles and sources to the similarity function
        if (areTitlesSimilar(product.title, products[i].title, product.source, products[i].source)) {
          trendScore++;
        }
      }
      return { ...product, trendScore };
    });

    // Sort products by the new, more accurate trendScore
    processedProducts.sort((a, b) => b.trendScore - a.trendScore);

    await fs.writeFile('trending_products.json', JSON.stringify(processedProducts, null, 2));
    console.log('✅ Smart analysis complete! Results saved to trending_products.json');

  } catch (error) {
    console.error('❌ FATAL ERROR during data processing:', error);
  } 
}