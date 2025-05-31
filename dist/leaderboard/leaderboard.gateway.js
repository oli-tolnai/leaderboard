"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const leaderboard_service_1 = require("./leaderboard.service");
let LeaderboardGateway = class LeaderboardGateway {
    constructor(leaderboardService) {
        this.leaderboardService = leaderboardService;
    }
    afterInit() {
        console.log('WebSocket Gateway initialized');
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
        client.emit('gameStateUpdate', this.leaderboardService.getGameState());
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
    }
    handleAddTeam(name) {
        const team = this.leaderboardService.addTeam(name);
        this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
        return team;
    }
    handleRemoveTeam(teamId) {
        this.leaderboardService.removeTeam(teamId);
        this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
    }
    handleAddTask(name) {
        const task = this.leaderboardService.addTask(name);
        this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
        return task;
    }
    handleRemoveTask(taskId) {
        this.leaderboardService.removeTask(taskId);
        this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
    }
    handleUpdateScore(data) {
        this.leaderboardService.updateScore(data.teamId, data.taskId, data.points);
        this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
    }
    handleSetView(view) {
        this.leaderboardService.setCurrentView(view);
        this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
    }
    handleSetTimer(data) {
        this.leaderboardService.setTimer(data.minutes, data.seconds);
        this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
    }
    handleAddSoundAlert(data) {
        this.leaderboardService.addSoundAlert(data.file, data.triggerMinutes, data.triggerSeconds);
        this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
    }
    handleRemoveSoundAlert(index) {
        this.leaderboardService.removeSoundAlert(index);
        this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
    }
    handleRevealNextTeam() {
        this.leaderboardService.revealNextTeam();
        this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
        this.server.emit('revealTeam', {
            revealedTeams: this.leaderboardService.getRevealedTeams(),
            totalRevealed: this.leaderboardService.getGameState().revealedTeams,
        });
    }
    handleResetReveal() {
        this.leaderboardService.resetReveal();
        this.server.emit('gameStateUpdate', this.leaderboardService.getGameState());
    }
    handleStartTimer() {
        this.server.emit('timerStart');
    }
    handlePauseTimer() {
        this.server.emit('timerPause');
    }
    handleResetTimer() {
        this.server.emit('timerReset');
    }
    handlePlaySound(soundFile) {
        this.server.emit('playSound', soundFile);
    }
};
exports.LeaderboardGateway = LeaderboardGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], LeaderboardGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('addTeam'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleAddTeam", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('removeTeam'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleRemoveTeam", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('addTask'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleAddTask", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('removeTask'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleRemoveTask", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('updateScore'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleUpdateScore", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('setView'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleSetView", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('setTimer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleSetTimer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('addSoundAlert'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleAddSoundAlert", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('removeSoundAlert'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleRemoveSoundAlert", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('revealNextTeam'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleRevealNextTeam", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('resetReveal'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleResetReveal", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('startTimer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleStartTimer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('pauseTimer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handlePauseTimer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('resetTimer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handleResetTimer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('playSound'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaderboardGateway.prototype, "handlePlaySound", null);
exports.LeaderboardGateway = LeaderboardGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [leaderboard_service_1.LeaderboardService])
], LeaderboardGateway);
//# sourceMappingURL=leaderboard.gateway.js.map