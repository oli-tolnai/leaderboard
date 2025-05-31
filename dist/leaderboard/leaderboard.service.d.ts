import { Team, Task, GameState } from './interfaces';
export declare class LeaderboardService {
    private gameState;
    getGameState(): GameState;
    addTeam(name: string): Team;
    removeTeam(teamId: string): void;
    addTask(name: string): Task;
    removeTask(taskId: string): void;
    updateScore(teamId: string, taskId: string, points: number): void;
    getScore(teamId: string, taskId: string): number;
    setCurrentView(view: 'logo' | 'scoreboard' | 'leaderboard' | 'timer'): void;
    setTimer(minutes: number, seconds: number): void;
    addSoundAlert(file: string, triggerMinutes: number, triggerSeconds: number): void;
    removeSoundAlert(index: number): void;
    revealNextTeam(): void;
    resetReveal(): void;
    private calculateTotalPoints;
    getSortedTeams(): Team[];
}
