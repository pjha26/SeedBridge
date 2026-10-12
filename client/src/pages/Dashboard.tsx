import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppNav from '../components/AppNav';
import FieldError from '../components/FieldError';
import {
  STAGE_OPTIONS,
  REVENUE_RANGE_OPTIONS,
  INDUSTRY_OPTIONS,
  STAGE_LABELS,
  REVENUE_RANGE_LABELS,
  formatINR,
  type StageKey,
} from '../lib/constants';
import type { Listing, BrowseResponse, ApiError } from '../lib/types';
import type { RevenueRangeKey } from '../lib/constants';

// ── Shared local types ────────────────────────────────────────────────────────

type ListingFormFields = {
  businessName:   string;
  industry:       string;
  city:           string;
  state:          string;
  stage:          StageKey | '';
  revenueRange:   RevenueRangeKey | '';
  fundingGoal:    string;
  fundingPurpose: string;
  description:    string;
};

type FormErrors = Partial<Record<keyof ListingFormFields | 'general', string>>;

const EMPTY_FORM: ListingFormFields = {
  businessName:   '',
  industry:       '',
  city:           '',
  state:          '',
  stage:          '',
  revenueRange:   '',
  fundingGoal:    '',
  fundingPurpose: '',
  description:    '',
};

// ── Skeleton helpers ──────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div
      className="skeleton"
      style={{
        width: '100%',
        height: '60px',
        background: 'var(--color-rule)',
        marginTop: '32px',
      }}
    />
  );
}

function FormSkeleton() {
  return (
    <div style={{ maxWidth: '640px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="mb-6">
          <div
            className="skeleton mb-2"
            style={{ height: '12px', width: '30%', background: 'var(--color-rule)' }}
          />
          <div
            className="skeleton"
            style={{ height: '42px', background: 'var(--color-rule)' }}
          />
        </div>
      ))}
    </div>
  );
}

function GridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
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
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        borderBottom: active
          ? '2px solid var(--color-clay)'
          : '2px solid transparent',
        color: active ? 'var(--color-clay)' : 'var(--color-forest)',
        padding: '8px 0',
        marginRight: '24px',
        marginBottom: '-2px',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

// ── Saved card (investor) ─────────────────────────────────────────────────────

function SavedCard({
  listing,
  onUnsave,
}: {
  listing: Listing;
  onUnsave: (id: string) => void;
}) {
  return (
    <div
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
            {REVENUE_RANGE_LABELS[listing.revenueRange as RevenueRangeKey]}
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
          onClick={() => onUnsave(listing._id)}
          className="text-xs font-semibold transition-opacity hover:opacity-75"
          style={{
            color: 'var(--color-clay)',
            fontFamily: 'var(--font-sans)',
            background: 'transparent',
            border: '1.5px solid var(--color-clay)',
            cursor: 'pointer',
            padding: '4px 10px',
          }}
        >
          Unsave
        </button>
      </div>
    </div>
  );
}

// ── Input / label styles (shared across form fields) ─────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid var(--color-rule)',
  background: 'var(--color-paper)',
  color: 'var(--color-ink)',
  fontFamily: 'var(--font-sans)',
  fontSize: '1rem',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.8125rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--color-forest)',
  fontFamily: 'var(--font-sans)',
};

// ── Owner Dashboard ───────────────────────────────────────────────────────────

function OwnerDashboard({
  user,
  searchParams,
  setSearchParams,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;
}) {
  const activeTab = searchParams.get('tab') ?? 'listing';

  function setTab(tab: string) {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next);
  }

  // Listing fetch state
  const [listing, setListing]           = useState<Listing | null>(null);
  const [listingLoading, setListingLoading] = useState(true);
  const [listingError, setListingError]   = useState<string | null>(null);

  // Form state
  const [form, setForm]       = useState<ListingFormFields>(EMPTY_FORM);
  const [errors, setErrors]   = useState<FormErrors>({});
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState<'saved' | 'error' | null>(null);
  const saveMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Optimistic active toggle
  const [activeOptimistic, setActiveOptimistic] = useState<boolean | null>(null);
  const displayActive =
    activeOptimistic !== null ? activeOptimistic : (listing?.isActive ?? true);

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (saveMsgTimer.current) clearTimeout(saveMsgTimer.current);
    },
    []
  );

  function showSaved() {
    setSaveMsg('saved');
    if (saveMsgTimer.current) clearTimeout(saveMsgTimer.current);
    saveMsgTimer.current = setTimeout(() => setSaveMsg(null), 3000);
  }

  const fetchMyListing = useCallback(async () => {
    setListingLoading(true);
    setListingError(null);
    try {
      const res = await api.get<{ listing: Listing }>('/api/listings/mine', { auth: true });
      setListing(res.listing);
      setForm({
        businessName:   res.listing.businessName,
        industry:       res.listing.industry,
        city:           res.listing.location.city,
        state:          res.listing.location.state,
        stage:          res.listing.stage,
        revenueRange:   res.listing.revenueRange,
        fundingGoal:    String(res.listing.fundingGoal),
        fundingPurpose: res.listing.fundingPurpose,
        description:    res.listing.description ?? '',
      });
    } catch (err: any) {
      if (err.status === 404) {
        setListing(null);
      } else {
        setListingError(err.message || 'Failed to load your listing');
      }
    } finally {
      setListingLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyListing();
  }, [fetchMyListing]);

  function mapServerErrors(err: ApiError): FormErrors {
    const fe: FormErrors = {};
    if (err.issues?.length) {
      err.issues.forEach(({ path, message }) => {
        const key = path as keyof ListingFormFields;
        if (key in EMPTY_FORM) {
          fe[key] = message;
        } else {
          fe.general = message;
        }
      });
    } else {
      fe.general = err.message;
    }
    return fe;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaveMsg(null);
    setSaving(true);
    const payload = {
      businessName:   form.businessName,
      industry:       form.industry,
      city:           form.city,
      state:          form.state,
      stage:          form.stage as StageKey,
      revenueRange:   form.revenueRange as RevenueRangeKey,
      fundingGoal:    parseInt(form.fundingGoal, 10),
      fundingPurpose: form.fundingPurpose,
      description:    form.description,
    };
    try {
      if (listing) {
        const res = await api.put<{ listing: Listing }>(
          `/api/listings/${listing._id}`,
          payload,
          { auth: true }
        );
        setListing(res.listing);
      } else {
        const res = await api.post<{ listing: Listing }>(
          '/api/listings',
          payload,
          { auth: true }
        );
        setListing(res.listing);
      }
      showSaved();
    } catch (err) {
      const mapped = mapServerErrors(err as ApiError);
      setErrors(mapped);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!listing) return;
    const next = !displayActive;
    setActiveOptimistic(next);
    try {
      const res = await api.put<{ listing: Listing }>(
        `/api/listings/${listing._id}`,
        { isActive: next },
        { auth: true }
      );
      setListing(res.listing);
      setActiveOptimistic(null);
      showSaved();
    } catch {
      setActiveOptimistic(null);
      setSaveMsg('error');
      if (saveMsgTimer.current) clearTimeout(saveMsgTimer.current);
      saveMsgTimer.current = setTimeout(() => setSaveMsg(null), 3000);
    }
  }

  const statusText =
    !listing
      ? 'No listing yet'
      : displayActive
      ? '● Active'
      : '○ Inactive';

  const statusColor =
    !listing
      ? 'var(--color-forest)'
      : displayActive
      ? '#2e7d32'
      : 'var(--color-forest)';

  return (
    <>
      <AppNav />
      <main className="pt-8 pb-12">
        <div className="container">
          <header className="mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{
                fontFamily: 'var(--font-serif)',
                fontVariationSettings: "'opsz' 36",
                color: 'var(--color-ink)',
              }}
            >
              Welcome, {user.name}
            </h1>
            <p
              className="text-sm"
              style={{ color: statusColor, fontFamily: 'var(--font-sans)' }}
            >
              {statusText}
            </p>
          </header>

          {/* Tab bar */}
          <nav role="tablist" className="mb-8 flex" style={{ borderBottom: '2px solid var(--color-rule)' }}>
            <TabButton
              label="My listing"
              active={activeTab === 'listing'}
              onClick={() => setTab('listing')}
            />
            <TabButton
              label="Interest requests"
              active={activeTab === 'interest'}
              onClick={() => setTab('interest')}
            />
          </nav>

          {/* Tab: listing */}
          {activeTab === 'listing' && (
            <>
              {listingLoading && <FormSkeleton />}

              {listingError && (
                <div className="text-center py-16">
                  <p
                    className="mb-4"
                    style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
                  >
                    {listingError}
                  </p>
                  <button
                    onClick={fetchMyListing}
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

              {!listingLoading && !listingError && (
                <div style={{ maxWidth: '640px' }}>
                  {/* Active toggle + view public page */}
                  {listing && (
                    <div
                      className="flex items-center gap-4 mb-6"
                      style={{ flexWrap: 'wrap' }}
                    >
                      <button
                        type="button"
                        onClick={handleToggleActive}
                        aria-pressed={displayActive}
                        style={{
                          background: displayActive
                            ? 'var(--color-forest)'
                            : 'var(--color-rule)',
                          color: displayActive
                            ? 'var(--color-white)'
                            : 'var(--color-ink)',
                          border: 'none',
                          padding: '6px 16px',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {displayActive ? 'Active' : 'Inactive'}
                      </button>
                      {displayActive && (
                        <Link
                          to={`/listings/${listing._id}`}
                          className="text-sm transition-opacity hover:opacity-75"
                          style={{
                            color: 'var(--color-clay)',
                            fontFamily: 'var(--font-sans)',
                          }}
                        >
                          View public page →
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Success / error banners */}
                  {saveMsg === 'saved' && (
                    <div
                      role="status"
                      className="mb-6 px-4 py-3 text-sm"
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #4caf50',
                        color: '#2e7d32',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {listing ? 'Changes saved!' : 'Listing created!'}
                    </div>
                  )}
                  {saveMsg === 'error' && (
                    <div
                      role="alert"
                      className="mb-6 px-4 py-3 text-sm"
                      style={{
                        background: '#FEF2F0',
                        border: '1px solid var(--color-clay)',
                        color: 'var(--color-clay)',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      Could not update listing status. Please try again.
                    </div>
                  )}
                  {errors.general && (
                    <div
                      role="alert"
                      className="mb-6 px-4 py-3 text-sm"
                      style={{
                        background: '#FEF2F0',
                        border: '1px solid var(--color-clay)',
                        color: 'var(--color-clay)',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {errors.general}
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Business name */}
                    <div className="mb-5">
                      <label htmlFor="businessName" style={labelStyle}>
                        Business name
                      </label>
                      <input
                        id="businessName"
                        type="text"
                        value={form.businessName}
                        maxLength={150}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, businessName: e.target.value }))
                        }
                        style={inputStyle}
                      />
                      <FieldError message={errors.businessName} />
                    </div>

                    {/* Industry */}
                    <div className="mb-5">
                      <label htmlFor="industry" style={labelStyle}>
                        Industry
                      </label>
                      <select
                        id="industry"
                        value={form.industry}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, industry: e.target.value }))
                        }
                        style={inputStyle}
                      >
                        <option value="">Select industry…</option>
                        {INDUSTRY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.industry} />
                    </div>

                    {/* City + State in a row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <label htmlFor="city" style={labelStyle}>
                          City
                        </label>
                        <input
                          id="city"
                          type="text"
                          value={form.city}
                          maxLength={100}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, city: e.target.value }))
                          }
                          style={inputStyle}
                        />
                        <FieldError message={errors.city} />
                      </div>
                      <div>
                        <label htmlFor="state" style={labelStyle}>
                          State
                        </label>
                        <input
                          id="state"
                          type="text"
                          value={form.state}
                          maxLength={100}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, state: e.target.value }))
                          }
                          style={inputStyle}
                        />
                        <FieldError message={errors.state} />
                      </div>
                    </div>

                    {/* Stage */}
                    <div className="mb-5">
                      <label htmlFor="stage" style={labelStyle}>
                        Stage
                      </label>
                      <select
                        id="stage"
                        value={form.stage}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, stage: e.target.value as StageKey | '' }))
                        }
                        style={inputStyle}
                      >
                        <option value="">Select stage…</option>
                        {STAGE_OPTIONS.map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.stage} />
                    </div>

                    {/* Revenue range */}
                    <div className="mb-5">
                      <label htmlFor="revenueRange" style={labelStyle}>
                        Revenue range
                      </label>
                      <select
                        id="revenueRange"
                        value={form.revenueRange}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            revenueRange: e.target.value as RevenueRangeKey | '',
                          }))
                        }
                        style={inputStyle}
                      >
                        <option value="">Select revenue range…</option>
                        {REVENUE_RANGE_OPTIONS.map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.revenueRange} />
                    </div>

                    {/* Funding goal */}
                    <div className="mb-5">
                      <label htmlFor="fundingGoal" style={labelStyle}>
                        Funding goal (₹)
                      </label>
                      <input
                        id="fundingGoal"
                        type="number"
                        min="1"
                        value={form.fundingGoal}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, fundingGoal: e.target.value }))
                        }
                        style={inputStyle}
                      />
                      <FieldError message={errors.fundingGoal} />
                    </div>

                    {/* Funding purpose */}
                    <div className="mb-5">
                      <label htmlFor="fundingPurpose" style={labelStyle}>
                        How will you use the funds?
                      </label>
                      <textarea
                        id="fundingPurpose"
                        value={form.fundingPurpose}
                        maxLength={500}
                        rows={3}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, fundingPurpose: e.target.value }))
                        }
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                      <small
                        style={{
                          color: 'var(--color-forest)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.75rem',
                        }}
                      >
                        {form.fundingPurpose.length} / 500
                      </small>
                      <FieldError message={errors.fundingPurpose} />
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                      <label htmlFor="description" style={labelStyle}>
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={form.description}
                        maxLength={2000}
                        rows={6}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, description: e.target.value }))
                        }
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                      <small
                        style={{
                          color: 'var(--color-forest)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.75rem',
                        }}
                      >
                        {form.description.length} / 2000
                      </small>
                      <FieldError message={errors.description} />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 text-sm font-semibold transition-opacity"
                      style={{
                        background: 'var(--color-clay)',
                        color: 'var(--color-white)',
                        fontFamily: 'var(--font-sans)',
                        border: 'none',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? 'Saving…' : listing ? 'Save changes' : 'Create listing'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

          {/* Tab: interest (placeholder) */}
          {activeTab === 'interest' && (
            <div className="py-16 text-center">
              <h2
                className="text-xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-ink)',
                }}
              >
                Interest requests
              </h2>
              <p
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                When investors express interest in your listing, they'll appear here.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ── Investor Dashboard ────────────────────────────────────────────────────────

function InvestorDashboard({
  user,
  searchParams,
  setSearchParams,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;
}) {
  const activeTab = searchParams.get('tab') ?? 'saved';

  function setTab(tab: string) {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next);
  }

  const [savedData, setSavedData]         = useState<Listing[]>([]);
  const [savedLoading, setSavedLoading]   = useState(true);
  const [savedError, setSavedError]       = useState<string | null>(null);
  const [savedRetry, setSavedRetry]       = useState(0);

  const fetchSaved = useCallback(async () => {
    setSavedLoading(true);
    setSavedError(null);
    try {
      const res = await api.get<BrowseResponse>('/api/saved', { auth: true });
      setSavedData(res.data);
    } catch (err: any) {
      setSavedError(err.message || 'Failed to load saved listings');
    } finally {
      setSavedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved, savedRetry]);

  async function handleUnsave(listingId: string) {
    const removed = savedData.find((l) => l._id === listingId);
    setSavedData((prev) => prev.filter((l) => l._id !== listingId));
    try {
      await api.delete(`/api/saved/${listingId}`);
    } catch {
      if (removed) setSavedData((prev) => [removed, ...prev]);
    }
  }

  return (
    <>
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
              Welcome, {user.name}
            </h1>
          </header>

          {/* Tab bar */}
          <nav
            role="tablist"
            className="mb-8 flex"
            style={{ borderBottom: '2px solid var(--color-rule)' }}
          >
            <TabButton
              label="Saved"
              active={activeTab === 'saved'}
              onClick={() => setTab('saved')}
            />
            <TabButton
              label="Sent requests"
              active={activeTab === 'requests'}
              onClick={() => setTab('requests')}
            />
          </nav>

          {/* Tab: saved */}
          {activeTab === 'saved' && (
            <>
              {savedLoading && <GridSkeleton count={6} />}

              {savedError && (
                <div className="text-center py-16">
                  <p
                    className="mb-4"
                    style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
                  >
                    {savedError}
                  </p>
                  <button
                    onClick={() => setSavedRetry((k) => k + 1)}
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

              {!savedLoading && !savedError && savedData.length === 0 && (
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

              {!savedLoading && !savedError && savedData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedData.map((listing) => (
                    <SavedCard
                      key={listing._id}
                      listing={listing}
                      onUnsave={handleUnsave}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Tab: requests (placeholder) */}
          {activeTab === 'requests' && (
            <div className="py-16 text-center">
              <h2
                className="text-xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-ink)',
                }}
              >
                Sent requests
              </h2>
              <p
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                Listings where you've expressed interest will appear here.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  if (authLoading) {
    return (
      <>
        <AppNav />
        <main className="pt-8 pb-12">
          <div className="container">
            <PageSkeleton />
          </div>
        </main>
      </>
    );
  }

  if (!user) return null;

  return user.role === 'owner' ? (
    <OwnerDashboard
      user={user}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
    />
  ) : (
    <InvestorDashboard
      user={user}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
    />
  );
}
