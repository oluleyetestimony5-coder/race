
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Html, Trail } from '@react-three/drei';
import { CarState } from '../types';

interface CarProps {
  car: CarState;
}

const Car: React.FC<CarProps> = ({ car }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.set(...car.position);
      groupRef.current.rotation.set(...car.rotation);
      
      // Banking logic: Tilt the body based on steering/rotation velocity
      // We approximate the banking by checking the difference in rotation
      if (bodyRef.current) {
        const targetTilt = -Math.min(Math.max(car.speed * 0.05, -0.5), 0.5); // Just a placeholder
        // In real usage, we'd track the angular velocity. For now, let's lean based on turn.
        // We'll use a simplified version for better visuals
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={4} rotationIntensity={0.05} floatIntensity={0.3}>
        <group rotation={[0, 0, 0]}>
          {/* Main Body */}
          <mesh castShadow ref={bodyRef}>
            <boxGeometry args={[1.6, 0.4, 3.2]} />
            <meshStandardMaterial 
                color={car.color} 
                metalness={1} 
                roughness={0.1} 
                emissive={car.color} 
                emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Neon Stripe */}
          <mesh position={[0, 0.21, 0]}>
            <planeGeometry args={[0.1, 3.2]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} rotation={[-Math.PI/2, 0, 0]} />
          </mesh>

          {/* Underglow */}
          <pointLight position={[0, -0.5, 0]} intensity={2} distance={3} color={car.color} />

          {/* Cockpit Shell */}
          <mesh position={[0, 0.35, -0.2]}>
            <boxGeometry args={[1.1, 0.5, 1.4]} />
            <meshStandardMaterial color="#000" metalness={1} roughness={0} transparent opacity={0.8} />
          </mesh>

          {/* Engine Glow (Back) */}
          <mesh position={[0, 0, -1.65]}>
            <boxGeometry args={[1.2, 0.2, 0.1]} />
            <meshStandardMaterial color={car.color} emissive={car.color} emissiveIntensity={8} />
          </mesh>

          {/* Hover Engines with Trails */}
          {[[-0.9, -0.3, 1], [0.9, -0.3, 1], [-0.9, -0.3, -1], [0.9, -0.3, -1]].map((pos, i) => (
            <group key={i} position={pos as [number, number, number]}>
              <mesh>
                <cylinderGeometry args={[0.3, 0.4, 0.2, 16]} />
                <meshStandardMaterial color="#111" emissive={car.color} emissiveIntensity={0.5} />
              </mesh>
              {car.speed > 5 && (
                <Trail 
                  width={0.5} 
                  length={4} 
                  color={new THREE.Color(car.color)} 
                  attenuation={(t) => t * t}
                >
                  <mesh position={[0, -0.1, 0]} />
                </Trail>
              )}
            </group>
          ))}
        </group>

        {/* Floating Tag */}
        <Html position={[0, 2, 0]} center>
          <div className={`px-3 py-1 rounded-sm text-[12px] font-orbitron font-bold whitespace-nowrap transition-all duration-500 border-2 ${car.id === 'player' ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,255,255,0.5)]' : 'bg-gray-950/80 border-gray-600 text-gray-400 opacity-60'}`}>
             {car.name.toUpperCase()}
          </div>
        </Html>
      </Float>
    </group>
  );
};

export default Car;
