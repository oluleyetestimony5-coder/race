
export interface CarState {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  speed: number;
  lap: number;
  progress: number;
  isAI: boolean;
  name: string;
  color: string;
}

export interface GameStats {
  gameState: 'START' | 'COUNTDOWN' | 'RACING' | 'FINISHED';
  currentLap: number;
  maxLaps: number;
  startTime: number;
  elapsedTime: number;
  commentary: string;
  leaderboard: CarState[];
  countdown: number;
}

export type MoveInput = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};
