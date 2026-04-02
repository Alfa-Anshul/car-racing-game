import React,{useEffect,useState}from'react';import{motion}from'framer-motion';import api from'../utils/api';
export default function Leaderboard(){
  const[rows,setRows]=useState([]);const[load,setLoad]=useState(true);
  useEffect(()=>{api.get('/leaderboard/').then(r=>setRows(r.data)).catch(()=>{}).finally(()=>setLoad(false));},[]);
  const medals=['🥇','🥈','🥉'];
  const fmt=s=>s?`${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toFixed(2).padStart(5,'0')}`:'--:--';
  return(<div style={{width:'100%',height:'100%',overflow:'auto',padding:32}}>
    <div style={{maxWidth:860,margin:'0 auto'}}>
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} style={{textAlign:'center',marginBottom:32}}>
        <div className="orb nred" style={{fontSize:36,fontWeight:900}}>🏆 LEADERBOARD</div>
        <div style={{color:'var(--dim)',fontFamily:'Rajdhani',fontSize:15,marginTop:4}}>Global Rankings</div>
      </motion.div>
      {load?<div style={{textAlign:'center',fontFamily:'Orbitron',fontSize:13,color:'var(--cyan)',animation:'pulse 1s infinite'}}>LOADING...</div>:
        rows.length===0?<div style={{textAlign:'center',fontFamily:'Orbitron',fontSize:13,color:'var(--dim)',marginTop:40}}>No races submitted yet. Be the first!</div>:
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {rows.map((r,i)=>(
            <motion.div key={r.username} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*.04}}
              className="glass" style={{padding:'16px 24px',display:'flex',alignItems:'center',gap:20,border:`1px solid ${i===0?'rgba(255,215,0,.3)':i===1?'rgba(192,192,192,.3)':i===2?'rgba(205,127,50,.3)':'var(--border)'}`,background:i<3?`rgba(255,215,0,.03)`:'rgba(255,255,255,.02)'}}>
              <div style={{width:40,textAlign:'center',fontFamily:'Orbitron',fontSize:i<3?22:14,fontWeight:900,color:['var(--gold)','#c0c0c0','#cd7f32','var(--dim)'][Math.min(i,3)]}}>{i<3?medals[i]:i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'Orbitron',fontSize:15,fontWeight:700,color:'var(--text)'}}>{r.username}</div>
                <div style={{fontSize:11,color:'var(--dim)',marginTop:2}}>{r.total_races} races</div>
              </div>
              <div style={{display:'flex',gap:32,textAlign:'center'}}>
                <div><div style={{fontFamily:'Orbitron',fontSize:9,color:'var(--dim)',letterSpacing:'.1em'}}>SCORE</div><div style={{fontFamily:'Orbitron',fontSize:18,color:'var(--red)',fontWeight:700}}>{r.total_score}</div></div>
                <div><div style={{fontFamily:'Orbitron',fontSize:9,color:'var(--dim)',letterSpacing:'.1em'}}>BEST LAP</div><div style={{fontFamily:'Orbitron',fontSize:14,color:'var(--cyan)'}}>{fmt(r.best_lap)}</div></div>
              </div>
            </motion.div>))}
        </div>}
    </div>
  </div>);
}
