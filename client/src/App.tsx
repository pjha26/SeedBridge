import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import ProtectedRoute from './components/ProtectedRoute';

function DashboardPage() {
  return <div style={{ padding: '4rem 2rem', fontFamily: 'var(--font-sans)' }}>Dashboard coming soon.</div>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/listings"
          element={
            <ProtectedRoute>
              <Listings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/:id"
          element={
            <ProtectedRoute>
              <ListingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}
