import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', background:'var(--dark)', color:'#fff' }}>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(5,5,15,0.92)', backdropFilter:'blur(12px)', borderBottom:'1px solid #1a1a2e', display:'flex', alignItems:'center', padding:'0 24px', height:56 }}>
        <span onClick={() => navigate('/')} style={{ fontFamily:'Orbitron,sans-serif', fontSize:16, letterSpacing:6, cursor:'pointer', marginRight:'auto',
          background:'linear-gradient(90deg,var(--red),var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>TURBORACE</span>
        <div style={{ display:'flex', gap:4 }}>
          {[
            { to:'/game', label:'RACE' },
            { to:'/garage', label:'GARAGE' },
            { to:'/leaderboard', label:'BOARD' },
            token ? { to:'/profile', label:'PROFILE' } : { to:'/auth', label:'LOGIN' },
          ].map(link => (
            <NavLink key={link.to} to={link.to}
              style={({ isActive }) => ({ fontFamily:'Orbitron,sans-serif', fontSize:10, letterSpacing:3, padding:'6px 14px', borderRadius:6, textDecoration:'none',
                color: isActive ? 'var(--cyan)' : '#555', background: isActive ? 'rgba(0,204,255,0.08)' : 'transparent', transition:'all 0.2s' })}>
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <Outlet />
    </div>
  );
}