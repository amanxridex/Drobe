const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith('http')) return resolve(null);
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(dest);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      resolve(null);
    });
  });
}

async function main() {
  console.log('Launching Chrome to crawl Knot Men Homepage in detail...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

  const interceptedApi = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('sapi.knotnow.co') || url.includes('/page/') || url.includes('layout')) {
      try {
        const text = await response.text();
        interceptedApi.push({ url, status: response.status(), text });
      } catch (e) {}
    }
  });

  console.log('Navigating to https://knotnow.co/ ...');
  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 4000));

  // Dismiss location modal if present
  try {
    await page.mouse.click(195, 795);
    await new Promise(r => setTimeout(r, 1500));
  } catch (e) {}

  // Scroll progressively and capture all sections in the DOM
  console.log('Scrolling progressively down the page...');
  const totalSteps = 25;
  for (let i = 0; i < totalSteps; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, 450);
    });
    await new Promise(r => setTimeout(r, 1200));
    console.log(`Scrolled step ${i + 1}/${totalSteps}`);
  }

  // Take screenshot of scrolled page
  await page.screenshot({ path: path.resolve(__dirname, 'live_knot_men_scrolled.png') });
  console.log('Saved live_knot_men_scrolled.png');

  // Extract all section data from DOM
  const domSections = await page.evaluate(() => {
    const results = [];
    const elements = document.querySelectorAll('section, div[class*="section"], div[class*="widget"], div[style*="background-image"], div[style*="overflow-x"]');
    
    // Also inspect all elements that have background-image or significant children
    const allDivs = Array.from(document.querySelectorAll('div, section'));
    allDivs.forEach((el, idx) => {
      const bgImg = window.getComputedStyle(el).backgroundImage;
      const hasBg = bgImg && bgImg !== 'none' && !bgImg.includes('gradient');
      const rect = el.getBoundingClientRect();
      const text = el.innerText ? el.innerText.trim() : '';
      
      // Look for horizontal scrollers
      const isHorizontalScroll = el.scrollWidth > el.clientWidth && el.clientWidth > 250;
      
      if (hasBg || isHorizontalScroll) {
        // Collect product cards inside
        const cardElements = el.querySelectorAll('div[class*="card"], div[class*="product"], a[href*="product"], div[style*="border-radius"]');
        const cards = [];
        cardElements.forEach(c => {
          const img = c.querySelector('img');
          const imgSrc = img ? img.src : null;
          const cardText = c.innerText ? c.innerText.split('\n').filter(t => t.trim().length > 0) : [];
          if (imgSrc && cardText.length >= 2) {
            cards.push({ imgSrc, text: cardText });
          }
        });

        results.push({
          idx,
          tagName: el.tagName,
          className: el.className,
          bgImg,
          width: rect.width,
          height: rect.height,
          top: rect.top + window.scrollY,
          textPreview: text.slice(0, 150),
          cardsCount: cards.length,
          cards: cards.slice(0, 6)
        });
      }
    });

    return results;
  });

  fs.writeFileSync(path.resolve(__dirname, 'live_knot_men_dom_sections.json'), JSON.stringify(domSections, null, 2));
  fs.writeFileSync(path.resolve(__dirname, 'live_knot_men_intercepted_api.json'), JSON.stringify(interceptedApi, null, 2));
  console.log(`Captured ${domSections.length} DOM elements and ${interceptedApi.length} API calls.`);

  await browser.close();
}

main().catch(console.error);
