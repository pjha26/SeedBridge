import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FieldError from '../components/FieldError';
import AppNav from '../components/AppNav';
import type { ApiError } from '../lib/types';

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  // If ProtectedRoute sent us here, return to the original destination
  const from         = (location.state as { from?: Location })?.from?.pathname ?? '/listings';

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // The server always returns the same generic message on auth failure.
      setError((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid var(--color-rule)',
    background: 'var(--color-paper)',
    color: 'var(--color-ink)',
    fontFamily: 'var(--font-sans)',
    fontSize: '1rem',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '0.8125rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-forest)',
    fontFamily: 'var(--font-sans)',
  };

  return (
    <>
      <AppNav />
      <main className="min-h-screen py-16" style={{ background: 'var(--color-paper)' }}>
        <div className="container">
          <div style={{ maxWidth: '460px' }}>

            <div className="mb-1 h-px w-12" style={{ background: 'var(--color-seed)' }} aria-hidden="true" />
            <h1
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-serif)', fontVariationSettings: "'opsz' 40'" }}
            >
              Log in
            </h1>
            <p className="mb-8 text-base" style={{ color: 'var(--color-forest)' }}>
              No account yet?{' '}
              <Link to="/register" style={{ color: 'var(--color-clay)' }}>
                Create one
              </Link>
            </p>

            {error && (
              <div
                role="alert"
                className="mb-6 px-4 py-3 text-sm"
                style={{ background: '#FEF2F0', border: '1px solid var(--color-clay)', color: 'var(--color-clay)' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-5">
                <label htmlFor="email" style={labelStyle}>Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
                <FieldError message={undefined} />
              </div>

              <div className="mb-8">
                <label htmlFor="password" style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: '80px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', color: 'var(--color-forest)',
                      fontFamily: 'var(--font-sans)',
                    }}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-base font-semibold"
                style={{
                  background: submitting ? 'var(--color-rule)' : 'var(--color-clay)',
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-sans)',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Logging in…' : 'Log in'}
              </button>
            </form>

          </div>
        </div>
      </main>
    </>
  );
}
