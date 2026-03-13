# Design Document: Productivity Dashboard

## Overview

The Productivity Dashboard is a client-side web application built with vanilla HTML, CSS, and JavaScript that provides time management and task tracking capabilities. The application operates entirely in the browser with no backend dependencies, using the Local Storage API for data persistence.

The design follows a component-based architecture where each feature (greeting display, focus timer, task list, quick links, theme toggle) is implemented as a self-contained module with clear responsibilities. The application emphasizes simplicity, performance, and maintainability while meeting strict response time requirements (50-100ms for most operations).

Key design principles:
- **Client-side only**: No server communication, all data stored in browser Local Storage
- **Performance-first**: Sub-100ms response times for user interactions
- **Vanilla JavaScript**: No frameworks or libraries, pure ES2015+ JavaScript
- **Component isolation**: Each feature module manages its own state and DOM
- **Single-file architecture**: One CSS file, one JavaScript file for simplicity

## Architecture

### High-Level Architecture

The application follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│                  (Structure Layer)                      │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
┌───────▼────────┐                 ┌────────▼────────┐
│   styles.css   │                 │    app.js       │
│ (Presentation) │                 │ (Logic Layer)   │
└────────────────┘                 └─────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
            ┌───────▼────────┐    ┌────────▼────────┐   ┌────────▼────────┐
            │   Components   │    │  State Manager  │   │ Storage Manager │
            │   - Greeting   │    │  - App State    │   │ - LocalStorage  │
            │   - Timer      │    │  - UI State     │   │   Operations    │
            │   - Tasks      │    │                 │   │ - Data Sync     │
            │   - Links      │    │                 │   │                 │
            │   - Theme      │    │                 │   │                 │
            └────────────────┘    └─────────────────┘   └─────────────────┘
```

### Component Architecture

Each component follows a consistent pattern:

1. **Initialization**: Set up DOM references and event listeners
2. **State Management**: Maintain component-specific state
3. **Rendering**: Update DOM based on state changes
4. **Persistence**: Sync state with Local Storage
5. **Event Handling**: Respond to user interactions

### Module Organization

The JavaScript file is organized into the following modules:

1. **StorageManager**: Handles all Local Storage operations with error handling
2. **ThemeManager**: Manages theme switching and persistence
3. **GreetingDisplay**: Updates time, date, and personalized greeting
4. **NameManager**: Handles custom name input and storage
5. **FocusTimer**: Implements countdown timer with start/stop/reset
6. **TimerConfig**: Manages timer duration configuration
7. **TaskList**: Handles task CRUD operations
8. **QuickLinks**: Manages website shortcuts
9. **App**: Main application controller that initializes all components

## Components and Interfaces

### 1. StorageManager

**Responsibility**: Centralized interface for all Local Storage operations with error handling and JSON serialization.

**Interface**:
```javascript
StorageManager = {
  // Save data to Local Storage
  save(key, value) -> boolean
  
  // Load data from Local Storage
  load(key) -> any | null
  
  // Remove data from Local Storage
  remove(key) -> boolean
  
  // Check if Local Storage is available
  isAvailable() -> boolean
  
  // Storage keys constants
  KEYS: {
    TASKS: 'productivity-tasks',
    LINKS: 'productivity-links',
    THEME: 'productivity-theme',
    NAME: 'productivity-name',
    TIMER_DURATION: 'productivity-timer-duration'
  }
}
```

**Implementation Notes**:
- All values are JSON-serialized before storage
- Returns null on read errors
- Returns false on write errors
- Includes try-catch for quota exceeded errors

### 2. ThemeManager

**Responsibility**: Toggle between light and dark themes and persist user preference.

**Interface**:
```javascript
ThemeManager = {
  // Initialize theme from storage or default
  init() -> void
  
  // Toggle between light and dark theme
  toggle() -> void
  
  // Apply a specific theme
  applyTheme(theme) -> void
  
  // Get current theme
  getCurrentTheme() -> 'light' | 'dark'
}
```

**Implementation Notes**:
- Adds/removes 'dark-theme' class on document.body
- Default theme is 'light'
- Must complete within 50ms on page load

### 3. GreetingDisplay

**Responsibility**: Display current time, date, and personalized greeting that updates every second.

**Interface**:
```javascript
GreetingDisplay = {
  // Initialize and start clock
  init() -> void
  
  // Update time, date, and greeting
  update() -> void
  
  // Get appropriate greeting based on hour
  getGreeting(hour) -> string
  
  // Format time as HH:MM:SS
  formatTime(date) -> string
  
  // Format date as human-readable string
  formatDate(date) -> string
}
```

**Implementation Notes**:
- Uses setInterval with 1000ms interval
- Greeting logic:
  - 05:00-11:59: "Good morning"
  - 12:00-16:59: "Good afternoon"
  - 17:00-20:59: "Good evening"
  - 21:00-04:59: "Good night"
- Includes custom name from storage if available

### 4. NameManager

**Responsibility**: Handle custom name input, storage, and display.

**Interface**:
```javascript
NameManager = {
  // Initialize name input functionality
  init() -> void
  
  // Get stored name
  getName() -> string | null
  
  // Save name to storage
  saveName(name) -> void
  
  // Show name input UI
  showInput() -> void
  
  // Hide name input UI
  hideInput() -> void
}
```

**Implementation Notes**:
- Provides inline editing interface
- Trims whitespace from input
- Updates greeting immediately on save

### 5. FocusTimer

**Responsibility**: Countdown timer with start, stop, reset controls.

**Interface**:
```javascript
FocusTimer = {
  // Initialize timer
  init() -> void
  
  // Start countdown
  start() -> void
  
  // Stop/pause countdown
  stop() -> void
  
  // Reset to configured duration
  reset() -> void
  
  // Update display
  updateDisplay() -> void
  
  // Format seconds as MM:SS
  formatTime(seconds) -> string
  
  // Handle timer completion
  onComplete() -> void
  
  // State
  remainingSeconds: number,
  isRunning: boolean,
  intervalId: number | null
}
```

**Implementation Notes**:
- Uses setInterval with 1000ms interval when running
- Default duration: 25 minutes (1500 seconds)
- Loads custom duration from storage on init
- Plays audio or shows visual alert on completion
- Updates display every second

### 6. TimerConfig

**Responsibility**: Allow users to configure timer duration.

**Interface**:
```javascript
TimerConfig = {
  // Initialize configuration UI
  init() -> void
  
  // Get configured duration in seconds
  getDuration() -> number
  
  // Save duration to storage
  saveDuration(minutes) -> void
  
  // Show configuration UI
  showConfig() -> void
  
  // Hide configuration UI
  hideConfig() -> void
}
```

**Implementation Notes**:
- Input validation for positive integers
- Converts minutes to seconds for storage
- Notifies FocusTimer of duration changes

### 7. TaskList

**Responsibility**: Manage task CRUD operations with completion status.

**Interface**:
```javascript
TaskList = {
  // Initialize task list
  init() -> void
  
  // Load tasks from storage
  loadTasks() -> void
  
  // Add new task
  addTask(text) -> void
  
  // Edit task text
  editTask(id, newText) -> void
  
  // Toggle task completion
  toggleTask(id) -> void
  
  // Delete task
  deleteTask(id) -> void
  
  // Render all tasks
  render() -> void
  
  // Save tasks to storage
  saveTasks() -> void
  
  // State
  tasks: Task[]
}
```

**Implementation Notes**:
- Tasks stored as array in Local Storage
- Each task has unique ID (timestamp-based)
- Renders in creation order
- Visual distinction for completed tasks (strikethrough, opacity)
- Inline editing with save/cancel buttons

### 8. QuickLinks

**Responsibility**: Manage website shortcuts with name and URL.

**Interface**:
```javascript
QuickLinks = {
  // Initialize quick links
  init() -> void
  
  // Load links from storage
  loadLinks() -> void
  
  // Add new link
  addLink(name, url) -> void
  
  // Edit link
  editLink(id, name, url) -> void
  
  // Delete link
  deleteLink(id) -> void
  
  // Render all links
  render() -> void
  
  // Save links to storage
  saveLinks() -> void
  
  // State
  links: Link[]
}
```

**Implementation Notes**:
- Links stored as array in Local Storage
- Each link has unique ID (timestamp-based)
- Opens links in new tab (target="_blank")
- URL validation to ensure proper format
- Inline editing with save/cancel buttons

### 9. App

**Responsibility**: Main application controller that initializes all components and handles global errors.

**Interface**:
```javascript
App = {
  // Initialize application
  init() -> void
  
  // Check browser compatibility
  checkCompatibility() -> boolean
  
  // Show error message
  showError(message) -> void
}
```

**Implementation Notes**:
- Initializes all components in correct order
- Checks for Local Storage availability
- Displays error if Local Storage unavailable
- Sets up global error handlers

## Data Models

### Task Model

```javascript
{
  id: string,           // Unique identifier (timestamp-based)
  text: string,         // Task description
  completed: boolean,   // Completion status
  createdAt: number     // Creation timestamp (milliseconds)
}
```

**Validation Rules**:
- `id`: Required, non-empty string
- `text`: Required, non-empty string after trimming
- `completed`: Required, boolean
- `createdAt`: Required, positive number

**Storage Key**: `productivity-tasks`

**Storage Format**: JSON array of Task objects

### Link Model

```javascript
{
  id: string,           // Unique identifier (timestamp-based)
  name: string,         // Display name for the link
  url: string,          // Website URL
  createdAt: number     // Creation timestamp (milliseconds)
}
```

**Validation Rules**:
- `id`: Required, non-empty string
- `name`: Required, non-empty string after trimming
- `url`: Required, valid URL format (http:// or https://)
- `createdAt`: Required, positive number

**Storage Key**: `productivity-links`

**Storage Format**: JSON array of Link objects

### Theme Preference

```javascript
{
  theme: 'light' | 'dark'  // Current theme selection
}
```

**Storage Key**: `productivity-theme`

**Storage Format**: JSON string ('light' or 'dark')

**Default**: 'light'

### Custom Name

```javascript
{
  name: string  // User's custom name for greeting
}
```

**Storage Key**: `productivity-name`

**Storage Format**: JSON string

**Default**: null (no custom name)

### Timer Duration

```javascript
{
  duration: number  // Timer duration in seconds
}
```

**Storage Key**: `productivity-timer-duration`

**Storage Format**: JSON number (seconds)

**Default**: 1500 (25 minutes)

### Local Storage Schema Summary

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `productivity-tasks` | Task[] | [] | Array of task objects |
| `productivity-links` | Link[] | [] | Array of link objects |
| `productivity-theme` | string | 'light' | Theme preference |
| `productivity-name` | string | null | Custom user name |
| `productivity-timer-duration` | number | 1500 | Timer duration in seconds |


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies and consolidations:

**Redundancy Analysis**:
1. Properties 1.3-1.6 (greeting by hour range) can be combined into a single comprehensive property about greeting selection
2. Properties 2.2, 2.3, 2.4 (name storage operations) overlap with the general persistence property 10.1
3. Properties 3.11, 3.12 (timer duration storage) overlap with the general persistence property 10.1
4. Properties 4.4, 4.7, 4.9, 4.11 (task storage operations) overlap with the general persistence property 10.1
5. Properties 5.4, 5.7, 5.9 (link storage operations) overlap with the general persistence property 10.1
6. Properties 6.5, 6.6 (theme storage operations) overlap with the general persistence property 10.1
7. Multiple UI structure tests (buttons, controls exist) can be consolidated into integration tests rather than individual properties
8. The round-trip property 10.5 subsumes individual storage/retrieval properties

**Consolidation Strategy**:
- Create comprehensive properties that cover multiple related criteria
- Focus on unique validation value for each property
- Eliminate properties that are subsumed by more general properties
- Keep specific edge cases and examples as unit tests rather than properties

### Property 1: Time Format Consistency

*For any* Date object, formatting the time should produce a string in 24-hour format (HH:MM:SS) where hours are 00-23, minutes are 00-59, and seconds are 00-59.

**Validates: Requirements 1.1**

### Property 2: Date Format Readability

*For any* Date object, formatting the date should produce a non-empty human-readable string containing day, month, and year information.

**Validates: Requirements 1.2**

### Property 3: Greeting Selection by Hour

*For any* hour value (0-23), the greeting function should return exactly one of the four greetings ("Good morning", "Good afternoon", "Good evening", "Good night") based on the hour ranges: 5-11 → morning, 12-16 → afternoon, 17-20 → evening, 21-4 → night.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

### Property 4: Custom Name Inclusion

*For any* non-empty custom name string, when included in the greeting display, the resulting greeting text should contain that exact name.

**Validates: Requirements 1.7**

### Property 5: Timer Format Consistency

*For any* non-negative integer representing seconds, formatting as MM:SS should produce a string where minutes are zero-padded to 2 digits and seconds are zero-padded to 2 digits (00-59).

**Validates: Requirements 3.1**

### Property 6: Timer Start Behavior

*For any* configured timer duration, starting the timer should set the remaining time to that duration and begin countdown.

**Validates: Requirements 3.5**

### Property 7: Timer Stop Preservation

*For any* timer state with remaining time T, stopping the timer should preserve the remaining time at T without further countdown.

**Validates: Requirements 3.6**

### Property 8: Timer Reset Restoration

*For any* configured timer duration D and current remaining time T, resetting the timer should set the remaining time back to D regardless of T.

**Validates: Requirements 3.7**

### Property 9: Task Creation Order Preservation

*For any* sequence of tasks created in order [T1, T2, ..., Tn], the task list display should maintain that exact creation order.

**Validates: Requirements 4.1**

### Property 10: Task Text Preservation

*For any* non-empty task text string, creating a task with that text should result in a task object whose text field exactly matches the input (after trimming whitespace).

**Validates: Requirements 4.3**

### Property 11: Task Completion Visual Distinction

*For any* task, when marked as complete, the rendered task element should have different visual styling (CSS class or inline style) than when marked incomplete.

**Validates: Requirements 4.6**

### Property 12: Task Edit Persistence

*For any* existing task with ID and any new text string, editing the task should update the task's text field while preserving its ID and creation timestamp.

**Validates: Requirements 4.9**

### Property 13: Task Deletion Removal

*For any* task list containing task with ID X, deleting task X should result in a task list that does not contain any task with ID X.

**Validates: Requirements 4.11**

### Property 14: Link Display Completeness

*For any* set of stored links, the rendered quick links section should display all links with their names and URLs visible.

**Validates: Requirements 5.1**

### Property 15: Link Creation with Valid Data

*For any* non-empty name string and valid URL string, creating a quick link should result in a link object with those exact name and URL values.

**Validates: Requirements 5.3**

### Property 16: Link Activation Opens URL

*For any* quick link with URL U, activating the link should trigger opening URL U in a new browser tab (target="_blank").

**Validates: Requirements 5.5**

### Property 17: Link Edit Persistence

*For any* existing link with ID and any new name/URL values, editing the link should update the link's fields while preserving its ID and creation timestamp.

**Validates: Requirements 5.7**

### Property 18: Link Deletion Removal

*For any* link list containing link with ID X, deleting link X should result in a link list that does not contain any link with ID X.

**Validates: Requirements 5.9**

### Property 19: Theme Toggle Alternation

*For any* current theme state (light or dark), activating the theme toggle should switch to the opposite theme state.

**Validates: Requirements 6.2**

### Property 20: Theme Persistence

*For any* theme value ('light' or 'dark'), setting the theme should store that exact value in Local Storage under the theme key.

**Validates: Requirements 6.5**

### Property 21: Theme Retrieval

*For any* theme value stored in Local Storage, loading the theme on page initialization should apply that exact theme to the dashboard.

**Validates: Requirements 6.6**

### Property 22: Data Change Persistence

*For any* user data change (task add/edit/delete, link add/edit/delete, name change, timer duration change, theme change), the change should be immediately persisted to Local Storage.

**Validates: Requirements 10.1**

### Property 23: Data Retrieval Completeness

*For any* set of user data stored in Local Storage (tasks, links, name, timer duration, theme), loading the page should retrieve and display all stored data.

**Validates: Requirements 10.2, 4.12, 5.10**

### Property 24: JSON Format Validity

*For any* data stored in Local Storage by the dashboard, the stored value should be valid JSON that can be parsed without errors.

**Validates: Requirements 10.4**

### Property 25: Storage Round-Trip Preservation

*For any* valid user data object (task, link, name, timer duration, theme), serializing to JSON, storing in Local Storage, retrieving from Local Storage, and deserializing should produce an equivalent object with the same values.

**Validates: Requirements 10.5**

## Error Handling

### Local Storage Unavailability

**Scenario**: Local Storage API is not available (disabled, private browsing, quota exceeded)

**Handling**:
1. Check `StorageManager.isAvailable()` on application initialization
2. If unavailable, display prominent error message to user
3. Error message: "Data persistence is not available. Your changes will not be saved."
4. Allow application to function in memory-only mode
5. Disable save operations gracefully without throwing errors

**Implementation**:
```javascript
// In StorageManager
isAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
```

### Storage Quota Exceeded

**Scenario**: Local Storage quota is exceeded when saving data

**Handling**:
1. Catch `QuotaExceededError` in `StorageManager.save()`
2. Display error message to user: "Storage quota exceeded. Please delete some items."
3. Return false to indicate save failure
4. Allow user to delete items to free space
5. Retry save operation after deletion

**Implementation**:
```javascript
save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      this.showQuotaError();
    }
    return false;
  }
}
```

### Invalid JSON Data

**Scenario**: Corrupted or invalid JSON in Local Storage

**Handling**:
1. Catch `SyntaxError` in `StorageManager.load()`
2. Log error to console for debugging
3. Return null to indicate load failure
4. Initialize with default/empty values
5. Overwrite corrupted data on next save

**Implementation**:
```javascript
load(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error(`Failed to parse ${key}:`, e);
    return null;
  }
}
```

### Invalid User Input

**Scenario**: User enters invalid data (empty task, invalid URL, etc.)

**Handling**:
1. Validate input before processing
2. Display inline error message near input field
3. Prevent submission of invalid data
4. Clear error message when user corrects input
5. Provide helpful validation messages

**Validation Rules**:
- Task text: Non-empty after trimming whitespace
- Link name: Non-empty after trimming whitespace
- Link URL: Must start with http:// or https://
- Timer duration: Positive integer (minutes)
- Custom name: Any string (empty allowed for removal)

### Timer Completion

**Scenario**: Focus timer reaches 00:00

**Handling**:
1. Stop the countdown interval
2. Play completion sound (if audio available)
3. Show visual notification (browser notification API if permitted)
4. Change timer display styling to indicate completion
5. Keep timer at 00:00 until user resets

**Implementation**:
```javascript
onComplete() {
  this.stop();
  this.playCompletionSound();
  this.showNotification('Focus session complete!');
  this.updateDisplay();
}
```

### Browser Compatibility Issues

**Scenario**: Browser doesn't support required features

**Handling**:
1. Check for required APIs on initialization
2. Required: Local Storage, ES2015+ features
3. Display error if critical features missing
4. Gracefully degrade non-critical features
5. Provide browser upgrade recommendation

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, error conditions, and integration points between components. Unit tests verify concrete scenarios and ensure components work together correctly.

**Property-Based Tests**: Verify universal properties across all inputs through randomization. Property tests ensure correctness holds for the entire input space, not just hand-picked examples.

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Property-Based Testing Configuration

**Library Selection**: Use **fast-check** for JavaScript property-based testing
- Mature, well-maintained library for JavaScript/TypeScript
- Supports browser and Node.js environments
- Provides rich set of generators (strings, numbers, arrays, objects)
- Integrates with standard test frameworks (Jest, Mocha, Vitest)

**Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: productivity-dashboard, Property {number}: {property_text}`

**Example Property Test Structure**:
```javascript
// Feature: productivity-dashboard, Property 1: Time Format Consistency
test('time formatting produces 24-hour format', () => {
  fc.assert(
    fc.property(
      fc.date(), // Generate random dates
      (date) => {
        const formatted = formatTime(date);
        const [hours, minutes, seconds] = formatted.split(':');
        
        // Verify 24-hour format constraints
        expect(parseInt(hours)).toBeGreaterThanOrEqual(0);
        expect(parseInt(hours)).toBeLessThan(24);
        expect(parseInt(minutes)).toBeGreaterThanOrEqual(0);
        expect(parseInt(minutes)).toBeLessThan(60);
        expect(parseInt(seconds)).toBeGreaterThanOrEqual(0);
        expect(parseInt(seconds)).toBeLessThan(60);
        
        // Verify zero-padding
        expect(hours).toMatch(/^\d{2}$/);
        expect(minutes).toMatch(/^\d{2}$/);
        expect(seconds).toMatch(/^\d{2}$/);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

**Test Organization**:
- One test file per component module
- Group related tests using describe blocks
- Use descriptive test names that explain the scenario

**Coverage Areas**:

1. **Component Initialization**
   - Test that components initialize with correct default state
   - Test that components load saved data from storage
   - Test error handling when storage is unavailable

2. **User Interactions**
   - Test button clicks trigger correct actions
   - Test form submissions create/update data
   - Test inline editing workflows (edit → save/cancel)

3. **Edge Cases**
   - Empty input handling (empty task, empty name)
   - Invalid input handling (invalid URL, negative duration)
   - Boundary conditions (hour 0, hour 23, timer at 0 seconds)
   - Empty state (no tasks, no links, no custom name)

4. **Error Conditions**
   - Storage unavailable
   - Storage quota exceeded
   - Invalid JSON in storage
   - Missing DOM elements

5. **Integration Points**
   - StorageManager integration with all components
   - Theme changes affect all components
   - Timer completion triggers notifications
   - Name changes update greeting display

**Example Unit Tests**:
```javascript
describe('TaskList', () => {
  test('adds task with valid text', () => {
    const taskList = new TaskList();
    taskList.addTask('Buy groceries');
    expect(taskList.tasks).toHaveLength(1);
    expect(taskList.tasks[0].text).toBe('Buy groceries');
  });
  
  test('rejects empty task text', () => {
    const taskList = new TaskList();
    taskList.addTask('   ');
    expect(taskList.tasks).toHaveLength(0);
  });
  
  test('deletes task by id', () => {
    const taskList = new TaskList();
    taskList.addTask('Task 1');
    const id = taskList.tasks[0].id;
    taskList.deleteTask(id);
    expect(taskList.tasks).toHaveLength(0);
  });
});
```

### Test Environment Setup

**Browser Testing**:
- Use Vitest with jsdom for DOM simulation
- Mock Local Storage API for controlled testing
- Mock Date object for time-dependent tests
- Mock window.open for link activation tests

**Test Utilities**:
```javascript
// Mock Local Storage
const mockStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value; },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

// Mock Date for consistent time testing
const mockDate = (isoString) => {
  const realDate = Date;
  global.Date = class extends realDate {
    constructor() {
      return new realDate(isoString);
    }
  };
};
```

### Manual Testing Checklist

Some requirements require manual verification:

**Performance Testing**:
- [ ] Page loads within 500ms on standard connection
- [ ] Interactions provide feedback within 50ms
- [ ] Data updates complete within 100ms
- [ ] Timer updates every second without lag

**Browser Compatibility**:
- [ ] Test in Chrome (latest stable)
- [ ] Test in Firefox (latest stable)
- [ ] Test in Edge (latest stable)
- [ ] Test in Safari (latest stable)

**Visual Design**:
- [ ] Consistent spacing between sections
- [ ] Clear font size hierarchy
- [ ] WCAG AA color contrast compliance
- [ ] Consistent button and control styling
- [ ] Responsive layout on different screen sizes

**Accessibility**:
- [ ] Keyboard navigation works for all controls
- [ ] Screen reader announces all interactive elements
- [ ] Focus indicators visible on all controls
- [ ] Semantic HTML structure

### Continuous Testing

**Development Workflow**:
1. Write property-based tests for each correctness property
2. Write unit tests for specific examples and edge cases
3. Run tests on every code change
4. Maintain 100% pass rate before committing
5. Add regression tests for any bugs found

**Test Execution**:
```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage
```

## Implementation Notes

### Performance Optimization

**Local Storage Access**:
- Batch reads on initialization (single pass through all keys)
- Debounce writes for rapid changes (e.g., timer countdown)
- Use in-memory cache for frequently accessed data
- Minimize JSON serialization/deserialization overhead

**DOM Updates**:
- Use document fragments for batch DOM insertions
- Minimize reflows by batching style changes
- Use event delegation for dynamic elements (tasks, links)
- Cache DOM element references in component state

**Timer Implementation**:
- Use requestAnimationFrame for smooth updates if needed
- Clear intervals properly to prevent memory leaks
- Avoid creating new intervals on every update

### Code Organization

**File Structure**:
```
productivity-dashboard/
├── index.html
├── css/
│   └── styles.css
└── js/
    └── app.js
```

**Module Pattern in app.js**:
```javascript
// Immediately Invoked Function Expression (IIFE) for encapsulation
(function() {
  'use strict';
  
  // StorageManager module
  const StorageManager = { /* ... */ };
  
  // ThemeManager module
  const ThemeManager = { /* ... */ };
  
  // Other modules...
  
  // App initialization
  const App = {
    init() {
      // Initialize all components
    }
  };
  
  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})();
```

### CSS Architecture

**Naming Convention**: Use BEM (Block Element Modifier) for clarity
```css
/* Block */
.task-list { }

/* Element */
.task-list__item { }

/* Modifier */
.task-list__item--completed { }
```

**Theme Implementation**:
```css
/* Light theme (default) */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --accent-color: #007bff;
}

/* Dark theme */
body.dark-theme {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --accent-color: #4a9eff;
}

/* Use CSS variables throughout */
body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

### Browser Compatibility

**Required Features**:
- Local Storage API (all modern browsers)
- ES2015+ features: const/let, arrow functions, template literals, classes
- CSS Grid and Flexbox for layout
- CSS Custom Properties (CSS variables)

**Polyfills**: None required for target browsers (latest stable versions)

**Graceful Degradation**:
- Notification API: Optional, fallback to visual indicator only
- Audio API: Optional, fallback to silent completion

### Security Considerations

**XSS Prevention**:
- Use textContent instead of innerHTML for user-generated content
- Sanitize URLs before opening (ensure http:// or https://)
- Validate all user input before storage

**Data Privacy**:
- All data stored locally in user's browser
- No data transmitted to external servers
- User can clear data via browser settings

### Accessibility

**Keyboard Navigation**:
- All interactive elements accessible via Tab key
- Enter key activates buttons and submits forms
- Escape key cancels inline editing

**ARIA Labels**:
- Add aria-label to icon-only buttons
- Use aria-live for timer updates
- Add role attributes where semantic HTML insufficient

**Focus Management**:
- Visible focus indicators on all interactive elements
- Focus returns to logical position after modal actions
- Focus trapped in modal dialogs if implemented

