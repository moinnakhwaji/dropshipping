// --- REVISED Alibabascrapper.js with STEALTH PLUGIN ---

// STEP 1: Import the necessary stealth libraries
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// STEP 2: Tell puppeteer to USE the stealth plugin
puppeteer.use(StealthPlugin());

export async function scrapeAliExpress() {
  console.log("--- Starting AliExpress Scrape (with Stealth) ---");
  let browser;
  try {
    // STEP 3: Launch puppeteer, not the original puppeteer
    browser = await puppeteer.launch({ 
        headless: false, // Keep this false to watch it work!
        args: ['--no-sandbox'] 
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
    
    console.log("Navigating to AliExpress...");
    await page.goto('https://www.aliexpress.com/wholesale?SearchText=trending+products', { waitUntil: 'domcontentloaded' });

    // The stealth plugin should help us avoid the CAPTCHA page entirely.
    // We will wait for the product selector to appear on the *real* page.
    const productSelector = 'div#card-list > a';
    
    console.log("Waiting for product list to appear...");
    await page.waitForSelector(productSelector, { timeout: 30000 }); 
    console.log("Product list found! CAPTCHA bypassed!");

    // The rest of your scraping logic remains the same
    const products = await page.evaluate((selector) => {
      const items = [];
      document.querySelectorAll(selector).forEach(item => {
        const titleElement = item.querySelector('h3');
        const priceElement = item.querySelector('div[class*="multi--price-sale"]'); 
        const imageElement = item.querySelector('img');

        const title = titleElement ? titleElement.innerText : null;
        const price = priceElement ? priceElement.innerText : 'N/A';
        const imageUrl = imageElement ? imageElement.src : null;
        const productUrl = item.href;

        if (title && imageUrl && productUrl) {
          items.push({ title, price, imageUrl, productUrl, source: 'AliExpress' });
        }
      });
      return items;
    }, productSelector);

    console.log(`✅ AliExpress Scrape Complete. Found ${products.length} items.`);
    await browser.close();
    return products;
  } catch (error) {
    console.error("❌ ERROR during AliExpress Scrape:", error.message);
    if (browser) await browser.close();
    return [];
  }
}