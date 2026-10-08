import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';

// Routes will grow as features are added.
// Keep this file as a thin routing shell only.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
