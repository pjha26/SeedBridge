import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Site-wide navigation bar.
 * Shown on all pages except the landing page (which has its own Nav).
 *
 * Logged-out: Log in + Get started
 * Logged-in:  user's name + Logout
 */
export default function AppNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

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
        <Link
          to="/"
          className="font-bold text-xl transition-opacity hover:opacity-75"
          style={{
            fontFamily: 'var(--font-serif)',
            fontVariationSettings: "'opsz' 20",
            color: 'var(--color-ink)',
          }}
          aria-label="SeedBridge home"
        >
          SeedBridge
        </Link>

        <nav aria-label="Primary navigation">
          <ul className="flex items-center gap-6 list-none">
            {user ? (
              <>
                <li>
                  <Link
                    to="/listings"
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
                  >
                    Browse
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
                  >
                    {user.name}
                  </span>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85"
                    style={{
                      border: '1.5px solid var(--color-clay)',
                      color: 'var(--color-clay)',
                      fontFamily: 'var(--font-sans)',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    Log out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
                  >
                    Log in
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85"
                    style={{
                      backgroundColor: 'var(--color-clay)',
                      color: 'var(--color-white)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    Get started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
