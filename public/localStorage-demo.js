// Demo script to test localStorage functionality
// Run this in the browser console on the admin page

// Test data for demonstration
const testData = {
    teams: [
        { id: "1", name: "Team Alpha", totalPoints: 85 },
        { id: "2", name: "Team Beta", totalPoints: 72 },
        { id: "3", name: "Team Gamma", totalPoints: 91 }
    ],
    tasks: [
        { id: "1", name: "Logic Puzzle", groupId: "1" },
        { id: "2", name: "Math Challenge", groupId: "1" },
        { id: "3", name: "Code Review", groupId: "2" }
    ],
    taskGroups: [
        { id: "1", name: "Round 1", taskIds: ["1", "2"] },
        { id: "2", name: "Round 2", taskIds: ["3"] }
    ],
    scores: [
        { teamId: "1", taskId: "1", points: 25 },
        { teamId: "1", taskId: "2", points: 30 },
        { teamId: "1", taskId: "3", points: 30 },
        { teamId: "2", taskId: "1", points: 20 },
        { teamId: "2", taskId: "2", points: 25 },
        { teamId: "2", taskId: "3", points: 27 },
        { teamId: "3", taskId: "1", points: 30 },
        { teamId: "3", taskId: "2", points: 31 },
        { teamId: "3", taskId: "3", points: 30 }
    ],
    timer: { minutes: 10, seconds: 0 },
    soundAlerts: []
};

console.log("🧪 LocalStorage Demo Script");
console.log("=========================");

// Function to test localStorage save
function testSave() {
    console.log("1. Testing localStorage save...");
    
    const saveData = {
        ...testData,
        timestamp: new Date().toISOString(),
        version: "1.0"
    };
    
    localStorage.setItem('leaderboard_demo', JSON.stringify(saveData));
    console.log("✅ Test data saved to localStorage");
    console.log("Data:", saveData);
}

// Function to test localStorage load
function testLoad() {
    console.log("2. Testing localStorage load...");
    
    const savedData = localStorage.getItem('leaderboard_demo');
    if (savedData) {
        const data = JSON.parse(savedData);
        console.log("✅ Test data loaded from localStorage");
        console.log("Data:", data);
        return data;
    } else {
        console.log("❌ No test data found in localStorage");
        return null;
    }
}

// Function to test export functionality
function testExport() {
    console.log("3. Testing export functionality...");
    
    const exportData = {
        ...testData,
        timestamp: new Date().toISOString(),
        version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    console.log("✅ Export blob created");
    console.log("Blob URL:", url);
    console.log("You can save this as a file manually");
    
    return { blob, url, data: exportData };
}

// Function to validate data structure
function testValidation() {
    console.log("4. Testing data validation...");
    
    // Test valid data
    const validData = testData;
    const isValid1 = validateTestData(validData);
    console.log("Valid data test:", isValid1 ? "✅ PASS" : "❌ FAIL");
    
    // Test invalid data
    const invalidData = { teams: "not an array" };
    const isValid2 = validateTestData(invalidData);
    console.log("Invalid data test:", !isValid2 ? "✅ PASS" : "❌ FAIL");
}

function validateTestData(data) {
    if (!data || typeof data !== 'object') return false;
    
    const requiredArrays = ['teams', 'tasks', 'scores'];
    for (const prop of requiredArrays) {
        if (!Array.isArray(data[prop])) return false;
    }
    
    if (data.teams.some(team => !team.id || !team.name)) return false;
    if (data.tasks.some(task => !task.id || !task.name)) return false;
    if (data.scores.some(score => !score.teamId || !score.taskId || typeof score.points !== 'number')) return false;
    
    return true;
}

// Function to test storage limits
function testStorageLimit() {
    console.log("5. Testing localStorage storage limits...");
    
    try {
        // Get current usage
        let used = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                used += localStorage[key].length;
            }
        }
        
        console.log(`Current localStorage usage: ${used} characters`);
        console.log(`Estimated usage: ${(used / 1024).toFixed(2)} KB`);
        
        // Test with our demo data
        const demoDataSize = JSON.stringify(testData).length;
        console.log(`Demo data size: ${demoDataSize} characters (${(demoDataSize / 1024).toFixed(2)} KB)`);
        
        console.log("✅ Storage limit test completed");
    } catch (error) {
        console.log("❌ Storage limit test failed:", error);
    }
}

// Function to run all tests
function runAllTests() {
    console.log("🚀 Running all localStorage tests...");
    console.log("");
    
    testSave();
    console.log("");
    
    testLoad();
    console.log("");
    
    testExport();
    console.log("");
    
    testValidation();
    console.log("");
    
    testStorageLimit();
    console.log("");
    
    console.log("🎉 All tests completed!");
    console.log("");
    console.log("To clean up test data, run: localStorage.removeItem('leaderboard_demo')");
}

// Auto-run tests if this script is executed
console.log("To run tests, call: runAllTests()");
console.log("Individual tests: testSave(), testLoad(), testExport(), testValidation(), testStorageLimit()");

// Export functions for manual testing
window.demoLocalStorage = {
    runAllTests,
    testSave,
    testLoad,
    testExport,
    testValidation,
    testStorageLimit,
    testData
};
