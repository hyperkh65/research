# Supabase Setup Guide

Please run the following SQL in your Supabase SQL Editor to create the required table with the `xxxxx_` prefix.

```sql
-- Create the products table with prefix
CREATE TABLE IF NOT EXISTS xxxxx_products (
    id BIGSERIAL PRIMARY KEY,
    site TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT,
    link TEXT UNIQUE NOT NULL,
    specs JSONB DEFAULT '{}'::jsonb,
    search_query TEXT,
    review_count INTEGER DEFAULT 0,
    review_score FLOAT DEFAULT 0,
    detailed_specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ms_query ON xxxxx_products(search_query);
CREATE INDEX IF NOT EXISTS idx_ms_site ON xxxxx_products(site);

-- Enable RLS (Optional but recommended for production)
-- ALTER TABLE xxxxx_products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON xxxxx_products FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert access" ON xxxxx_products FOR INSERT WITH CHECK (true);
```

### Environment Variables
The `.env.local` file has been updated with:
- **URL**: `https://bnvbikyqktcxuytisxia.supabase.co`
- **KEY**: `sb_publishable_mg4p9bpDmT-40Crg8ymavQ_swQyHv_U`
