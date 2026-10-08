import { useEffect, useRef } from 'react';

/**
 * Illustration: seed with sprout (bottom-left) → arching bridge line → lantern (top-right).
 *
 * viewBox: 0 0 360 300
 * Seed centre:    (52, 240)
 * Arc start:      (52, 210)  — top of seed sprout
 * Arc end:        (308, 68)  — top of lantern hook
 * Arc control:    C 80 80, 240 40  — single cubic, rises well above centre
 *
 * pathLength="1" on the bridge path keeps dash animation on a 0–1 scale
 * regardless of actual computed path length.
 *
 * Final state (stroke-dashoffset: 0) is set immediately as a default style,
 * then overridden by the CSS animation class when JS + motion are available.
 * This means the arc is always visible even if animation never runs.
 */
export default function SeedBridgeIllustration() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // default style already shows it fully drawn

    // Reset to hidden, then trigger the draw animation next frame
    el.style.strokeDashoffset = '1';
    const frame = requestAnimationFrame(() => {
      el.classList.add('animate');
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const INK = 'var(--color-ink)';
  const FOREST = 'var(--color-forest)';
  const CLAY = 'var(--color-clay)';
  const SEED_Y = 'var(--color-seed)';
  const RULE = 'var(--color-rule)';
  const PAPER = 'var(--color-paper)';

  return (
    <svg
      viewBox="0 0 360 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="A sprouting seed on the left, connected by an arching line to a hanging lantern on the right"
      role="img"
      className="w-full h-auto select-none"
      style={{ maxHeight: '420px' }}
    >

      {/* ── Ground line ──────────────────────────────────────── */}
      <line
        x1="20" y1="268"
        x2="120" y2="268"
        stroke={RULE}
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* ── Seed body (teardrop: pointed top, rounded bottom) ── */}
      {/*
        Drawn as a single path so it reads as one shape.
        Seed sits with its base at y≈260, tip at y≈220.
      */}
      <path
        d="M 52 220 C 38 230, 34 248, 42 258 Q 52 268 62 258 C 70 248 66 230 52 220 Z"
        stroke={FOREST}
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />

      {/* Seed centre crease */}
      <path
        d="M 52 222 Q 48 242 52 260"
        stroke={FOREST}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* ── Sprout (two small leaves + stem rising from seed tip) */}
      {/* Stem */}
      <line
        x1="52" y1="220"
        x2="52" y2="200"
        stroke={FOREST}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <path
        d="M 52 210 Q 38 204 36 196 Q 44 196 52 206"
        stroke={FOREST}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right leaf */}
      <path
        d="M 52 207 Q 66 200 70 192 Q 62 194 52 204"
        stroke={FOREST}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Bridge arc ───────────────────────────────────────── */}
      {/*
        Starts at sprout tip (52, 198), arches to lantern hook (308, 72).
        Control points lift the curve well above centre so it reads clearly.
        stroke-dashoffset:0 by default → always visible.
        The animate class overrides this with the keyframe animation.
      */}
      <path
        ref={pathRef}
        d="M 52 198 C 90 80, 240 40, 308 72"
        stroke={CLAY}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        pathLength="1"
        className="bridge-path"
        style={{ strokeDashoffset: 0 }}
      />

      {/* ── Lantern ───────────────────────────────────────────── */}
      {/*
        Hook chain: a short vertical line + small arc, ending at the cap.
        Cap: a trapezoid-ish shape (wider at bottom).
        Body: rectangular cage with vertical bars.
        Base: a small tapered bottom.
        The whole lantern sits centred on x=308, top at y≈72.
      */}

      {/* Chain / hook loop */}
      <path
        d="M 308 72 L 308 58"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M 304 58 Q 308 52 312 58"
        stroke={INK}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Cap (wider than body, sits on top) */}
      <path
        d="M 296 72 Q 300 68 308 67 Q 316 68 320 72"
        stroke={INK}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      {/* Cap top-edge crossbar */}
      <line
        x1="297" y1="72"
        x2="319" y2="72"
        stroke={INK}
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Body frame */}
      <rect
        x="299" y="72"
        width="18" height="32"
        stroke={INK}
        strokeWidth="1.6"
        fill="none"
        rx="1"
      />

      {/* Vertical bars inside body (give it the cage feel) */}
      <line x1="305" y1="72" x2="305" y2="104" stroke={INK} strokeWidth="1" opacity="0.55" />
      <line x1="311" y1="72" x2="311" y2="104" stroke={INK} strokeWidth="1" opacity="0.55" />

      {/* Mid crossbar */}
      <line
        x1="299" y1="88"
        x2="317" y2="88"
        stroke={INK}
        strokeWidth="1"
        opacity="0.55"
      />

      {/* Flame / light inside — small pointed oval */}
      <ellipse
        cx="308" cy="84"
        rx="4" ry="6"
        fill={SEED_Y}
        opacity="0.5"
      />
      <path
        d="M 308 78 L 308 74"
        stroke={SEED_Y}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Base — tapered cap mirroring the top */}
      <path
        d="M 299 104 Q 300 110 308 112 Q 316 110 317 104"
        stroke={INK}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Small dots where arc meets lantern & seed ────────── */}
      <circle cx="308" cy="72" r="3.5" fill={PAPER} stroke={CLAY} strokeWidth="1.8" />
      <circle cx="52"  cy="198" r="3.5" fill={PAPER} stroke={CLAY} strokeWidth="1.8" />

    </svg>
  );
}
