import React,{useEffect,useState}from'react';import{motion}from'framer-motion';import api from'../utils/api';
export default function Profile(){
  const[data,setData]=useState(null);const[load,setLoad]=useState(true);
  useEffect(()=>{api.get('/users/me').then(r=>setData(r.data)).catch(()=>{}).finally(()=>setLoad(false));},[]);
  const fmt=s=>s?`${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toFixed(2).padStart(5,'0')}`:'--:--';
  if(load)return(<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}><div className="orb ncyan" style={{fontSize:14,animation:'pulse 1s infinite'}}>LOADING...</div></div>);
  if(!data)return(<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}><div className="orb" style={{color:'var(--dim)'}}>No data</div></div>);
  return(<div style={{width:'100%',height:'100%',overflow:'auto',padding:32}}><div style={{maxWidth:900,margin:'0 auto'}}>
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{display:'flex',gap:24,marginBottom:28,alignItems:'center'}}>
      <div style={{width:80,height:80,borderRadius:'50%',background:`radial-gradient(circle,${data.avatar_color},transparent)`,border:`3px solid ${data.avatar_color}`,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontFamily:'Orbitron',fontSize:28,fontWeight:900,color:data.avatar_color}}>{data.username[0].toUpperCase()}</span></div>
      <div><div className="orb" style={{fontSize:28,fontWeight:900}}>{data.username}</div><div style={{color:'var(--dim)',fontSize:13,marginTop:4}}>{data.email}</div></div>
    </motion.div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
      {[['RACES',data.total_races,'var(--cyan)'],['WINS',data.total_wins,'var(--gold)'],['WIN RATE',data.total_races?Math.round(data.total_wins/data.total_races*100)+'%':'0%','var(--red)'],['BEST LAP',fmt(data.best_lap_time),'var(--cyan)']].map(([l,v,c])=>(<div key={l} className="glass" style={{padding:'20px 16px',textAlign:'center',borderTop:`3px solid ${c}`}}><div style={{fontFamily:'Orbitron',fontSize:9,color:'var(--dim)',letterSpacing:'.15em',marginBottom:8}}>{l}</div><div style={{fontFamily:'Orbitron',fontSize:24,fontWeight:900,color:c}}>{v}</div></div>))}
    </div>
    <div className="glass" style={{padding:24}}>
      <div className="orb" style={{fontSize:14,fontWeight:700,color:'var(--dim)',letterSpacing:'.15em',marginBottom:16}}>RECENT RACES</div>
      {!data.recent_races?.length&&<div style={{color:'var(--dim)'}}>No races yet. Hit the track!</div>}
      <div style={{display:'flex',flexDirection:'column',gap:8}}>{data.recent_races?.map((r,i)=>(<div key={r.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'rgba(255,255,255,.02)',border:'1px solid var(--border)'}}><div style={{display:'flex',gap:16,alignItems:'center'}}><span style={{fontFamily:'Orbitron',fontSize:11,color:'var(--dim)'}}>#{i+1}</span><span style={{fontFamily:'Orbitron',fontSize:12}}>{r.track?.replace('_',' ').toUpperCase()}</span></div><div style={{display:'flex',gap:24}}><span style={{fontFamily:'Orbitron',fontSize:11,color:'var(--gold)'}}>P{r.position}</span><span style={{fontFamily:'Orbitron',fontSize:11,color:'var(--cyan)'}}>{fmt(r.lap_time)}</span><span style={{fontFamily:'Orbitron',fontSize:11,color:'var(--red)'}}>{r.score}pts</span></div></div>))}</div>
    </div>
  </div></div>);
}
