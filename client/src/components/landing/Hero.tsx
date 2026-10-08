import { hero } from '../../content/landing';
import SeedBridgeIllustration from './SeedBridgeIllustration';

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      style={{ borderBottom: '1px solid var(--color-rule)' }}
      className="pt-16 pb-12 md:pt-24 md:pb-20"
    >
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">

          {/* ── Text column (left, 7/12) ─────────────────────── */}
          <div className="md:col-span-7">
            {/* Eyebrow rule */}
            <div
              className="mb-6 h-px w-16"
              style={{ background: 'var(--color-seed)' }}
              aria-hidden="true"
            />

            <h1
              id="hero-heading"
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
              style={{
                fontFamily: 'var(--font-serif)',
                fontVariationSettings: "'opsz' 64",
                whiteSpace: 'pre-line',
                letterSpacing: '-0.01em',
                color: 'var(--color-ink)',
              }}
            >
              {hero.headline}
            </h1>

            <p
              className="text-lg md:text-xl mb-10 max-w-xl"
              style={{ color: 'var(--color-forest)', lineHeight: 1.6 }}
            >
              {hero.subline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/register?role=owner"
                className="inline-block px-7 py-4 text-base font-semibold transition-opacity hover:opacity-85"
                style={{
                  backgroundColor: 'var(--color-clay)',
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.01em',
                }}
              >
                {hero.ctaOwner}
              </a>
              <a
                href="/register?role=investor"
                className="inline-block px-7 py-4 text-base font-semibold transition-opacity hover:opacity-85"
                style={{
                  border: '1.5px solid var(--color-clay)',
                  color: 'var(--color-clay)',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.01em',
                }}
              >
                {hero.ctaInvestor}
              </a>
            </div>
          </div>

          {/* ── Illustration column (right, 5/12) ────────────── */}
          <div
            className="md:col-span-5 flex items-end justify-center"
            aria-hidden="true"
          >
            <div className="w-full max-w-sm md:max-w-none">
              <SeedBridgeIllustration />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
