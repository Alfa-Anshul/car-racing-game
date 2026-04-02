import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Landing() {
  const canvasRef = useRef();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 1.5 + 0.3,
      color: ['#ff2244','#00ccff','#ffcc00'][Math.floor(Math.random()*3)]
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,w,h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = p.color + 'aa';
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div style={{ position:'relative', height:'100vh', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, zIndex:0 }} />
      <div style={{ position:'relative', zIndex:1, textAlign:'center', padding:'0 20px' }}>
        <div style={{ fontSize:11, letterSpacing:8, color:'var(--red)', fontFamily:'Orbitron,sans-serif', marginBottom:16 }}>ANERVEA PRESENTS</div>
        <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(40px,10vw,96px)', fontWeight:900, letterSpacing:8, lineHeight:1, marginBottom:8,
          background:'linear-gradient(135deg,#fff 0%,var(--cyan) 40%,var(--red) 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>TURBORACE</h1>
        <p style={{ color:'#555', fontSize:13, letterSpacing:4, marginBottom:48 }}>3D MULTIPLAYER RACING — BUILT WITH AI</p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate(token ? '/game' : '/auth')}
            style={{ background:'linear-gradient(135deg,var(--red),var(--cyan))', border:'none', borderRadius:8, padding:'16px 40px', color:'#000', fontFamily:'Orbitron,sans-serif', fontSize:14, letterSpacing:4, cursor:'pointer', fontWeight:700 }}>
            {token ? 'CONTINUE RACING' : 'START RACING'}
          </button>
          <button onClick={() => navigate('/leaderboard')}
            style={{ background:'transparent', border:'1px solid var(--cyan)', borderRadius:8, padding:'16px 40px', color:'var(--cyan)', fontFamily:'Orbitron,sans-serif', fontSize:14, letterSpacing:4, cursor:'pointer' }}>
            LEADERBOARD
          </button>
        </div>
      </div>
    </div>
  );
}