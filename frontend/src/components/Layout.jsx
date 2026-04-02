import React from'react';import{Outlet,NavLink,useNavigate}from'react-router-dom';import{useAuthStore}from'../store/authStore';
export default function Layout(){
  const{user,logout}=useAuthStore();const nav=useNavigate();
  return(<div style={{width:'100vw',height:'100vh',display:'flex',flexDirection:'column',background:'var(--dark)'}}>
    <nav style={{height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',background:'rgba(10,10,15,.95)',borderBottom:'1px solid rgba(255,51,102,.3)',backdropFilter:'blur(20px)',zIndex:100,flexShrink:0}}>
      <div style={{display:'flex',alignItems:'center',gap:32}}>
        <span className="orb nred" style={{fontSize:18,fontWeight:900,letterSpacing:'.1em'}}>TURBO<span className="ncyan">RACE</span></span>
        {[['game','🏎️ RACE'],['garage','🔧 GARAGE'],['leaderboard','🏆 BOARD'],['profile','👤 PROFILE']].map(([p,l])=>(
          <NavLink key={p} to={`/${p}`} style={({isActive})=>({fontFamily:'Orbitron',fontSize:11,fontWeight:700,letterSpacing:'.1em',color:isActive?'var(--red)':'var(--dim)',textDecoration:'none',borderBottom:isActive?'2px solid var(--red)':'2px solid transparent',padding:'4px 0',transition:'all .2s'})}>{l}</NavLink>
        ))}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:16}}>
        <span style={{fontFamily:'Orbitron',fontSize:12,color:'var(--cyan)'}}>{user?.username}</span>
        <button className="btn btn-s" onClick={()=>{logout();nav('/');}} style={{padding:'6px 16px',fontSize:10}}>LOGOUT</button>
      </div>
    </nav>
    <div style={{flex:1,overflow:'hidden'}}><Outlet/></div>
  </div>);
}
