import { sampleListings } from '../../content/landing';

export default function SampleListings() {
  return (
    <section
      aria-labelledby="listings-heading"
      className="py-20 md:py-28"
      style={{ borderBottom: '1px solid var(--color-rule)' }}
    >
      <div className="container">

        <div className="mb-14" data-reveal>
          <span
            className="block text-xs tracking-widest uppercase mb-3"
            style={{ color: 'var(--color-clay)', fontFamily: 'var(--font-sans)' }}
            aria-hidden="true"
          >
            §&nbsp;04
          </span>
          <h2
            id="listings-heading"
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: 'var(--font-serif)',
              fontVariationSettings: "'opsz' 36",
            }}
          >
            What a listing looks like
          </h2>
        </div>

        {/* 
          Desktop: 2 cards wide (offset), then 1 card in second row.
          Mobile: single column stack.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 md:items-start">

          {sampleListings.map((listing, i) => (
            <div
              key={listing.name}
              data-reveal
              className={`
                border p-6 md:p-8
                ${i === 2 ? 'md:col-span-1' : ''}
              `}
              style={{
                borderColor: 'var(--color-rule)',
                background: 'var(--color-paper)',
                transitionDelay: `${i * 90}ms`,
              }}
            >

              {/* Top label */}
              <div className="flex items-baseline justify-between mb-6 pb-3" style={{ borderBottom: '1px solid var(--color-rule)' }}>
                <span
                  className="text-xs tracking-widest uppercase"
                  style={{ color: 'var(--color-clay)', fontFamily: 'var(--font-sans)', letterSpacing: '0.14em' }}
                >
                  {listing.label}
                </span>
                {/* Stage stamp */}
                <span
                  className="px-3 py-1 text-xs font-bold uppercase"
                  style={{
                    background: 'var(--color-clay)',
                    color: 'var(--color-white)',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {listing.stage}
                </span>
              </div>

              {/* Name */}
              <h3
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontVariationSettings: "'opsz' 28",
                  color: 'var(--color-ink)',
                }}
              >
                {listing.name}
              </h3>

              {/* Grid of details */}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5 text-sm">
                <div>
                  <dt
                    className="text-xs tracking-wide uppercase mb-1"
                    style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)', letterSpacing: '0.08em' }}
                  >
                    Industry
                  </dt>
                  <dd style={{ color: 'var(--color-ink)' }}>{listing.industry}</dd>
                </div>
                <div>
                  <dt
                    className="text-xs tracking-wide uppercase mb-1"
                    style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)', letterSpacing: '0.08em' }}
                  >
                    Location
                  </dt>
                  <dd style={{ color: 'var(--color-ink)' }}>{listing.location}</dd>
                </div>
                <div>
                  <dt
                    className="text-xs tracking-wide uppercase mb-1"
                    style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)', letterSpacing: '0.08em' }}
                  >
                    Revenue
                  </dt>
                  <dd style={{ color: 'var(--color-ink)' }}>{listing.revenueRange}</dd>
                </div>
                <div>
                  <dt
                    className="text-xs tracking-wide uppercase mb-1"
                    style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)', letterSpacing: '0.08em' }}
                  >
                    Seeking
                  </dt>
                  <dd style={{ color: 'var(--color-ink)' }}>{listing.fundingGoal}</dd>
                </div>
              </dl>

              {/* Purpose */}
              <div className="mb-4">
                <dt
                  className="text-xs tracking-wide uppercase mb-2"
                  style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)', letterSpacing: '0.08em' }}
                >
                  Use of funds
                </dt>
                <dd className="text-sm" style={{ color: 'var(--color-ink)', lineHeight: 1.6 }}>
                  {listing.fundingPurpose}
                </dd>
              </div>

              {/* Divider */}
              <div className="my-4" style={{ borderTop: '1px solid var(--color-rule)' }} aria-hidden="true" />

              {/* Description */}
              <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink)' }}>
                {listing.description}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
