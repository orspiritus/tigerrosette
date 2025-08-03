export interface GameSessionData {
  score: number;
  duration: number;
  clicks: number;
  shocks: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  isMultiplayer: boolean;
  roomId?: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  firstName: string;
  score: number;
  level: number;
  achievements: number;
  rank: number;
}

export interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  gameMode: 'quick_match' | 'tournament' | 'challenge' | 'community';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  duration: number;
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  participants: RoomParticipantData[];
}

export interface RoomParticipantData {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  level: number;
  joinedAt: Date;
  finalScore?: number;
  finalRank?: number;
}

export interface GameResults {
  userId: string;
  username: string;
  firstName: string;
  score: number;
  rank: number;
  experienceGained: number;
  voltsEarned: number;
}

// WebSocket Events
export interface ClientEvents {
  'game:start': { roomId: string };
  'game:click': { score: number; isShocked: boolean; timestamp: number };
  'game:finish': { finalScore: number; statistics: GameSessionData };
  'room:join': { roomId: string };
  'room:leave': { roomId: string };
  'room:create': { 
    name: string; 
    maxPlayers: number; 
    gameMode: string; 
    difficulty: string; 
    duration: number 
  };
}

export interface ServerEvents {
  'room:joined': { room: Room; players: RoomParticipantData[] };
  'room:player_joined': { player: RoomParticipantData };
  'room:player_left': { playerId: string };
  'game:started': { countdown: number; roomId: string };
  'game:player_score': { playerId: string; score: number; timestamp: number };
  'game:finished': { results: GameResults[] };
  'leaderboard:updated': { leaderboard: LeaderboardEntry[] };
  'error': { message: string; code?: string };
}
