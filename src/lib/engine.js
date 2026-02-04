import { supabase, TABLE_NAME } from './supabase';
import { SITES } from './types';
import { scrapeDanawa } from './scrapers/danawa';

/**
 * Scraper Engine - Supabase Intelligence Edition
 */
export const runIntelligenceSearch = async (query, selectedSites = [SITES.DANAWA]) => {
    console.log(`Searching for: "${query}" (Supabase Mode)`);

    // 1. Check Supabase Cache
    const { data: existing, error: selectError } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('search_query', query)
        .eq('site', 'danawa')
        .gt('created_at', new Date(Date.now() - 3600 * 1000).toISOString());

    if (existing && existing.length > 0) {
        console.log(`Returning ${existing.length} cached results from Supabase.`);
        return existing.map(p => ({
            ...p,
            specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs,
            detailed_specs: typeof p.detailed_specs === 'string' ? JSON.parse(p.detailed_specs) : p.detailed_specs
        })).sort((a, b) => a.price - b.price);
    }

    if (selectError) {
        console.error("Supabase select error:", selectError.message);
        // If table doesn't exist, we'll try to insert later which might fail too, 
        // but we should proceed with scraping.
    }

    // 2. Run Scraper
    let newProducts = [];
    try {
        newProducts = await scrapeDanawa(query);
    } catch (e) {
        console.error("Danawa scraping failed:", e);
    }

    // 3. Persistent Storage (Supabase)
    if (newProducts.length > 0) {
        const productsToInsert = newProducts
            .filter(p => p && p.site) // Ensure valid product data
            .map(p => ({
                site: p.site,
                name: p.name,
                price: p.price,
                image: p.image,
                link: p.link,
                search_query: query,
                specs: p.specs || {},
                review_count: p.review_count || 0,
                review_score: p.review_score || 0,
                detailed_specs: p.detailed_specs || {}
            }));

        const { error: insertError } = await supabase
            .from(TABLE_NAME)
            .upsert(productsToInsert, { onConflict: 'link' });

        if (insertError) {
            console.error("Supabase insert error:", insertError.message);
            console.log("Tip: Make sure the table '" + TABLE_NAME + "' exists in Supabase with correct columns.");
        }
    }

    return newProducts.sort((a, b) => a.price - b.price);
};
