// Admin page JavaScript
class AdminController {
    constructor() {
        this.socket = io();
        this.gameState = null;
        this.soundFiles = ['sound1.mp3', 'sound2.mp3', 'sound3.mp3', 'sound4.mp3', 'sound5.mp3', 'sound6.mp3'];
        
        this.initializeSocketEvents();
        this.initializeEventListeners();
        this.populateSoundFiles();
    }

    initializeSocketEvents() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnectionStatus(false);
        });

        this.socket.on('gameStateUpdate', (gameState) => {
            this.gameState = gameState;
            this.updateUI();
        });
    }

    initializeEventListeners() {
        // View control buttons
        document.getElementById('logoViewBtn').addEventListener('click', () => this.setView('logo'));
        document.getElementById('scoreboardViewBtn').addEventListener('click', () => this.setView('scoreboard'));
        document.getElementById('leaderboardViewBtn').addEventListener('click', () => this.setView('leaderboard'));
        document.getElementById('timerViewBtn').addEventListener('click', () => this.setView('timer'));

        // Leaderboard controls
        document.getElementById('revealNextBtn').addEventListener('click', () => this.revealNextTeam());
        document.getElementById('resetRevealBtn').addEventListener('click', () => this.resetReveal());

        // Timer controls
        document.getElementById('startTimerBtn').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimerBtn').addEventListener('click', () => this.pauseTimer());
        document.getElementById('resetTimerBtn').addEventListener('click', () => this.resetTimer());

        // Team management
        document.getElementById('addTeamBtn').addEventListener('click', () => this.addTeam());
        document.getElementById('teamNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTeam();
        });

        // Task management
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Timer settings
        document.getElementById('setTimerBtn').addEventListener('click', () => this.setTimer());

        // Sound alert management
        document.getElementById('addSoundAlertBtn').addEventListener('click', () => this.addSoundAlert());
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.className = `status-indicator ${connected ? 'status-connected' : 'status-disconnected'}`;
        }
    }

    updateUI() {
        if (!this.gameState) return;

        this.updateCurrentViewDisplay();
        this.updateTeamsList();
        this.updateTasksList();
        this.updateScoringMatrix();
        this.updateTimerSettings();
        this.updateSoundAlerts();
        this.updateViewButtons();
    }

    updateCurrentViewDisplay() {
        const display = document.getElementById('currentViewDisplay');
        const viewName = this.gameState.currentView.charAt(0).toUpperCase() + this.gameState.currentView.slice(1);
        display.textContent = `Current View: ${viewName}`;
    }

    updateViewButtons() {
        // Update active view button
        document.querySelectorAll('[id$="ViewBtn"]').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-light');
        });

        const activeBtn = document.getElementById(`${this.gameState.currentView}ViewBtn`);
        if (activeBtn) {
            activeBtn.classList.remove('btn-outline-light');
            activeBtn.classList.add('btn-primary');
        }
    }

    setView(view) {
        this.socket.emit('setView', view);
    }

    revealNextTeam() {
        this.socket.emit('revealNextTeam');
    }

    resetReveal() {
        this.socket.emit('resetReveal');
    }

    startTimer() {
        this.socket.emit('startTimer');
    }

    pauseTimer() {
        this.socket.emit('pauseTimer');
    }

    resetTimer() {
        this.socket.emit('resetTimer');
    }

    addTeam() {
        const input = document.getElementById('teamNameInput');
        const teamName = input.value.trim();
        
        if (teamName) {
            this.socket.emit('addTeam', teamName);
            input.value = '';
        }
    }

    removeTeam(teamId) {
        if (confirm('Are you sure you want to remove this team?')) {
            this.socket.emit('removeTeam', teamId);
        }
    }

    addTask() {
        const input = document.getElementById('taskNameInput');
        const taskName = input.value.trim();
        
        if (taskName) {
            this.socket.emit('addTask', taskName);
            input.value = '';
        }
    }

    removeTask(taskId) {
        if (confirm('Are you sure you want to remove this task?')) {
            this.socket.emit('removeTask', taskId);
        }
    }

    updateScore(teamId, taskId, points) {
        this.socket.emit('updateScore', { teamId, taskId, points: parseInt(points) || 0 });
    }

    setTimer() {
        const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
        
        this.socket.emit('setTimer', { minutes, seconds });
    }

    addSoundAlert() {
        const file = document.getElementById('soundFileSelect').value;
        const minutes = parseInt(document.getElementById('alertMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('alertSeconds').value) || 0;
        
        if (file) {
            this.socket.emit('addSoundAlert', { file, triggerMinutes: minutes, triggerSeconds: seconds });
            document.getElementById('alertMinutes').value = '';
            document.getElementById('alertSeconds').value = '';
        }
    }

    removeSoundAlert(index) {
        this.socket.emit('removeSoundAlert', index);
    }

    updateTeamsList() {
        const container = document.getElementById('teamsList');
        
        if (!this.gameState.teams || this.gameState.teams.length === 0) {
            container.innerHTML = '<div class="list-group-item">No teams added yet</div>';
            return;
        }

        container.innerHTML = this.gameState.teams.map(team => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${team.name}</span>
                <div>
                    <span class="badge bg-primary rounded-pill me-2">${team.totalPoints || 0} pts</span>
                    <button class="btn btn-sm btn-danger" onclick="adminController.removeTeam('${team.id}')">×</button>
                </div>
            </div>
        `).join('');
    }

    updateTasksList() {
        const container = document.getElementById('tasksList');
        
        if (!this.gameState.tasks || this.gameState.tasks.length === 0) {
            container.innerHTML = '<div class="list-group-item">No tasks added yet</div>';
            return;
        }

        container.innerHTML = this.gameState.tasks.map(task => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${task.name}</span>
                <button class="btn btn-sm btn-danger" onclick="adminController.removeTask('${task.id}')">×</button>
            </div>
        `).join('');
    }

    updateScoringMatrix() {
        const table = document.getElementById('scoringMatrix');
        const thead = table.querySelector('thead tr');
        const tbody = table.querySelector('tbody');

        if (!this.gameState.teams || !this.gameState.tasks || 
            this.gameState.teams.length === 0 || this.gameState.tasks.length === 0) {
            thead.innerHTML = '<th>Team</th><th>Total</th>';
            tbody.innerHTML = '<tr><td colspan="2" class="text-center">Add teams and tasks to see the scoring matrix</td></tr>';
            return;
        }

        // Update header
        thead.innerHTML = `
            <th>Team</th>
            ${this.gameState.tasks.map(task => `<th>${task.name}</th>`).join('')}
            <th>Total</th>
        `;

        // Update body
        tbody.innerHTML = this.gameState.teams.map(team => `
            <tr>
                <td class="fw-bold">${team.name}</td>
                ${this.gameState.tasks.map(task => {
                    const score = this.gameState.scores.find(s => s.teamId === team.id && s.taskId === task.id);
                    return `
                        <td>
                            <input type="number" 
                                   class="score-input" 
                                   value="${score ? score.points : 0}"
                                   onchange="adminController.updateScore('${team.id}', '${task.id}', this.value)"
                                   min="0">
                        </td>
                    `;
                }).join('')}
                <td class="fw-bold text-warning">${team.totalPoints || 0}</td>
            </tr>
        `).join('');
    }

    updateTimerSettings() {
        if (this.gameState.timer) {
            document.getElementById('timerMinutes').value = this.gameState.timer.minutes;
            document.getElementById('timerSeconds').value = this.gameState.timer.seconds;
        }
    }

    updateSoundAlerts() {
        const container = document.getElementById('soundAlertsList');
        
        if (!this.gameState.soundAlerts || this.gameState.soundAlerts.length === 0) {
            container.innerHTML = '<div class="list-group-item">No sound alerts configured</div>';
            return;
        }

        container.innerHTML = this.gameState.soundAlerts.map((alert, index) => `
            <div class="sound-alert-item">
                <div class="sound-alert-info">
                    <strong>${alert.file}</strong> at ${alert.triggerMinutes}:${alert.triggerSeconds.toString().padStart(2, '0')}
                </div>
                <button class="sound-alert-remove" onclick="adminController.removeSoundAlert(${index})">×</button>
            </div>
        `).join('');
    }

    populateSoundFiles() {
        const select = document.getElementById('soundFileSelect');
        select.innerHTML = this.soundFiles.map(file => 
            `<option value="${file}">${file}</option>`
        ).join('');
    }
}

// Initialize the admin controller when the page loads
let adminController;
document.addEventListener('DOMContentLoaded', () => {
    adminController = new AdminController();
});
