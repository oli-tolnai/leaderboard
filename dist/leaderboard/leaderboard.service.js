"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardService = void 0;
const common_1 = require("@nestjs/common");
let LeaderboardService = class LeaderboardService {
    constructor() {
        this.gameState = {
            teams: [],
            tasks: [],
            scores: [],
            currentView: 'logo',
            timer: { minutes: 5, seconds: 0 },
            soundAlerts: [],
            revealedTeams: 0,
        };
    }
    getGameState() {
        return Object.assign(Object.assign({}, this.gameState), { teams: this.calculateTotalPoints() });
    }
    addTeam(name) {
        const team = {
            id: Date.now().toString(),
            name,
            totalPoints: 0,
        };
        this.gameState.teams.push(team);
        return team;
    }
    removeTeam(teamId) {
        this.gameState.teams = this.gameState.teams.filter(team => team.id !== teamId);
        this.gameState.scores = this.gameState.scores.filter(score => score.teamId !== teamId);
    }
    addTask(name) {
        const task = {
            id: Date.now().toString(),
            name,
        };
        this.gameState.tasks.push(task);
        return task;
    }
    removeTask(taskId) {
        this.gameState.tasks = this.gameState.tasks.filter(task => task.id !== taskId);
        this.gameState.scores = this.gameState.scores.filter(score => score.taskId !== taskId);
    }
    updateScore(teamId, taskId, points) {
        const existingScoreIndex = this.gameState.scores.findIndex(score => score.teamId === teamId && score.taskId === taskId);
        if (existingScoreIndex >= 0) {
            this.gameState.scores[existingScoreIndex].points = points;
        }
        else {
            this.gameState.scores.push({ teamId, taskId, points });
        }
    }
    getScore(teamId, taskId) {
        const score = this.gameState.scores.find(score => score.teamId === teamId && score.taskId === taskId);
        return score ? score.points : 0;
    }
    setCurrentView(view) {
        this.gameState.currentView = view;
        if (view === 'leaderboard') {
            this.gameState.revealedTeams = 0;
        }
    }
    setTimer(minutes, seconds) {
        this.gameState.timer = { minutes, seconds };
    }
    addSoundAlert(file, triggerMinutes, triggerSeconds) {
        this.gameState.soundAlerts.push({ file, triggerMinutes, triggerSeconds });
    }
    removeSoundAlert(index) {
        this.gameState.soundAlerts.splice(index, 1);
    }
    revealNextTeam() {
        const sortedTeams = this.getSortedTeams();
        if (this.gameState.revealedTeams < sortedTeams.length) {
            this.gameState.revealedTeams++;
        }
    }
    resetReveal() {
        this.gameState.revealedTeams = 0;
    }
    calculateTotalPoints() {
        return this.gameState.teams.map(team => (Object.assign(Object.assign({}, team), { totalPoints: this.gameState.scores
                .filter(score => score.teamId === team.id)
                .reduce((total, score) => total + score.points, 0) })));
    }
    getSortedTeams() {
        return this.calculateTotalPoints().sort((a, b) => b.totalPoints - a.totalPoints);
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = __decorate([
    (0, common_1.Injectable)()
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map