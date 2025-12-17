
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { CarState, GameStats } from './types';
import GameScene from './components/GameScene';
import HUD from './components/HUD';
import { getRaceCommentary } from './geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameStats>({
    gameState: 'START',
    currentLap: 1,
    maxLaps: 3,
    startTime: 0,
    elapsedTime: 0,
    commentary: "SYSTEMS ONLINE. AWAITING PILOT AUTHORIZATION.",
    leaderboard: [],
    countdown: 3,
  });

  const [playerPosition, setPlayerPosition] = useState(1);
  const commentaryCooldown = useRef(false);

  const updateCommentary = useCallback(async (event: string) => {
    if (commentaryCooldown.current) return;
    commentaryCooldown.current = true;
    
    const text = await getRaceCommentary(event, playerPosition, 4);
    setGameState(prev => ({ ...prev, commentary: text }));
    
    setTimeout(() => {
      commentaryCooldown.current = false;
    }, 6000);
  }, [playerPosition]);

  const startCountdown = () => {
    setGameState(prev => ({ ...prev, gameState: 'COUNTDOWN', countdown: 3 }));
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count === 0) {
        clearInterval(interval);
        setGameState(prev => ({
          ...prev,
          gameState: 'RACING',
          startTime: Date.now(),
        }));
        updateCommentary("The grid is live! Floor it!");
      } else {
        setGameState(prev => ({ ...prev, countdown: count }));
      }
    }, 1000);
  };

  const handleLapComplete = (lap: number) => {
    if (lap > gameState.maxLaps) {
      setGameState(prev => ({ ...prev, gameState: 'FINISHED' }));
      updateCommentary("VICTORY! YOU HAVE CONQUERED THE GRID!");
    } else {
      setGameState(prev => ({ ...prev, currentLap: lap }));
      updateCommentary(`Lap ${lap}! Don't let up!`);
    }
  };

  const updateLeaderboard = (cars: CarState[]) => {
    const sorted = [...cars].sort((a, b) => {
        if (b.lap !== a.lap) return b.lap - a.lap;
        return b.progress - a.progress;
    });
    setGameState(prev => ({ ...prev, leaderboard: sorted }));
    const playerRank = sorted.findIndex(c => c.id === 'player') + 1;
    if (playerRank !== playerPosition && playerRank > 0) {
      if (playerRank < playerPosition) {
        updateCommentary("Target overtaken. Moving to the front.");
      }
      setPlayerPosition(playerRank);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 8, 15]} fov={75} />
        <color attach="background" args={['#020205']} />
        
        <Stars radius={150} depth={50} count={7000} factor={4} saturation={0} fade speed={1.5} />
        <fog attach="fog" args={['#020205', 20, 120]} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[20, 30, 10]} intensity={1.5} color="#00ffff" />
        <pointLight position={[-20, 30, -10]} intensity={1.5} color="#ff00ff" />
        
        <Environment preset="night" />

        <GameScene 
          isActive={gameState.gameState === 'RACING'} 
          onLapComplete={handleLapComplete}
          onUpdateLeaderboard={updateLeaderboard}
        />
      </Canvas>

      <HUD 
        stats={gameState} 
        onStart={startCountdown} 
        playerRank={playerPosition} 
      />
      
      {/* Scanline Effect Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]"></div>
    </div>
  );
};

export default App;
