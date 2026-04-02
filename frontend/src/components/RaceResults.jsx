import React from'react';import{motion}from'framer-motion';import{useNavigate}from'react-router-dom';import{useGameStore}from'../store/gameStore';
export default function RaceResults({onAgain}){
  const{raceResults}=useGameStore();const nav=useNavigate();
  if(!raceResults)return null;
  const{position,lapTime,totalTime,score}=raceResults;
  const fmt=s=>`${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toFixed(2).padStart(5,'0')}`;
  const medals=['🥇','🥈','🥉',''];
  return(<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.8)',backdropFilter:'blur(8px)'}}>
    <motion.div initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:200}}
      className="glass" style={{width:460,padding:40,textAlign:'center',border:'1px solid rgba(255,51,102,.3)'}}>
      <div style={{fontSize:64,marginBottom:8}}>{medals[Math.min(position-1,3)]}</div>
      <div className="orb nred" style={{fontSize:32,fontWeight:900,marginBottom:4}}>RACE COMPLETE</div>
      <div style={{fontFamily:'Orbitron',fontSize:14,color:'var(--gold)'}}>POSITION P{position}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,margin:'28px 0'}}>
        {[['BEST LAP',fmt(lapTime)],['TOTAL TIME',fmt(totalTime)],['POSITION',`P${position}`],['SCORE',score]].map(([l,v])=>(
          <div key={l} className="glass" style={{padding:14,borderTop:'2px solid var(--red)'}}>
            <div style={{fontFamily:'Orbitron',fontSize:9,color:'var(--dim)',letterSpacing:'.15em',marginBottom:4}}>{l}</div>
            <div style={{fontFamily:'Orbitron',fontSize:22,color:'var(--cyan)',fontWeight:700}}>{v}</div>
          </div>))}
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'center'}}>
        <button className="btn btn-p" onClick={onAgain} style={{fontSize:12,padding:'14px 28px'}}>RACE AGAIN</button>
        <button className="btn btn-s" onClick={()=>nav('/leaderboard')} style={{fontSize:11,padding:'14px 20px'}}>LEADERBOARD</button>
        <button className="btn btn-s" onClick={()=>nav('/profile')} style={{fontSize:11,padding:'14px 20px'}}>PROFILE</button>
      </div>
    </motion.div>
  </div>);
}
