// Admin page JavaScript
class AdminController {
    constructor() {
        this.socket = io();
        this.gameState = null;
        this.soundFiles = ['sound1.mp3', 'sound2.mp3', 'sound3.mp3', 'sound4.mp3', 'sound5.mp3', 'sound6.mp3'];
        
        this.initializeSocketEvents();
        this.initializeEventListeners();
        this.populateSoundFiles();
        this.initializeLocalStorage();
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

        // Task group management
        document.getElementById('addTaskGroupBtn').addEventListener('click', () => this.addTaskGroup());
        document.getElementById('taskGroupNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTaskGroup();
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
    }    updateUI() {
        if (!this.gameState) return;

        this.updateCurrentViewDisplay();
        this.updateTeamsList();
        this.updateTasksList();
        this.updateTaskGroupsList();
        this.updateScoringMatrix();
        this.updateTimerSettings();
        this.updateSoundAlerts();
        this.updateViewButtons();
        
        // Auto-save if enabled
        if (this.autoSaveEnabled) {
            this.autoSave();
        }
    }

    autoSave() {
        // Debounce auto-save to avoid excessive saves
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveToLocalStorage();
        }, 1000); // Save 1 second after last change
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

    addTaskGroup() {
        const input = document.getElementById('taskGroupNameInput');
        const groupName = input.value.trim();
        
        if (groupName) {
            this.socket.emit('addTaskGroup', groupName);
            input.value = '';
        }
    }

    removeTaskGroup(groupId) {
        if (confirm('Are you sure you want to remove this task group? Tasks will be ungrouped.')) {
            this.socket.emit('removeTaskGroup', groupId);
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

    updateTaskGroup(groupId, name, taskIds) {
        this.socket.emit('updateTaskGroup', { groupId, name, taskIds });
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

        container.innerHTML = this.gameState.tasks.map(task => {
            const group = this.gameState.taskGroups?.find(g => g.id === task.groupId);
            const groupName = group ? ` (${group.name})` : '';
            
            return `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${task.name}${groupName}</span>
                    <button class="btn btn-sm btn-danger" onclick="adminController.removeTask('${task.id}')">×</button>
                </div>
            `;
        }).join('');
    }

    updateTaskGroupsList() {
        const container = document.getElementById('taskGroupsList');
        
        if (!this.gameState.taskGroups || this.gameState.taskGroups.length === 0) {
            container.innerHTML = '<div class="list-group-item">No task groups created yet</div>';
            return;
        }

        container.innerHTML = this.gameState.taskGroups.map(group => {
            const tasksInGroup = this.gameState.tasks.filter(task => task.groupId === group.id);
            const ungroupedTasks = this.gameState.tasks.filter(task => !task.groupId);
            
            return `
                <div class="card mb-3" style="background-color: #171725; border-color: #30384d;">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0 text-white">${group.name}</h6>
                        <button class="btn btn-sm btn-danger" onclick="adminController.removeTaskGroup('${group.id}')">×</button>
                    </div>
                    <div class="card-body">
                        <div class="mb-2">
                            <small class="text-white-50">Tasks in this group:</small>
                        </div>
                        <div class="task-group-tasks mb-3">
                            ${tasksInGroup.map(task => `
                                <span class="badge bg-primary me-1 mb-1" style="cursor: pointer;" onclick="adminController.removeTaskFromGroup('${task.id}', '${group.id}')">${task.name} ×</span>
                            `).join('')}
                            ${tasksInGroup.length === 0 ? '<small class="text-white-50">No tasks assigned</small>' : ''}
                        </div>
                        ${ungroupedTasks.length > 0 ? `
                            <div class="mb-2">
                                <small class="text-white-50">Add tasks to group:</small>
                            </div>
                            <div class="ungrouped-tasks">
                                ${ungroupedTasks.map(task => `
                                    <span class="badge bg-secondary me-1 mb-1" style="cursor: pointer;" onclick="adminController.addTaskToGroup('${task.id}', '${group.id}')">${task.name} +</span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    addTaskToGroup(taskId, groupId) {
        const group = this.gameState.taskGroups.find(g => g.id === groupId);
        if (group) {
            const newTaskIds = [...group.taskIds, taskId];
            this.updateTaskGroup(groupId, group.name, newTaskIds);
        }
    }

    removeTaskFromGroup(taskId, groupId) {
        const group = this.gameState.taskGroups.find(g => g.id === groupId);
        if (group) {
            const newTaskIds = group.taskIds.filter(id => id !== taskId);
            this.updateTaskGroup(groupId, group.name, newTaskIds);
        }
    }    updateScoringMatrix() {
        const table = document.getElementById('scoringMatrix');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');

        if (!this.gameState.teams || !this.gameState.tasks || 
            this.gameState.teams.length === 0 || this.gameState.tasks.length === 0) {
            thead.innerHTML = '<tr><th class="team-header">Team</th><th class="total-header">Total</th></tr>';
            tbody.innerHTML = '<tr><td colspan="2" class="text-center">Add teams and tasks to see the scoring matrix</td></tr>';
            return;
        }

        // Group tasks and prepare headers
        const { groupedTasks, ungroupedTasks } = this.organizeTasksByGroups();
        
        // Create header rows
        let headerHTML = '';
        
        // First row: group headers (merged)
        if (this.gameState.taskGroups && this.gameState.taskGroups.length > 0) {
            headerHTML += '<tr>';
            headerHTML += '<th rowspan="2" class="team-header">Team</th>';
            
            // Add group headers with better styling
            this.gameState.taskGroups.forEach((group, groupIndex) => {
                const tasksInGroup = groupedTasks[group.id] || [];
                if (tasksInGroup.length > 0) {
                    headerHTML += `<th colspan="${tasksInGroup.length}" class="group-header group-${groupIndex % 4}">${group.name}</th>`;
                }
            });
            
            // Add ungrouped tasks header if any
            if (ungroupedTasks.length > 0) {
                headerHTML += `<th colspan="${ungroupedTasks.length}" class="group-header ungrouped-header">Individual Tasks</th>`;
            }
            
            headerHTML += '<th rowspan="2" class="total-header">Total</th>';
            headerHTML += '</tr>';
        }
        
        // Second row: individual task headers
        headerHTML += '<tr>';
        if (!this.gameState.taskGroups || this.gameState.taskGroups.length === 0) {
            headerHTML += '<th class="team-header">Team</th>';
        }
        
        // Add task headers in order: grouped tasks first, then ungrouped
        let taskIndex = 0;
        this.gameState.taskGroups.forEach((group, groupIndex) => {
            const tasksInGroup = groupedTasks[group.id] || [];
            tasksInGroup.forEach((task, index) => {
                const isFirstInGroup = index === 0;
                headerHTML += `<th class="task-header ${isFirstInGroup ? 'first-in-group' : ''}">${task.name}</th>`;
                taskIndex++;
            });
        });
        
        ungroupedTasks.forEach((task, index) => {
            const isFirstInGroup = index === 0 && ungroupedTasks.length > 0;
            headerHTML += `<th class="task-header ${isFirstInGroup ? 'first-in-group' : ''}">${task.name}</th>`;
        });
        
        if (!this.gameState.taskGroups || this.gameState.taskGroups.length === 0) {
            headerHTML += '<th class="total-header">Total</th>';
        }
        headerHTML += '</tr>';
        
        thead.innerHTML = headerHTML;

        // Update body with tasks in the same order as headers and add group separators
        const orderedTasks = [];
        const taskGroupInfo = []; // Track which group each task belongs to
        
        this.gameState.taskGroups.forEach((group, groupIndex) => {
            const tasksInGroup = groupedTasks[group.id] || [];
            tasksInGroup.forEach((task, index) => {
                orderedTasks.push(task);
                taskGroupInfo.push({ groupIndex, isFirstInGroup: index === 0 });
            });
        });
        
        ungroupedTasks.forEach((task, index) => {
            orderedTasks.push(task);
            taskGroupInfo.push({ groupIndex: -1, isFirstInGroup: index === 0 && ungroupedTasks.length > 0 });
        });

        tbody.innerHTML = this.gameState.teams.map(team => `
            <tr class="team-row">
                <td class="team-cell">${team.name}</td>
                ${orderedTasks.map((task, index) => {
                    const score = this.gameState.scores.find(s => s.teamId === team.id && s.taskId === task.id);
                    const groupInfo = taskGroupInfo[index];
                    const separatorClass = groupInfo.isFirstInGroup ? 'group-separator' : '';
                    return `
                        <td class="score-edit-cell ${separatorClass}">
                            <input type="number" 
                                   class="score-input" 
                                   value="${score ? score.points : 0}"
                                   onchange="adminController.updateScore('${team.id}', '${task.id}', this.value)"
                                   min="0">
                        </td>
                    `;
                }).join('')}
                <td class="total-cell">${team.totalPoints || 0}</td>
            </tr>
        `).join('');
    }

    organizeTasksByGroups() {
        const groupedTasks = {};
        const ungroupedTasks = [];
        
        // Initialize grouped tasks
        if (this.gameState.taskGroups) {
            this.gameState.taskGroups.forEach(group => {
                groupedTasks[group.id] = [];
            });
        }
        
        // Organize tasks
        this.gameState.tasks.forEach(task => {
            if (task.groupId && groupedTasks[task.groupId]) {
                groupedTasks[task.groupId].push(task);
            } else {
                ungroupedTasks.push(task);
            }
        });
        
        return { groupedTasks, ungroupedTasks };
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
    }    initializeLocalStorage() {
        // Add localStorage management buttons to the UI
        this.addLocalStorageControls();
        
        // Auto-save on game state updates
        this.autoSaveEnabled = localStorage.getItem('leaderboard_autosave') !== 'false';
        
        // Check for auto-load preference
        const autoLoad = localStorage.getItem('leaderboard_autoload') === 'true';
        if (autoLoad && localStorage.getItem('leaderboard_data')) {
            // Delay auto-load to ensure socket connection is established
            setTimeout(() => {
                this.loadFromLocalStorage();
            }, 1000);
        }
    }

    addLocalStorageControls() {
        // Check if controls already exist
        if (document.getElementById('localStorageControls')) return;

        const sidebar = document.querySelector('.sidebar .position-sticky');
        
        const storageControlsHTML = `
            <div id="localStorageControls" class="mb-4 mt-4 border-top pt-3">
                <h6 class="text-white-50 mb-2">Data Management</h6>
                <div class="d-grid gap-2">
                    <button type="button" class="btn btn-info btn-sm" id="saveDataBtn">💾 Save Data</button>
                    <button type="button" class="btn btn-warning btn-sm" id="loadDataBtn">📂 Load Data</button>
                    <button type="button" class="btn btn-success btn-sm" id="exportDataBtn">📤 Export Data</button>
                    <button type="button" class="btn btn-primary btn-sm" id="importDataBtn">📥 Import Data</button>
                    <button type="button" class="btn btn-danger btn-sm" id="clearDataBtn">🗑️ Clear All</button>
                </div>                <div class="form-check mt-2">
                    <input class="form-check-input" type="checkbox" id="autoSaveCheck" ${this.autoSaveEnabled ? 'checked' : ''}>
                    <label class="form-check-label text-white-50" for="autoSaveCheck">
                        Auto-save
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="autoLoadCheck" ${localStorage.getItem('leaderboard_autoload') === 'true' ? 'checked' : ''}>
                    <label class="form-check-label text-white-50" for="autoLoadCheck">
                        Auto-load on startup
                    </label>
                </div>
                <small class="text-white-50 d-block mt-2" id="lastSaveInfo">
                    ${this.getLastSaveInfo()}
                </small>
            </div>
        `;
        
        sidebar.insertAdjacentHTML('beforeend', storageControlsHTML);
        
        // Add event listeners for the new buttons
        this.addLocalStorageEventListeners();
    }

    addLocalStorageEventListeners() {
        document.getElementById('saveDataBtn').addEventListener('click', () => this.saveToLocalStorage());
        document.getElementById('loadDataBtn').addEventListener('click', () => this.loadFromLocalStorage());
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => this.importData());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearLocalStorage());        document.getElementById('autoSaveCheck').addEventListener('change', (e) => {
            this.autoSaveEnabled = e.target.checked;
            localStorage.setItem('leaderboard_autosave', this.autoSaveEnabled.toString());
        });
        document.getElementById('autoLoadCheck').addEventListener('change', (e) => {
            localStorage.setItem('leaderboard_autoload', e.target.checked.toString());
        });
    }

    saveToLocalStorage() {
        try {
            if (!this.gameState) {
                alert('No data to save');
                return;
            }

            const dataToSave = {
                teams: this.gameState.teams,
                tasks: this.gameState.tasks,
                taskGroups: this.gameState.taskGroups,
                scores: this.gameState.scores,
                timer: this.gameState.timer,
                soundAlerts: this.gameState.soundAlerts,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };

            localStorage.setItem('leaderboard_data', JSON.stringify(dataToSave));
            localStorage.setItem('leaderboard_last_save', new Date().toISOString());
            
            this.updateLastSaveInfo();
            this.showNotification('Data saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showNotification('Error saving data: ' + error.message, 'error');
        }
    }

    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('leaderboard_data');
            if (!savedData) {
                this.showNotification('No saved data found', 'warning');
                return;
            }

            if (!confirm('This will replace all current data. Are you sure?')) {
                return;
            }

            const data = JSON.parse(savedData);
            
            // Validate data structure
            if (!this.validateGameData(data)) {
                this.showNotification('Invalid data format', 'error');
                return;
            }

            // Send data to server to update game state
            this.socket.emit('loadGameState', {
                teams: data.teams || [],
                tasks: data.tasks || [],
                taskGroups: data.taskGroups || [],
                scores: data.scores || [],
                timer: data.timer || { minutes: 5, seconds: 0 },
                soundAlerts: data.soundAlerts || []
            });

            this.showNotification('Data loaded successfully!', 'success');
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.showNotification('Error loading data: ' + error.message, 'error');
        }
    }

    exportData() {
        try {
            if (!this.gameState) {
                alert('No data to export');
                return;
            }

            const dataToExport = {
                teams: this.gameState.teams,
                tasks: this.gameState.tasks,
                taskGroups: this.gameState.taskGroups,
                scores: this.gameState.scores,
                timer: this.gameState.timer,
                soundAlerts: this.gameState.soundAlerts,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `leaderboard_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Error exporting data: ' + error.message, 'error');
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!this.validateGameData(data)) {
                        this.showNotification('Invalid file format', 'error');
                        return;
                    }

                    if (!confirm('This will replace all current data. Are you sure?')) {
                        return;
                    }

                    // Send data to server to update game state
                    this.socket.emit('loadGameState', {
                        teams: data.teams || [],
                        tasks: data.tasks || [],
                        taskGroups: data.taskGroups || [],
                        scores: data.scores || [],
                        timer: data.timer || { minutes: 5, seconds: 0 },
                        soundAlerts: data.soundAlerts || []
                    });

                    this.showNotification('Data imported successfully!', 'success');
                } catch (error) {
                    console.error('Error importing data:', error);
                    this.showNotification('Error importing data: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    clearLocalStorage() {
        if (!confirm('This will permanently delete all saved data. Are you sure?')) {
            return;
        }

        localStorage.removeItem('leaderboard_data');
        localStorage.removeItem('leaderboard_last_save');
        this.updateLastSaveInfo();
        this.showNotification('All saved data cleared', 'success');
    }

    validateGameData(data) {
        if (!data || typeof data !== 'object') return false;
        
        // Check required properties exist and are arrays
        const requiredArrays = ['teams', 'tasks', 'scores'];
        for (const prop of requiredArrays) {
            if (!Array.isArray(data[prop])) return false;
        }

        // Validate team structure
        if (data.teams.some(team => !team.id || !team.name)) return false;
        
        // Validate task structure
        if (data.tasks.some(task => !task.id || !task.name)) return false;
        
        // Validate score structure
        if (data.scores.some(score => !score.teamId || !score.taskId || typeof score.points !== 'number')) return false;

        return true;
    }

    getLastSaveInfo() {
        const lastSave = localStorage.getItem('leaderboard_last_save');
        if (!lastSave) return 'No saves yet';
        
        const saveDate = new Date(lastSave);
        return `Last saved: ${saveDate.toLocaleDateString()} ${saveDate.toLocaleTimeString()}`;
    }

    updateLastSaveInfo() {
        const infoElement = document.getElementById('lastSaveInfo');
        if (infoElement) {
            infoElement.textContent = this.getLastSaveInfo();
        }
    }

    showNotification(message, type = 'info') {
        // Create a toast notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info'} position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${message}</span>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
}

// Initialize the admin controller when the page loads
let adminController;
document.addEventListener('DOMContentLoaded', () => {
    adminController = new AdminController();
});
