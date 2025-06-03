import { Server, Socket } from 'socket.io';
import { LeaderboardService } from './leaderboard.service';
export declare class LeaderboardGateway {
    private leaderboardService;
    server: Server;
    constructor(leaderboardService: LeaderboardService);
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleAddTeam(name: string): import("./interfaces").Team;
    handleRemoveTeam(teamId: string): void;
    handleAddTask(name: string): import("./interfaces").Task;
    handleRemoveTask(taskId: string): void;
    handleAddTaskGroup(name: string): import("./interfaces").TaskGroup;
    handleRemoveTaskGroup(groupId: string): void;
    handleUpdateTaskGroup(data: {
        groupId: string;
        name: string;
        taskIds: string[];
    }): void;
    handleUpdateScore(data: {
        teamId: string;
        taskId: string;
        points: number;
    }): void;
    handleSetView(view: 'logo' | 'scoreboard' | 'leaderboard' | 'timer'): void;
    handleSetTimer(data: {
        minutes: number;
        seconds: number;
    }): void;
    handleAddSoundAlert(data: {
        file: string;
        triggerMinutes: number;
        triggerSeconds: number;
    }): void;
    handleRemoveSoundAlert(index: number): void;
    handleRevealNextTeam(): void;
    handleResetReveal(): void;
    handleStartTimer(): void;
    handlePauseTimer(): void;
    handleResetTimer(): void;
    handlePlaySound(soundFile: string): void;
}
