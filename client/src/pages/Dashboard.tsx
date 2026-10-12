import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import AppNav from '../components/AppNav';
import {
  STAGE_LABELS,
  REVENUE_RANGE_LABELS,
  formatINR,
  type StageKey,
} from '../lib/constants';
import type { BrowseResponse, Listing } from '../lib/types';

export default function Dashboard() {
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<BrowseResponse>('/api/saved', { auth: true });
      setData(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved, retryKey]);

  async function handleUnsave(listingId: string) {
    // optimistic removal
    setData((prev) => prev.filter((l) => l._id !== listingId));
    try {
      await api.delete(`/api/saved/${listingId}`);
    } catch {
      // rollback by re-fetching
      fetchSaved();
    }
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          from { opacity: 1; }
          to { opacity: 0.4; }
        }
        .skeleton { animation: shimmer 1.2s ease-in-out infinite alternate; }
      `}</style>

      <AppNav />

      <main className="pt-8 pb-12">
        <div className="container">
          <header className="mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{
                fontFamily: 'var(--font-serif)',
                fontVariationSettings: "'opsz' 36",
                color: 'var(--color-ink)',
              }}
            >
              Saved listings
            </h1>
          </header>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton border p-6"
                  style={{
                    background: 'var(--color-rule)',
                    borderColor: 'var(--color-rule)',
                    minHeight: '280px',
                  }}
                >
                  <div className="mb-4 h-4" style={{ background: 'var(--color-paper)', width: '60%' }} />
                  <div className="mb-2 h-6" style={{ background: 'var(--color-paper)', width: '80%' }} />
                  <div className="mb-4 h-12" style={{ background: 'var(--color-paper)' }} />
                  <div className="h-16" style={{ background: 'var(--color-paper)' }} />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="mb-4" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                {error}
              </p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-85"
                style={{
                  backgroundColor: 'var(--color-clay)',
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="text-center py-16">
              <p
                className="mb-4 text-lg"
                style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
              >
                Nothing saved yet.
              </p>
              <Link
                to="/listings"
                className="text-sm font-semibold transition-opacity hover:opacity-85"
                style={{ color: 'var(--color-clay)', fontFamily: 'var(--font-sans)' }}
              >
                Browse listings →
              </Link>
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((listing) => (
                <div
                  key={listing._id}
                  className="border p-6 flex flex-col"
                  style={{
                    borderColor: 'var(--color-rule)',
                    background: 'var(--color-paper)',
                  }}
                >
                  {/* Top row: location + stage badge */}
                  <div
                    className="flex items-baseline justify-between mb-4 pb-3"
                    style={{ borderBottom: '1px solid var(--color-rule)' }}
                  >
                    <span
                      className="text-xs tracking-widest uppercase"
                      style={{
                        color: 'var(--color-clay)',
                        fontFamily: 'var(--font-sans)',
                        letterSpacing: '0.14em',
                      }}
                    >
                      {listing.location.city}, {listing.location.state}
                    </span>
                    <span
                      className="px-3 py-1 text-xs font-bold uppercase"
                      style={{
                        background: '#D4A853',
                        color: 'var(--color-ink)',
                        fontFamily: 'var(--font-sans)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {STAGE_LABELS[listing.stage as StageKey]}
                    </span>
                  </div>

                  {/* Business name */}
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontVariationSettings: "'opsz' 28",
                      color: 'var(--color-ink)',
                    }}
                  >
                    {listing.businessName}
                  </h3>

                  {/* 2-line description preview */}
                  {listing.description && (
                    <p
                      className="text-sm mb-4"
                      style={{
                        color: 'var(--color-ink)',
                        fontFamily: 'var(--font-sans)',
                        lineHeight: 1.6,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      } as React.CSSProperties}
                    >
                      {listing.description}
                    </p>
                  )}

                  {/* Key facts */}
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4 text-sm">
                    <div>
                      <dt
                        className="text-xs tracking-wide uppercase mb-1"
                        style={{
                          color: 'var(--color-forest)',
                          fontFamily: 'var(--font-sans)',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Revenue
                      </dt>
                      <dd style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                        {REVENUE_RANGE_LABELS[listing.revenueRange]}
                      </dd>
                    </div>
                    <div>
                      <dt
                        className="text-xs tracking-wide uppercase mb-1"
                        style={{
                          color: 'var(--color-forest)',
                          fontFamily: 'var(--font-sans)',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Seeking
                      </dt>
                      <dd style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                        {formatINR(listing.fundingGoal)}
                      </dd>
                    </div>
                  </dl>

                  {/* Footer: view link + unsave button */}
                  <div
                    className="mt-auto pt-3 flex items-center justify-between gap-3"
                    style={{ borderTop: '1px solid var(--color-rule)' }}
                  >
                    <Link
                      to={`/listings/${listing._id}`}
                      className="text-xs font-semibold transition-opacity hover:opacity-75"
                      style={{ color: 'var(--color-clay)', fontFamily: 'var(--font-sans)' }}
                    >
                      View details →
                    </Link>
                    <button
                      onClick={() => handleUnsave(listing._id)}
                      className="text-xs font-semibold transition-opacity hover:opacity-75"
                      style={{
                        color: 'var(--color-forest)',
                        fontFamily: 'var(--font-sans)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Unsave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
