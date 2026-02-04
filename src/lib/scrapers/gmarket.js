import * as cheerio from 'cheerio';
import { createProduct, SITES } from '../types';
import { scrapeWithPlaywright } from '../playwright-browser';

export const scrapeGMarket = async (query) => {
    const searchUrl = `https://browse.gmarket.co.kr/search?keyword=${encodeURIComponent(query)}`;

    console.log('[GMarket] Starting scrape...');

    return await scrapeWithPlaywright(searchUrl, (html) => {
        const $ = cheerio.load(html);
        const products = [];

        console.log(`[GMarket] HTML length: ${html.length} bytes`);

        $('.box__item-container').each((i, el) => {
            if (i >= 15) return;

            const $el = $(el);

            // 이름: 중복 제거를 위해 text-title 클래스만 정확히 타겟팅
            const nameEl = $el.find('.text__item');
            const name = nameEl.first().text().trim();

            // 가격: 정확한 클래스 타겟팅 및 첫 번째 텍스트 노드만 사용
            let price = 0;
            const priceStrong = $el.find('.box__price-seller strong.text__value').first();
            if (priceStrong.length > 0) {
                const rawPrice = priceStrong.text().replace(/[^0-9]/g, '');
                price = parseInt(rawPrice);
            }

            // 가격이 비정상적이라면 스킵
            if (!price || price < 100 || price > 100000000) return;

            const image = $el.find('img.image__item').first().attr('src');
            const link = $el.find('a.link__item').first().attr('href');

            if (name && name.length > 1) {
                products.push(createProduct({
                    site: SITES.GMARKET,
                    name,
                    price,
                    image: image?.startsWith('//') ? `https:${image}` : image,
                    link: link?.startsWith('http') ? link : `https://www.gmarket.co.kr${link}`,
                    specs: { "출처": "G마켓" }
                }));
            }
        });

        console.log(`[GMarket] Total products found: ${products.length}`);
        return products;
    });
};
