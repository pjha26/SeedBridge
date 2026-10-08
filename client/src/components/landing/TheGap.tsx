import { gap } from '../../content/landing';

export default function TheGap() {
  return (
    <section
      aria-labelledby="gap-heading"
      className="py-20 md:py-28"
      style={{ borderBottom: '1px solid var(--color-rule)' }}
    >
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* ── Section label column ─────────────────────────── */}
          <div className="md:col-span-3">
            <div className="md:sticky md:top-12" data-reveal>
              <span
                className="block text-xs tracking-widest uppercase mb-3"
                style={{ color: 'var(--color-clay)', fontFamily: 'var(--font-sans)' }}
                aria-hidden="true"
              >
                §&nbsp;01
              </span>
              <h2
                id="gap-heading"
                className="text-3xl md:text-4xl font-bold"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontVariationSettings: "'opsz' 36",
                  color: 'var(--color-ink)',
                }}
              >
                {gap.heading}
              </h2>
            </div>
          </div>

          {/* ── Body text ────────────────────────────────────── */}
          <div
            className="md:col-span-8 md:col-start-5"
            style={{
              borderLeft: '2px solid var(--color-seed)',
              paddingLeft: '2rem',
            }}
          >
            {gap.body.map((para, i) => (
              <p
                key={i}
                data-reveal
                className="text-lg md:text-xl mb-6 last:mb-0"
                style={{
                  color: 'var(--color-ink)',
                  lineHeight: 1.75,
                  fontFamily: 'var(--font-sans)',
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                {para}
              </p>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
