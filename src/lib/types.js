/**
 * Market Intelligence Platform - Shared Types & Interfaces
 */

export const SITES = {
    NAVER: 'naver',
    COUPANG: 'coupang',
    DANAWA: 'danawa',
    GMARKET: 'gmarket',
    AUCTION: 'auction'
};

export const createProduct = (data) => ({
    id: data.id || Math.random().toString(36).substr(2, 9),
    site: data.site,
    name: data.name || 'Untitled Product',
    price: data.price || 0,
    currency: data.currency || 'KRW',
    image: data.image || '',
    link: data.link || '',
    specs: data.specs || {},
    review_count: data.review_count || 0,
    review_score: data.review_score || 0,
    detailed_specs: data.detailed_specs || {},
    gallery_images: data.gallery_images || [],
    description_images: data.description_images || [],
    timestamp: new Date().toISOString()
});
