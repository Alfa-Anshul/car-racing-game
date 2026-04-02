import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { Suspense, useRef } from 'react';

const CARS = [
  { id: 'red', name: 'VIPER GT', color: '#ff3366', desc: 'Top Speed', stats: { speed: 95, handling