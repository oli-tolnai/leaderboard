import { Injectable } from '@nestjs/common';
import { Team, Task, TaskGroup, ScoreEntry, GameState, TimerConfig, SoundAlert } from './interfaces';

@Injectable()
export class LeaderboardService {  private gameState: GameState = {
    teams: [],
    tasks: [],
    taskGroups: [],
    scores: [],
    currentView: 'logo',
    timer: { minutes: 5, seconds: 0 },
    soundAlerts: [],
    revealedTeams: 0,
    revealedRanks: 0,
  };

  getGameState(): GameState {
    return {
      ...this.gameState,
      teams: this.calculateTotalPoints(),
    };
  }

  addTeam(name: string): Team {
    const team: Team = {
      id: Date.now().toString(),
      name,
      totalPoints: 0,
    };
    this.gameState.teams.push(team);
    return team;
  }

  removeTeam(teamId: string): void {
    this.gameState.teams = this.gameState.teams.filter(team => team.id !== teamId);
    this.gameState.scores = this.gameState.scores.filter(score => score.teamId !== teamId);
  }

  addTask(name: string): Task {
    const task: Task = {
      id: Date.now().toString(),
      name,
    };
    this.gameState.tasks.push(task);
    return task;
  }

  removeTask(taskId: string): void {
    this.gameState.tasks = this.gameState.tasks.filter(task => task.id !== taskId);
    this.gameState.scores = this.gameState.scores.filter(score => score.taskId !== taskId);
  }

  updateScore(teamId: string, taskId: string, points: number): void {
    const existingScoreIndex = this.gameState.scores.findIndex(
      score => score.teamId === teamId && score.taskId === taskId
    );

    if (existingScoreIndex >= 0) {
      this.gameState.scores[existingScoreIndex].points = points;
    } else {
      this.gameState.scores.push({ teamId, taskId, points });
    }
  }

  getScore(teamId: string, taskId: string): number {
    const score = this.gameState.scores.find(
      score => score.teamId === teamId && score.taskId === taskId
    );
    return score ? score.points : 0;
  }
  setCurrentView(view: 'logo' | 'scoreboard' | 'leaderboard' | 'timer'): void {
    this.gameState.currentView = view;
    if (view === 'leaderboard') {
      this.gameState.revealedTeams = 0; // Reset reveal count when switching to leaderboard
      this.gameState.revealedRanks = 0; // Reset revealed ranks when switching to leaderboard
    }
  }

  setTimer(minutes: number, seconds: number): void {
    this.gameState.timer = { minutes, seconds };
  }

  addSoundAlert(file: string, triggerMinutes: number, triggerSeconds: number): void {
    this.gameState.soundAlerts.push({ file, triggerMinutes, triggerSeconds });
  }

  removeSoundAlert(index: number): void {
    this.gameState.soundAlerts.splice(index, 1);
  }
  revealNextTeam(): void {
    const rankedTeams = this.calculateStandardRanking();
    
    if (rankedTeams.length === 0) return;
    
    // Find the next rank to reveal
    const currentMaxRevealedRank = this.gameState.revealedRanks;
    const nextRankToReveal = currentMaxRevealedRank + 1;
    
    // Find teams with the next rank (starting from worst rank)
    const sortedRanks = [...new Set(rankedTeams.map(team => team.rank))].sort((a, b) => b - a);
    
    if (nextRankToReveal <= sortedRanks.length) {
      const rankToReveal = sortedRanks[nextRankToReveal - 1];
      const teamsAtThisRank = rankedTeams.filter(team => team.rank === rankToReveal);
      
      // Update revealed teams count to include all teams at this rank
      this.gameState.revealedTeams += teamsAtThisRank.length;
      this.gameState.revealedRanks = nextRankToReveal;
    }
  }

  resetReveal(): void {
    this.gameState.revealedTeams = 0;
    this.gameState.revealedRanks = 0;
  }

  private calculateTotalPoints(): Team[] {
    return this.gameState.teams.map(team => ({
      ...team,
      totalPoints: this.gameState.scores
        .filter(score => score.teamId === team.id)
        .reduce((total, score) => total + score.points, 0),
    }));
  }
  getSortedTeams(): Team[] {    return this.calculateTotalPoints().sort((a, b) => b.totalPoints - a.totalPoints);
  }

  calculateStandardRanking(): Team[] {
    const sortedTeams = this.getSortedTeams();
    if (!sortedTeams || sortedTeams.length === 0) return [];
    
    const rankedTeams: Team[] = [];
    let currentRank = 1;
    
    for (let i = 0; i < sortedTeams.length; i++) {
      const team = sortedTeams[i];
      
      // If this is not the first team and has the same score as the previous team,
      // give it the same rank as the previous team
      if (i > 0 && team.totalPoints === sortedTeams[i - 1].totalPoints) {
        rankedTeams.push({
          ...team,
          rank: rankedTeams[i - 1].rank
        });
      } else {
        // Different score, so assign the current rank
        rankedTeams.push({
          ...team,
          rank: currentRank
        });
      }
      
      // Update currentRank for the next iteration
      // In standard competition ranking, the next rank after tied teams
      // is the current position + 1 (which skips ranks for ties)
      currentRank = i + 2;
    }
    
    return rankedTeams;
  }

  addTaskGroup(name: string): TaskGroup {
    const taskGroup: TaskGroup = {
      id: Date.now().toString(),
      name,
      taskIds: [],
    };
    this.gameState.taskGroups.push(taskGroup);
    return taskGroup;
  }

  removeTaskGroup(groupId: string): void {
    // Remove groupId from tasks that belong to this group
    this.gameState.tasks = this.gameState.tasks.map(task => ({
      ...task,
      groupId: task.groupId === groupId ? undefined : task.groupId
    }));
    
    this.gameState.taskGroups = this.gameState.taskGroups.filter(group => group.id !== groupId);
  }

  updateTaskGroup(groupId: string, name: string, taskIds: string[]): void {
    const groupIndex = this.gameState.taskGroups.findIndex(group => group.id === groupId);
    if (groupIndex >= 0) {
      this.gameState.taskGroups[groupIndex].name = name;
      this.gameState.taskGroups[groupIndex].taskIds = taskIds;
      
      // Update task assignments
      this.gameState.tasks = this.gameState.tasks.map(task => ({
        ...task,
        groupId: taskIds.includes(task.id) ? groupId : (task.groupId === groupId ? undefined : task.groupId)
      }));
    }
  }
  getTasksForGroup(groupId: string): Task[] {
    return this.gameState.tasks.filter(task => task.groupId === groupId);
  }

  getUngroupedTasks(): Task[] {
    return this.gameState.tasks.filter(task => !task.groupId);
  }

  loadGameState(data: {
    teams: Team[];
    tasks: Task[];
    taskGroups: TaskGroup[];
    scores: ScoreEntry[];
    timer: TimerConfig;
    soundAlerts: SoundAlert[];
  }): void {
    // Reset current state
    this.gameState.teams = data.teams || [];
    this.gameState.tasks = data.tasks || [];
    this.gameState.taskGroups = data.taskGroups || [];
    this.gameState.scores = data.scores || [];
    this.gameState.timer = data.timer || { minutes: 5, seconds: 0 };
    this.gameState.soundAlerts = data.soundAlerts || [];
    
    // Reset view-related state
    this.gameState.revealedTeams = 0;
    this.gameState.revealedRanks = 0;
    this.gameState.currentView = 'logo';
  }
}
