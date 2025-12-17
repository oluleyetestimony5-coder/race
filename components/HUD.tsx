
import React from 'react';
import { GameStats } from '../types';

interface HUDProps {
  stats: GameStats;
  onStart: () => void;
  playerRank: number;
}

const HUD: React.FC<HUDProps> = ({ stats, onStart, playerRank }) => {
  const playerCar = stats.leaderboard.find(c => c.id === 'player');
  const speed = playerCar ? Math.floor(Math.abs(playerCar.speed) * 4) : 0;

  return (
    <div className="absolute inset-0 pointer-events-none font-orbitron text-white">
      {/* Top Banner - AI Commentary */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        <div className="bg-cyan-900/20 backdrop-blur-xl border-t-2 border-b-2 border-cyan-500/50 p-3 text-center shadow-[0_0_30px_rgba(0,255,255,0.1)]">
           <div className="text-[10px] tracking-[0.3em] text-cyan-400 uppercase mb-1 font-bold">Grid Marshall Feed</div>
           <div className="text-lg italic font-bold tracking-tight text-white drop-shadow-md">
             "{stats.commentary}"
           </div>
        </div>
      </div>

      {/* Right Side Stats */}
      <div className="absolute top-10 right-10 space-y-4">
        <div className="bg-black/80 backdrop-blur-md border border-white/20 p-4 w-40 skew-x-[-12deg]">
          <div className="skew-x-[12deg]">
            <div className="text-[10px] text-gray-500 uppercase font-bold">Position</div>
            <div className="text-4xl font-black text-cyan-400">
                {playerRank}<span className="text-xs text-white">/4</span>
            </div>
          </div>
        </div>
        <div className="bg-black/80 backdrop-blur-md border border-white/20 p-4 w-40 skew-x-[-12deg]">
          <div className="skew-x-[12deg]">
            <div className="text-[10px] text-gray-500 uppercase font-bold">Lap</div>
            <div className="text-4xl font-black">{stats.currentLap}<span className="text-xs text-gray-500">/{stats.maxLaps}</span></div>
          </div>
        </div>
      </div>

      {/* Bottom Center - Speedometer */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="relative">
            <svg className="w-48 h-24" viewBox="0 0 100 50">
                <path d="M 10 40 A 35 35 0 0 1 90 40" fill="none" stroke="#222" strokeWidth="4" />
                <path 
                    d="M 10 40 A 35 35 0 0 1 90 40" 
                    fill="none" 
                    stroke="#00ffff" 
                    strokeWidth="4" 
                    strokeDasharray="125.6" 
                    strokeDashoffset={125.6 - (Math.min(speed, 300) / 300) * 125.6}
                    className="transition-all duration-300"
                />
            </svg>
            <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center">
                <div className="text-4xl font-black italic">{speed}</div>
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">U/S Velocity</div>
            </div>
        </div>
      </div>

      {/* Start / Finish Screens */}
      {stats.gameState === 'START' && (
        <div className="absolute inset-0 pointer-events-auto bg-black/90 flex flex-col items-center justify-center p-8">
            <div className="relative mb-12">
                <h1 className="text-9xl font-black tracking-tighter italic skew-x-[-15deg] text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-white to-blue-600 drop-shadow-[0_0_50px_rgba(0,255,255,0.4)]">
                    HYPERDRIVE
                </h1>
                <div className="absolute -bottom-2 right-0 bg-white text-black px-4 py-1 font-bold skew-x-[-15deg]">GEMINI CIRCUIT</div>
            </div>

            <button 
                onClick={onStart}
                className="group relative px-20 py-6 bg-transparent overflow-hidden border-2 border-cyan-400 hover:border-white transition-all duration-300"
            >
                <div className="absolute inset-0 bg-cyan-400/20 group-hover:bg-cyan-400 transition-all duration-300"></div>
                <span className="relative z-10 text-2xl font-black group-hover:text-black">INITIATE SEQUENCE</span>
            </button>
            
            <div className="mt-12 grid grid-cols-2 gap-12 text-center opacity-70">
                <div>
                    <div className="text-cyan-400 text-xs mb-2">DIRECTION</div>
                    <div className="font-bold">WASD / ARROWS</div>
                </div>
                <div>
                    <div className="text-cyan-400 text-xs mb-2">OBJECTIVE</div>
                    <div className="font-bold">REACH TOP RANK</div>
                </div>
            </div>
        </div>
      )}

      {stats.gameState === 'COUNTDOWN' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-[15rem] font-black italic animate-ping text-cyan-400 opacity-80">
                {stats.countdown}
            </div>
        </div>
      )}

      {stats.gameState === 'FINISHED' && (
        <div className="absolute inset-0 pointer-events-auto bg-black/80 flex flex-col items-center justify-center backdrop-blur-md">
            <h2 className="text-7xl font-black text-white mb-2">CIRCUIT COMPLETE</h2>
            <div className="text-cyan-400 text-xl mb-12">RANKING: #{playerRank}</div>
            
            <button 
                onClick={() => window.location.reload()}
                className="px-12 py-4 bg-white text-black font-black hover:scale-110 transition-transform"
            >
                REBOOT CORE
            </button>
        </div>
      )}

      {/* Leaderboard Small */}
      <div className="absolute bottom-10 left-10 w-64 bg-black/40 backdrop-blur-xl border-l-4 border-cyan-500 p-4">
        <div className="text-[10px] text-gray-500 uppercase font-bold mb-3">Live Rankings</div>
        <div className="space-y-2">
            {stats.leaderboard.map((car, i) => (
                <div key={car.id} className={`flex justify-between items-center ${car.id === 'player' ? 'text-cyan-400 font-bold' : 'text-gray-400'}`}>
                    <div className="flex gap-3 items-center">
                        <span className="text-[10px] opacity-50">{i + 1}</span>
                        <div className="w-1.5 h-6 bg-current opacity-80"></div>
                        <span className="text-sm">{car.name}</span>
                    </div>
                    <span className="text-[10px]">L{car.lap}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HUD;
