import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  /** If provided, the route also requires this role. */
  role?: 'owner' | 'investor';
  children: React.ReactNode;
}

/**
 * Wraps a route that requires authentication.
 * - While the session is being restored (loading=true) renders nothing —
 *   avoids a flash of the login redirect before /me completes.
 * - If no user: redirect to /login, preserving the attempted path so we
 *   can send them back after login.
 * - If a role is required and the user's role doesn't match: redirect to
 *   /listings (not a 403 page — keep it simple for now).
 */
export default function ProtectedRoute({ role, children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // spinner could go here later

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/listings" replace />;
  }

  return <>{children}</>;
}
