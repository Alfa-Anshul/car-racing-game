import React,{useState}from'react';import{useNavigate}from'react-router-dom';import{motion,AnimatePresence}from'framer-motion';import{useAuthStore}from'../store/authStore';
export default function Auth(){
  const[mode,setMode]=useState('login');const[form,setForm]=useState({username:'',email:'',password:''});
  const[err,setErr]=useState('');const[load,setLoad]=useState(false);
  const{login,register}=useAuthStore();const nav=useNavigate();
  const sub=async e=>{e.preventDefault();setErr('');setLoad(true);
    try{mode==='login'?await login(form.username,form.password):await register(form.username,form.email,form.password);nav('/game');}
    catch(e){setErr(e.response?.data?.detail||'Authentication failed');}finally{setLoad(false);}}
  const f=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  return(<div style={{width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--dark)',position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,51,102,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
    <div style={{position:'absolute',top:'15%',left:'8%',width:300,height:300,background:'radial-gradient(circle,rgba(255,51,102,.07) 0%,transparent 70%)',borderRadius:'50%'}}/>
    <div style={{position:'absolute',bottom:'15%',right:'8%',width:350,height:350,background:'radial-gradient(circle,rgba(0,245,255,.05) 0%,transparent 70%)',borderRadius:'50%'}}/>
    <motion.div initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} transition={{duration:.4}} style={{width:420,position:'relative',zIndex:10}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div className="orb nred" style={{fontSize:34,fontWeight:900}}>TURBO<span className="ncyan">RACE</span></div>
        <div style={{color:'var(--dim)',fontSize:12,marginTop:8,letterSpacing:'.2em',fontFamily:'Orbitron'}}>{mode==='login'?'WELCOME BACK DRIVER':'JOIN THE GRID'}</div>
      </div>
      <div style={{display:'flex',marginBottom:28,background:'rgba(255,255,255,.03)',border:'1px solid var(--border)'}}>
        {['login','register'].map(m=>(<button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'12px 0',fontFamily:'Orbitron',fontSize:11,fontWeight:700,letterSpacing:'.15em',border:'none',cursor:'pointer',transition:'all .2s',background:mode===m?'var(--red)':'transparent',color:mode===m?'#fff':'var(--dim)'}}>{m.toUpperCase()}</button>))}
      </div>
      <form onSubmit={sub} style={{display:'flex',flexDirection:'column',gap:16}}>
        <div><label style={{fontFamily:'Orbitron',fontSize:10,color:'var(--dim)',letterSpacing:'.15em',display:'block',marginBottom:6}}>USERNAME</label><input className="inp" value={form.username} onChange={f('username')} placeholder="Enter username" required/></div>
        <AnimatePresence>{mode==='register'&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}><label style={{fontFamily:'Orbitron',fontSize:10,color:'var(--dim)',letterSpacing:'.15em',display:'block',marginBottom:6}}>EMAIL</label><input className="inp" type="email" value={form.email} onChange={f('email')} placeholder="your@email.com" required/></motion.div>}</AnimatePresence>
        <div><label style={{fontFamily:'Orbitron',fontSize:10,color:'var(--dim)',letterSpacing:'.15em',display:'block',marginBottom:6}}>PASSWORD</label><input className="inp" type="password" value={form.password} onChange={f('password')} placeholder="••••••••" required/></div>
        {err&&<div style={{color:'#ff6b6b',fontFamily:'Orbitron',fontSize:11,padding:'10px 14px',background:'rgba(255,51,51,.1)',border:'1px solid rgba(255,51,51,.3)'}}>{err}</div>}
        <motion.button type="submit" className="btn btn-p" disabled={load} whileHover={{scale:1.02}} whileTap={{scale:.98}} style={{marginTop:8,padding:16,fontSize:13,width:'100%'}}>{load?'LOADING...':(mode==='login'?'IGNITE ENGINE':'JOIN THE RACE')}</motion.button>
      </form>
      <div style={{textAlign:'center',marginTop:20}}><button onClick={()=>nav('/')} style={{background:'none',border:'none',color:'var(--dim)',cursor:'pointer',fontFamily:'Rajdhani',fontSize:13}}>← Back to home</button></div>
    </motion.div>
  </div>);
}
