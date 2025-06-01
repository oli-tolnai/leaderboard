// Test script to demonstrate simultaneous reveal of teams with same rank
// Open the browser console on the admin page and run this script

// Function to add teams and scores to test rank-based revealing
function testTieReveals() {
    console.log('Setting up test data for tie reveals...');
    
    // Add teams
    const teams = [
        'Alpha Squad',
        'Beta Team', 
        'Gamma Force',
        'Delta Unit',
        'Echo Group'
    ];
    
    teams.forEach(teamName => {
        adminController.socket.emit('addTeam', teamName);
    });
    
    // Wait a bit then add tasks
    setTimeout(() => {
        const tasks = ['Challenge A', 'Challenge B'];
        tasks.forEach(taskName => {
            adminController.socket.emit('addTask', taskName);
        });
        
        // Wait a bit more then set scores to create a complex tie scenario
        setTimeout(() => {
            const gameState = adminController.gameState;
            if (gameState && gameState.teams && gameState.tasks) {
                console.log('Setting up complex tie scenario...');
                
                // Alpha Squad: 100 points (1st place)
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[0].id, 
                    taskId: gameState.tasks[0].id, 
                    points: 60 
                });
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[0].id, 
                    taskId: gameState.tasks[1].id, 
                    points: 40 
                });
                
                // Beta Team: 90 points (2nd place - TIED)
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
                
                // Gamma Force: 90 points (2nd place - TIED with Beta)
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[2].id, 
                    taskId: gameState.tasks[0].id, 
                    points: 50 
                });
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[2].id, 
                    taskId: gameState.tasks[1].id, 
                    points: 40 
                });
                
                // Delta Unit: 70 points (4th place)
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[3].id, 
                    taskId: gameState.tasks[0].id, 
                    points: 35 
                });
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[3].id, 
                    taskId: gameState.tasks[1].id, 
                    points: 35 
                });
                
                // Echo Group: 60 points (5th place)
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[4].id, 
                    taskId: gameState.tasks[0].id, 
                    points: 30 
                });
                adminController.socket.emit('updateScore', { 
                    teamId: gameState.teams[4].id, 
                    taskId: gameState.tasks[1].id, 
                    points: 30 
                });
                
                console.log('✅ Test data setup complete!');
                console.log('Expected ranking:');
                console.log('  1st: Alpha Squad (100pts)');
                console.log('  2nd: Beta Team (90pts) - TIED');
                console.log('  2nd: Gamma Force (90pts) - TIED with Beta');
                console.log('  4th: Delta Unit (70pts)');
                console.log('  5th: Echo Group (60pts)');
                console.log('');
                console.log('🎯 Now switch to leaderboard view and test revealing!');
                console.log('   - Click "Reveal Next Team" to reveal teams by rank');
                console.log('   - Teams with same rank should appear simultaneously');
                console.log('   - Notice rank 3 is skipped due to the tie at rank 2');
            }
        }, 1000);
    }, 500);
}

// Run the setup
testTieReveals();
