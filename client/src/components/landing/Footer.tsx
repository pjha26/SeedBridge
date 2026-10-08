import { footer } from '../../content/landing';

export default function Footer() {
  return (
    <footer role="contentinfo" className="py-10">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* Brand + tagline */}
          <div>
            <span
              className="block font-bold text-lg"
              style={{ fontFamily: 'var(--font-serif)', fontVariationSettings: "'opsz' 20", color: 'var(--color-ink)' }}
            >
              SeedBridge
            </span>
            <span className="block text-sm mt-1" style={{ color: 'var(--color-forest)' }}>
              {footer.tagline}
            </span>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-6 list-none">
              {footer.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div
          className="mt-8 mb-6 h-px"
          style={{ background: 'var(--color-rule)' }}
          aria-hidden="true"
        />

        <p className="text-xs" style={{ color: 'var(--color-forest)' }}>
          {footer.legal}
        </p>
      </div>
    </footer>
  );
}
