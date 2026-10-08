export default function Nav() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-40 py-4"
      style={{
        background: 'var(--color-paper)',
        borderBottom: '1px solid var(--color-rule)',
      }}
    >
      <div className="container flex items-center justify-between">

        {/* Wordmark */}
        <a
          href="/"
          className="font-bold text-xl transition-opacity hover:opacity-75"
          style={{
            fontFamily: 'var(--font-serif)',
            fontVariationSettings: "'opsz' 20",
            color: 'var(--color-ink)',
          }}
          aria-label="SeedBridge home"
        >
          SeedBridge
        </a>

        {/* Nav links */}
        <nav aria-label="Primary navigation">
          <ul className="flex items-center gap-6 list-none">
            <li className="hidden sm:block">
              <a
                href="#how-it-works"
                className="text-sm transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                How it works
              </a>
            </li>
            <li>
              <a
                href="/login"
                className="text-sm transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                Log in
              </a>
            </li>
            <li>
              <a
                href="/register"
                className="px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85"
                style={{
                  backgroundColor: 'var(--color-clay)',
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Get started
              </a>
            </li>
          </ul>
        </nav>

      </div>
    </header>
  );
}
