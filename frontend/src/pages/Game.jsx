import React,{Suspense,useEffect,useRef,useState,useCallback}from'react';
import{Canvas,useFrame,useThree}from'@react-three/fiber';
import{Stars}from'@react-three/drei';
import{EffectComposer,Bloom,ChromaticAberration,Vignette}from'@react-three/postprocessing';
import*as THREE from'three';
import{useGameStore}from'../store/gameStore';
import{useAuthStore}from'../store/authStore';
import api from'../utils/api';
import HUD from'../components/HUD';
import CountdownOverlay from'../components/CountdownOverlay';
import RaceResults from'../components/RaceResults';

const V_CAR=`varying vec3 vN,vP;varying vec2 vUv;
void main(){vN=normalize(normalMatrix*normal);vP=(modelMatrix*vec4(position,1.)).xyz;vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}` ;
const F_CAR=`uniform vec3 uC;uniform float uM,uT;varying vec3 vN,vP;varying vec2 vUv;
void main(){vec3 l1=normalize(vec3(2.,5.,3.)),l2=normalize(vec3(-2.,3.,-1.));
float d1=max(dot(vN,l1),0.),d2=max(dot(vN,l2),0.)*.35;
vec3 vd=normalize(cameraPosition-vP),h=normalize(l1+vd);
float sp=pow(max(dot(vN,h),0.),128.)*uM;
float fr=pow(1.-max(dot(vN,vd),0.),3.)*.45;
vec3 col=uC*(0.15+d1*.75+d2)+vec3(sp)+uC*fr*.4;
col+=step(.45,fract(vUv.x*4.+uT*.25))*step(fract(vUv.x*4.+uT*.25),.55)*.12;
gl_FragColor=vec4(col,1.);}` ;
const V_RD=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}` ;
const F_RD=`uniform float uT;varying vec2 vUv;
void main(){vec3 asp=vec3(.12,.12,.14);
float lane=step(.48,vUv.x)*step(vUv.x,.52);
float dash=step(.4,fract(vUv.y*10.-uT*.6))*lane;
float edge=(step(vUv.x,.015)+step(.985,vUv.x))*.6;
vec3 col=asp+vec3(dash*.7)+vec3(edge*.5,edge*.35,0.);
col+=fract(sin(dot(vUv*vec2(127.1,311.7),vec2(1.)))*43758.5)*.025;
gl_FragColor=vec4(col,1.);}` ;

function Car({pos,color,isPlayer,ctrl,id}){
  const g=useRef(),body=useRef();const wh=[useRef(),useRef(),useRef(),useRef()];
  const v=useRef({spd:0,rot:0});const sm=useRef();const cc=new THREE.Color(color);
  useFrame((st,dt)=>{
    if(!g.current)return;const t=st.clock.elapsedTime;
    if(sm.current)sm.current.uniforms.uT.value=t;
    if(isPlayer&&ctrl.current){
      const{w,a,s,d}=ctrl.current,mx=.32,ac=.012,fr=.965,ts=.042;
      if(w)v.current.spd=Math.min(v.current.spd+ac,mx);
      if(s)v.current.spd=Math.max(v.current.spd-ac*1.5,-mx*.4);
      if(!w&&!s)v.current.spd*=fr;
      if(Math.abs(v.current.spd)>.005){if(a)v.current.rot+=ts*Math.sign(v.current.spd);if(d)v.current.rot-=ts*Math.sign(v.current.spd);}
      g.current.rotation.y=v.current.rot;
      g.current.position.x+=Math.sin(v.current.rot)*v.current.spd;
      g.current.position.z+=Math.cos(v.current.rot)*v.current.spd;
      g.current.position.x=THREE.MathUtils.clamp(g.current.position.x,-12,12);
      g.current.position.z=THREE.MathUtils.clamp(g.current.position.z,-80,80);
      wh.forEach(w=>{if(w.current)w.current.rotation.x+=v.current.spd*5;});
      if(body.current){const lean=(a?1:d?-1:0)*.05*Math.abs(v.current.spd)/mx;body.current.rotation.z=THREE.MathUtils.lerp(body.current.rotation.z,lean,.1);}
    }else{
      const as=.16+id*.018,wb=Math.sin(t*.6+id*2.1)*.003;
      g.current.position.z-=as;g.current.position.x+=wb;
      if(g.current.position.z<-80)g.current.position.z=80;
      g.current.position.x=THREE.MathUtils.clamp(g.current.position.x,-11,11);
      wh.forEach(w=>{if(w.current)w.current.rotation.x-=as*5;});
    }
  });
  const uni={uC:{value:cc},uM:{value:.9},uT:{value:0}};
  return(<group ref={g} position={pos}>
    <group ref={body}>
      <mesh castShadow><boxGeometry args={[1.8,.35,3.8]}/><shaderMaterial ref={sm} vertexShader={V_CAR} fragmentShader={F_CAR} uniforms={uni}/></mesh>
      <mesh position={[0,.45,.2]} castShadow><boxGeometry args={[1.4,.4,1.8]}/><shaderMaterial vertexShader={V_CAR} fragmentShader={F_CAR} uniforms={{uC:{value:cc},uM:{value:.7},uT:{value:0}}}/></mesh>
      <mesh position={[0,.55,.9]}><boxGeometry args={[1.35,.35,.05]}/><meshPhysicalMaterial color="#88ddff" transparent opacity={.6} metalness={.1} roughness={0}/></mesh>
      <mesh position={[0,.5,-1.7]}><boxGeometry args={[1.8,.07,.4]}/><meshStandardMaterial color="#111" metalness={1} roughness={.2}/></mesh>
      {[[.6,0,1.9,'#ffffaa',3],[-.6,0,1.9,'#ffffaa',3],[.6,0,-1.9,'#ff2200',2],[-.6,0,-1.9,'#ff2200',2]].map(([x,y,z,c,e],i)=>(<mesh key={i} position={[x,y,z]}><sphereGeometry args={[.1,8,8]}/><meshStandardMaterial color={c} emissive={c} emissiveIntensity={e}/></mesh>))}
    </group>
    {[[-1,-.2,1.3],[1,-.2,1.3],[-1,-.2,-1.3],[1,-.2,-1.3]].map(([x,y,z],i)=>(
      <group key={i} ref={wh[i]} position={[x,y,z]}>
        <mesh rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.3,.3,.24,16]}/><meshStandardMaterial color="#1a1a1a" metalness={.3} roughness={.8}/></mesh>
        <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.2,.2,.25,8]}/><meshStandardMaterial color="#aaa" metalness={.8} roughness={.2}/></mesh>
      </group>))}
  </group>);
}

function Track(){
  const sm=useRef();
  useFrame(st=>{if(sm.current)sm.current.uniforms.uT.value=st.clock.elapsedTime;});
  return(<group>
    <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[26,160,32,64]}/><shaderMaterial ref={sm} vertexShader={V_RD} fragmentShader={F_RD} uniforms={{uT:{value:0}}}/></mesh>
    {Array.from({length:20},(_,i)=>(<React.Fragment key={i}>
      <mesh position={[-14,.5,-75+i*8]}><boxGeometry args={[.5,1,2]}/><meshStandardMaterial color={i%2===0?'#ff3300':'#fff'}/></mesh>
      <mesh position={[14,.5,-75+i*8]}><boxGeometry args={[.5,1,2]}/><meshStandardMaterial color={i%2===0?'#ff3300':'#fff'}/></mesh>
    </React.Fragment>))}
    {Array.from({length:13},(_,i)=>(<mesh key={i} rotation={[-Math.PI/2,0,0]} position={[-12+i*2,.02,0]}><planeGeometry args={[1,1]}/><meshStandardMaterial color={i%2===0?'#fff':'#000'}/></mesh>))}
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.05,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#1a2a1a" roughness={1}/></mesh>
    {[[-16,1,0],[16,1,0],[-16,1,-40],[16,1,-40]].map(([x,y,z],i)=>(<mesh key={i} position={[x,y,z]}><boxGeometry args={[.3,6,.3]}/><meshStandardMaterial color="#555"/></mesh>))}
  </group>);
}

function CamRig({pr}){
  const{camera}=useThree();
  useFrame(()=>{
    if(!pr.current)return;
    const p=pr.current.position,r=pr.current.rotation.y;
    const off=new THREE.Vector3(Math.sin(r)*-9,5,Math.cos(r)*-9);
    camera.position.lerp(new THREE.Vector3(p.x+off.x,p.y+off.y,p.z+off.z),.1);
    camera.lookAt(p.x,p.y+1,p.z);});
  return null;
}

function Scene({ctrl,phase,onLap}){
  const pr=useRef();const lsRef=useRef(Date.now());const crossed=useRef(false);
  const{selectedCar}=useGameStore();
  const COLORS={red:'#ff3366',blue:'#00f5ff',green:'#00ff88',gold:'#ffd700',purple:'#cc44ff'};
  const ai=[{id:1,col:'#00aaff',sx:-4,sz:15},{id:2,col:'#00ff88',sx:4,sz:20},{id:3,col:'#ffaa00',sx:-4,sz:25},{id:4,col:'#aa00ff',sx:4,sz:30}];
  useFrame(()=>{
    if(phase!=='racing'||!pr.current)return;
    const z=pr.current.position.z;
    if(z>-2&&z<2&&!crossed.current){crossed.current=true;const lap=(Date.now()-lsRef.current)/1000;lsRef.current=Date.now();onLap(lap);}
    else if(Math.abs(z)>4)crossed.current=false;
  });
  return(<>
    <ambientLight intensity={.4}/>
    <directionalLight position={[10,20,10]} intensity={1.5} castShadow shadow-mapSize={[2048,2048]}/>
    <directionalLight position={[-10,15,-10]} intensity={.5} color="#4488ff"/>
    <pointLight position={[0,5,0]} intensity={.8} color="#ff3366" distance={30}/>
    <Track/>
    <group ref={pr} position={[0,.37,10]}>
      <Car pos={[0,0,0]} color={COLORS[selectedCar]||'#ff3366'} isPlayer ctrl={ctrl} id={0}/>
    </group>
    {ai.map(c=>(<Car key={c.id} pos={[c.sx,.37,c.sz]} color={c.col} isPlayer={false} ctrl={{current:{}}} id={c.id}/>))}
    {phase==='racing'&&<CamRig pr={pr}/>}
    <Stars radius={150} depth={60} count={3000} factor={4} fade/>
    <fog attach="fog" args={['#0a0a0f',40,120]}/>
  </>);
}

export default function Game(){
  const{phase,setPhase,setLap,totalLaps,setBestLap,setTotalTime,setPosition,setScore,setRaceResults,resetRace,selectedCar,selectedTrack}=useGameStore();
  const ctrl=useRef({w:false,a:false,s:false,d:false});
  const lc=useRef(0);const ts=useRef(0);const[lt,setLt]=useState(0);
  useEffect(()=>{
    const dn=e=>{const k=e.key.toLowerCase();if(k==='w'||k==='arrowup')ctrl.current.w=true;if(k==='a'||k==='arrowleft')ctrl.current.a=true;if(k==='s'||k==='arrowdown')ctrl.current.s=true;if(k==='d'||k==='arrowright')ctrl.current.d=true;};
    const up=e=>{const k=e.key.toLowerCase();if(k==='w'||k==='arrowup')ctrl.current.w=false;if(k==='a'||k==='arrowleft')ctrl.current.a=false;if(k==='s'||k==='arrowdown')ctrl.current.s=false;if(k==='d'||k==='arrowright')ctrl.current.d=false;};
    window.addEventListener('keydown',dn);window.addEventListener('keyup',up);
    return()=>{window.removeEventListener('keydown',dn);window.removeEventListener('keyup',up);};
  },[]);
  const start=()=>{resetRace();lc.current=0;ts.current=Date.now();setPhase('countdown');setTimeout(()=>setPhase('racing'),4000);};
  const onLap=useCallback(lap=>{
    lc.current+=1;setBestLap(lap);setLap(lc.current+1);setLt(lap);
    if(lc.current>=totalLaps){
      const tot=(Date.now()-ts.current)/1000,pos=Math.floor(Math.random()*3)+1;
      const sc=Math.max(0,1000-Math.floor(tot*8)+(4-pos)*180);
      setTotalTime(tot);setPosition(pos);setScore(sc);
      setRaceResults({lapTime:lap,totalTime:tot,position:pos,score:sc});setPhase('finished');
      api.post('/races/submit',{track:selectedTrack,position:pos,lap_time:lap,total_time:tot,score:sc,car_used:selectedCar}).catch(()=>{});
    }
  },[totalLaps,selectedCar,selectedTrack]);
  return(<div style={{width:'100%',height:'100%',position:'relative',background:'#0a0a0f'}}>
    <Canvas shadows camera={{position:[0,6,20],fov:65}} style={{position:'absolute',inset:0}}>
      <Suspense fallback={null}>
        <Scene ctrl={ctrl} phase={phase} onLap={onLap}/>
        <EffectComposer>
          <Bloom luminanceThreshold={.6} luminanceSmoothing={.9} intensity={1.2}/>
          <ChromaticAberration offset={[.001,.001]}/>
          <Vignette eskil={false} offset={.3} darkness={.8}/>
        </EffectComposer>
      </Suspense>
    </Canvas>
    {phase==='menu'&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.65)',backdropFilter:'blur(6px)'}}>
      <div style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:24}}>
        <div className="orb nred" style={{fontSize:52,fontWeight:900}}>READY?</div>
        <div style={{color:'var(--dim)',fontFamily:'Rajdhani',fontSize:16}}>Use WASD or Arrow Keys to drive</div>
        <div style={{display:'flex',gap:24,fontSize:12,color:'var(--cyan)',fontFamily:'Orbitron'}}>
          {['W — GAS','S — BRAKE','A/D — STEER'].map(k=>(<span key={k}>{k}</span>))}
        </div>
        <button className="btn btn-p" onClick={start} style={{padding:'18px 56px',fontSize:16,marginTop:8}}>🏎️ START RACE</button>
      </div>
    </div>}
    {phase!=='menu'&&<HUD lapTime={lt}/>}
    {phase==='countdown'&&<CountdownOverlay/>}
    {phase==='finished'&&<RaceResults onAgain={start}/>}
  </div>);
}
