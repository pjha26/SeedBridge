import { twoSides } from '../../content/landing';

export default function TwoSides() {
  return (
    <section
      aria-labelledby="two-sides-heading"
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
            §&nbsp;03
          </span>
          <h2
            id="two-sides-heading"
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: 'var(--font-serif)',
              fontVariationSettings: "'opsz' 36",
            }}
          >
            {twoSides.heading}
          </h2>
        </div>

        {/* Split — owner wider (7 cols) | thin rule | investor (4 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Owner */}
          <div className="md:col-span-7" data-reveal>
            <span
              className="block text-xs tracking-widest uppercase mb-5"
              style={{
                color: 'var(--color-forest)',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.14em',
              }}
            >
              {twoSides.owner.role}
            </span>
            <ul className="space-y-4 mb-8">
              {twoSides.owner.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-4 text-base md:text-lg"
                  style={{ color: 'var(--color-ink)', lineHeight: 1.6 }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 shrink-0 block w-2 h-2 rounded-full"
                    style={{ background: 'var(--color-seed)' }}
                  />
                  {point}
                </li>
              ))}
            </ul>
            <a
              href="/register?role=owner"
              className="inline-block px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-85"
              style={{
                backgroundColor: 'var(--color-clay)',
                color: 'var(--color-white)',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.01em',
              }}
            >
              {twoSides.owner.cta}
            </a>
          </div>

          {/* Vertical rule — hidden on mobile */}
          <div
            className="hidden md:block md:col-span-1 justify-self-center"
            aria-hidden="true"
          >
            <div
              className="h-full mx-auto"
              style={{ width: '1px', background: 'var(--color-rule)' }}
            />
          </div>

          {/* Investor */}
          <div className="md:col-span-4" data-reveal style={{ transitionDelay: '80ms' }}>
            <span
              className="block text-xs tracking-widest uppercase mb-5"
              style={{
                color: 'var(--color-forest)',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.14em',
              }}
            >
              {twoSides.investor.role}
            </span>
            <ul className="space-y-4 mb-8">
              {twoSides.investor.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-4 text-base"
                  style={{ color: 'var(--color-ink)', lineHeight: 1.6 }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 shrink-0 block w-2 h-2 rounded-full"
                    style={{ background: 'var(--color-seed)' }}
                  />
                  {point}
                </li>
              ))}
            </ul>
            <a
              href="/register?role=investor"
              className="inline-block px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-85"
              style={{
                border: '1.5px solid var(--color-clay)',
                color: 'var(--color-clay)',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.01em',
              }}
            >
              {twoSides.investor.cta}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
