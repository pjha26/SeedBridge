import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import AppNav from '../components/AppNav';
import {
  STAGE_LABELS,
  REVENUE_RANGE_LABELS,
  formatINR,
  type StageKey,
  type RevenueRangeKey,
} from '../lib/constants';
import type { Listing } from '../lib/types';

/**
 * /listings/:id — Detail page for a single listing.
 * Active listings are public; inactive listings visible only to owner.
 */
export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    async function fetchListing() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const data = await api.get<{ listing: Listing }>(`/api/listings/${id}`, {
          auth: true,
          signal: controller.signal,
        } as any);
        setListing(data.listing);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          if (err.status === 404) {
            setNotFound(true);
          } else {
            setError(err.message || 'Failed to load listing');
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchListing();

    return () => controller.abort();
  }, [id, retryKey]);

  if (notFound) {
    return (
      <>
        <AppNav />
        <main className="py-12">
          <div className="container text-center">
            <p className="text-lg mb-4" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
              Listing not found.
            </p>
            <Link
              to="/listings"
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
            >
              ← Back to listings
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (loading) {
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
        <main className="py-12">
          <div className="container max-w-3xl">
            <div className="skeleton mb-6 h-4" style={{ background: 'var(--color-rule)', width: '120px' }} />
            <div className="skeleton mb-4 h-10" style={{ background: 'var(--color-rule)', width: '60%' }} />
            <div className="skeleton mb-8 h-6" style={{ background: 'var(--color-rule)', width: '40%' }} />
            <div className="skeleton mb-4 h-32" style={{ background: 'var(--color-rule)' }} />
            <div className="skeleton mb-4 h-48" style={{ background: 'var(--color-rule)' }} />
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppNav />
        <main className="py-12">
          <div className="container text-center">
            <p className="text-lg mb-4" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
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
        </main>
      </>
    );
  }

  if (!listing) return null;

  const listedDate = new Date(listing.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <AppNav />
      <main className="py-12">
        <div className="container max-w-3xl">

          {/* Back link */}
          <nav className="mb-8">
            <Link
              to="/listings"
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
            >
              ← Back to listings
            </Link>
          </nav>

          {/* Listing content */}
          <article>

            {/* Header */}
            <header className="mb-8">
              {/* Badges */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-3 py-1 text-xs font-bold uppercase"
                  style={{
                    background: 'var(--color-clay)',
                    color: 'var(--color-white)',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {listing.industry}
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
              <h1
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontVariationSettings: "'opsz' 36",
                  color: 'var(--color-ink)',
                }}
              >
                {listing.businessName}
              </h1>

              {/* Owner */}
              <p
                className="text-sm mb-2"
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                Listed by {listing.owner.name}
              </p>

              {/* Location */}
              <p
                className="text-sm mb-2"
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                📍 {listing.location.city}, {listing.location.state}
              </p>

              {/* Created date */}
              <p
                className="text-sm"
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                Listed on {listedDate}
              </p>
            </header>

            {/* Details grid */}
            <section
              className="mb-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6"
              style={{ borderBottom: '1px solid var(--color-rule)' }}
            >
              <div>
                <dt
                  className="text-xs tracking-wide uppercase mb-2"
                  style={{
                    color: 'var(--color-forest)',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.08em',
                  }}
                >
                  Industry
                </dt>
                <dd style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                  {listing.industry}
                </dd>
              </div>

              <div>
                <dt
                  className="text-xs tracking-wide uppercase mb-2"
                  style={{
                    color: 'var(--color-forest)',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.08em',
                  }}
                >
                  Stage
                </dt>
                <dd style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                  {STAGE_LABELS[listing.stage as StageKey]}
                </dd>
              </div>

              <div>
                <dt
                  className="text-xs tracking-wide uppercase mb-2"
                  style={{
                    color: 'var(--color-forest)',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.08em',
                  }}
                >
                  Revenue
                </dt>
                <dd style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                  {REVENUE_RANGE_LABELS[listing.revenueRange as RevenueRangeKey]}
                </dd>
              </div>

              <div>
                <dt
                  className="text-xs tracking-wide uppercase mb-2"
                  style={{
                    color: 'var(--color-forest)',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.08em',
                  }}
                >
                  Funding sought
                </dt>
                <dd style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                  {formatINR(listing.fundingGoal)}
                </dd>
              </div>

              <div>
                <dt
                  className="text-xs tracking-wide uppercase mb-2"
                  style={{
                    color: 'var(--color-forest)',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.08em',
                  }}
                >
                  City
                </dt>
                <dd style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                  {listing.location.city}
                </dd>
              </div>

              <div>
                <dt
                  className="text-xs tracking-wide uppercase mb-2"
                  style={{
                    color: 'var(--color-forest)',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.08em',
                  }}
                >
                  State
                </dt>
                <dd style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                  {listing.location.state}
                </dd>
              </div>
            </section>

            {/* Funding purpose */}
            <section className="mb-8">
              <h2
                className="text-xs tracking-wide uppercase mb-3"
                style={{
                  color: 'var(--color-forest)',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.08em',
                }}
              >
                Use of funds
              </h2>
              <p
                className="text-base"
                style={{
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-sans)',
                  lineHeight: 1.7,
                }}
              >
                {listing.fundingPurpose}
              </p>
            </section>

            {/* Description */}
            {listing.description && (
              <section className="mb-8">
                <h2
                  className="text-xl font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontVariationSettings: "'opsz' 24",
                    color: 'var(--color-ink)',
                  }}
                >
                  About this business
                </h2>
                <p
                  className="text-base"
                  style={{
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-sans)',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {listing.description}
                </p>
              </section>
            )}

            {/* Action buttons (disabled) */}
            <footer className="pt-8" style={{ borderTop: '1px solid var(--color-rule)' }}>
              <div className="flex flex-wrap gap-4 mb-3">
                <button
                  disabled
                  title="Coming soon"
                  className="px-6 py-3 text-sm font-semibold cursor-not-allowed"
                  style={{
                    border: '1.5px solid var(--color-clay)',
                    color: 'var(--color-clay)',
                    fontFamily: 'var(--font-sans)',
                    background: 'var(--color-paper)',
                    opacity: 0.5,
                  }}
                >
                  Save this listing
                </button>
                <button
                  disabled
                  title="Coming soon"
                  className="px-6 py-3 text-sm font-semibold cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--color-clay)',
                    color: 'var(--color-white)',
                    fontFamily: 'var(--font-sans)',
                    border: 'none',
                    opacity: 0.5,
                  }}
                >
                  Express interest
                </button>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}>
                These features are coming soon.
              </p>
            </footer>

          </article>

        </div>
      </main>
    </>
  );
}
