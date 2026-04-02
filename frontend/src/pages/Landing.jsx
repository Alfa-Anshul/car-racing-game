import React,{useEffect,useRef}from'react';import{useNavigate}from'react-router-dom';import{motion}from'framer-motion';import{useAuthStore}from'../store/authStore';
export default function Landing(){
  const nav=useNavigate();const{token}=useAuthStore();const cvs=useRef();
  useEffect(()=>{if(token){nav('/game');return;}
    const c=cvs.current;if(!c)return;const ctx=c.getContext('2d');c.width=window.innerWidth;c.height=window.innerHeight;
    const pts=Array.from({length:100},()=>({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*2+.5,a:Math.random()*.6+.2,col:Math.random()>.5?'#ff3366':'#00f5ff'}));
    let raf;const draw=()=>{ctx.fillStyle='rgba(10,10,15,.15)';ctx.fillRect(0,0,c.width,c.height);
      pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0;if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0;
        ctx.save();ctx.globalAlpha=p.a;ctx.fillStyle=p.col;ctx.shadowColor=p.col;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();});
      raf=requestAnimationFrame(draw);};draw();return()=>cancelAnimationFrame(raf);},[token]);
  return(<div style={{width:'100vw',height:'100vh',position:'relative',overflow:'hidden',background:'#0a0a0f'}}>
    <canvas ref={cvs} style={{position:'absolute',inset:0}}/>
    <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,51,102,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,.02) 1px,transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none'}}/>
    <div style={{position:'relative',zIndex:10,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:32}}>
      <motion.div initial={{opacity:0,y:-40}} animate={{opacity:1,y:0}} transition={{duration:.8}} style={{textAlign:'center'}}>
        <div className="orb" style={{fontSize:'clamp(52px,9vw,100px)',fontWeight:900,lineHeight:1}}><span className="nred">TURBO</span><span className="ncyan">RACE</span></div>
        <div style={{fontFamily:'Rajdhani',fontSize:15,letterSpacing:'.4em',color:'var(--dim)',textTransform:'uppercase',marginTop:8}}>WebGL · Shaders · Live</div>
      </motion.div>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5}} style={{display:'flex',gap:16}}>
        <motion.button whileHover={{scale:1.05}} whileTap={{scale:.95}} className="btn btn-p" onClick={()=>nav('/auth')} style={{fontSize:15,padding:'16px 44px'}}>START ENGINE</motion.button>
        <motion.button whileHover={{scale:1.05}} whileTap={{scale:.95}} className="btn btn-s" onClick={()=>nav('/leaderboard')} style={{padding:'16px 32px'}}>LEADERBOARD</motion.button>
      </motion.div>
    </div>
    <div style={{position:'absolute',bottom:20,width:'100%',textAlign:'center',fontFamily:'Orbitron',fontSize:9,color:'rgba(255,255,255,.15)',letterSpacing:'.25em'}}>car.anervea.live</div>
  </div>);
}
