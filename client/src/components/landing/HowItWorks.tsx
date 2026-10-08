import { howItWorks } from '../../content/landing';

/**
 * Desktop: three stops along a horizontal arc.
 * Mobile (<768px): vertical track with the arc running down the left side.
 */
export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="py-20 md:py-28"
      style={{ borderBottom: '1px solid var(--color-rule)' }}
    >
      <div className="container">

        {/* Heading */}
        <div className="mb-14 md:mb-20" data-reveal>
          <span
            className="block text-xs tracking-widest uppercase mb-3"
            style={{ color: 'var(--color-clay)', fontFamily: 'var(--font-sans)' }}
            aria-hidden="true"
          >
            §&nbsp;02
          </span>
          <h2
            id="how-heading"
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: 'var(--font-serif)',
              fontVariationSettings: "'opsz' 36",
            }}
          >
            {howItWorks.heading}
          </h2>
        </div>

        {/* ── Desktop track ──────────────────────────────────── */}
        <div className="hidden md:block relative" data-reveal>
          {/* Arc SVG spans the full width behind the steps */}
          <svg
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-x-0 top-4 w-full"
            style={{ height: '80px', pointerEvents: 'none' }}
          >
            <path
              d="M 60 70 C 300 0, 700 0, 940 70"
              stroke="var(--color-clay-light)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <ol className="relative grid grid-cols-3 gap-8 list-none">
            {howItWorks.steps.map((step, i) => (
              <li
                key={step.number}
                className="flex flex-col items-start pt-20"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Stop dot on the arc */}
                <div
                  className="absolute"
                  aria-hidden="true"
                  style={{
                    // Position dots roughly at 10%, 50%, 90% horizontally, just on the arc
                    left: `${[8, 49, 90][i]}%`,
                    top: i === 1 ? '6px' : '22px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '2px solid var(--color-clay)',
                    background: 'var(--color-paper)',
                    transform: 'translateX(-50%)',
                  }}
                />

                <span
                  className="text-4xl font-bold mb-3 block"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontVariationSettings: "'opsz' 48, 'ital' 1",
                    color: 'var(--color-rule)',
                    lineHeight: 1,
                  }}
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontVariationSettings: "'opsz' 24",
                    color: 'var(--color-ink)',
                  }}
                >
                  {step.label}
                </h3>
                <p style={{ color: 'var(--color-forest)', lineHeight: 1.65 }}>
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Mobile track (vertical) ──────────────────────── */}
        <div className="md:hidden relative pl-10" data-reveal>
          {/* Vertical arc line down the left */}
          <svg
            viewBox="0 0 40 300"
            aria-hidden="true"
            className="absolute left-0 top-0 h-full"
            style={{ width: '40px', pointerEvents: 'none' }}
            preserveAspectRatio="none"
          >
            <path
              d="M 28 20 C 8 80, 8 200, 28 280"
              stroke="var(--color-clay-light)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <ol className="list-none space-y-12">
            {howItWorks.steps.map((step) => (
              <li key={step.number} className="relative">
                {/* Stop dot */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '-34px',
                    top: '8px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '2px solid var(--color-clay)',
                    background: 'var(--color-paper)',
                  }}
                />
                <span
                  className="block text-xs tracking-widest uppercase mb-1"
                  style={{ color: 'var(--color-clay)', fontFamily: 'var(--font-sans)' }}
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontVariationSettings: "'opsz' 24",
                    color: 'var(--color-ink)',
                  }}
                >
                  {step.label}
                </h3>
                <p style={{ color: 'var(--color-forest)', lineHeight: 1.65 }}>
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </section>
  );
}
