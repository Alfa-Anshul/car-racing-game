import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--dark)', overflow: 'hidden' }}>
      <nav style={{
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: 'rgba(10,10,15,0.95)',
        borderBottom: '1px solid rgba(255,51,102,0.3)',
        backdropFilter: 'blur(20px)', zIndex: 100, flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span className="font-orbitron neon-text-red" style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.1em' }}>
            TURBO<span style={{ color: 'var(--cyan)' }}>RACE</span>
          </span>
          {[['game','🏎️ RACE'],['garage','🔧 GARAGE'],['leaderboard','🏆 BOARD'],['profile','👤 PROFILE']].map(([path, label]) => (
            <NavLink key={path} to={`/${path}`} style={({ isActive }) => ({
              fontFamily: 'Orbitron',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: isActive ? 'var(--red)' : 'var(--text-dim)',
              textDecoration: 'none',
              padding: '4px 0',
              borderBottom: isActive ? '2px solid var(--red)' : '2px solid transparent',
              transition: 'all 0.2s'
            })}>{label}</NavLink>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: 12, color: 'var(--cyan)' }}>{user?.username}</span>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '6px 16px', fontSize: 10 }}>LOGOUT</button>
        </div>
      </nav>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </div>
    </div>
  );
}
