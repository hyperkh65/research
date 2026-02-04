import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'market.db');
const db = new Database(dbPath);

// Initialize Tables
db.exec(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site TEXT NOT NULL,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        image TEXT,
        link TEXT UNIQUE,
        specs TEXT,
        search_query TEXT,
        review_count INTEGER,
        review_score REAL,
        detailed_specs TEXT,
        gallery_images TEXT,
        description_images TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_query ON products(search_query);
    CREATE INDEX IF NOT EXISTS idx_site ON products(site);
`);

export default db;
