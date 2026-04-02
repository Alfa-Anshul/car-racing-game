import React,{useRef,Suspense}from'react';import{Canvas,useFrame}from'@react-three/fiber';import{OrbitControls}from'@react-three/drei';import{EffectComposer,Bloom}from'@react-three/postprocessing';import{motion}from'framer-motion';import*as THREE from'three';import{useGameStore}from'../store/gameStore';import{useNavigate}from'react-router-dom';
const CARS=[{id:'red',name:'VIPER GT',color:'#ff3366',stats:{speed:95,handling:70,accel:85}},{id:'blue',name:'PHANTOM X',color:'#00f5ff',stats:{speed:80,handling:95,accel:75}},{id:'green',name:'APEX SR',color:'#00ff88',stats:{speed:75,handling:80,accel:95}},{id:'gold',name:'TITAN V8',color:'#ffd700',stats:{speed:90,handling:65,accel:80}},{id:'purple',name:'GHOST R',color:'#cc44ff',stats:{speed:85,handling:90,accel:70}}];
const TRACKS=[{id:'circuit_1',name:'NEON CIRCUIT',desc:'High-speed straights'},{id:'circuit_2',name:'NIGHT CITY',desc:'Tight urban corners'}];
function PreviewCar({color}){const g=useRef();const cc=new THREE.Color(color);useFrame(st=>{if(g.current)g.current.rotation.y=st.clock.elapsedTime*.5;});return(<group ref={g}><mesh><boxGeometry args={[1.8,.35,3.8]}/><meshStandardMaterial color={cc} metalness={.9} roughness={.1}/></mesh><mesh position={[0,.45,.2]}><boxGeometry args={[1.4,.4,1.8]}/><meshStandardMaterial color={cc} metalness={.7} roughness={.15}/></mesh><mesh position={[0,.55,.9]}><boxGeometry args={[1.35,.35,.05]}/><meshPhysicalMaterial color="#88ddff" transparent opacity={.6}/></mesh>{[[-1,-.2,1.3],[1,-.2,1.3],[-1,-.2,-1.3],[1,-.2,-1.3]].map(([x,y,z],i)=>(<group key={i} position={[x,y,z]}><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.3,.3,.24,16]}/><meshStandardMaterial color="#1a1a1a"/></mesh></group>))}</group>);}
export default function Garage(){
  const{selectedCar,setSelectedCar,selectedTrack,setSelectedTrack}=useGameStore();const nav=useNavigate();
  const cur=CARS.find(c=>c.id===selectedCar)||CARS[0];
  return(<div style={{width:'100%',height:'100%',display:'flex',background:'var(--dark)',overflow:'hidden'}}>
    <div style={{flex:1,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)'}}><span className="orb nred" style={{fontSize:18,fontWeight:900}}>🔧 GARAGE</span></div>
      <div style={{flex:1,position:'relative'}}>
        <Canvas camera={{position:[0,2,6],fov:50}}><Suspense fallback={null}>
          <ambientLight intensity={.5}/><pointLight position={[5,5,5]} intensity={2} color={cur.color}/><pointLight position={[-5,3,-5]} intensity={1} color="#4488ff"/>
          <PreviewCar color={cur.color}/><OrbitControls enableZoom={false}/>
          <EffectComposer><Bloom luminanceThreshold={.5} intensity={1.5}/></EffectComposer>
        </Suspense></Canvas>
        <div style={{position:'absolute',bottom:20,left:0,right:0,textAlign:'center'}}>
          <div className="orb" style={{fontSize:20,fontWeight:900,color:cur.color}}>{cur.name}</div>
          <div style={{display:'flex',justifyContent:'center',gap:24,marginTop:12}}>
            {Object.entries(cur.stats).map(([k,v])=>(<div key={k} style={{textAlign:'center'}}><div style={{fontFamily:'Orbitron',fontSize:9,color:'var(--dim)',marginBottom:4}}>{k.toUpperCase()}</div><div style={{width:80,height:4,background:'var(--border)',borderRadius:2}}><div style={{height:'100%',width:`${v}%`,background:cur.color}}/></div><div style={{fontFamily:'Orbitron',fontSize:10,color:cur.color,marginTop:2}}>{v}</div></div>))}
          </div>
        </div>
      </div>
    </div>
    <div style={{width:320,borderLeft:'1px solid var(--border)',display:'flex',flexDirection:'column',overflow:'auto'}}>
      <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)'}}><div className="orb" style={{fontSize:12,color:'var(--dim)',letterSpacing:'.15em'}}>SELECT CAR</div></div>
      <div style={{padding:12,display:'flex',flexDirection:'column',gap:8}}>{CARS.map(c=>(<motion.button key={c.id} whileHover={{scale:1.02}} whileTap={{scale:.98}} onClick={()=>setSelectedCar(c.id)} style={{padding:'14px 16px',background:selectedCar===c.id?`${c.color}22`:'rgba(255,255,255,.03)',border:`1px solid ${selectedCar===c.id?c.color:'var(--border)'}`,cursor:'pointer',display:'flex',alignItems:'center',gap:12}}><div style={{width:16,height:16,borderRadius:'50%',background:c.color,boxShadow:`0 0 8px ${c.color}`}}/><span style={{fontFamily:'Orbitron',fontSize:12,fontWeight:700,color:selectedCar===c.id?c.color:'var(--text)'}}>{c.name}</span></motion.button>))}</div>
      <div style={{padding:'16px 20px',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}><div className="orb" style={{fontSize:12,color:'var(--dim)',letterSpacing:'.15em'}}>SELECT TRACK</div></div>
      <div style={{padding:12,display:'flex',flexDirection:'column',gap:8}}>{TRACKS.map(t=>(<motion.button key={t.id} whileHover={{scale:1.02}} whileTap={{scale:.98}} onClick={()=>setSelectedTrack(t.id)} style={{padding:'14px 16px',background:selectedTrack===t.id?'rgba(255,51,102,.15)':'rgba(255,255,255,.03)',border:`1px solid ${selectedTrack===t.id?'var(--red)':'var(--border)'}`,cursor:'pointer',textAlign:'left'}}><div style={{fontFamily:'Orbitron',fontSize:12,fontWeight:700,color:selectedTrack===t.id?'var(--red)':'var(--text)'}}>{t.name}</div><div style={{fontSize:12,color:'var(--dim)',marginTop:2}}>{t.desc}</div></motion.button>))}</div>
      <div style={{padding:16,marginTop:'auto'}}><button className="btn btn-p" onClick={()=>nav('/game')} style={{width:'100%',padding:14,fontSize:13}}>🏎️ RACE NOW</button></div>
    </div>
  </div>);
}
