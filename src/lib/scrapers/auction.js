import * as cheerio from 'cheerio';
import { createProduct, SITES } from '../types';
import { scrapeWithPlaywright } from '../playwright-browser';

export const scrapeAuction = async (query) => {
    // 옥션 모바일 검색
    const searchUrl = `https://m.search.auction.co.kr/search?keyword=${encodeURIComponent(query)}`;

    console.log('[Auction Mobile] Starting scrape...');

    return await scrapeWithPlaywright(searchUrl, (html) => {
        const $ = cheerio.load(html);
        const products = [];

        console.log(`[Auction] HTML Size: ${html.length}`);

        // 디버깅: HTML 내에서 'ItemName' 같은 키워드가 있는지 확인 (JSON 데이터 여부)
        if (html.includes('ItemName')) {
            console.log('[Auction] JSON data detected in HTML');
        }

        // Strategy: Link based search for Mobile
        // 모바일 옥션은 <a> 태그 안에 텍스트와 가격이 다 들어있는 경우가 많음
        $('a').each((i, el) => {
            if (products.length >= 15) return;
            const $el = $(el);
            const href = $el.attr('href') || '';
            const text = $el.text();

            // 옥션 상품 링크 특징 (itempage, ItemID 등)
            if (!href.includes('itempage') && !href.includes('ItemID')) return;

            // 가격 찾기 (숫자와 '원'이 포함된 텍스트)
            const priceMatch = text.match(/([\d,]+)원/);
            if (!priceMatch) return;

            const price = parseInt(priceMatch[1].replace(/,/g, ''));
            if (price < 100) return;

            // 이름 찾기 (가격 제외한 긴 텍스트)
            // 보통 이름이 가장 김
            let name = text.replace(priceMatch[0], '').trim();
            // 너무 짧으면 건너뜀 (예: '무료배송', '구매 100')
            if (name.length < 5) {
                // 이미지를 형제로 찾거나 부모에서 찾아봄
                const parentText = $el.closest('li, div').text();
                name = parentText.replace(priceMatch[0], '').trim().substring(0, 50); // 그냥 부모 텍스트 가져옴
            }

            let image = $el.find('img').attr('src') || $el.closest('li').find('img').attr('src');

            if (name && price) {
                console.log(`[Auction] Found item: ${name.substring(0, 15)}... / ${price}`);
                products.push(createProduct({
                    site: SITES.AUCTION,
                    name: name.replace(/\s+/g, ' ').substring(0, 80), // 공백 정리
                    price,
                    image: image?.startsWith('//') ? `https:${image}` : image,
                    link: href,
                    specs: { "출처": "옥션(M)" }
                }));
            }
        });

        console.log(`[Auction] Total products: ${products.length}`);
        return products;
    }, { mobile: true });
};
