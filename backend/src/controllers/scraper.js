import { promises as fs } from 'fs';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';


// Tell puppeteer to use the stealth plugin and load environment variables
puppeteer.use(StealthPlugin());
dotenv.config();





// --- FINAL, ACTIONABLE Amazon Scraper ---
export async function scrapeAmazon() {
  console.log("--- Starting FINAL Amazon Scrape ---");
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
    await page.goto('https://www.amazon.com.au/gp/bestsellers', { waitUntil: 'domcontentloaded' });
    const productSelector = 'li.a-carousel-card';
    await page.waitForSelector(productSelector, { timeout: 20000 });
    await autoScroll(page);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const products = await page.evaluate((selector) => {
      const items = [];
      document.querySelectorAll(selector).forEach(item => {
        const linkElement = item.querySelector('a.a-link-normal');
        if (!linkElement) return;

        const productUrl = linkElement.href;
        const title = item.querySelector('div.p13n-sc-truncate-desktop-type2')?.innerText;
        const price = item.querySelector('span.p13n-sc-price')?.innerText;
        const imageUrl = item.querySelector('img')?.src;
        
        if (title && imageUrl && !title.includes("Next page")) {
          items.push({ title, price: price || 'N/A', imageUrl, productUrl, source: 'Amazon' });
        }
      });
      return items;
    }, productSelector);

    console.log(`✅ Amazon Scrape Complete. Found ${products.length} items.`);
    await browser.close();
    return products;
  } catch (error) {
    console.error("❌ ERROR during FINAL Amazon Scrape:", error.message);
    if (browser) await browser.close();
    return [];
  }
}

// --- MODIFIED eBay Scraper (Now with selectable time filter) ---
// --- REVISED and MORE RELIABLE eBay Scraper ---
export async function scrapeEbay() {
    console.log("--- Starting eBay Scrape (Sorting by Newly Listed) ---");
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // RELIABLE URL: We search for "trending" and sort by "Newly listed" (_sop=10).
        // This is the most effective way to find recent products without using unreliable time filters.
        const ebayUrl = 'https://www.ebay.com.au/sch/i.html?_from=R40&_nkw=trending&_sacat=0&_sop=10&LH_PrefLoc=1';
        
        await page.goto(ebayUrl, { waitUntil: 'networkidle2' });

        // IMPORTANT: Wait for the product list to appear before trying to scrape it.
        const itemSelector = 'li.s-item';
        await page.waitForSelector(itemSelector, { timeout: 20000 }); // Wait up to 20 seconds

        const products = await page.evaluate((selector) => {
            const items = [];
            // We specifically ignore the first item, as it's often a "sponsored" or non-product result.
            document.querySelectorAll(selector).forEach((item, index) => {
                if (index === 0) return;

                const titleElement = item.querySelector('div.s-item__title, h3.s-item__title');
                const title = titleElement ? titleElement.innerText.trim() : null;

                const priceElement = item.querySelector('span.s-item__price');
                const price = priceElement ? priceElement.innerText.trim() : 'N/A';

                const imageUrlElement = item.querySelector('div.s-item__image-wrapper img');
                const imageUrl = imageUrlElement ? imageUrlElement.src : null;
                
                const productUrlElement = item.querySelector('a.s-item__link');
                const productUrl = productUrlElement ? productUrlElement.href : null;

                const soldCountElement = item.querySelector('span.s-item__hotness, span.s-item__sold-count');
                const soldCount = soldCountElement ? soldCountElement.innerText.trim() : '0 sold';

                if (title && imageUrl && productUrl && !title.includes('Shop on eBay')) {
                    items.push({ 
                        title, 
                        price, 
                        imageUrl, 
                        productUrl, 
                        source: 'eBay', 
                        ratingsCount: soldCount 
                    });
                }
            });
            return items;
        }, itemSelector);
        
        console.log(`✅ eBay Scrape Complete. Found ${products.length} items.`);
        await browser.close();
        return products;
    } catch (error) {
        console.error("❌ ERROR during eBay Scrape:", error.message);
        if (browser) await browser.close();
        return [];
    }
}

// --- FINAL, RELIABLE Instagram Scraper (Grid Only) ---
export async function scrapeInstagram() {
  console.log("--- Starting FINAL Instagram Scrape (Grid Only) ---");
  const cookiesPath = 'instagram_cookies.json';
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    const cookiesString = await fs.readFile(cookiesPath);
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
    const hashtag = 'amazonfinds';
    await page.goto(`https://www.instagram.com/explore/tags/${hashtag}/`, { waitUntil: 'networkidle2' });
    const postSelector = 'a[href^="/p/"]';
    await page.waitForSelector(postSelector, { timeout: 20000 });
    await autoScroll(page);

    const products = await page.evaluate((selector) => {
      const items = [];
      const postElements = Array.from(document.querySelectorAll(selector));
      postElements.slice(0, 18).forEach(item => {
        const productUrl = item.href;
        const imageUrl = item.querySelector('img')?.src;
        const title = item.querySelector('img')?.alt;
        if (imageUrl && title) {
          items.push({ title, imageUrl, productUrl, source: 'Instagram' });
        }
      });
      return items;
    }, postSelector);

    console.log(`✅ Instagram Scrape Complete. Found ${products.length} items.`);
    await browser.close();
    return products;
  } catch (error) {
    console.error("❌ ERROR during FINAL Instagram Scrape:", error.message);
    if (browser) await browser.close();
    return [];
  }
}

// --- TikTok Scraper (Skipped Gracefully) ---
export async function scrapeTikTok() {
  console.log("--- TikTok Scrape SKIPPED (Blocked in region, requires proxy) ---");
  return [];
}
// --- AliExpress Product Discovery Scraper ---
// --- AliExpress Product Discovery Scraper ---
export async function scrapeAliExpress() {
  console.log("--- Starting AliExpress Product Discovery Tool ---");
  let browser;
  try {
    browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');

    const discoveryQueries = [
        'tiktok finds',
        'dropshipping winners',
        'innovative kitchen gadgets',
        'unique pet supplies',
        'car accessories cool'
    ];

    let allProducts = [];

    for (const query of discoveryQueries) {
        console.log(`\n🔎 Searching for: "${query}" with AU filter...`);
        const searchQuery = encodeURIComponent(query);
        const searchUrl = `https://www.aliexpress.com/wholesale?SearchText=${searchQuery}&SortType=total_tranpro_desc&shipTo=AU`;
        
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        const productSelector = 'a[href*="/item/"]';
        try {
            await page.waitForSelector(productSelector, { timeout: 15000 });
        } catch {
            console.log(`No results found for "${query}", skipping.`);
            continue;
        }

        const productsOnPage = await page.evaluate((selector) => {
            const items = [];
            const productCards = Array.from(document.querySelectorAll(selector)).slice(0, 20);

            productCards.forEach(card => {
                const titleElement = card.querySelector('h3');
                const priceElement = card.querySelector('div[class*="multi--price-sale"]');
                const imageElement = card.querySelector('img');
                const soldElement = card.querySelector('span[class*="multi--trade"]');
                const ratingElement = card.querySelector('span[class*="multi--starScore"]');

                const title = titleElement ? titleElement.innerText : null;
                const price = priceElement ? priceElement.innerText : 'N/A';
                const imageUrl = imageElement ? imageElement.src : null;
                const productUrl = card.href;

                const soldCountText = soldElement ? soldElement.innerText : '0';
                const soldCount = parseInt(soldCountText.replace(/[^0-9]/g, '')) || 0;

                const ratingText = ratingElement ? ratingElement.innerText : '0';
                const rating = parseFloat(ratingText) || 0;
                
                if (title && imageUrl && productUrl) {
                    items.push({ 
                        title, 
                        price, 
                        imageUrl, 
                        productUrl, 
                        source: 'AliExpress',
                        soldCount,
                        rating
                    });
                }
            });
            return items;
        }, productSelector);
        
        allProducts.push(...productsOnPage);
        console.log(`Found ${productsOnPage.length} potential products for "${query}".`);
    }

    const productMap = new Map();
    allProducts.forEach(p => {
        if (!productMap.has(p.productUrl)) {
            productMap.set(p.productUrl, p);
        }
    });
    const uniqueProducts = Array.from(productMap.values());

    console.log(`✅ AliExpress Discovery Complete. Found ${uniqueProducts.length} unique dropshipping products.`);
    await browser.close();
    return uniqueProducts;

  } catch (error) {
    console.error("❌ ERROR during AliExpress Discovery:", error.message);
    if (browser) await browser.close();
    return [];
  }
}


// --- Helper function to scroll the page ---
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const maxScrolls = 30;
      let scrollCount = 0;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrollCount++;
        if (totalHeight >= scrollHeight - window.innerHeight || scrollCount >= maxScrolls) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// --- Main Function to Run All Scrapers ---
export async function runAllScrapers(ebayTimeFilter = 7) {
  console.log(`🚀 Starting all working scrapers with eBay filter set to last ${ebayTimeFilter} days...`);
  const aliExpressProducts = await scrapeAliExpress();
  const amazonProducts = await scrapeAmazon();
  const ebayProducts = await scrapeEbay(ebayTimeFilter);
  const instagramProducts = await scrapeInstagram();
  const tiktokProducts = await scrapeTikTok();


  const allProducts = [...amazonProducts, ...ebayProducts, ...instagramProducts, ...tiktokProducts, ...aliExpressProducts];
  console.log(`\n📦 Total items scraped from all sources: ${allProducts.length}`);

  await fs.writeFile('scraped_products.json', JSON.stringify(allProducts, null, 2));
  console.log('💾 All data saved to scraped_products.json');
  return allProducts;
}