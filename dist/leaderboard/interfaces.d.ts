export interface Team {
    id: string;
    name: string;
    totalPoints: number;
    rank?: number;
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
    revealedTeams: number;
    revealedRanks: number;
}
