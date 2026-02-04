import { chromium } from 'playwright';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getStealthBrowser = async () => {
    return await chromium.launch({
        headless: true,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security'
        ]
    });
};

// ... (기존 scrapeWithPlaywright 유지)

/**
 * Advanced Scraper: Intercepts JSON API responses
 * This bypasses UI changes and extracts raw data directly from backend APIs.
 */
export const scrapeWithResponseInterceptor = async (url, apiUrlPattern) => {
    let browser;
    try {
        browser = await getStealthBrowser();
        const context = await browser.newContext({
            viewport: { width: 390, height: 844 }, // Mobile
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
            locale: 'ko-KR'
        });

        const page = await context.newPage();
        const capturedData = [];

        // Response Listener
        page.on('response', async response => {
            const requestUrl = response.url();
            // Check if URL matches the API pattern we are looking for
            if (requestUrl.includes(apiUrlPattern)) {
                console.log(`[Interceptor] Captured API: ${requestUrl}`);
                try {
                    const json = await response.json();
                    capturedData.push(json);
                } catch (e) {
                    // Ignore non-JSON responses
                }
            }
        });

        console.log(`[Interceptor] Navigating to: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        // Scroll to trigger lazy loaded APIs
        await page.evaluate(() => window.scrollBy(0, 1000));
        await sleep(2000);

        await browser.close();
        return capturedData;

    } catch (error) {
        console.error(`[Interceptor] Error:`, error.message);
        if (browser) await browser.close();
        return [];
    }
};

// Re-export original function for compatibility
export const scrapeWithPlaywright = async (url, parserFn, options = {}) => {
    let browser;
    try {
        browser = await getStealthBrowser();
        const contextOptions = {
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            locale: 'ko-KR',
        };

        if (options.mobile) {
            contextOptions.viewport = { width: 390, height: 844 };
            contextOptions.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
            contextOptions.isMobile = true;
            contextOptions.hasTouch = true;
        }

        const context = await browser.newContext(contextOptions);
        const page = await context.newPage();

        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        console.log(`[Playwright] Navigating to: ${url}`);

        // Timeout increased
        const waitUntil = options.waitUntil || 'domcontentloaded';
        await page.goto(url, { waitUntil, timeout: 60000 });

        if (options.waitForSelector) {
            try {
                // Wait for any of the selectors (if it's a comma-separated list)
                const candidateSelectors = options.waitForSelector.split(',').map(s => s.trim());
                await Promise.race(
                    candidateSelectors.map(s => page.waitForSelector(s, { timeout: 10000 }).catch(() => null))
                );
            } catch (e) { }
        }

        try {
            // Slow scroll to trigger lazy loading
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 200;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;

                        if (totalHeight >= scrollHeight - window.innerHeight || totalHeight > 3000) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            });
            await page.waitForTimeout(2000);
        } catch (e) { }

        const content = await page.content();
        const result = await parserFn(content, page);

        await browser.close();
        return result;

    } catch (error) {
        console.error(`[Playwright] Error for ${url}:`, error.message);
        if (browser) await browser.close();
        return [];
    }
};
