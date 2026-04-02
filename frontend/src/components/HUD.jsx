import React,{useEffect,useState,useRef}from'react';import{useGameStore}from'../store/gameStore';
export default function HUD({lapTime}){
  const{lap,totalLaps,bestLap,position,phase}=useGameStore();const[el,setEl]=useState(0);const sr=useRef(Date.now());
  useEffect(()=>{if(phase!=='racing')return;sr.current=Date.now();const iv=setInterval(()=>setEl((Date.now()-sr.current)/1000),100);return()=>clearInterval(iv);},[phase]);
  const fmt=s=>`${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toFixed(2).padStart(5,'0')}`;
  return(<div style={{position:'absolute',inset:0,pointerEvents:'none',userSelect:'none'}}>
    <div style={{position:'absolute',top:16,left:0,right:0,display:'flex',justifyContent:'space-between',padding:'0 24px'}}>
      <div className="glass" style={{padding:'10px 20px',borderLeft:'3px solid var(--red)'}}><div style={{fontFamily:'Orbitron',fontSize:9,color:'var(--dim)',letterSpacing:'.2em'}}>LAP</div><div className="nred orb" style={{fontSize:28,fontWeight:900}}>{lap}/{totalLaps}</div></div>
      <div className="glass" style={{padding:'10px 24px',textAlign:'center',borderTop:'2px solid var(--cyan)'}}><div style={{fontFamily:'Orbitron',fontSize:9,color:'var(--dim)',letterSpacing:'.2em'}}>TIME</div><div className="ncyan orb" style={{fontSize:24,fontWeight:700}}>{fmt(el)}</div></div>
      <div className="glass" style={{padding:'10px 20px',textAlign:'right',borderRight:'3px solid var(--gold)'}}><div style={{fontFamily:'Orbitron',fontSize:9,color:'var(--dim)',letterSpacing:'.2em'}}>POS</div><div style={{fontFamily:'Orbitron',fontSize:28,fontWeight:900,color:'var(--gold)'}}>P{position}</div></div>
    </div>
    {bestLap<Infinity&&<div style={{position:'absolute',top:88,right:24}} className="glass"><div style={{padding:'5px 12px',fontFamily:'Orbitron',fontSize:9,color:'var(--gold)'}}>BEST {fmt(bestLap)}</div></div>}
    <div style={{position:'absolute',bottom:20,left:20}} className="glass"><div style={{padding:'8px 14px',display:'flex',gap:14}}>{[['W','↑'],['A','←'],['S','↓'],['D','→']].map(([k,a])=>(<div key={k} style={{textAlign:'center'}}><div style={{fontFamily:'Orbitron',fontSize:9,color:'var(--cyan)'}}>{k}</div><div style={{fontSize:10,color:'var(--dim)'}}>{a}</div></div>))}</div></div>
  </div>);
}
