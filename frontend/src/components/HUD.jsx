import { useGameStore } from '../store/gameStore';

function fmt(t) {
  const m = Math.floor(t/60), s = (t%60).toFixed(2).padStart(5,'0');
  return `${m}:${s}`;
}

export default function HUD() {
  const { lap, totalLaps, lapTime, bestLap, position } = useGameStore();
  return (
    <div style={{ position:'fixed', top:64, left:0, right:0, pointerEvents:'none', zIndex:50, padding:'0 20px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
      <div style={{ background:'rgba(0,0,0,0.7)', borderRadius:10, padding:'12px 20px', border:'1px solid rgba(255,34,68,0.3)', backdropFilter:'blur(8px)' }}>
        <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:10, color:'#555', letterSpacing:3, marginBottom:4 }}>LAP TIME</div>
        <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:22, color:'var(--cyan)' }}>{fmt(lapTime)}</div>
        {bestLap && <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:10, color:'#555', marginTop:4 }}>BEST {fmt(bestLap)}</div>}
      </div>
      <div style={{ background:'rgba(0,0,0,0.7)', borderRadius:10, padding:'12px 20px', border:'1px solid rgba(0,204,255,0.3)', backdropFilter:'blur(8px)', textAlign:'center' }}>
        <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:10, color:'#555', letterSpacing:3, marginBottom:4 }}>LAP</div>
        <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:22 }}><span style={{ color:'var(--gold)' }}>{lap}</span><span style={{ color:'#333' }}>/{totalLaps}</span></div>
      </div>
      <div style={{ background:'rgba(0,0,0,0.7)', borderRadius:10, padding:'12px 20px', border:'1px solid rgba(255,204,0,0.3)', backdropFilter:'blur(8px)', textAlign:'right' }}>
        <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:10, color:'#555', letterSpacing:3, marginBottom:4 }}>POSITION</div>
        <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:22, color:'var(--gold)' }}>#{position}</div>
      </div>
    </div>
  );
}