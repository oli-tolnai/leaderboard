// Test script to demonstrate standard competition ranking
// Open the browser console and run this script on the admin page

// Function to add teams and scores to test ranking
function setupTestData() {
    console.log('Setting up test data...');
    
    // Add teams
    const teams = [
        'Team Alpha',
        'Team Beta', 
        'Team Gamma',
        'Team Delta'
    ];
    
    teams.forEach(teamName => {
        adminController.socket.emit('addTeam', teamName);
    });
    
    // Wait a bit then add tasks
    setTimeout(() => {
        const tasks = ['Task 1', 'Task 2'];
        tasks.forEach(taskName => {
            adminController.socket.emit('addTask', taskName);
        });
        
        // Wait a bit more then set scores to create ties
        setTimeout(() => {
            // Get the current game state to find team/task IDs
            const gameState = adminController.gameState;
            if (gameState && gameState.teams && gameState.tasks) {
                // Set scores to create a tie scenario
                // Team Alpha: 100 points (50 + 50)
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[0].id, 
                    taskId: gameState.tasks[0].id, 
                    points: 50 
                });
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[0].id, 
                    taskId: gameState.tasks[1].id, 
                    points: 50 
                });
                
                // Team Beta: 90 points (45 + 45) - TIED
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[1].id, 
                    taskId: gameState.tasks[0].id, 
                    points: 45 
                });
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[1].id, 
                    taskId: gameState.tasks[1].id, 
                    points: 45 
                });
                
                // Team Gamma: 90 points (40 + 50) - TIED with Beta
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[2].id, 
                    taskId: gameState.tasks[0].id, 
                    points: 40 
                });
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[2].id, 
                    taskId: gameState.tasks[1].id, 
                    points: 50 
                });
                
                // Team Delta: 80 points (30 + 50)
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[3].id, 
                    taskId: gameState.tasks[0].id, 
                    points: 30 
                });
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[3].id, 
                    taskId: gameState.tasks[1].id, 
                    points: 50 
                });
                
                console.log('Test data setup complete!');
                console.log('Expected ranking: Team Alpha (1st, 100pts), Team Beta (2nd, 90pts), Team Gamma (2nd, 90pts), Team Delta (4th, 80pts)');
                console.log('Notice rank 3 is skipped because of the tie at rank 2');
            }
        }, 1000);
    }, 500);
}

// Run the setup
setupTestData();
