import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LeaderboardService } from './leaderboard.service';
import { Team, Task, TaskGroup, ScoreEntry, TimerConfig, SoundAlert } from './interfaces';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LeaderboardGateway {
  @WebSocketServer()
  server: Server;

  constructor(private leaderboardService: LeaderboardService) {}

  afterInit() {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // Send current game state to newly connected client
    client.emit('gameStateUpdate', this.leaderboardService.getGameState());
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('addTeam')
  handleAddTeam(@MessageBody() name: string) {
    const team = this.leaderboardService.addTeam(name);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
    return team;
  }

  @SubscribeMessage('removeTeam')
  handleRemoveTeam(@MessageBody() teamId: string) {
    this.leaderboardService.removeTeam(teamId);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
  }

  @SubscribeMessage('addTask')
  handleAddTask(@MessageBody() name: string) {
    const task = this.leaderboardService.addTask(name);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
    return task;
  }

  @SubscribeMessage('removeTask')
  handleRemoveTask(@MessageBody() taskId: string) {
    this.leaderboardService.removeTask(taskId);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
  }

  @SubscribeMessage('addTaskGroup')
  handleAddTaskGroup(@MessageBody() name: string) {
    const taskGroup = this.leaderboardService.addTaskGroup(name);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
    return taskGroup;
  }

  @SubscribeMessage('removeTaskGroup')
  handleRemoveTaskGroup(@MessageBody() groupId: string) {
    this.leaderboardService.removeTaskGroup(groupId);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
  }

  @SubscribeMessage('updateTaskGroup')
  handleUpdateTaskGroup(@MessageBody() data: { groupId: string; name: string; taskIds: string[] }) {
    this.leaderboardService.updateTaskGroup(data.groupId, data.name, data.taskIds);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
  }

  @SubscribeMessage('updateScore')
  handleUpdateScore(@MessageBody() data: { teamId: string; taskId: string; points: number }) {
    this.leaderboardService.updateScore(data.teamId, data.taskId, data.points);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
  }

  @SubscribeMessage('setView')
  handleSetView(@MessageBody() view: 'logo' | 'scoreboard' | 'leaderboard' | 'timer') {
    this.leaderboardService.setCurrentView(view);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
  }

  @SubscribeMessage('setTimer')
  handleSetTimer(@MessageBody() data: { minutes: number; seconds: number }) {
    this.leaderboardService.setTimer(data.minutes, data.seconds);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
  }

  @SubscribeMessage('addSoundAlert')
  handleAddSoundAlert(@MessageBody() data: { file: string; triggerMinutes: number; triggerSeconds: number }) {
    this.leaderboardService.addSoundAlert(data.file, data.triggerMinutes, data.triggerSeconds);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
  }

  @SubscribeMessage('removeSoundAlert')
  handleRemoveSoundAlert(@MessageBody() index: number) {
    this.leaderboardService.removeSoundAlert(index);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
  }

  @SubscribeMessage('revealNextTeam')
  handleRevealNextTeam() {
    this.leaderboardService.revealNextTeam();
    const gameState = this.leaderboardService.getGameState();
    this.server.emit('gameStateUpdate', gameState);
    this.server.emit('revealTeam', {
      totalRevealed: gameState.revealedTeams,
      revealedRanks: gameState.revealedRanks,
    });
  }

  @SubscribeMessage('resetReveal')
  handleResetReveal() {
    this.leaderboardService.resetReveal();
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
  }

  @SubscribeMessage('startTimer')
  handleStartTimer() {
    this.server.emit('timerStart');
  }

  @SubscribeMessage('pauseTimer')
  handlePauseTimer() {
    this.server.emit('timerPause');
  }

  @SubscribeMessage('resetTimer')
  handleResetTimer() {
    this.server.emit('timerReset');
  }

  @SubscribeMessage('playSound')
  handlePlaySound(@MessageBody() soundFile: string) {
    this.server.emit('playSound', soundFile);
  }

  @SubscribeMessage('loadGameState')
  handleLoadGameState(@MessageBody() data: {
    teams: Team[];
    tasks: Task[];
    taskGroups: TaskGroup[];
    scores: ScoreEntry[];
    timer: TimerConfig;
    soundAlerts: SoundAlert[];
  }) {
    this.leaderboardService.loadGameState(data);
    this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
  }
}
