import React, { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Stars, Environment, useTexture, Plane } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import HUD from '../components/HUD';
import CountdownOverlay from '../components/CountdownOverlay';
import RaceResultsModal from '../components/RaceResultsModal';

// ─── Car shaders ───────────────────────────────────────────────────────────────
const carVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const carFragmentShader = `
uniform vec3 uColor;
uniform float uMetalness;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
void main() {
  vec3 lightDir = normalize(vec3(2.0, 5.0, 3.0));
  vec3 lightDir2 = normalize(vec3(-2.0, 3.0, -1.0));
  float diff = max(dot(vNormal, lightDir), 0.0);
  float diff2 = max(dot(vNormal, lightDir2), 0.0) * 0.4;
  vec3 viewDir = normalize(cameraPosition - vPosition);
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(vNormal, halfDir), 0.0), 128.0) * uMetalness;
  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0) * 0.5;
  vec3 col = uColor * (0.15 + diff * 0.7 + diff2) + vec3(spec) + uColor * fresnel * 0.4;
  float stripe = step(0.45, fract(vUv.x * 4.0 + uTime * 0.3)) * step(fract(vUv.x * 4.0 + uTime * 0.3), 0.55) * 0.15;
  col += stripe;
  gl_FragColor = vec4(col, 1.0);
}
`;

// Road shader
const roadVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const roadFragmentShader = `
uniform float uTime;
varying vec2 vUv;
void main() {
  vec3 asphalt = vec3(0.12, 0.12, 0.14);
  float lane = step(0.48, vUv.x) * step(vUv.x, 0.52);
  float dash = step(0.4, fract(vUv.y * 8.0 - uTime * 0.5)) * lane;
  float edge = (step(vUv.x, 0.02) + step(0.98, vUv.x)) * 0.6;
  vec3 col = asphalt + vec3(dash * 0.7) + vec3(edge * 0.5, edge * 0.4, 0.0);
  float noise = fract(sin(dot(vUv * vec2(127.1, 311.7), vec2(1.0))) * 43758.5) * 0.03;
  col += noise;
  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── Car Component ────────────────────────────────────────────────────────────
function RaceCar({ position, color, isPlayer, controls, carId, onLapComplete }) {
  const meshRef = useRef();
  const bodyRef = useRef();
  const wheelRefs = [useRef(), useRef(), useRef(), useRef()];
  const vel = useRef({ x: 0, z: 0, rot: 0, speed: 0 });
  const shaderRef = useRef();

  const carColor = new THREE.Color(color);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    if (shaderRef.current) shaderRef.current.uniforms.uTime.value = t;

    if (isPlayer && controls.current) {
      const { w, a, s, d } = controls.current;
      const maxSpeed = 0.35;
      const accel = 0.015;
      const friction = 0.96;
      const turnSpeed = 0.045;

      if (w) vel.current.speed = Math.min(vel.current.speed + accel, maxSpeed);
      if (s) vel.current.speed = Math.max(vel.current.speed - accel * 1.5, -maxSpeed * 0.5);
      if (!w && !s) vel.current.speed *= friction;

      if (Math.abs(vel.current.speed) > 0.01) {
        if (a) vel.current.rot += turnSpeed * Math.sign(vel.current.speed);
        if (d) vel.current.rot -= turnSpeed * Math.sign(vel.current.speed);
      }

      meshRef.current.rotation.y = vel.current.rot;
      meshRef.current.position.x += Math.sin(vel.current.rot) * vel.current.speed;
      meshRef.current.position.z += Math.cos(vel.current.rot) * vel.current.speed;

      // Track boundary clamp
      meshRef.current.position.x = THREE.MathUtils.clamp(meshRef.current.position.x, -12, 12);
      meshRef.current.position.z = THREE.MathUtils.clamp(meshRef.current.position.z, -80, 80);

      // Wheel spin
      wheelRefs.forEach(w => {
        if (w.current) w.current.rotation.x += vel.current.speed * 6;
      });

      // Body tilt from turning
      if (bodyRef.current) {
        const lean = (a ? 1 : d ? -1 : 0) * 0.06 * Math.abs(vel.current.speed) / maxSpeed;
        bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, lean, 0.1);
      }
    } else {
      // AI car
      const aiSpeed = 0.18 + carId * 0.02;
      const wobble = Math.sin(t * 0.7 + carId * 2.1) * 0.003;
      meshRef.current.position.z -= aiSpeed;
      meshRef.current.position.x += wobble;
      if (meshRef.current.position.z < -80) meshRef.current.position.z = 80;
      meshRef.current.position.x = THREE.MathUtils.clamp(meshRef.current.position.x, -11, 11);
      wheelRefs.forEach(w => { if (w.current) w.current.rotation.x -= aiSpeed * 6; });
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Car body */}
      <group ref={bodyRef}>
        {/* Main chassis */}
        <mesh castShadow>
          <boxGeometry args={[1.8, 0.35, 3.8]} />
          <shaderMaterial ref={shaderRef} vertexShader={carVertexShader} fragmentShader={carFragmentShader}
            uniforms={{ uColor: { value: carColor }, uMetalness: { value: 0.9 }, uTime: { value: 0 } }} />
        </mesh>
        {/* Cabin */}
        <mesh position={[0, 0.45, 0.2]} castShadow>
          <boxGeometry args={[1.4, 0.4, 1.8]} />
          <shaderMaterial vertexShader={carVertexShader} fragmentShader={carFragmentShader}
            uniforms={{ uColor: { value: carColor }, uMetalness: { value: 0.7 }, uTime: { value: 0 } }} />
        </mesh>
        {/* Windshield */}
        <mesh position={[0, 0.55, 0.9]}>
          <boxGeometry args={[1.35, 0.35, 0.05]} />
          <meshPhysicalMaterial color="#88ddff" transparent opacity={0.6} metalness={0.1} roughness={0} />
        </mesh>
        {/* Spoiler */}
        <mesh position={[0, 0.5, -1.7]}>
          <boxGeometry args={[1.8, 0.07, 0.4]} />
          <meshStandardMaterial color="#111" metalness={1} roughness={0.2} />
        </mesh>
        {/* Headlights */}
        <mesh position={[0.6, 0, 1.9]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#ffffaa" emissive="#ffffaa" emissiveIntensity={3} />
        </mesh>
        <mesh position={[-0.6, 0, 1.9]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#ffffaa" emissive="#ffffaa" emissiveIntensity={3} />
        </mesh>
        {/* Taillights */}
        <mesh position={[0.6, 0, -1.9]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.6, 0, -1.9]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Wheels */}
      {[[-0.95, -0.2, 1.3],[0.95, -0.2, 1.3],[-0.95, -0.2, -1.3],[0.95, -0.2, -1.3]].map(([x,y,z], i) => (
        <group key={i} ref={wheelRefs[i]} position={[x, y, z]}>
          <mesh rotation={[0, 0, Math.PI/2]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.25, 16]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.26, 8]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Track ────────────────────────────────────────────────────────────────────
function Track() {
  const shaderRef = useRef();
  useFrame((state) => {
    if (shaderRef.current) shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <group>
      {/* Main straight */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 160, 32, 64]} />
        <shaderMaterial ref={shaderRef} vertexShader={roadVertexShader} fragmentShader={roadFragmentShader}
          uniforms={{ uTime: { value: 0 } }} />
      </mesh>
      {/* Barriers left */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={`bl${i}`} position={[-14, 0.5, -75 + i * 8]} castShadow>
          <boxGeometry args={[0.5, 1, 2]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#ff3300' : '#ffffff'} />
        </mesh>
      ))}
      {/* Barriers right */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={`br${i}`} position={[14, 0.5, -75 + i * 8]} castShadow>
          <boxGeometry args={[0.5, 1, 2]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#ff3300' : '#ffffff'} />
        </mesh>
      ))}
      {/* Finish line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[26, 2]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Checkered pattern overlay */}
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={`c${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-12 + i * 2, 0.02, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#ffffff' : '#000000'} />
        </mesh>
      ))}
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a2a1a" roughness={1} />
      </mesh>
    </group>
  );
}

// ─── Camera follow ────────────────────────────────────────────────────────────
function CameraRig({ playerRef }) {
  const { camera } = useThree();
  useFrame(() => {
    if (!playerRef.current) return;
    const pos = playerRef.current.position;
    const rot = playerRef.current.rotation.y;
    const offset = new THREE.Vector3(
      Math.sin(rot) * -8,
      4.5,
      Math.cos(rot) * -8
    );
    const target = new THREE.Vector3(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z);
    camera.position.lerp(target, 0.1);
    camera.lookAt(pos.x, pos.y + 1, pos.z);
  });
  return null;
}

// ─── Game Scene ───────────────────────────────────────────────────────────────
function GameScene({ controls, phase, setLapTime, onLapComplete }) {
  const playerRef = useRef();
  const lapStartRef = useRef(Date.now());
  const crossedLine = useRef(false);
  const { selectedCar } = useGameStore();

  const aiCars = [
    { id: 1, color: '#00aaff', startX: -4, startZ: 15 },
    { id: 2, color: '#00ff88', startX: 4, startZ: 20 },
    { id: 3, color: '#ffaa00', startX: -4, startZ: 25 },
    { id: 4, color: '#aa00ff', startX: 4, startZ: 30 },
  ];

  const CAR_COLORS = { red: '#ff3366', blue: '#00f5ff', green: '#00ff88', gold: '#ffd700', purple: '#cc44ff' };
  const playerColor = CAR_COLORS[selectedCar] || '#ff3366';

  useFrame(() => {
    if (phase !== 'racing' || !playerRef.current) return;
    const z = playerRef.current.position.z;
    const now = Date.now();
    if (z > -2 && z < 2 && !crossedLine.current) {
      crossedLine.current = true;
      const lap = (now - lapStartRef.current) / 1000;
      setLapTime(lap);
      lapStartRef.current = now;
      onLapComplete(lap);
    } else if (Math.abs(z) > 4) {
      crossedLine.current = false;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-10, 15, -10]} intensity={0.5} color="#4488ff" />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#ff3366" distance={30} />

      <Track />

      <group ref={playerRef} position={[0, 0.37, 10]}>
        <RaceCar position={[0, 0, 0]} color={playerColor} isPlayer={true} controls={controls} carId={0} />
      </group>

      {aiCars.map(car => (
        <RaceCar key={car.id} position={[car.startX, 0.37, car.startZ]} color={car.color}
          isPlayer={false} controls={{ current: {} }} carId={car.id} />
      ))}

      {phase === 'racing' && <CameraRig playerRef={playerRef} />}

      <Stars radius={150} depth={60} count={3000} factor={4} saturation={0.8} fade />
      <fog attach="fog" args={['#0a0a0f', 40, 120]} />
    </>
  );
}

// ─── Main Game Page ───────────────────────────────────────────────────────────
export default function Game() {
  const { phase, setPhase, lap, setLap, totalLaps, setBestLap, setTotalTime, setPosition, setScore, setRaceResults, resetRace, selectedCar, selectedTrack } = useGameStore();
  const { user } = useAuthStore();
  const controls = useRef({ w: false, a: false, s: false, d: false });
  const lapTimeRef = useRef(0);
  const totalStartRef = useRef(0);
  const lapCountRef = useRef(0);
  const [displayLapTime, setDisplayLapTime] = useState(0);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') controls.current.w = true;
      if (k === 'a' || k === 'arrowleft') controls.current.a = true;
      if (k === 's' || k === 'arrowdown') controls.current.s = true;
      if (k === 'd' || k === 'arrowright') controls.current.d = true;
    };
    const up = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') controls.current.w = false;
      if (k === 'a' || k === 'arrowleft') controls.current.a = false;
      if (k === 's' || k === 'arrowdown') controls.current.s = false;
      if (k === 'd' || k === 'arrowright') controls.current.d = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const startRace = () => {
    resetRace();
    lapCountRef.current = 0;
    totalStartRef.current = Date.now();
    setPhase('countdown');
    setTimeout(() => setPhase('racing'), 4000);
  };

  const handleLapComplete = useCallback((lapTime) => {
    lapCountRef.current += 1;
    setBestLap(lapTime);
    setLap(lapCountRef.current + 1);
    setDisplayLapTime(lapTime);

    if (lapCountRef.current >= totalLaps) {
      const total = (Date.now() - totalStartRef.current) / 1000;
      const pos = Math.floor(Math.random() * 3) + 1;
      const sc = Math.max(0, 1000 - Math.floor(total * 10) + (4 - pos) * 200);
      setTotalTime(total);
      setPosition(pos);
      setScore(sc);
      setRaceResults({ lapTime, totalTime: total, position: pos, score: sc });
      setPhase('finished');

      // Submit to backend
      api.post('/races/submit', {
        track: selectedTrack,
        position: pos,
        lap_time: lapTime,
        total_time: total,
        score: sc,
        car_used: selectedCar
      }).catch(() => {});
    }
  }, [totalLaps, selectedCar, selectedTrack]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0a0a0f' }}>
      <Canvas shadows camera={{ position: [0, 6, 20], fov: 65 }} style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}>
          <GameScene controls={controls} phase={phase} setLapTime={setDisplayLapTime} onLapComplete={handleLapComplete} />
          <EffectComposer>
            <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} height={300} intensity={1.2} />
            <ChromaticAberration offset={[0.001, 0.001]} />
            <Vignette eskil={false} offset={0.3} darkness={0.8} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {phase === 'menu' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <motion_div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div className="font-orbitron neon-text-red" style={{ fontSize: 48, fontWeight: 900 }}>READY?</div>
            <div style={{ color: 'var(--text-dim)', fontFamily: 'Rajdhani', fontSize: 16 }}>Use WASD or Arrow Keys to drive</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--cyan)', fontFamily: 'Orbitron' }}>
              <span>W — Accelerate</span><span>S — Brake</span><span>A/D — Steer</span>
            </div>
            <button className="btn btn-primary" onClick={startRace} style={{ padding: '18px 48px', fontSize: 16, marginTop: 8 }}>START RACE</button>
          </motion_div>
        </div>
      )}

      {phase !== 'menu' && <HUD lapTime={displayLapTime} speed={speed} />}
      {phase === 'countdown' && <CountdownOverlay />}
      {phase === 'finished' && <RaceResultsModal onPlayAgain={startRace} />}
    </div>
  );
}

// Inline motion div substitute
const motion_div = ({ children, style }) => <div style={style}>{children}</div>;
