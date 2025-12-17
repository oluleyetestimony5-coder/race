
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Track from './Track';
import Car from './Car';
import { CarState, MoveInput } from '../types';

interface GameSceneProps {
  isActive: boolean;
  onLapComplete: (lap: number) => void;
  onUpdateLeaderboard: (cars: CarState[]) => void;
}

const TRACK_POINTS = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(30, 0, 20),
  new THREE.Vector3(80, 0, 10),
  new THREE.Vector3(120, 0, 50),
  new THREE.Vector3(100, 0, 130),
  new THREE.Vector3(40, 0, 160),
  new THREE.Vector3(-60, 0, 140),
  new THREE.Vector3(-100, 0, 80),
  new THREE.Vector3(-40, 0, 20),
];

const GameScene: React.FC<GameSceneProps> = ({ isActive, onLapComplete, onUpdateLeaderboard }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(TRACK_POINTS, true), []);
  const [playerInput, setPlayerInput] = useState<MoveInput>({
    forward: false, backward: false, left: false, right: false
  });

  const carsRef = useRef<CarState[]>([
    { id: 'player', position: [0, 0.5, 0], rotation: [0, 0, 0], speed: 0, lap: 1, progress: 0, isAI: false, name: 'Nova-1', color: '#00ffff' },
    { id: 'ai1', position: [3, 0.5, -5], rotation: [0, 0, 0], speed: 0, lap: 1, progress: 0.98, isAI: true, name: 'Phantom', color: '#ff00ff' },
    { id: 'ai2', position: [-3, 0.5, -10], rotation: [0, 0, 0], speed: 0, lap: 1, progress: 0.95, isAI: true, name: 'Viper', color: '#ffff00' },
    { id: 'ai3', position: [0, 0.5, -15], rotation: [0, 0, 0], speed: 0, lap: 1, progress: 0.92, isAI: true, name: 'Goliath', color: '#00ff00' },
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') setPlayerInput(p => ({ ...p, forward: true }));
      if (e.key === 'ArrowDown' || e.key === 's') setPlayerInput(p => ({ ...p, backward: true }));
      if (e.key === 'ArrowLeft' || e.key === 'a') setPlayerInput(p => ({ ...p, left: true }));
      if (e.key === 'ArrowRight' || e.key === 'd') setPlayerInput(p => ({ ...p, right: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') setPlayerInput(p => ({ ...p, forward: false }));
      if (e.key === 'ArrowDown' || e.key === 's') setPlayerInput(p => ({ ...p, backward: false }));
      if (e.key === 'ArrowLeft' || e.key === 'a') setPlayerInput(p => ({ ...p, left: false }));
      if (e.key === 'ArrowRight' || e.key === 'd') setPlayerInput(p => ({ ...p, right: false }));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const playerLapRef = useRef(1);
  const lastProgressRef = useRef(0);

  useFrame((state, delta) => {
    if (!isActive) return;

    carsRef.current.forEach((car, index) => {
      if (car.isAI) {
        car.speed = 0.04 + Math.random() * 0.015;
        const newProgress = (car.progress + (car.speed * delta)) % 1;
        
        // AI Lap Detection
        if (newProgress < car.progress) car.lap += 1;
        car.progress = newProgress;

        const point = curve.getPointAt(newProgress);
        const lookAtPoint = curve.getPointAt((newProgress + 0.01) % 1);
        const laneOffset = Math.sin(car.progress * 50 + index) * 2;
        car.position = [point.x + laneOffset, 0.5, point.z];
        const dir = new THREE.Vector3().subVectors(lookAtPoint, point).normalize();
        car.rotation = [0, Math.atan2(dir.x, dir.z), 0];
      } else {
        // Player Physics
        let force = 0;
        if (playerInput.forward) force = 55;
        if (playerInput.backward) force = -30;

        car.speed += force * delta;
        car.speed *= 0.985; // Air resistance

        // Handling / Steering
        const steerSpeed = 2.5;
        if (Math.abs(car.speed) > 1) {
          const steerDirection = playerInput.left ? 1 : (playerInput.right ? -1 : 0);
          car.rotation[1] += steerDirection * steerSpeed * delta * (Math.min(car.speed, 40) / 40);
          
          // Banking Visual (Z rotation)
          const targetZ = steerDirection * -0.4 * (Math.abs(car.speed) / 60);
          car.rotation[2] = THREE.MathUtils.lerp(car.rotation[2], targetZ, 0.1);
        }

        const vx = Math.sin(car.rotation[1]) * car.speed * delta;
        const vz = Math.cos(car.rotation[1]) * car.speed * delta;
        car.position[0] += vx;
        car.position[2] += vz;

        // Calculate progress along curve for leaderboard
        const posVec = new THREE.Vector3(car.position[0], 0, car.position[2]);
        const nearestT = curve.getUtoTmapping(0, 0); // Simplified: we check a range around current progress
        let bestT = car.progress;
        let minDist = Infinity;
        for (let checkT = car.progress - 0.05; checkT <= car.progress + 0.05; checkT += 0.005) {
            const normalizedT = ((checkT % 1) + 1) % 1;
            const p = curve.getPointAt(normalizedT);
            const d = p.distanceTo(posVec);
            if (d < minDist) {
                minDist = d;
                bestT = normalizedT;
            }
        }
        
        // Lap Detection
        if (bestT < 0.1 && lastProgressRef.current > 0.9) {
          car.lap += 1;
          playerLapRef.current = car.lap;
          onLapComplete(car.lap);
        }
        lastProgressRef.current = bestT;
        car.progress = bestT;

        // Dynamic Camera
        const camTarget = new THREE.Vector3(
          car.position[0] - Math.sin(car.rotation[1]) * 12,
          car.position[1] + 6,
          car.position[2] - Math.cos(car.rotation[1]) * 12
        );
        state.camera.position.lerp(camTarget, 0.1);
        const lookPos = new THREE.Vector3(
            car.position[0] + Math.sin(car.rotation[1]) * 5,
            car.position[1] + 1,
            car.position[2] + Math.cos(car.rotation[1]) * 5
        );
        state.camera.lookAt(lookPos);
        
        // FOV warp effect
        const targetFOV = 70 + (Math.abs(car.speed) * 0.5);
        (state.camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp((state.camera as THREE.PerspectiveCamera).fov, targetFOV, 0.05);
        (state.camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      }
    });

    onUpdateLeaderboard(carsRef.current);
  });

  return (
    <group>
      <Track curve={curve} />
      {carsRef.current.map((car) => (
        <Car key={car.id} car={car} />
      ))}
      
      {/* Decorative Monoliths */}
      {TRACK_POINTS.map((p, i) => (
        <mesh key={i} position={[p.x * 1.5, -5, p.z * 1.5]}>
            <boxGeometry args={[10, 50, 10]} />
            <meshStandardMaterial color="#050510" emissive="#111" />
        </mesh>
      ))}
    </group>
  );
};

export default GameScene;
