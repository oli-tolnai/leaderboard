# LocalStorage Features for Leaderboard Application

## Overview
The leaderboard application now supports data persistence using browser localStorage. This allows you to save and restore teams, tasks, scores, and other competition data.

## Features Added

### 1. Data Management Controls
The admin interface now includes a "Data Management" section in the sidebar with the following buttons:

- **💾 Save Data**: Manually save current competition data to localStorage
- **📂 Load Data**: Load previously saved data from localStorage
- **📤 Export Data**: Download competition data as a JSON file
- **📥 Import Data**: Upload and load data from a JSON file
- **🗑️ Clear All**: Remove all saved data from localStorage

### 2. Auto-Save Feature
- **Auto-save checkbox**: When enabled, automatically saves data to localStorage whenever changes are made
- Data is saved with a 1-second debounce to avoid excessive saves
- Last save timestamp is displayed below the controls

### 3. Auto-Load Feature
- **Auto-load on startup checkbox**: When enabled, automatically loads saved data when the admin page opens
- Useful for continuing work where you left off

### 4. Display Page Caching
The display page now automatically caches game state for offline viewing:
- Game state is cached in localStorage whenever it's received
- If connection to server fails, cached data is automatically loaded
- Shows an "Offline Mode" notification when using cached data

## Data Structure
The saved data includes:
```json
{
  "teams": [...],
  "tasks": [...], 
  "taskGroups": [...],
  "scores": [...],
  "timer": {...},
  "soundAlerts": [...],
  "timestamp": "2025-06-03T22:02:23.000Z",
  "version": "1.0"
}
```

## Usage Examples

### Basic Usage
1. Open the admin interface at `http://localhost:8080/admin.html`
2. Add some teams and tasks
3. Click "💾 Save Data" to save to localStorage
4. Refresh the page
5. Click "📂 Load Data" to restore your data

### Export/Import for Backup
1. After setting up your competition, click "📤 Export Data"
2. Save the downloaded JSON file as a backup
3. Later, click "📥 Import Data" and select your JSON file to restore

### Auto-Save Workflow
1. Enable the "Auto-save" checkbox
2. Make changes to teams, tasks, or scores
3. Data is automatically saved after each change
4. Enable "Auto-load on startup" to automatically restore data when you open the admin page

## Technical Details

### Frontend (admin.js)
- `saveToLocalStorage()`: Saves current game state to localStorage
- `loadFromLocalStorage()`: Loads and applies saved data
- `exportData()`: Downloads data as JSON file
- `importData()`: Uploads and applies JSON file data
- `validateGameData()`: Ensures data integrity before loading

### Backend (leaderboard.service.ts)
- `loadGameState()`: Replaces current game state with provided data
- Resets view-related state (revealed teams, current view)
- Validates data structure before applying

### Display Page (display.js)
- `cacheGameState()`: Automatically caches received game state
- `loadCachedGameState()`: Loads cached data when offline
- Shows offline notification when using cached data

## Benefits
1. **Data Persistence**: No data loss when browser closes or refreshes
2. **Backup/Restore**: Easy backup of competition setups
3. **Offline Capability**: Display can work with cached data if connection fails
4. **Competition Templates**: Save and reuse competition setups
5. **Recovery**: Automatic recovery from unexpected disconnections

## Browser Compatibility
Works with all modern browsers that support localStorage (IE8+, Chrome, Firefox, Safari, Edge).

## Storage Limitations
- localStorage typically has a 5-10MB limit per domain
- Competition data is usually very small (few KB)
- Automatic cleanup of old cache data to prevent storage issues
