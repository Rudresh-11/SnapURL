import puppeteer from "puppeteer";

export async function fetchMetadata(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Pretend to be a real browser
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });

  // Extract metadata
  const metadata = await page.evaluate(() => {
    const get = (selector) => document.querySelector(selector)?.content || null;

    return {
      title: document.title || null,
      description: get('meta[name="description"]') || get('meta[property="og:description"]'),
      image: get('meta[property="og:image"]'),
      favicon: document.querySelector('link[rel="icon"]')?.href ||
               document.querySelector('link[rel="shortcut icon"]')?.href ||
               null,
    };
  });

  await browser.close();
  return metadata;
}
