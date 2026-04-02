import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Game from './pages/Game';
import Garage from './pages/Garage';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

function Protected({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="auth" element={<Auth />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="game" element={<Protected><Game /></Protected>} />
          <Route path="garage" element={<Protected><Garage /></Protected>} />
          <Route path="profile" element={<Protected><Profile /></Protected>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}