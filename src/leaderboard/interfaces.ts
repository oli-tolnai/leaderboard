export interface Team {
  id: string;
  name: string;
  totalPoints: number;
  rank?: number; // Optional rank for leaderboard display
}

export interface Task {
  id: string;
  name: string;
}

export interface ScoreEntry {
  teamId: string;
  taskId: string;
  points: number;
}

export interface TimerConfig {
  minutes: number;
  seconds: number;
}

export interface SoundAlert {
  file: string;
  triggerMinutes: number;
  triggerSeconds: number;
}

export interface GameState {
  teams: Team[];
  tasks: Task[];
  scores: ScoreEntry[];
  currentView: 'logo' | 'scoreboard' | 'leaderboard' | 'timer';
  timer: TimerConfig;
  soundAlerts: SoundAlert[];
  revealedTeams: number; // For leaderboard reveal animation
  revealedRanks: number; // Track revealed ranks for simultaneous tie reveals
}
