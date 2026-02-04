import { createProduct, SITES } from '../types';
import { scrapeWithResponseInterceptor } from '../playwright-browser';

export const scrapeNaver = async (query) => {
    // 네이버 모바일 검색 URL
    const searchUrl = `https://m.search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}`;

    // 네이버 API URL 패턴 (네트워크 탭에서 확인된 패턴)
    // 보통 graphql 또는 search/all 로 들어옴
    const apiPattern = 'search/all';

    console.log('[Naver Interceptor] Starting...');

    const responses = await scrapeWithResponseInterceptor(searchUrl, apiPattern);
    const products = [];

    // 캡처된 JSON 데이터 분석
    for (const json of responses) {
        // 네이버 JSON 구조 탐색 (구조는 변할 수 있으므로 광범위 탐색)
        try {
            // 1. 일반적인 상품 리스트 구조 확인
            const items = json?.props?.pageProps?.initialState?.products?.list
                || json?.shoppingResult?.products
                || [];

            for (const item of items) {
                if (products.length >= 10) break;

                const product = item.item || item; // 구조에 따라 다름

                const name = product.productTitle || product.name || product.title;
                const price = product.price || product.lowPrice || product.mobilePrice;
                const image = product.imageUrl || product.thumbnailUrl;
                const link = product.mallProductUrl || product.crUrl;

                if (name && price) {
                    products.push(createProduct({
                        site: SITES.NAVER,
                        name: name,
                        price: parseInt(price),
                        image: image,
                        link: link,
                        specs: { "출처": "네이버(API)" }
                    }));
                }
            }
        } catch (e) {
            // JSON 구조가 다를 수 있음
        }
    }

    console.log(`[Naver] Intercepted ${products.length} products`);
    return products;
};
