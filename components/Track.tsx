
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface TrackProps {
  curve: THREE.CatmullRomCurve3;
}

const Track: React.FC<TrackProps> = ({ curve }) => {
  const tubeSegments = 200;
  const tubeRadius = 7;
  
  // High-tech highway geometry
  const roadGeom = useMemo(() => new THREE.TubeGeometry(curve, tubeSegments, tubeRadius, 12, true), [curve]);
  const railLeftGeom = useMemo(() => new THREE.TubeGeometry(curve, tubeSegments, 0.3, 8, true), [curve]);
  
  return (
    <group>
      {/* Dark Road Surface */}
      <mesh geometry={roadGeom} receiveShadow>
        <meshStandardMaterial 
          color="#08080a" 
          roughness={0.2} 
          metalness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Grid pattern on the road using wireframe overlay */}
      <mesh geometry={roadGeom}>
        <meshStandardMaterial 
          color="#1a1a2e" 
          wireframe 
          transparent 
          opacity={0.15} 
        />
      </mesh>

      {/* Side Rails (Neon) */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * tubeRadius;
          const y = Math.sin(angle) * tubeRadius;
          
          return (
            <mesh key={i} geometry={railLeftGeom}>
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#00ffff" : "#ff00ff"} 
                emissive={i % 2 === 0 ? "#00ffff" : "#ff00ff"} 
                emissiveIntensity={2}
              />
            </mesh>
          )
      })}

      {/* Checkered Start Gate */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <planeGeometry args={[14, 4]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} transparent opacity={0.8} />
        </mesh>
        
        {/* Arch */}
        <mesh position={[0, 4, 0]}>
            <torusGeometry args={[8, 0.2, 16, 32, Math.PI]} rotation={[0, Math.PI/2, 0]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={10} />
        </mesh>
      </group>

      {/* Directional Chevrons (Fake - placed manually or procedurally along curve) */}
      {Array.from({length: 20}).map((_, i) => {
        const t = (i / 20);
        const pos = curve.getPointAt(t);
        const look = curve.getPointAt((t + 0.01) % 1);
        return (
          <group key={i} position={[pos.x, pos.y + 0.1, pos.z]}>
             <mesh rotation={[-Math.PI / 2, 0, 0]} lookAt={look}>
                <planeGeometry args={[2, 2]} />
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} transparent opacity={0.3} />
             </mesh>
          </group>
        )
      })}

      {/* Global Ground Grid */}
      <gridHelper args={[1000, 100, '#ff00ff', '#111111']} position={[0, -10, 0]} />
    </group>
  );
};

export default Track;
