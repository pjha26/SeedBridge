import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
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
  const { user } = useAuth();
  const location = useLocation();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [saved, setSaved] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [myInterestStatus, setMyInterestStatus] = useState<'none' | 'pending' | 'accepted' | 'declined'>('none');
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestError, setInterestError] = useState<string | null>(null);

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
        setSaved(data.listing.savedByMe ?? false);
        setMyInterestStatus(data.listing.myInterestStatus ?? 'none');
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

  async function handleSaveToggle() {
    if (!listing) return;
    setSaveLoading(true);
    setSaveError(null);
    const prev = saved;
    setSaved(!prev); // optimistic
    try {
      if (prev) {
        await api.delete(`/api/saved/${listing._id}`);
      } else {
        await api.post(`/api/saved/${listing._id}`, {});
      }
    } catch (err: any) {
      setSaved(prev); // rollback
      setSaveError(err.message || 'Could not update saved status');
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleSendInterest() {
    if (!listing) return;
    setInterestLoading(true);
    setInterestError(null);
    try {
      await api.post('/api/interest', { listingId: listing._id, message: interestMessage || undefined });
      setMyInterestStatus('pending');
      setShowInterestModal(false);
      setInterestMessage('');
    } catch (err: any) {
      setInterestError(err.message || 'Could not send interest request');
    } finally {
      setInterestLoading(false);
    }
  }

  useEffect(() => {
    if (!showInterestModal) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setShowInterestModal(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showInterestModal]);

  if (notFound) {
    return (
      <>
        <AppNav />
        <main className="pt-8 pb-12">
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
        <main className="pt-8 pb-12">
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
        <main className="pt-8 pb-12">
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
      <main className="pt-8 pb-12">
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

            {/* Action buttons */}
            <footer className="pt-8" style={{ borderTop: '1px solid var(--color-rule)' }}>
              <div className="flex flex-wrap gap-4 mb-3">
                {/* Save button — role-dependent */}
                {!user && (
                  <Link
                    to="/login"
                    state={{ from: location }}
                    className="px-6 py-3 text-sm font-semibold"
                    style={{
                      border: '1.5px solid var(--color-clay)',
                      color: 'var(--color-clay)',
                      fontFamily: 'var(--font-sans)',
                      background: 'var(--color-paper)',
                    }}
                  >
                    Log in to save
                  </Link>
                )}
                {user?.role === 'investor' && (
                  <button
                    onClick={handleSaveToggle}
                    disabled={saveLoading}
                    className="px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-50"
                    style={{
                      border: '1.5px solid var(--color-clay)',
                      color: saved ? 'var(--color-white)' : 'var(--color-clay)',
                      backgroundColor: saved ? 'var(--color-clay)' : 'var(--color-paper)',
                      fontFamily: 'var(--font-sans)',
                      cursor: 'pointer',
                    }}
                  >
                    {saveLoading
                      ? (saved ? 'Removing…' : 'Saving…')
                      : (saved ? 'Saved ✓' : 'Save this listing')}
                  </button>
                )}
                {/* owners: no save button at all */}
                {/* Interest button — role-dependent */}
                {!user && (
                  <Link
                    to="/login"
                    state={{from: location}}
                    className="px-6 py-3 text-sm font-semibold"
                    style={{border: '1.5px solid var(--color-clay)',
                      color: 'var(--color-clay)',
                      fontFamily: 'var(--font-sans)',
                      background: 'var(--color-paper)',}}
                  >
                    Log in to express interest
                  </Link>
                )}
                {user?.role === 'investor' && (
                  <>
                    {(!myInterestStatus || myInterestStatus === 'none') && (
                      <button
                        onClick={() => setShowInterestModal(true)}
                        className="px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-85"
                        style={{backgroundColor: 'var(--color-clay)',
                          color: 'var(--color-white)',
                          fontFamily: 'var(--font-sans)',
                          border: 'none',
                          cursor: 'pointer',}}
                      >
                        Express interest
                      </button>
                    )}
                    {myInterestStatus === 'pending' && (
                      <span
                        className="px-4 py-2 text-sm font-semibold"
                        style={{background: '#D4A853',
                          color: 'var(--color-ink)',
                          fontFamily: 'var(--font-sans)',}}
                      >
                        Pending review
                      </span>
                    )}
                    {myInterestStatus === 'accepted' && (
                      <span
                        className="px-4 py-2 text-sm font-semibold"
                        style={{background: 'var(--color-forest)',
                          color: 'var(--color-white)',
                          fontFamily: 'var(--font-sans)',}}
                      >
                        Accepted ✓
                      </span>
                    )}
                    {myInterestStatus === 'declined' && (
                      <span
                        className="px-4 py-2 text-sm font-semibold"
                        style={{background: 'var(--color-rule)',
                          color: 'var(--color-forest)',
                          fontFamily: 'var(--font-sans)',}}
                      >
                        Declined
                      </span>
                    )}
                  </>
                )}
                {/* owners: no interest button */}
              </div>
              {saveError && (
                <p className="text-sm mt-2" style={{ color: 'var(--color-clay)', fontFamily: 'var(--font-sans)' }}>
                  {saveError}
                </p>
              )}
            </footer>

          </article>

          {showInterestModal && (
            <div
              style={{position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.45)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',}}
              onClick={(e) => { if (e.target === e.currentTarget) setShowInterestModal(false); }}
            >
              <div
                style={{background: 'var(--color-paper)',
                  padding: '32px',
                  maxWidth: '440px',
                  width: '100%',}}
              >
                <h2
                  className="text-xl font-bold mb-4"
                  style={{fontFamily: 'var(--font-serif)', color: 'var(--color-ink)'}}
                >
                  Express interest in {listing?.businessName}
                </h2>
                <p className="text-sm mb-4" style={{color: 'var(--color-forest)', fontFamily: 'var(--font-sans)'}}>
                  Add an optional message to introduce yourself.
                </p>
                <textarea
                  value={interestMessage}
                  maxLength={500}
                  rows={4}
                  onChange={(e) => setInterestMessage(e.target.value)}
                  placeholder="Your message (optional)"
                  style={{width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid var(--color-rule)',
                    background: 'var(--color-paper)',
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1rem',
                    resize: 'vertical',
                    outline: 'none',
                    marginBottom: '4px',}}
                />
                <p className="text-xs mb-4" style={{color: 'var(--color-forest)', fontFamily: 'var(--font-sans)', textAlign: 'right'}}>
                  {interestMessage.length} / 500
                </p>
                {interestError && (
                  <p className="text-sm mb-4" style={{color: 'var(--color-clay)', fontFamily: 'var(--font-sans)'}}>
                    {interestError}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleSendInterest}
                    disabled={interestLoading}
                    className="flex-1 px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-50"
                    style={{backgroundColor: 'var(--color-clay)',
                      color: 'var(--color-white)',
                      fontFamily: 'var(--font-sans)',
                      border: 'none',
                      cursor: interestLoading ? 'not-allowed' : 'pointer',}}
                  >
                    {interestLoading ? 'Sending…' : 'Send'}
                  </button>
                  <button
                    onClick={() => { setShowInterestModal(false); setInterestError(null); }}
                    disabled={interestLoading}
                    className="flex-1 px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-50"
                    style={{border: '1.5px solid var(--color-clay)',
                      color: 'var(--color-clay)',
                      background: 'var(--color-paper)',
                      fontFamily: 'var(--font-sans)',
                      cursor: 'pointer',}}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
