// Display page JavaScript
class DisplayController {
    constructor() {
        this.socket = io();
        this.currentView = 'logo';
        this.gameState = null;
        this.lastRevealedCount = 0; // Track how many teams were previously revealed
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
    }    updateScoreboard() {
        const header = document.getElementById('scoreboardHeader');
        const body = document.getElementById('scoreboardBody');

        if (!this.gameState.teams || !this.gameState.tasks) return;

        // Update header
        header.innerHTML = `
            <th>Rank</th>
            <th>Team</th>
            ${this.gameState.tasks.map(task => `<th>${task.name}</th>`).join('')}
            <th>Total</th>
        `;

        // Get sorted teams and calculate ranking
        const sortedTeams = this.getAllSortedTeams();
        const rankedTeams = this.calculateStandardRanking(sortedTeams);

        // Update body
        body.innerHTML = rankedTeams.map(team => `
            <tr>
                <td class="fw-bold text-info">${team.rank}</td>
                <td class="fw-bold">${team.name}</td>
                ${this.gameState.tasks.map(task => {
                    const score = this.gameState.scores.find(s => s.teamId === team.id && s.taskId === task.id);
                    return `<td>${score ? score.points : 0}</td>`;
                }).join('')}
                <td class="fw-bold text-warning">${team.totalPoints || 0}</td>
            </tr>
        `).join('');
    }updateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        
        if (this.gameState.revealedTeams === 0) {
            leaderboardList.innerHTML = '';
            this.lastRevealedCount = 0; // Reset tracking
            return;
        }

        // Get all teams sorted by score (best to worst)
        const allSortedTeams = this.getAllSortedTeams();
        
        // Check if we need to rebuild (first time or teams changed)
        if (leaderboardList.children.length === 0 || 
            leaderboardList.children.length !== allSortedTeams.length) {
            this.buildFixedPositionLeaderboard(allSortedTeams);
            this.lastRevealedCount = 0; // Reset tracking on rebuild
        }
        
        // Update visibility based on revealed teams
        this.updateTeamVisibility(allSortedTeams);
    }    getAllSortedTeams() {
        if (!this.gameState.teams) return [];
        return [...this.gameState.teams].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    }

    calculateStandardRanking(sortedTeams) {
        if (!sortedTeams || sortedTeams.length === 0) return [];
        
        const rankedTeams = [];
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
    }buildFixedPositionLeaderboard(allSortedTeams) {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        // Calculate standard competition ranking (skip ranking)
        const rankedTeams = this.calculateStandardRanking(allSortedTeams);
          // Create all team elements in their fixed positions, but hidden initially
        rankedTeams.forEach((team) => {
            const position = team.rank;
            // For medal colors, we need to consider that with skip ranking, 
            // multiple teams can have the same rank (e.g., two teams at rank 2)
            const positionClass = position === 1 ? 'gold' : 
                                 position === 2 ? 'silver' : 
                                 position === 3 ? 'bronze' : '';
            
            const teamElement = document.createElement('div');
            teamElement.className = 'leaderboard-item';
            teamElement.dataset.teamId = team.id;
            teamElement.innerHTML = `
                <div class="leaderboard-position ${positionClass}">${position}</div>
                <div class="leaderboard-team-name">${team.name}</div>
                <div class="leaderboard-points">${team.totalPoints} pts</div>
            `;
            
            // Initially hide all teams
            teamElement.style.opacity = '0';
            teamElement.style.transform = 'translateY(50px)';
            teamElement.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            leaderboardList.appendChild(teamElement);
        });
    }    updateTeamVisibility(allSortedTeams) {
        const leaderboardList = document.getElementById('leaderboardList');
        const currentRevealedCount = this.gameState.revealedTeams;
        const currentRevealedRanks = this.gameState.revealedRanks || 0;
        
        // Calculate ranked teams for proper position handling
        const rankedTeams = this.calculateStandardRanking(allSortedTeams);
        
        // Only animate if there are new teams to reveal
        if (currentRevealedCount > this.lastRevealedCount) {
            // Find all newly revealed teams by checking if they should be revealed based on rank
            const sortedRanks = [...new Set(rankedTeams.map(team => team.rank))].sort((a, b) => b - a);
            
            // Teams are revealed from worst to best rank
            const ranksToReveal = sortedRanks.slice(0, currentRevealedRanks);
            
            rankedTeams.forEach((team) => {
                if (ranksToReveal.includes(team.rank)) {
                    const teamElement = leaderboardList.querySelector(`[data-team-id="${team.id}"]`);
                    
                    if (teamElement && teamElement.style.opacity === '0') {
                        // Reveal this team with animation
                        // Add a small delay based on rank to create a nice effect for simultaneous reveals
                        const delay = (sortedRanks.indexOf(team.rank)) * 100 + 100;
                        setTimeout(() => {
                            teamElement.style.opacity = '1';
                            teamElement.style.transform = 'translateY(0)';
                        }, delay);
                    }
                }
            });
            
            // Update the tracking variable
            this.lastRevealedCount = currentRevealedCount;
        }
        
        // Handle reset case (when revealedTeams goes back to 0)
        if (currentRevealedCount === 0 && this.lastRevealedCount > 0) {
            // Hide all teams
            rankedTeams.forEach((team) => {
                const teamElement = leaderboardList.querySelector(`[data-team-id="${team.id}"]`);
                if (teamElement) {
                    teamElement.style.opacity = '0';
                    teamElement.style.transform = 'translateY(50px)';
                }
            });
            this.lastRevealedCount = 0;
        }
    }isTeamRevealed(team, allSortedTeams) {
        // Teams are revealed from worst to best
        // So we reveal the last N teams where N = revealedTeams count
        const teamIndex = allSortedTeams.findIndex(t => t.id === team.id);
        const totalTeams = allSortedTeams.length;
        const worstRevealedIndex = totalTeams - this.gameState.revealedTeams;
        
        return teamIndex >= worstRevealedIndex;
    }    animateTeamReveal(data) {
        // Simply trigger the visibility update, the fixed position system handles the rest
        const allSortedTeams = this.getAllSortedTeams();
        this.updateTeamVisibility(allSortedTeams);
    }initializeTimer() {
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
