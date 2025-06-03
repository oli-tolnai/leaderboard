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
            taskGroups: [],
            scores: [],
            currentView: 'logo',
            timer: { minutes: 5, seconds: 0 },
            soundAlerts: [],
            revealedTeams: 0,
            revealedRanks: 0,
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
            this.gameState.revealedRanks = 0;
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
        const rankedTeams = this.calculateStandardRanking();
        if (rankedTeams.length === 0)
            return;
        const currentMaxRevealedRank = this.gameState.revealedRanks;
        const nextRankToReveal = currentMaxRevealedRank + 1;
        const sortedRanks = [...new Set(rankedTeams.map(team => team.rank))].sort((a, b) => b - a);
        if (nextRankToReveal <= sortedRanks.length) {
            const rankToReveal = sortedRanks[nextRankToReveal - 1];
            const teamsAtThisRank = rankedTeams.filter(team => team.rank === rankToReveal);
            this.gameState.revealedTeams += teamsAtThisRank.length;
            this.gameState.revealedRanks = nextRankToReveal;
        }
    }
    resetReveal() {
        this.gameState.revealedTeams = 0;
        this.gameState.revealedRanks = 0;
    }
    calculateTotalPoints() {
        return this.gameState.teams.map(team => (Object.assign(Object.assign({}, team), { totalPoints: this.gameState.scores
                .filter(score => score.teamId === team.id)
                .reduce((total, score) => total + score.points, 0) })));
    }
    getSortedTeams() {
        return this.calculateTotalPoints().sort((a, b) => b.totalPoints - a.totalPoints);
    }
    calculateStandardRanking() {
        const sortedTeams = this.getSortedTeams();
        if (!sortedTeams || sortedTeams.length === 0)
            return [];
        const rankedTeams = [];
        let currentRank = 1;
        for (let i = 0; i < sortedTeams.length; i++) {
            const team = sortedTeams[i];
            if (i > 0 && team.totalPoints === sortedTeams[i - 1].totalPoints) {
                rankedTeams.push(Object.assign(Object.assign({}, team), { rank: rankedTeams[i - 1].rank }));
            }
            else {
                rankedTeams.push(Object.assign(Object.assign({}, team), { rank: currentRank }));
            }
            currentRank = i + 2;
        }
        return rankedTeams;
    }
    addTaskGroup(name) {
        const taskGroup = {
            id: Date.now().toString(),
            name,
            taskIds: [],
        };
        this.gameState.taskGroups.push(taskGroup);
        return taskGroup;
    }
    removeTaskGroup(groupId) {
        this.gameState.tasks = this.gameState.tasks.map(task => (Object.assign(Object.assign({}, task), { groupId: task.groupId === groupId ? undefined : task.groupId })));
        this.gameState.taskGroups = this.gameState.taskGroups.filter(group => group.id !== groupId);
    }
    updateTaskGroup(groupId, name, taskIds) {
        const groupIndex = this.gameState.taskGroups.findIndex(group => group.id === groupId);
        if (groupIndex >= 0) {
            this.gameState.taskGroups[groupIndex].name = name;
            this.gameState.taskGroups[groupIndex].taskIds = taskIds;
            this.gameState.tasks = this.gameState.tasks.map(task => (Object.assign(Object.assign({}, task), { groupId: taskIds.includes(task.id) ? groupId : (task.groupId === groupId ? undefined : task.groupId) })));
        }
    }
    getTasksForGroup(groupId) {
        return this.gameState.tasks.filter(task => task.groupId === groupId);
    }
    getUngroupedTasks() {
        return this.gameState.tasks.filter(task => !task.groupId);
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = __decorate([
    (0, common_1.Injectable)()
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map