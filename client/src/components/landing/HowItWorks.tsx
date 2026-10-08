import { howItWorks } from '../../content/landing';

/**
 * Desktop: three stops along a horizontal arc drawn in SVG.
 *
 * Arc path: M 60 72 C 300 8, 700 8, 940 72
 * This is a cubic bezier. We calculate exact on-curve points at t=0, 0.5, 1
 * using the cubic bezier formula: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
 *
 * P0=(60,72)  P1=(300,8)  P2=(700,8)  P3=(940,72)
 * t=0   → x=60,  y=72   (left stop)
 * t=0.5 → x=500, y=24   (mid stop — apex)
 * t=1   → x=940, y=72   (right stop)
 *
 * Dots are SVG <circle> elements placed at those exact coordinates.
 * Column text is laid out in a 3-col grid whose columns are centred at
 * x=60, x=500, x=940 inside the same 1000-unit wide container, so
 * the dots sit directly above their column.
 *
 * The SVG uses a fixed viewBox="0 0 1000 90" with preserveAspectRatio="none"
 * only horizontally (xMidYMid meet would shrink it). Instead we set
 * preserveAspectRatio="none" but give the SVG a fixed px height so the
 * Y scale is stable and dots land on the arc.
 */

// Cubic bezier point at parameter t
function cubicPoint(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  t: number
): [number, number] {
  const mt = 1 - t;
  const x = mt ** 3 * p0[0] + 3 * mt ** 2 * t * p1[0] + 3 * mt * t ** 2 * p2[0] + t ** 3 * p3[0];
  const y = mt ** 3 * p0[1] + 3 * mt ** 2 * t * p1[1] + 3 * mt * t ** 2 * p2[1] + t ** 3 * p3[1];
  return [x, y];
}

const P0: [number, number] = [60, 72];
const P1: [number, number] = [300, 8];
const P2: [number, number] = [700, 8];
const P3: [number, number] = [940, 72];

// t values that put the stops at the column centres
// Col centres in a 3-col layout across [0..1000]: roughly x=167, x=500, x=833
// Solve for t where B_x(t) ≈ those values.
// For this symmetric arc:  t=0.15 → x≈167, t=0.5 → x=500, t=0.85 → x≈833
const stopPoints = [0.15, 0.5, 0.85].map((t) => cubicPoint(P0, P1, P2, P3, t));

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="py-20 md:py-28"
      style={{ borderBottom: '1px solid var(--color-rule)' }}
    >
      <div className="container">

        {/* ── Heading ──────────────────────────────────────────── */}
        <div className="mb-14 md:mb-16" data-reveal>
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
        <div className="hidden md:block" data-reveal>
          {/*
            The arc SVG and the text columns share the same container.
            SVG is display:block with a fixed height so its coordinate
            space is stable. Dots are circles placed at exact bezier points.
          */}
          <div className="relative">
            <svg
              viewBox="0 0 1000 90"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="w-full block"
              style={{ height: '90px' }}
            >
              {/* Arc */}
              <path
                d={`M ${P0[0]} ${P0[1]} C ${P1[0]} ${P1[1]}, ${P2[0]} ${P2[1]}, ${P3[0]} ${P3[1]}`}
                stroke="var(--color-clay)"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                opacity="0.55"
              />
              {/* Stop dots — placed at exact bezier coordinates */}
              {stopPoints.map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="6"
                  fill="var(--color-paper)"
                  stroke="var(--color-clay)"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>

          {/* Text columns — 3 equal cols, each centre aligns with a dot */}
          <ol className="grid grid-cols-3 gap-8 mt-8 list-none">
            {howItWorks.steps.map((step, i) => (
              <li
                key={step.number}
                className="flex flex-col items-start"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span
                  className="text-5xl font-bold mb-3 block"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontVariationSettings: "'opsz' 56, 'ital' 1",
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

        {/* ── Mobile track (vertical arc on left) ──────────────── */}
        <div className="md:hidden relative pl-12" data-reveal>
          {/*
            Vertical bezier down the left edge.
            The SVG is absolutely positioned, h-full stretches to the list height.
            Dots are SVG circles at t=0.1, t=0.5, t=0.9 on the curve.
          */}
          <svg
            viewBox="0 0 48 300"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute left-0 top-0 w-12"
            style={{ height: '100%', pointerEvents: 'none' }}
          >
            {/* Vertical arc */}
            <path
              d="M 32 10 C 8 60, 8 220, 32 290"
              stroke="var(--color-clay)"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />
            {/* Dots at t≈0.1, 0.5, 0.9 on the mobile arc */}
            {[
              [28, 36],
              [16, 150],
              [28, 264],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="5"
                fill="var(--color-paper)"
                stroke="var(--color-clay)"
                strokeWidth="2"
              />
            ))}
          </svg>

          <ol className="list-none space-y-14">
            {howItWorks.steps.map((step) => (
              <li key={step.number}>
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
