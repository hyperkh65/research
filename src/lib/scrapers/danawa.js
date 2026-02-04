import * as cheerio from 'cheerio';
import { createProduct, SITES } from '../types';
import { scrapeWithPlaywright } from '../playwright-browser';

/**
 * Danawa Intelligence Scraper - Balanced Edition
 * Extracts reviews, scores, detailed specs (all rows/cols), and cleans shipping text.
 * Gallery/Description images removed as per user request to keep it light.
 */
export const scrapeDanawa = async (query) => {
    const searchUrl = `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(query)}&tab=main`;
    console.log('[Danawa] Phase 1: Locating products...');

    const initialProducts = await scrapeWithPlaywright(searchUrl, (html) => {
        const $ = cheerio.load(html);
        const items = [];

        $('.prod_main_info').each((i, el) => {
            if (i >= 5) return;

            const $el = $(el);
            const nameEl = $el.find('.prod_name a');
            const name = nameEl.text().trim();
            if (!name) return;

            let link = nameEl.attr('href');
            if (link) {
                if (link.startsWith('//')) link = `https:${link}`;
                else if (!link.startsWith('http')) {
                    link = `https://prod.danawa.com/info/${link.startsWith('/') ? link.substring(1) : link}`;
                }
            }

            const priceStr = $el.find('.price_sect strong').first().text().replace(/[^0-9]/g, '');
            const price = parseInt(priceStr) || 0;

            let thumb = $el.find('.thumb_link img').attr('src') || $el.find('.thumb_link img').attr('data-original');
            if (thumb && thumb.startsWith('//')) thumb = `https:${thumb}`;

            items.push({
                site: SITES.DANAWA,
                name,
                price,
                image: thumb,
                link,
                specs: {}
            });
        });
        return items;
    });

    console.log(`[Danawa] Phase 2: Mining deep intelligence...`);

    const detailTasks = initialProducts.map(async (product) => {
        if (!product.link) return product;

        try {
            const minedResult = await scrapeWithPlaywright(product.link, async (html, page) => {
                const scrapedData = await page.evaluate(async () => {
                    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

                    window.scrollBy(0, 800);
                    await sleep(1000);

                    const cleanShipping = (text) => {
                        if (!text) return '유료';
                        if (text.includes('무료')) return '무료배송';
                        const match = text.match(/[\d,]+원/);
                        return match ? match[0] : '유료';
                    };

                    const offers = [];
                    const items = document.querySelectorAll('.list-item, tr.diff_lowest_price, .lowest_list_item');
                    items.forEach(item => {
                        if (offers.length >= 8) return;
                        const img = item.querySelector('.box__logo img, .mall img, .d_mall img');
                        const textMall = item.querySelector('.text__mall, .mall_name, .box__name');
                        let mall = (img ? img.alt : null) || (textMall ? textMall.textContent.trim() : '');

                        const priceEl = item.querySelector('.box__price .text__num, .price .num, .prc_c');
                        const priceVal = priceEl ? parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) : 0;

                        const shipEl = item.querySelector('.box__delivery, .ship .stxt, .d_ship .stxt');
                        const rawShip = shipEl ? shipEl.textContent.trim() : '';

                        if (mall && priceVal > 0) {
                            offers.push({ mall, price: priceVal, shipping: cleanShipping(rawShip) });
                        }
                    });

                    let score = 0;
                    let revCount = 0;

                    const scoreEl = document.querySelector('#productReviewArea .prc_c, .point_num, .score_avg, .rank_uv .num');
                    if (scoreEl) score = parseFloat(scoreEl.textContent.replace(/[^0-9.]/g, ''));

                    const revEl = document.querySelector('#productOpinionTabCount, #productReviewArea .num_c, .cnt_uv, .count_review em');
                    if (revEl) revCount = parseInt(revEl.textContent.replace(/[^0-9]/g, ''));

                    if (score === 0 || revCount === 0) {
                        try {
                            const ldJsonEl = document.querySelector('script[type="application/ld+json"]');
                            if (ldJsonEl) {
                                const ldData = JSON.parse(ldJsonEl.textContent);
                                const rating = ldData.aggregateRating || (Array.isArray(ldData) ? ldData.find(d => d.aggregateRating)?.aggregateRating : null);
                                if (rating) {
                                    if (score === 0) score = parseFloat(rating.ratingValue);
                                    if (revCount === 0) revCount = parseInt(rating.reviewCount);
                                }
                            }
                        } catch (e) { }
                    }

                    const specTable = {};
                    const specRows = document.querySelectorAll('.detail_spec_list tr, .prod_spec tr');
                    specRows.forEach(row => {
                        const ths = row.querySelectorAll('th');
                        const tds = row.querySelectorAll('td');
                        for (let k = 0; k < ths.length; k++) {
                            const th = ths[k];
                            const td = tds[k];
                            if (th && td) {
                                const key = th.textContent.trim();
                                const val = td.textContent.trim().replace(/\s+/g, ' ');
                                if (key && val && key !== '') specTable[key] = val;
                            }
                        }
                    });

                    const baseImg = document.querySelector('#baseImage, .photo_w img, .thumb_main img');
                    const image = baseImg ? baseImg.src.split('?')[0] : null;
                    const catEls = Array.from(document.querySelectorAll('.loc_item a'));
                    const category = catEls.slice(1).map(a => a.textContent.trim()).join(' > ');

                    return { offers, image, category, score, revCount, specTable };
                });

                return {
                    ...product,
                    image: scrapedData.image || product.image,
                    review_count: scrapedData.revCount || 0,
                    review_score: scrapedData.score || 0,
                    detailed_specs: scrapedData.specTable || {},
                    specs: {
                        ...product.specs,
                        category: scrapedData.category,
                        offers: scrapedData.offers
                    }
                };
            }, {
                waitUntil: 'networkidle'
            });

            // Handle failed mine (returns [] or null from scrapeWithPlaywright)
            if (!minedResult || (Array.isArray(minedResult) && minedResult.length === 0)) {
                return product;
            }
            return minedResult;
        } catch (e) {
            console.error(`[Deep Mine Error] ${product.name}:`, e.message);
            return product;
        }
    });

    const results = await Promise.all(detailTasks);
    return results.map(p => createProduct(p));
};
