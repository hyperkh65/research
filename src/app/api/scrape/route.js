import { NextResponse } from 'next/server';
import { runIntelligenceSearch } from '@/lib/engine';

export async function POST(req) {
    try {
        const { query, sites } = await req.json();

        if (!query) {
            return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
        }

        const results = await runIntelligenceSearch(query, sites);

        return NextResponse.json({
            success: true,
            results,
            count: results.length
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
