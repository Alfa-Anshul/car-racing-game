import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';
import * as THREE from 'three';

const CARS = [
  { id: 'red',    label: 'INFERNO',   color: '#ff2244', accent: '#ff6600', speed: 92, handling: 78, boost: 85 },
  { id: 'blue',   label: 'PHANTOM',   color: '#2266ff', accent: '#00ccff', speed: 80, handling: 95, boost: 88 },
  { id: 'green',  label: 'VIPER',     color: '#00cc44', accent: '#aaff00', speed: 85, handling: 88, boost: 80 },
  { id: 'gold',   label: 'SOVEREIGN', color: '#ffcc00', accent: '#ff9900', speed: 75, handling: 82, boost: 95 },
  { id: 'purple', label: 'SPECTRE',   color: '#9922ff', accent: '#ff44cc', speed: 88, handling: 90, boost: 82 },
];

function CarModel({ color, accent }) {
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.4; });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[1.8, 0.28, 0.9]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0.1, 0.38, 0]} castShadow>
        <boxGeometry args={[0.9, 0.22, 0.75]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      {[[-0.65,-0.08,0.52],[0.65,-0.08,0.52],[-0.65,-0.08,-0.52],[0.65,-0.08,-0.52]].map(([x,y,z],i) => (
        <mesh key={i} position={[x,y,z]} rotation={[Math.PI/2,0,0]}>
          <cylinderGeometry args={[0.18,0.18,0.12,24]} />
          <meshStandardMaterial color="#111" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.92, 0.15, 0]}>
        <boxGeometry args={[0.04, 0.08, 0.6]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-0.93, 0.15, 0]}>
        <boxGeometry args={[0.04, 0.06, 0.4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function StatBar({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#aaa', marginBottom:4 }}>
        <span>{label}</span><span style={{ color:'var(--cyan)' }}>{value}</span>
      </div>
      <div style={{ height:4, background:'#1a1a2e', borderRadius:2 }}>
        <div style={{ height:'100%', width:`${value}%`, background:'linear-gradient(90deg,var(--cyan),var(--red))', borderRadius:2, transition:'width 0.5s' }} />
      </div>
    </div>
  );
}

export default function Garage() {
  const [selected, setSelected] = useState(0);
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const car = CARS[selected];

  const handleSelect = async () => {
    try {
      const res = await api.put('/users/me', { car_skin: car.id });
      setUser(res.data);
    } catch {}
    navigate('/game');
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--dark)', display:'flex', flexDirection:'column', alignItems:'center', padding:'80px 20px 40px' }}>
      <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:28, letterSpacing:6, marginBottom:8 }}>GARAGE</h1>
      <p style={{ color:'#666', fontSize:12, marginBottom:32 }}>SELECT YOUR MACHINE</p>

      <div style={{ display:'flex', gap:12, marginBottom:32, flexWrap:'wrap', justifyContent:'center' }}>
        {CARS.map((c, i) => (
          <button key={c.id} onClick={() => setSelected(i)}
            style={{ background: i===selected ? c.color+'33' : '#0a0a1a', border:`2px solid ${i===selected ? c.color : '#222'}`, borderRadius:8, padding:'8px 16px', cursor:'pointer', color: i===selected ? c.color : '#555', fontFamily:'Orbitron,sans-serif', fontSize:10, letterSpacing:2, transition:'all 0.2s' }}>
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ width:'100%', maxWidth:600, height:300, borderRadius:16, overflow:'hidden', border:`1px solid ${car.color}44`, marginBottom:32 }}>
        <Canvas camera={{ position:[0,1.2,3.5], fov:45 }} shadows>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5,8,5]} intensity={1.5} castShadow />
          <pointLight position={[-3,2,0]} color={car.accent} intensity={2} />
          <CarModel color={car.color} accent={car.accent} />
          <OrbitControls enablePan={false} enableZoom={false} autoRotate={false} />
          <Environment preset="night" />
        </Canvas>
      </div>

      <div style={{ width:'100%', maxWidth:400, background:'#0a0a1a', borderRadius:12, padding:24, border:`1px solid ${car.color}33`, marginBottom:32 }}>
        <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:20, color:car.color, marginBottom:20, letterSpacing:4 }}>{car.label}</h2>
        <StatBar label="TOP SPEED" value={car.speed} />
        <StatBar label="HANDLING" value={car.handling} />
        <StatBar label="BOOST" value={car.boost} />
      </div>

      <button onClick={handleSelect}
        style={{ background:`linear-gradient(135deg,${car.color},${car.accent})`, border:'none', borderRadius:8, padding:'14px 48px', color:'#000', fontFamily:'Orbitron,sans-serif', fontSize:14, letterSpacing:4, cursor:'pointer', fontWeight:700 }}>
        RACE WITH THIS CAR
      </button>
    </div>
  );
}