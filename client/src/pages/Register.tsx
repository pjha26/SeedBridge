import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FieldError from '../components/FieldError';
import AppNav from '../components/AppNav';
import type { ApiError } from '../lib/types';

type Role = 'owner' | 'investor';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  general?: string;
}

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [params]     = useSearchParams();

  // Pre-select role from landing page CTA query param (?role=owner|investor)
  const initialRole = (params.get('role') === 'investor' ? 'investor' : 'owner') as Role;

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [role, setRole]           = useState<Role>(initialRole);
  const [errors, setErrors]       = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function mapServerErrors(err: ApiError): FieldErrors {
    // Map Zod issues to field errors by path
    const fe: FieldErrors = {};
    if (err.issues) {
      err.issues.forEach(({ path, message }) => {
        if (path === 'name' || path === 'email' || path === 'password' || path === 'role') {
          fe[path] = message;
        } else {
          fe.general = message;
        }
      });
    } else {
      fe.general = err.message;
    }
    return fe;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await register(name, email, password, role);
      navigate('/listings');
    } catch (err) {
      setErrors(mapServerErrors(err as ApiError));
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

            {/* Section marker */}
            <div className="mb-1 h-px w-12" style={{ background: 'var(--color-seed)' }} aria-hidden="true" />

            <h1
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-serif)', fontVariationSettings: "'opsz' 40' " }}
            >
              Create your account
            </h1>
            <p className="mb-8 text-base" style={{ color: 'var(--color-forest)' }}>
              Already have one?{' '}
              <Link to="/login" style={{ color: 'var(--color-clay)' }}>
                Log in
              </Link>
            </p>

            {/* Role toggle */}
            <div className="mb-8">
              <span style={labelStyle}>I am a</span>
              <div className="flex gap-0" role="group" aria-label="Account type">
                {(['owner', 'investor'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="flex-1 py-3 text-sm font-semibold transition-colors"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      border: '1.5px solid var(--color-clay)',
                      borderRight: r === 'owner' ? 'none' : undefined,
                      background: role === r ? 'var(--color-clay)' : 'transparent',
                      color:      role === r ? 'var(--color-white)' : 'var(--color-clay)',
                      cursor: 'pointer',
                    }}
                    aria-pressed={role === r}
                  >
                    {r === 'owner' ? 'Business owner' : 'Investor'}
                  </button>
                ))}
              </div>
              <FieldError message={errors.role} />
            </div>

            {errors.general && (
              <div
                role="alert"
                className="mb-6 px-4 py-3 text-sm"
                style={{ background: '#FEF2F0', border: '1px solid var(--color-clay)', color: 'var(--color-clay)' }}
              >
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Name */}
              <div className="mb-5">
                <label htmlFor="name" style={labelStyle}>Name</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                <FieldError message={errors.name} />
              </div>

              {/* Email */}
              <div className="mb-5">
                <label htmlFor="email" style={labelStyle}>Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                <FieldError message={errors.email} />
              </div>

              {/* Password */}
              <div className="mb-8">
                <label htmlFor="password" style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: '80px' }}
                    aria-describedby={errors.password ? 'pw-error' : undefined}
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
                <p className="mt-1 text-xs" style={{ color: 'var(--color-forest)' }}>
                  8–72 characters
                </p>
                <FieldError message={errors.password} />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-base font-semibold transition-opacity"
                style={{
                  background: submitting ? 'var(--color-rule)' : 'var(--color-clay)',
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-sans)',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Creating account…' : 'Create account'}
              </button>
            </form>

          </div>
        </div>
      </main>
    </>
  );
}
