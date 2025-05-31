import { Injectable } from '@nestjs/common';
import { Team, Task, ScoreEntry, GameState, TimerConfig, SoundAlert } from './interfaces';

@Injectable()
export class LeaderboardService {
  private gameState: GameState = {
    teams: [],
    tasks: [],
    scores: [],
    currentView: 'logo',
    timer: { minutes: 5, seconds: 0 },
    soundAlerts: [],
    revealedTeams: 0,
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
    const sortedTeams = this.getSortedTeams();
    if (this.gameState.revealedTeams < sortedTeams.length) {
      this.gameState.revealedTeams++;
    }
  }

  resetReveal(): void {
    this.gameState.revealedTeams = 0;
  }

  private calculateTotalPoints(): Team[] {
    return this.gameState.teams.map(team => ({
      ...team,
      totalPoints: this.gameState.scores
        .filter(score => score.teamId === team.id)
        .reduce((total, score) => total + score.points, 0),
    }));
  }

  getSortedTeams(): Team[] {
    return this.calculateTotalPoints().sort((a, b) => b.totalPoints - a.totalPoints);
  }

  getRevealedTeams(): Team[] {
    const sortedTeams = this.getSortedTeams();
    const revealed = [];
    
    // Reveal from last to first (bottom to top)
    for (let i = 0; i < this.gameState.revealedTeams; i++) {
      const teamIndex = sortedTeams.length - 1 - i;
      if (teamIndex >= 0) {
        revealed.unshift(sortedTeams[teamIndex]);
      }
    }
    
    return revealed;
  }
}
