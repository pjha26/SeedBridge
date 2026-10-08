import { cta } from '../../content/landing';

export default function CallToAction() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="py-24 md:py-36"
      style={{ borderBottom: '1px solid var(--color-rule)' }}
    >
      <div className="container">
        <div data-reveal>
          <h2
            id="cta-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-10 max-w-2xl"
            style={{
              fontFamily: 'var(--font-serif)',
              fontVariationSettings: "'opsz' 56",
              letterSpacing: '-0.01em',
            }}
          >
            {cta.heading}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/register?role=owner"
              className="inline-block px-8 py-4 text-base font-semibold transition-opacity hover:opacity-85"
              style={{
                backgroundColor: 'var(--color-clay)',
                color: 'var(--color-white)',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.01em',
              }}
            >
              {cta.ctaOwner}
            </a>
            <a
              href="/register?role=investor"
              className="inline-block px-8 py-4 text-base font-semibold transition-opacity hover:opacity-85"
              style={{
                border: '1.5px solid var(--color-clay)',
                color: 'var(--color-clay)',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.01em',
              }}
            >
              {cta.ctaInvestor}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
