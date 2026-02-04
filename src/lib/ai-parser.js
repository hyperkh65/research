/**
 * AI Powered Spec Parser
 * In a real scenario, this would call Gemini/GPT API
 * to extract structured data from messy HTML strings.
 */
export const extractSpecsWithAI = async (rawHtmlTable, categoryHint = 'general') => {
    console.log(`AI Parsing specs for category: ${categoryHint}`);

    // Fallback: If no AI key, use simple regex or return raw
    // For now, we mock the intelligence
    return {
        "Brand": "Apple",
        "Model": "MacBook Pro",
        "Processor": "M3 Max",
        "Memory": "32GB",
        "Display": "14-inch Liquid Retina"
    };
};
