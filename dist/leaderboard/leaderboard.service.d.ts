import { Team, Task, TaskGroup, GameState } from './interfaces';
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
    calculateStandardRanking(): Team[];
    addTaskGroup(name: string): TaskGroup;
    removeTaskGroup(groupId: string): void;
    updateTaskGroup(groupId: string, name: string, taskIds: string[]): void;
    getTasksForGroup(groupId: string): Task[];
    getUngroupedTasks(): Task[];
}
