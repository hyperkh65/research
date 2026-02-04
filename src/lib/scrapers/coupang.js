import { createProduct, SITES } from '../types';
import { scrapeWithPlaywright } from '../playwright-browser';

// 쿠팡은 API 인터셉트가 매우 어렵습니다 (암호화됨).
// 대신, 모바일 페이지가 생각보다 봇 탐지가 약하다는 점을 이용해
// Playwright 모바일 모드로 HTML 파싱을 시도합니다.

export const scrapeCoupang = async (query) => {
    const searchUrl = `https://m.coupang.com/nm/search?q=${encodeURIComponent(query)}`;

    console.log('[Coupang Mobile] Starting stealth scrape...');

    return await scrapeWithPlaywright(searchUrl, (html) => {
        const cheerio = require('cheerio');
        const $ = cheerio.load(html);
        const products = [];

        console.log(`[Coupang Mobile] HTML Size: ${html.length}`);

        // 모바일 쿠팡 리스트 아이템
        $('li.renew-product-item, .product-item, li').each((i, el) => {
            if (products.length >= 15) return;
            const $el = $(el);

            // 이름
            let name = $el.find('.renew-product-name, .name, .title').text().trim();
            if (!name) return;

            // 가격
            const priceText = $el.find('.renew-product-price, .price, .price-value').text();
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));
            if (!price || price < 100) return;

            // 이미지
            const image = $el.find('img').attr('src') || $el.find('img').attr('data-src');

            // 링크
            let link = $el.find('a').attr('href');
            if (link && !link.startsWith('http')) {
                link = `https://m.coupang.com${link}`;
            }

            if (name && price) {
                products.push(createProduct({
                    site: SITES.COUPANG,
                    name,
                    price,
                    image,
                    link,
                    specs: { "Type": "Rocket" }
                }));
            }
        });

        console.log(`[Coupang] Found ${products.length} items`);
        return products;
    }, { mobile: true });
};
