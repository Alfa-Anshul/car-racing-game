import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import HUD from '../components/HUD';
import CountdownOverlay from '../components/CountdownOverlay';
import RaceResultsModal from '../components/RaceResultsModal';
import * as THREE from 'three';

const TRACK_LENGTH = 200;
const TRACK_WIDTH = 12;
const TOTAL_LAPS = 3;

const carVertShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const carFragShader = `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.5);
    float stripe = step(0.48, fract(vUv.x * 3.0 + uTime * 0.5)) * step(fract(vUv.x * 3.0 + uTime * 0.5), 0.52);
    vec3 col = mix(uColor * 0.9, uColor, dot(vNormal, vec3(0,1,0)) * 0.5 + 0.5);
    col = mix(col, uAccent, fresnel * 0.6 + stripe * 0.3);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const roadVertShader = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const roadFragShader = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float dash = step(0.45, fract(vUv.y * 20.0 - uTime * 0.8)) * (1.0 - step(0.55, abs(vUv.x - 0.5) * 2.0));
    float edge = step(0.92, abs(vUv.x - 0.5) * 2.0);
    vec3 road = vec3(0.06, 0.06, 0.1);
    vec3 col = mix(road, vec3(1.0), dash * 0.5);
    col = mix(col, vec3(1.0, 0.2, 0.3), edge * 0.6);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const AI_CARS = [
  { color: '#2266ff', accent: '#00ccff', baseSpeed: 0.18 },
  { color: '#00cc44', accent: '#aaff00', baseSpeed: 0.16 },
  { color: '#ffcc00', accent: '#ff9900', baseSpeed: 0.20 },
  { color: '#9922ff', accent: '#ff44cc', baseSpeed: 0.17 },
];

function Track({ time }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, dt) => { uniforms.uTime.value += dt; });
  return (
    <group>
      <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[TRACK_WIDTH, TRACK_LENGTH, 2, 64]} />
        <shaderMaterial vertexShader={roadVertShader} fragmentShader={roadFragShader} uniforms={uniforms} />
      </mesh>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, TRACK_LENGTH + 20]} />
        <meshStandardMaterial color="#030308" />
      </mesh>
      {[-TRACK_WIDTH/2, TRACK_WIDTH/2].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0]}>
          <boxGeometry args={[0.2, 0.6, TRACK_LENGTH]} />
          <meshStandardMaterial color="#cc2233" emissive="#440011" />
        </mesh>
      ))}
      <mesh position={[0, 0.01, -TRACK_LENGTH/2 + 2]}>
        <boxGeometry args={[TRACK_WIDTH, 0.05, 0.4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function RaceCar({ carRef, color = '#ff2244', accent = '#ff6600' }) {
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uAccent: { value: new THREE.Color(accent) },
    uTime: { value: 0 },
  }), [color, accent]);
  useFrame((_, dt) => { uniforms.uTime.value += dt; });
  return (
    <group ref={carRef}>
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1.8, 0.28, 0.9]} />
        <shaderMaterial vertexShader={carVertShader} fragmentShader={carFragShader} uniforms={uniforms} />
      </mesh>
      <mesh castShadow position={[0.1, 0.38, 0]}>
        <boxGeometry args={[0.9, 0.22, 0.75]} />
        <shaderMaterial vertexShader={carVertShader} fragmentShader={carFragShader} uniforms={uniforms} />
      </mesh>
      {[[-0.65,-0.08,0.45],[0.65,-0.08,0.45],[-0.65,-0.08,-0.45],[0.65,-0.08,-0.45]].map(([x,y,z],i) => (
        <mesh key={i} position={[x,y,z]} rotation={[Math.PI/2,0,0]}>
          <cylinderGeometry args={[0.18,0.18,0.12,20]} />
          <meshStandardMaterial color="#111" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0.93, 0.15, 0]}>
        <boxGeometry args={[0.04,0.08,0.5]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-0.94, 0.15, 0]}>
        <boxGeometry args={[0.04,0.06,0.35]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function AICar({ config, index }) {
  const ref = useRef();
  const phase = useRef(Math.random() * Math.PI * 2);
  const zPos = useRef(TRACK_LENGTH/2 - 10 - index * 6);

  useFrame((_, dt) => {
    if (!ref.current) return;
    zPos.current -= config.baseSpeed * (1 + Math.sin(phase.current) * 0.1) * 60 * dt;
    phase.current += dt;
    if (zPos.current < -TRACK_LENGTH/2) zPos.current = TRACK_LENGTH/2;
    const wobble = Math.sin(phase.current * 1.5) * 0.8;
    ref.current.position.set(wobble, 0, zPos.current);
  });

  return <RaceCar carRef={ref} color={config.color} accent={config.accent} />;
}

function PlayerCar({ onLap, onPosition }) {
  const ref = useRef();
  const keys = useRef({});
  const vel = useRef({ x: 0, z: 0 });
  const phase = useGameStore(s => s.phase);
  const tick = useGameStore(s => s.tick);
  const lap = useGameStore(s => s.lap);
  const lapRef = useRef(lap);
  lapRef.current = lap;
  const prevZ = useRef(TRACK_LENGTH/2 - 5);
  const { user } = useAuthStore();

  const skinColors = {
    red: ['#ff2244','#ff6600'], blue: ['#2266ff','#00ccff'],
    green: ['#00cc44','#aaff00'], gold: ['#ffcc00','#ff9900'], purple: ['#9922ff','#ff44cc']
  };
  const [color, accent] = skinColors[user?.car_skin || 'red'] || skinColors.red;

  useEffect(() => {
    const down = e => { keys.current[e.key] = true; };
    const up = e => { keys.current[e.key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.position.set(0, 0, TRACK_LENGTH/2 - 5);
  }, []);

  useFrame((_, dt) => {
    if (!ref.current || phase !== 'racing') return;
    tick(dt);
    const accel = 12, friction = 0.88, maxSpeed = 18, turnSpeed = 6;
    if (keys.current['ArrowUp'] || keys.current['w'] || keys.current['W']) vel.current.z -= accel * dt;
    if (keys.current['ArrowDown'] || keys.current['s'] || keys.current['S']) vel.current.z += accel * dt * 0.5;
    if (keys.current['ArrowLeft'] || keys.current['a'] || keys.current['A']) vel.current.x -= turnSpeed * dt;
    if (keys.current['ArrowRight'] || keys.current['d'] || keys.current['D']) vel.current.x += turnSpeed * dt;
    vel.current.x *= friction;
    vel.current.z *= friction;
    vel.current.z = Math.max(-maxSpeed, Math.min(maxSpeed, vel.current.z));
    ref.current.position.x = Math.max(-TRACK_WIDTH/2 + 1, Math.min(TRACK_WIDTH/2 - 1, ref.current.position.x + vel.current.x * dt));
    ref.current.position.z += vel.current.z * dt;
    ref.current.rotation.y = -vel.current.x * 0.08;
    const curZ = ref.current.position.z;
    if (prevZ.current > -TRACK_LENGTH/2 + 4 && curZ <= -TRACK_LENGTH/2 + 4) {
      ref.current.position.z = TRACK_LENGTH/2 - 5;
      vel.current = { x:0, z:0 };
      onLap();
    }
    prevZ.current = curZ;
  });

  return <RaceCar carRef={ref} color={color} accent={accent} />;
}

function CameraRig({ carRef }) {
  const { camera } = useThree();
  useFrame(() => {
    if (!carRef.current) return;
    const pos = carRef.current.position;
    camera.position.lerp(new THREE.Vector3(pos.x * 0.5, pos.y + 4, pos.z + 10), 0.08);
    camera.lookAt(pos.x, pos.y + 0.5, pos.z - 5);
  });
  return null;
}

export default function Game() {
  const { phase, lap, bestLap, totalTime, reset } = useGameStore();
  const setLap = useGameStore(s => s.setLap);
  const recordLap = useGameStore(s => s.recordLap);
  const setPhase = useGameStore(s => s.setPhase);
  const setPosition = useGameStore(s => s.setPosition);
  const lapTimeRef = useGameStore(s => s.lapTime);
  const [results, setResults] = useState(null);
  const carRef = useRef();

  useEffect(() => { reset(); }, []);

  const handleLap = () => {
    const newLap = useGameStore.getState().lap + 1;
    recordLap(useGameStore.getState().lapTime);
    setLap(newLap);
    if (newLap >= TOTAL_LAPS) {
      setPhase('finished');
      const state = useGameStore.getState();
      const pos = Math.floor(Math.random() * 4) + 1;
      const score = Math.max(0, 1000 - Math.floor(state.totalTime * 10) + (4 - pos) * 200);
      setPosition(pos);
      setResults({ position: pos, totalTime: state.totalTime, bestLap: state.bestLap, score });
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'#000' }}>
      {phase === 'countdown' && <CountdownOverlay />}
      {phase === 'racing' && <HUD />}
      {results && <RaceResultsModal {...results} />}
      <Canvas shadows camera={{ position:[0,4,10], fov:60 }}>
        <fog attach="fog" args={['#05050f', 50, 200]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10,20,10]} intensity={1.2} castShadow shadow-mapSize={[2048,2048]} />
        <pointLight position={[0,5,0]} color="#00ccff" intensity={1} distance={30} />
        <Track />
        <PlayerCar onLap={handleLap} onPosition={setPosition} />
        {AI_CARS.map((cfg, i) => <AICar key={i} config={cfg} index={i} />)}
        {carRef.current && <CameraRig carRef={carRef} />}
        <EffectComposer>
          <Bloom luminanceThreshold={0.6} intensity={0.8} />
          <ChromaticAberration offset={[0.001, 0.001]} />
          <Vignette eskil={false} offset={0.3} darkness={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}