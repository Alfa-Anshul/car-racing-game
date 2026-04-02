import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function CountdownOverlay() {
  const [count, setCount] = useState(3);
  const setPhase = useGameStore(s => s.setPhase);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => {
        if (c <= 1) { clearInterval(id); setPhase('racing'); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [setPhase]);

  return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, background:'rgba(0,0,0,0.4)', pointerEvents:'none' }}>
      <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:120, fontWeight:900,
        background: count > 1 ? 'linear-gradient(135deg,var(--red),var(--cyan))' : 'linear-gradient(135deg,var(--gold),#fff)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        animation:'pulse 0.8s ease-out' }}>
        {count > 0 ? count : 'GO!'}
      </div>
      <style>{`@keyframes pulse { from{transform:scale(1.5);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
}