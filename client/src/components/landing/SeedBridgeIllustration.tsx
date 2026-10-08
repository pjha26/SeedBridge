import { useEffect, useRef } from 'react';

/**
 * Hand-drawn-feeling SVG: a seed bottom-left connected by a single
 * arching bridge line to a lantern top-right.
 *
 * The bridge path uses pathLength="1" so the dash animation works
 * on a 0–1 scale without measuring the actual path length.
 */
export default function SeedBridgeIllustration() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      // Show fully drawn immediately
      pathRef.current?.style.setProperty('stroke-dashoffset', '0');
      return;
    }
    // Trigger the CSS animation by adding the class after mount
    const frame = requestAnimationFrame(() => {
      pathRef.current?.classList.add('animate');
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="A seed on the left connected by an arching bridge line to a lantern on the right"
      role="img"
      className="w-full h-auto select-none"
    >
      {/* ── Seed — bottom left ───────────────────────────────── */}
      {/* Outer seed shape */}
      <ellipse
        cx="68" cy="258"
        rx="18" ry="26"
        stroke="var(--color-forest)"
        strokeWidth="1.8"
        fill="none"
        transform="rotate(-20 68 258)"
      />
      {/* Inner cotyledon line */}
      <path
        d="M 60 244 Q 68 258 60 272"
        stroke="var(--color-forest)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Radicle (tiny root) */}
      <path
        d="M 72 278 Q 78 290 74 298"
        stroke="var(--color-forest)"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Bridge arc ───────────────────────────────────────── */}
      {/*
        Single cubic bezier from seed to lantern.
        pathLength="1" keeps the dash animation on a 0–1 scale.
      */}
      <path
        ref={pathRef}
        d="M 78 252 C 140 120, 260 60, 340 72"
        stroke="var(--color-clay-light)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        pathLength="1"
        className="bridge-path"
        style={{ '--color-clay-light': 'var(--color-clay-light)' } as React.CSSProperties}
      />

      {/* ── Small tick marks along the arc (bridge stops) ────── */}
      {[
        { x1: 148, y1: 165, x2: 144, y2: 158 },
        { x1: 220, y1: 110, x2: 216, y2: 103 },
        { x1: 292, y1: 82,  x2: 288, y2: 75  },
      ].map((tick, i) => (
        <line
          key={i}
          x1={tick.x1} y1={tick.y1}
          x2={tick.x2} y2={tick.y2}
          stroke="var(--color-seed)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      ))}

      {/* ── Lantern — top right ──────────────────────────────── */}
      {/* Hook */}
      <path
        d="M 340 72 Q 343 62 340 56"
        stroke="var(--color-forest)"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Body */}
      <rect
        x="330" y="56"
        width="20" height="28"
        rx="3"
        stroke="var(--color-forest)"
        strokeWidth="1.6"
        fill="none"
      />
      {/* Cross-bar top */}
      <line
        x1="330" y1="62"
        x2="350" y2="62"
        stroke="var(--color-forest)"
        strokeWidth="1.2"
      />
      {/* Glow suggestion — small seed-yellow circle */}
      <circle
        cx="340" cy="72"
        r="5"
        fill="var(--color-seed)"
        opacity="0.45"
      />
      {/* Base */}
      <path
        d="M 333 84 Q 340 92 347 84"
        stroke="var(--color-forest)"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Ground line under seed ───────────────────────────── */}
      <line
        x1="42" y1="294"
        x2="100" y2="294"
        stroke="var(--color-rule)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
