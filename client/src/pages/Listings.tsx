import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import AppNav from '../components/AppNav';
import {
  STAGE_LABELS,
  STAGE_OPTIONS,
  REVENUE_RANGE_LABELS,
  INDUSTRY_OPTIONS,
  formatINR,
  type StageKey,
} from '../lib/constants';
import type { BrowseResponse, Listing } from '../lib/types';

/**
 * /listings — Browse page with search, filters, sort, and pagination.
 * All state lives in URL search params.
 */
export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Read all filters from URL
  const q = searchParams.get('q') || '';
  const industry = searchParams.get('industry') || '';
  const stage = searchParams.get('stage') || '';
  const city = searchParams.get('city') || '';
  const state = searchParams.get('state') || '';
  const minFunding = searchParams.get('minFunding') || '';
  const maxFunding = searchParams.get('maxFunding') || '';
  const sort = searchParams.get('sort') || 'newest';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  // Update URL params helper
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    q || industry || stage || city || state || minFunding || maxFunding
  );

  // Clear all filters
  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  // Fetch listings from API
  const fetchListings = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (industry) params.set('industry', industry);
      if (stage) params.set('stage', stage);
      if (city) params.set('city', city);
      if (state) params.set('state', state);
      if (minFunding) params.set('minFunding', (parseFloat(minFunding) * 100000).toString());
      if (maxFunding) params.set('maxFunding', (parseFloat(maxFunding) * 100000).toString());
      if (sort) params.set('sort', sort);
      params.set('page', urlPage.toString());
      params.set('limit', limit.toString());

      const response = await api.get<BrowseResponse>(
        `/api/listings?${params.toString()}`,
        { auth: true, signal } as any
      );

      setData(response.data);
      setPage(response.page);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load listings');
      }
    } finally {
      setLoading(false);
    }
  }, [q, industry, stage, city, state, minFunding, maxFunding, sort, urlPage, limit]);

  // Fetch on param changes
  useEffect(() => {
    const controller = new AbortController();
    fetchListings(controller.signal);
    return () => controller.abort();
  }, [fetchListings]);

  // Debounced search input
  useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const timeout = setTimeout(() => {
      updateParams({ q: searchInput || null, page: null });
    }, 400);
    setDebounceTimeout(timeout);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          from { opacity: 1; }
          to { opacity: 0.4; }
        }
        .skeleton {
          animation: shimmer 1.2s ease-in-out infinite alternate;
        }
      `}</style>

      <AppNav />

      <main className="pt-8 pb-12">
        <div className="container">

          {/* Page title */}
          <header className="mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{
                fontFamily: 'var(--font-serif)',
                fontVariationSettings: "'opsz' 36",
                color: 'var(--color-ink)',
              }}
            >
              Browse businesses
            </h1>
          </header>

          {/* Search */}
          <section className="mb-4">
            <label htmlFor="search" className="sr-only">Search listings</label>
            <input
              id="search"
              type="text"
              placeholder="Search by name, description…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-3 text-base"
              style={{
                background: 'var(--color-paper)',
                color: 'var(--color-ink)',
                border: '1px solid var(--color-rule)',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </section>

          {/* Filters + Sort — single aligned row, wraps on mobile */}
          <section aria-label="Filters and sort" className="mb-8 flex flex-wrap gap-3 items-end">

            <div className="flex-1 min-w-[140px]">
              <label
                htmlFor="industry"
                className="block text-xs uppercase tracking-wide mb-1"
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                Industry
              </label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => updateParams({ industry: e.target.value || null, page: null })}
                className="w-full px-3 py-2 text-sm"
                style={{
                  background: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-rule)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <option value="">All industries</option>
                {INDUSTRY_OPTIONS.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[140px]">
              <label
                htmlFor="stage"
                className="block text-xs uppercase tracking-wide mb-1"
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                Stage
              </label>
              <select
                id="stage"
                value={stage}
                onChange={(e) => updateParams({ stage: e.target.value || null, page: null })}
                className="w-full px-3 py-2 text-sm"
                style={{
                  background: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-rule)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <option value="">All stages</option>
                {STAGE_OPTIONS.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[110px]">
              <label
                htmlFor="city"
                className="block text-xs uppercase tracking-wide mb-1"
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                City
              </label>
              <input
                id="city"
                type="text"
                placeholder="Any city"
                value={city}
                onChange={(e) => updateParams({ city: e.target.value || null, page: null })}
                className="w-full px-3 py-2 text-sm"
                style={{
                  background: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-rule)',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>

            <div className="flex-1 min-w-[110px]">
              <label
                htmlFor="state"
                className="block text-xs uppercase tracking-wide mb-1"
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                State
              </label>
              <input
                id="state"
                type="text"
                placeholder="Any state"
                value={state}
                onChange={(e) => updateParams({ state: e.target.value || null, page: null })}
                className="w-full px-3 py-2 text-sm"
                style={{
                  background: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-rule)',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>

            <div className="flex-1 min-w-[110px]">
              <label
                htmlFor="minFunding"
                className="block text-xs uppercase tracking-wide mb-1"
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                Min ₹ (lakhs)
              </label>
              <input
                id="minFunding"
                type="number"
                min="0"
                placeholder="0"
                value={minFunding}
                onChange={(e) => updateParams({ minFunding: e.target.value || null, page: null })}
                className="w-full px-3 py-2 text-sm"
                style={{
                  background: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-rule)',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>

            <div className="flex-1 min-w-[110px]">
              <label
                htmlFor="maxFunding"
                className="block text-xs uppercase tracking-wide mb-1"
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                Max ₹ (lakhs)
              </label>
              <input
                id="maxFunding"
                type="number"
                min="0"
                placeholder="Any"
                value={maxFunding}
                onChange={(e) => updateParams({ maxFunding: e.target.value || null, page: null })}
                className="w-full px-3 py-2 text-sm"
                style={{
                  background: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-rule)',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>

            {/* Sort lives in the same row, pushed right via ml-auto on wider screens */}
            <div className="flex-1 min-w-[150px]">
              <label
                htmlFor="sort"
                className="block text-xs uppercase tracking-wide mb-1"
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                Sort by
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value || null, page: null })}
                className="w-full px-3 py-2 text-sm"
                style={{
                  background: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-rule)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="funding_desc">Funding: High → Low</option>
                <option value="funding_asc">Funding: Low → High</option>
              </select>
            </div>

            {/* Clear filters — self-aligns to bottom with the inputs */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85"
                  style={{
                    border: '1.5px solid var(--color-clay)',
                    color: 'var(--color-clay)',
                    fontFamily: 'var(--font-sans)',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>

          {/* Results */}
          <div>
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton border p-6"
                    style={{
                      background: 'var(--color-rule)',
                      borderColor: 'var(--color-rule)',
                      minHeight: '320px',
                    }}
                  >
                    <div className="mb-4 h-4" style={{ background: 'var(--color-paper)', width: '60%' }} />
                    <div className="mb-2 h-6" style={{ background: 'var(--color-paper)', width: '80%' }} />
                    <div className="mb-4 h-16" style={{ background: 'var(--color-paper)' }} />
                    <div className="h-20" style={{ background: 'var(--color-paper)' }} />
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
                  onClick={() => fetchListings(new AbortController().signal)}
                  className="px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-85"
                  style={{
                    backgroundColor: 'var(--color-clay)',
                    color: 'var(--color-white)',
                    fontFamily: 'var(--font-sans)',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && data.length === 0 && (
              <div className="text-center py-16">
                <p className="mb-4 text-lg" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                  No listings match your filters.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-85"
                    style={{
                      backgroundColor: 'var(--color-clay)',
                      color: 'var(--color-white)',
                      fontFamily: 'var(--font-sans)',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {!loading && !error && data.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((listing) => (
                  <Link
                    key={listing._id}
                    to={`/listings/${listing._id}`}
                    className="border p-6 flex flex-col hover:opacity-90 transition-opacity block"
                    style={{
                      borderColor: 'var(--color-rule)',
                      background: 'var(--color-paper)',
                      textDecoration: 'none',
                    }}
                  >
                    {/* Top row: location + clickable stage badge */}
                    <div
                      className="flex items-baseline justify-between mb-4 pb-3"
                      style={{ borderBottom: '1px solid var(--color-rule)' }}
                    >
                      {/* Location replaces the old industry label */}
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

                      {/* Stage badge — clicking sets ?stage= filter without navigating to detail */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateParams({ stage: listing.stage, page: null });
                        }}
                        className="px-3 py-1 text-xs font-bold uppercase transition-opacity hover:opacity-75"
                        style={{
                          background: '#D4A853',
                          color: 'var(--color-ink)',
                          fontFamily: 'var(--font-sans)',
                          letterSpacing: '0.06em',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        title={`Filter by stage: ${STAGE_LABELS[listing.stage as StageKey]}`}
                        aria-label={`Filter by stage: ${STAGE_LABELS[listing.stage as StageKey]}`}
                      >
                        {STAGE_LABELS[listing.stage as StageKey]}
                      </button>
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
                        }}
                      >
                        {listing.description}
                      </p>
                    )}

                    {/* Key facts: Revenue + Funding */}
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

                    {/* Footer: owner + view details */}
                    <div
                      className="mt-auto pt-3 flex items-center justify-between"
                      style={{ borderTop: '1px solid var(--color-rule)' }}
                    >
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
                      >
                        by {listing.owner.name}
                      </p>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: 'var(--color-clay)', fontFamily: 'var(--font-sans)' }}
                        aria-hidden="true"
                      >
                        View details →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Pagination">
              <button
                onClick={() => updateParams({ page: (urlPage - 1).toString() })}
                disabled={urlPage === 1}
                className="px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  border: '1.5px solid var(--color-clay)',
                  color: 'var(--color-forest)',
                  fontFamily: 'var(--font-sans)',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                ← Previous
              </button>
              <span
                className="text-sm"
                style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
              >
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => updateParams({ page: (urlPage + 1).toString() })}
                disabled={urlPage === totalPages}
                className="px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  border: '1.5px solid var(--color-clay)',
                  color: 'var(--color-forest)',
                  fontFamily: 'var(--font-sans)',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Next →
              </button>
            </nav>
          )}

        </div>
      </main>
    </>
  );
}
