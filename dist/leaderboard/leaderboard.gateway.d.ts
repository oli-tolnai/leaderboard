import { Server, Socket } from 'socket.io';
import { LeaderboardService } from './leaderboard.service';
import { Team, Task, TaskGroup, ScoreEntry, TimerConfig, SoundAlert } from './interfaces';
export declare class LeaderboardGateway {
    private leaderboardService;
    server: Server;
    constructor(leaderboardService: LeaderboardService);
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleAddTeam(name: string): Team;
    handleRemoveTeam(teamId: string): void;
    handleAddTask(name: string): Task;
    handleRemoveTask(taskId: string): void;
    handleAddTaskGroup(name: string): TaskGroup;
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
    handleLoadGameState(data: {
        teams: Team[];
        tasks: Task[];
        taskGroups: TaskGroup[];
        scores: ScoreEntry[];
        timer: TimerConfig;
        soundAlerts: SoundAlert[];
    }): void;
}
