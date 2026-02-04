'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Star, FileText, ShoppingCart, AlertCircle, ChevronRight } from 'lucide-react';
import { SITES } from '@/lib/types';

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, sites: [SITES.DANAWA] })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      console.error("Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main style={{ background: '#fcfdfe', minHeight: '100vh', paddingBottom: '100px', fontFamily: '-apple-system, system-ui, sans-serif' }}>

      {/* Search Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '50px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#111', letterSpacing: '-0.05em', marginBottom: '8px' }}>Market Spy Intelligence</h1>
        <p style={{ color: '#666', marginBottom: '35px', fontSize: '1.1rem' }}>다나와 정밀 분석 기반 실시간 최저가 탐지</p>

        <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative' }}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="모델명이나 상품명을 입력하세요..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              suppressHydrationWarning={true}
              style={{
                width: '100%',
                padding: '22px 35px',
                borderRadius: '50px',
                border: '2px solid #222',
                fontSize: '1.2rem',
                fontWeight: 500,
                outline: 'none',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                bottom: '10px',
                width: '55px',
                borderRadius: '50%',
                background: '#222',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={22} />}
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '30px', border: '1px solid #eee', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <Loader2 className="animate-spin" size={56} style={{ margin: '0 auto 25px', color: '#007aff' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111' }}>Deep Scanning...</h3>
            <p style={{ color: '#888', marginTop: '12px', fontSize: '1.1rem' }}>제품의 모든 상세 스펙과 실시간 최저가를 동기화하는 중입니다.</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem' }}>일치하는 상품 정보를 찾을 수 없습니다.</p>
          </div>
        )}

        {results.map((product) => (
          <div key={product.id} style={{
            background: 'white',
            borderRadius: '28px',
            marginBottom: '40px',
            display: 'flex',
            overflow: 'hidden',
            border: '1px solid #eceef0',
            boxShadow: '0 12px 40px rgba(0,0,0,0.04)'
          }}>

            {/* LEFT COLUMN: Product Identity & Details (65%) */}
            <div style={{ flex: 1.5, padding: '40px', borderRight: '1px solid #f0f2f4' }}>

              {/* Identity Header */}
              <div style={{ display: 'flex', gap: '30px', marginBottom: '35px' }}>
                <div style={{ width: '220px', height: '220px', flexShrink: 0, background: '#fff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                  {product.image ? (
                    <img src={product.image} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ color: '#ccc', fontSize: '12px' }}>이미지 없음</div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#007aff', fontSize: '14px', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {product.specs?.category || 'General Product'}
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '15px', color: '#111', lineHeight: 1.3 }}>
                    <a href={product.link} target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>{product.name}</a>
                  </h3>

                  {/* Review Stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff4cc', padding: '6px 14px', borderRadius: '8px' }}>
                      <Star size={18} fill="#ffcc00" color="#ffcc00" />
                      <span style={{ fontWeight: 900, color: '#997a00', fontSize: '16px' }}>{product.review_score || '0.0'}</span>
                    </div>
                    <span style={{ color: '#777', fontSize: '14px', fontWeight: 600 }}>리뷰 {product.review_count?.toLocaleString() || 0}개</span>
                  </div>

                  {/* Key Specs (Pills) */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {Object.entries(product.specs || {})
                      .filter(([k, v]) => k.startsWith('spec_') && v)
                      .map(([k, v]) => (
                        <span key={k} style={{ padding: '7px 16px', background: '#f0f2f5', borderRadius: '50px', fontSize: '12px', color: '#444', fontWeight: 600, border: '1px solid #e1e4e8' }}>{v}</span>
                      ))}
                  </div>
                </div>
              </div>

              {/* DETAILED SPECS TABLE */}
              {product.detailed_specs && Object.keys(product.detailed_specs).length > 0 && (
                <div style={{ background: '#f9fafb', borderRadius: '20px', padding: '30px', border: '1px solid #f0f2f4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 900, marginBottom: '20px', color: '#222' }}>
                    <FileText size={20} color="#007aff" /> 기술 사양 및 상세 정보
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    {Object.entries(product.detailed_specs).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', fontSize: '13px', padding: '10px 0', borderBottom: '1px solid #eef0f2' }}>
                        <div style={{ width: '120px', fontWeight: 800, color: '#888', flexShrink: 0 }}>{key}</div>
                        <div style={{ flex: 1, color: '#333', fontWeight: 600 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Comparison & Action (35%) */}
            <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', background: '#f8f9fb' }}>

              {/* Mall Prices */}
              <div style={{ flex: 1, padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #222', paddingBottom: '15px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#111' }}>쇼핑몰별 최저가 비교</span>
                  <span style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>배송비 포함</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {product.specs?.offers && product.specs.offers.length > 0 && product.specs.offers.map((offer, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', alignItems: 'center', padding: '10px 0', borderBottom: '1px dotted #d1d5db' }}>
                      <span style={{ fontWeight: 800, color: '#333' }}>{offer.mall}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, color: idx === 0 ? '#ff3b30' : '#111', fontSize: '18px' }}>{offer.price.toLocaleString()}원</div>
                        <div style={{ fontSize: '12px', color: '#888', fontWeight: 600, marginTop: '4px' }}>{offer.shipping}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Area */}
              <div style={{ padding: '40px', background: 'white', borderTop: '1px solid #f0f2f4' }}>
                <a href={product.link} target="_blank" style={{
                  background: '#111',
                  color: 'white',
                  padding: '18px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  fontSize: '16px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }}>
                  최저가 구매하러 가기 <ChevronRight size={20} />
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>
    </main>
  );
}
