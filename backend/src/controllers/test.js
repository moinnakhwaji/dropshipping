// import { promises as fs } from 'fs';
// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// puppeteer.use(StealthPlugin());

// async function createHtmlSnapshot() {
//   console.log("--- Starting HTML Snapshot Tool for Amazon ---");
//   let browser;
//   try {
//     browser = await puppeteer.launch({ 
//       headless: true, // This can be true, we don't need to see it
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//     const page = await browser.newPage();
//     await page.setViewport({ width: 1920, height: 1080 });
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');

//     console.log("Navigating to Amazon...");
//     await page.goto('https://www.amazon.com.au/gp/bestsellers', { waitUntil: 'domcontentloaded' });
//     console.log("Page loaded. Waiting for initial content...");

//     // Wait for the body to be present
//     await page.waitForSelector('body', { timeout: 20000 });
//     console.log("Content found. Scrolling the page...");
    
//     // Scroll the page to trigger everything
//     await autoScroll(page);
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     console.log("Scrolling complete.");

//     // --- THIS IS THE MOST IMPORTANT STEP ---
//     console.log("Capturing final page HTML...");
//     const htmlContent = await page.content(); // Get the entire HTML
//     await fs.writeFile('debug_amazon_snapshot.html', htmlContent);
//     console.log("\n✅ SUCCESS! A file named 'debug_amazon_snapshot.html' has been created.");
//     console.log("   - Open this file in your regular Chrome browser.");
//     console.log("   - Use 'Inspect Element' on THAT local file to find the correct selectors.");
//     console.log("   - This is the real code your scraper is seeing.\n");

//     await browser.close();
//   } catch (error) {
//     console.error("❌ ERROR during snapshot creation:", error.message);
//     if (browser) await browser.close();
//   }
// }

// // Helper function to scroll the page
// async function autoScroll(page) {
//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       const distance = 100;
//       const maxScrolls = 30;
//       let scrollCount = 0;
//       const timer = setInterval(() => {
//         const scrollHeight = document.body.scrollHeight;
//         window.scrollBy(0, distance);
//         totalHeight += distance;
//         scrollCount++;
//         if (totalHeight >= scrollHeight - window.innerHeight || scrollCount >= maxScrolls) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 100);
//     });
//   });
// }

// // Run the snapshot tool directly
// createHtmlSnapshot();


// import { promises as fs } from 'fs';
// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import dotenv from 'dotenv';

// // Load environment variables from .env file
// dotenv.config();
// puppeteer.use(StealthPlugin());

// async function spyOnInstagram() {
//   console.log("\n--- LAUNCHING SPY BROWSER FOR INSTAGRAM ---");
//   const cookiesPath = 'instagram_cookies.json';
//   let browser;

//   try {
//     browser = await puppeteer.launch({
//       headless: false,  // You MUST see the browser window
//       devtools: true,   // It will open the DevTools for you automatically
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//     const page = await browser.newPage();
//     await page.setViewport({ width: 1280, height: 800 });

//     // Try to load saved cookies
//     try {
//       const cookiesString = await fs.readFile(cookiesPath);
//       const cookies = JSON.parse(cookiesString);
//       await page.setCookie(...cookies);
//       console.log("✅ Instagram session cookies loaded successfully.");
//     } catch (e) {
//       console.log("⚠️ No Instagram cookies found. You may need to log in manually.");
//     }

//     const hashtag = 'australianmade';
//     console.log(`Navigating to hashtag #${hashtag}...`);
//     await page.goto(`https://www.instagram.com/explore/tags/${hashtag}/`, { waitUntil: 'networkidle2' });

//     console.log("\n✅ BROWSER IS NOW PAUSED FOR 5 MINUTES.");
//     console.log("   - A Chromium window is open with its own Developer Tools.");
//     console.log("   - Use the DevTools in THAT window to find the correct selector for a post card.");
//     console.log("   - Test your selector in the CONSOLE of THAT window.");
//     console.log("   - Right-click the correct HTML -> Copy -> Copy outerHTML.");
//     console.log("   - Paste the HTML into our chat, then close the browser window.\n");

//     // This line pauses the script for 5 minutes (300,000 milliseconds)
//     await new Promise(resolve => setTimeout(resolve, 300000));

//     await browser.close();

//   } catch (error) {
//     console.error("❌ ERROR during Instagram spy session:", error.message);
//     if (browser) await browser.close();
//   }
// }

// // Run the spy function directly
// spyOnInstagram();




import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Tell puppeteer to use the stealth plugin to avoid bot detection
puppeteer.use(StealthPlugin());

async function spyOnAliExpress() {
  console.log("\n--- LAUNCHING SPY BROWSER FOR ALIEXPRESS ---");
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: false,  // You MUST see the browser window
      devtools: true,   // It will open the DevTools for you automatically
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--start-maximized' // Start with a full-screen window
      ]
    });
    const page = await browser.newPage();
    
    // Set a realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');

    const searchUrl = 'https://www.aliexpress.com/wholesale?SearchText=trending+products';
    console.log(`Navigating to AliExpress search page...`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    console.log("Page navigation complete.");

    // --- MANUAL INTERACTION STEP ---
    // If you see the slider CAPTCHA, solve it manually now.
    // If you see a pop-up, close it manually.

    console.log("\n✅ BROWSER IS NOW PAUSED FOR 5 MINUTES.");
    console.log("   - A Chromium window is open with its own Developer Tools.");
    console.log("   - Your goal is to find the correct CSS selectors.");
    console.log("\n   --- YOUR TASKS ---");
    console.log("   1. Find the selector for the CONTAINER that holds all the product cards. Test it in the console with `document.querySelectorAll('YOUR_SELECTOR')`.");
    console.log("   2. Find the selector for the PRODUCT TITLE within one of those cards.");
    console.log("   3. Find the selector for the PRODUCT PRICE.");
    console.log("   4. Find the selector for the PRODUCT IMAGE.");
    console.log("   5. Once you have the selectors, paste them into our chat.");
    console.log("\n   You can close the browser window when you are done.\n");

    // This line pauses the script for 5 minutes (300,000 milliseconds)
    await new Promise(resolve => setTimeout(resolve, 300000));

    console.log("Spy session finished.");
    await browser.close();

  } catch (error) {
    console.error("❌ ERROR during AliExpress spy session:", error.message);
    if (browser) await browser.close();
  }
}

// Run the spy function directly
spyOnAliExpress();