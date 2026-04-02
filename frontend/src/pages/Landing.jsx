import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

export default function Landing() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (token) { navigate('/game'); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.5 ? '#ff3366' : '#00f5ff'
    }));

    let raf;
    const render = () => {
      ctx.fillStyle = 'rgba(10,10,15,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(raf);
  }, [token]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#0a0a0f' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Grid lines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,51,102,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,51,102,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 32 }}>

        <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 'clamp(48px,8vw,96px)', fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>
            <span className="neon-text-red">TURBO</span>
            <span className="neon-text-cyan">RACE</span>
          </div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 16, letterSpacing: '0.4em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Multiplayer · WebGL · Shaders</div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} style={{ display: 'flex', gap: 16 }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" onClick={() => navigate('/auth')} style={{ fontSize: 14, padding: '16px 40px' }}>
            START ENGINE
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-secondary" onClick={() => navigate('/leaderboard')} style={{ fontSize: 12, padding: '16px 32px' }}>
            LEADERBOARD
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: 'flex', gap: 48, marginTop: 16 }}>
          {[['3D GRAPHICS','WebGL Shaders'],['WASD CONTROLS','Responsive Physics'],['LEADERBOARD','Global Rankings'],['PROFILES','Race Stats']].map(([title, sub]) => (
            <div key={title} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.1em' }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', fontFamily: 'Orbitron', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>car.anervea.live</div>
    </div>
  );
}
