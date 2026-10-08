import { straightTalk } from '../../content/landing';

export default function StraightTalk() {
  return (
    <section
      aria-labelledby="straight-talk-heading"
      className="py-20 md:py-28"
      style={{ borderBottom: '1px solid var(--color-rule)' }}
    >
      <div className="container">
        <div className="max-w-2xl" data-reveal>

          {/* Seed-yellow rule above */}
          <div
            className="mb-8 h-px"
            style={{ background: 'var(--color-seed)' }}
            aria-hidden="true"
          />

          <span
            className="block text-xs tracking-widest uppercase mb-4"
            style={{ color: 'var(--color-clay)', fontFamily: 'var(--font-sans)' }}
            aria-hidden="true"
          >
            §&nbsp;05
          </span>

          <h2
            id="straight-talk-heading"
            className="text-3xl md:text-4xl font-bold mb-8"
            style={{
              fontFamily: 'var(--font-serif)',
              fontVariationSettings: "'opsz' 36",
            }}
          >
            {straightTalk.heading}
          </h2>

          <div className="space-y-5">
            {straightTalk.body.map((para, i) => (
              <p
                key={i}
                className="text-base md:text-lg leading-relaxed"
                style={{ color: 'var(--color-ink)' }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Seed-yellow rule below */}
          <div
            className="mt-8 h-px"
            style={{ background: 'var(--color-seed)' }}
            aria-hidden="true"
          />

        </div>
      </div>
    </section>
  );
}
