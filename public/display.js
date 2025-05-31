// Display page JavaScript
class DisplayController {
    constructor() {
        this.socket = io();
        this.currentView = 'logo';
        this.gameState = null;
        this.timer = {
            minutes: 5,
            seconds: 0,
            isRunning: false,
            intervalId: null
        };
        
        this.initializeSocketEvents();
        this.initializeTimer();
    }

    initializeSocketEvents() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('gameStateUpdate', (gameState) => {
            this.gameState = gameState;
            this.updateDisplay();
        });

        this.socket.on('revealTeam', (data) => {
            this.animateTeamReveal(data);
        });

        this.socket.on('timerStart', () => {
            this.startTimer();
        });

        this.socket.on('timerPause', () => {
            this.pauseTimer();
        });

        this.socket.on('timerReset', () => {
            this.resetTimer();
        });

        this.socket.on('playSound', (soundFile) => {
            this.playSound(soundFile);
        });
    }

    updateDisplay() {
        if (!this.gameState) return;

        // Switch views if needed
        if (this.currentView !== this.gameState.currentView) {
            this.switchView(this.gameState.currentView);
        }

        // Update timer configuration
        this.timer.minutes = this.gameState.timer.minutes;
        this.timer.seconds = this.gameState.timer.seconds;

        // Update specific view content
        switch (this.gameState.currentView) {
            case 'scoreboard':
                this.updateScoreboard();
                break;
            case 'leaderboard':
                this.updateLeaderboard();
                break;
            case 'timer':
                this.updateTimerDisplay();
                break;
        }
    }

    switchView(newView) {
        const currentViewElement = document.getElementById(`${this.currentView}View`);
        const newViewElement = document.getElementById(`${newView}View`);

        if (currentViewElement) {
            currentViewElement.classList.remove('active');
        }

        setTimeout(() => {
            if (newViewElement) {
                newViewElement.classList.add('active');
            }
            this.currentView = newView;
        }, 400);
    }

    updateScoreboard() {
        const header = document.getElementById('scoreboardHeader');
        const body = document.getElementById('scoreboardBody');

        if (!this.gameState.teams || !this.gameState.tasks) return;

        // Update header
        header.innerHTML = `
            <th>Team</th>
            ${this.gameState.tasks.map(task => `<th>${task.name}</th>`).join('')}
            <th>Total</th>
        `;

        // Update body
        body.innerHTML = this.gameState.teams.map(team => `
            <tr>
                <td class="fw-bold">${team.name}</td>
                ${this.gameState.tasks.map(task => {
                    const score = this.gameState.scores.find(s => s.teamId === team.id && s.taskId === task.id);
                    return `<td>${score ? score.points : 0}</td>`;
                }).join('')}
                <td class="fw-bold text-warning">${team.totalPoints || 0}</td>
            </tr>
        `).join('');
    }

    updateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        
        if (this.gameState.revealedTeams === 0) {
            leaderboardList.innerHTML = '';
            return;
        }

        // Don't update if we're in the middle of a reveal animation
        if (leaderboardList.querySelector('.leaderboard-item[style*="animation"]')) {
            return;
        }

        const revealedTeams = this.getRevealedTeams();
        leaderboardList.innerHTML = revealedTeams.map((team, index) => {
            const position = revealedTeams.length - index;
            const positionClass = position === 1 ? 'gold' : position === 2 ? 'silver' : position === 3 ? 'bronze' : '';
            
            return `
                <div class="leaderboard-item">
                    <div class="leaderboard-position ${positionClass}">${position}</div>
                    <div class="leaderboard-team-name">${team.name}</div>
                    <div class="leaderboard-points">${team.totalPoints} pts</div>
                </div>
            `;
        }).join('');
    }

    getRevealedTeams() {
        if (!this.gameState.teams) return [];
        
        const sortedTeams = [...this.gameState.teams].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
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

    animateTeamReveal(data) {
        const leaderboardList = document.getElementById('leaderboardList');
        const revealedTeams = data.revealedTeams;
        
        if (revealedTeams.length === 0) return;

        // Add the new team with animation
        const newTeam = revealedTeams[0]; // The newly revealed team (at the top)
        const position = revealedTeams.length;
        const positionClass = position === 1 ? 'gold' : position === 2 ? 'silver' : position === 3 ? 'bronze' : '';
        
        const teamElement = document.createElement('div');
        teamElement.className = 'leaderboard-item';
        teamElement.innerHTML = `
            <div class="leaderboard-position ${positionClass}">${position}</div>
            <div class="leaderboard-team-name">${newTeam.name}</div>
            <div class="leaderboard-points">${newTeam.totalPoints} pts</div>
        `;
        
        // Insert at the beginning (top)
        leaderboardList.insertBefore(teamElement, leaderboardList.firstChild);
    }

    initializeTimer() {
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const display = document.getElementById('timerDisplay');
        const minutes = this.timer.minutes.toString().padStart(2, '0');
        const seconds = this.timer.seconds.toString().padStart(2, '0');
        display.textContent = `${minutes}:${seconds}`;
        
        // Add warning class if time is low
        if (this.timer.minutes === 0 && this.timer.seconds <= 30) {
            display.classList.add('warning');
        } else {
            display.classList.remove('warning');
        }
    }

    startTimer() {
        if (this.timer.intervalId) {
            clearInterval(this.timer.intervalId);
        }
        
        this.timer.isRunning = true;
        this.timer.intervalId = setInterval(() => {
            if (this.timer.seconds > 0) {
                this.timer.seconds--;
            } else if (this.timer.minutes > 0) {
                this.timer.minutes--;
                this.timer.seconds = 59;
            } else {
                this.pauseTimer();
                return;
            }
            
            this.updateTimerDisplay();
            this.checkSoundAlerts();
        }, 1000);
    }

    pauseTimer() {
        this.timer.isRunning = false;
        if (this.timer.intervalId) {
            clearInterval(this.timer.intervalId);
            this.timer.intervalId = null;
        }
    }

    resetTimer() {
        this.pauseTimer();
        if (this.gameState) {
            this.timer.minutes = this.gameState.timer.minutes;
            this.timer.seconds = this.gameState.timer.seconds;
        }
        this.updateTimerDisplay();
    }

    checkSoundAlerts() {
        if (!this.gameState || !this.gameState.soundAlerts) return;
        
        this.gameState.soundAlerts.forEach(alert => {
            if (this.timer.minutes === alert.triggerMinutes && this.timer.seconds === alert.triggerSeconds) {
                this.playSound(alert.file);
            }
        });
    }

    playSound(soundFile) {
        try {
            const audio = new Audio(`/assets/beeps/${soundFile}`);
            audio.play().catch(e => console.warn('Could not play sound:', e));
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }
}

// Initialize the display controller when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DisplayController();
});
