# Implementation Plan: Productivity Dashboard

## Overview

This plan implements a client-side productivity dashboard with vanilla HTML, CSS, and JavaScript. The implementation follows a component-based architecture with 9 modules (StorageManager, ThemeManager, GreetingDisplay, NameManager, FocusTimer, TimerConfig, TaskList, QuickLinks, App) that interact through a centralized storage layer. All data persists to Local Storage with 5 storage keys. The implementation includes 25 property-based tests using fast-check to validate correctness properties.

## Tasks

- [x] 1. Set up project structure and testing framework
  - Create directory structure: `css/`, `js/`, and root `index.html`
  - Install fast-check library for property-based testing
  - Install Vitest with jsdom for unit testing
  - Create test utilities for mocking Local Storage and Date
  - _Requirements: 9.1, 9.2_

- [x] 2. Implement HTML structure
  - [x] 2.1 Create index.html with semantic HTML5 structure
    - Add document structure with head and body
    - Create sections for greeting, timer, tasks, and quick links
    - Add theme toggle button
    - Include CSS and JavaScript file references
    - _Requirements: 9.3, 11.4_

- [x] 3. Implement CSS styling with theme support
  - [x] 3.1 Create styles.css with CSS variables for theming
    - Define CSS custom properties for colors, spacing, and typography
    - Implement light theme (default) color scheme
    - Implement dark theme color scheme with `.dark-theme` class
    - _Requirements: 6.3, 6.4, 9.1, 9.5_
  
  - [x] 3.2 Style all dashboard components with BEM naming
    - Style greeting display section
    - Style focus timer with controls
    - Style task list with inline editing
    - Style quick links section
    - Style theme toggle button
    - Ensure WCAG AA color contrast compliance
    - _Requirements: 11.1, 11.2, 11.3, 11.5_

- [x] 4. Implement StorageManager module
  - [x] 4.1 Create StorageManager with Local Storage operations
    - Implement `save(key, value)` with JSON serialization and error handling
    - Implement `load(key)` with JSON parsing and error handling
    - Implement `remove(key)` with error handling
    - Implement `isAvailable()` to check Local Storage availability
    - Define storage keys constants (TASKS, LINKS, THEME, NAME, TIMER_DURATION)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 4.2 Write property test for JSON format validity
    - **Property 24: JSON Format Validity**
    - **Validates: Requirements 10.4**
  
  - [ ]* 4.3 Write property test for storage round-trip preservation
    - **Property 25: Storage Round-Trip Preservation**
    - **Validates: Requirements 10.5**
  
  - [ ]* 4.4 Write unit tests for StorageManager error handling
    - Test quota exceeded error handling
    - Test invalid JSON parsing
    - Test storage unavailability
    - _Requirements: 10.3_

- [x] 5. Implement ThemeManager module
  - [x] 5.1 Create ThemeManager with theme toggle functionality
    - Implement `init()` to load theme from storage or default to light
    - Implement `toggle()` to switch between light and dark themes
    - Implement `applyTheme(theme)` to add/remove dark-theme class
    - Implement `getCurrentTheme()` to return current theme
    - Persist theme changes to Local Storage
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [ ]* 5.2 Write property test for theme toggle alternation
    - **Property 19: Theme Toggle Alternation**
    - **Validates: Requirements 6.2**
  
  - [ ]* 5.3 Write property test for theme persistence
    - **Property 20: Theme Persistence**
    - **Validates: Requirements 6.5**
  
  - [ ]* 5.4 Write property test for theme retrieval
    - **Property 21: Theme Retrieval**
    - **Validates: Requirements 6.6**
  
  - [ ]* 5.5 Write unit tests for ThemeManager
    - Test default theme is light
    - Test theme application within 50ms
    - _Requirements: 6.7, 7.2_

- [x] 6. Checkpoint - Ensure storage and theme tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement GreetingDisplay module
  - [x] 7.1 Create GreetingDisplay with time, date, and greeting
    - Implement `init()` to start clock with setInterval (1000ms)
    - Implement `update()` to refresh time, date, and greeting every second
    - Implement `getGreeting(hour)` with hour-based logic (morning/afternoon/evening/night)
    - Implement `formatTime(date)` to produce HH:MM:SS format
    - Implement `formatDate(date)` to produce human-readable date
    - Include custom name from storage in greeting if available
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_
  
  - [ ]* 7.2 Write property test for time format consistency
    - **Property 1: Time Format Consistency**
    - **Validates: Requirements 1.1**
  
  - [ ]* 7.3 Write property test for date format readability
    - **Property 2: Date Format Readability**
    - **Validates: Requirements 1.2**
  
  - [ ]* 7.4 Write property test for greeting selection by hour
    - **Property 3: Greeting Selection by Hour**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
  
  - [ ]* 7.5 Write property test for custom name inclusion
    - **Property 4: Custom Name Inclusion**
    - **Validates: Requirements 1.7**
  
  - [ ]* 7.6 Write unit tests for GreetingDisplay
    - Test clock updates every second
    - Test default greeting without custom name
    - Test boundary hours (0, 5, 12, 17, 21, 23)
    - _Requirements: 1.8, 1.9_

- [x] 8. Implement NameManager module
  - [x] 8.1 Create NameManager with custom name functionality
    - Implement `init()` to set up name input event listeners
    - Implement `getName()` to retrieve name from storage
    - Implement `saveName(name)` to persist name to storage
    - Implement `showInput()` and `hideInput()` for inline editing UI
    - Trim whitespace from name input
    - Update greeting display immediately on save
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 8.2 Write unit tests for NameManager
    - Test name persistence within 100ms
    - Test whitespace trimming
    - Test empty name handling
    - _Requirements: 2.5_

- [x] 9. Implement FocusTimer module
  - [x] 9.1 Create FocusTimer with countdown functionality
    - Implement `init()` to load duration from storage (default 1500 seconds)
    - Implement `start()` to begin countdown with setInterval (1000ms)
    - Implement `stop()` to pause countdown
    - Implement `reset()` to restore configured duration
    - Implement `updateDisplay()` to show remaining time
    - Implement `formatTime(seconds)` to produce MM:SS format
    - Implement `onComplete()` to handle timer reaching 00:00
    - Manage state: remainingSeconds, isRunning, intervalId
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.12_
  
  - [ ]* 9.2 Write property test for timer format consistency
    - **Property 5: Timer Format Consistency**
    - **Validates: Requirements 3.1**
  
  - [ ]* 9.3 Write property test for timer start behavior
    - **Property 6: Timer Start Behavior**
    - **Validates: Requirements 3.5**
  
  - [ ]* 9.4 Write property test for timer stop preservation
    - **Property 7: Timer Stop Preservation**
    - **Validates: Requirements 3.6**
  
  - [ ]* 9.5 Write property test for timer reset restoration
    - **Property 8: Timer Reset Restoration**
    - **Validates: Requirements 3.7**
  
  - [ ]* 9.6 Write unit tests for FocusTimer
    - Test default 25-minute duration
    - Test timer completion notification
    - Test interval cleanup on stop
    - Test display updates every second
    - _Requirements: 3.9, 3.8, 7.4_

- [x] 10. Implement TimerConfig module
  - [x] 10.1 Create TimerConfig with duration configuration
    - Implement `init()` to set up configuration UI event listeners
    - Implement `getDuration()` to retrieve duration from storage
    - Implement `saveDuration(minutes)` to persist duration (convert to seconds)
    - Implement `showConfig()` and `hideConfig()` for configuration UI
    - Validate input for positive integers
    - Notify FocusTimer of duration changes
    - _Requirements: 3.10, 3.11_
  
  - [ ]* 10.2 Write unit tests for TimerConfig
    - Test duration persistence
    - Test input validation (negative, zero, non-numeric)
    - Test minutes to seconds conversion
    - _Requirements: 3.11_

- [x] 11. Checkpoint - Ensure greeting and timer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 12. Implement TaskList module
  - [x] 12.1 Create TaskList with CRUD operations
    - Implement `init()` to load tasks from storage and set up event listeners
    - Implement `loadTasks()` to retrieve tasks array from storage
    - Implement `addTask(text)` to create task with unique ID (timestamp-based)
    - Implement `editTask(id, newText)` to update task text
    - Implement `toggleTask(id)` to mark task complete/incomplete
    - Implement `deleteTask(id)` to remove task
    - Implement `render()` to display all tasks in creation order
    - Implement `saveTasks()` to persist tasks array to storage
    - Validate task text is non-empty after trimming
    - Apply visual distinction for completed tasks (strikethrough, opacity)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12_
  
  - [ ]* 12.2 Write property test for task creation order preservation
    - **Property 9: Task Creation Order Preservation**
    - **Validates: Requirements 4.1**
  
  - [ ]* 12.3 Write property test for task text preservation
    - **Property 10: Task Text Preservation**
    - **Validates: Requirements 4.3**
  
  - [ ]* 12.4 Write property test for task completion visual distinction
    - **Property 11: Task Completion Visual Distinction**
    - **Validates: Requirements 4.6**
  
  - [ ]* 12.5 Write property test for task edit persistence
    - **Property 12: Task Edit Persistence**
    - **Validates: Requirements 4.9**
  
  - [ ]* 12.6 Write property test for task deletion removal
    - **Property 13: Task Deletion Removal**
    - **Validates: Requirements 4.11**
  
  - [ ]* 12.7 Write unit tests for TaskList
    - Test empty task text rejection
    - Test whitespace trimming
    - Test task loading within 100ms
    - Test inline editing workflow (edit → save/cancel)
    - _Requirements: 4.12, 7.3_

- [x] 13. Implement QuickLinks module
  - [x] 13.1 Create QuickLinks with CRUD operations
    - Implement `init()` to load links from storage and set up event listeners
    - Implement `loadLinks()` to retrieve links array from storage
    - Implement `addLink(name, url)` to create link with unique ID (timestamp-based)
    - Implement `editLink(id, name, url)` to update link data
    - Implement `deleteLink(id)` to remove link
    - Implement `render()` to display all links
    - Implement `saveLinks()` to persist links array to storage
    - Validate link name is non-empty after trimming
    - Validate URL format (must start with http:// or https://)
    - Open links in new tab (target="_blank")
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_
  
  - [ ]* 13.2 Write property test for link display completeness
    - **Property 14: Link Display Completeness**
    - **Validates: Requirements 5.1**
  
  - [ ]* 13.3 Write property test for link creation with valid data
    - **Property 15: Link Creation with Valid Data**
    - **Validates: Requirements 5.3**
  
  - [ ]* 13.4 Write property test for link activation opens URL
    - **Property 16: Link Activation Opens URL**
    - **Validates: Requirements 5.5**
  
  - [ ]* 13.5 Write property test for link edit persistence
    - **Property 17: Link Edit Persistence**
    - **Validates: Requirements 5.7**
  
  - [ ]* 13.6 Write property test for link deletion removal
    - **Property 18: Link Deletion Removal**
    - **Validates: Requirements 5.9**
  
  - [ ]* 13.7 Write unit tests for QuickLinks
    - Test empty name rejection
    - Test invalid URL rejection (no protocol)
    - Test link loading within 100ms
    - Test inline editing workflow (edit → save/cancel)
    - Test new tab opening (target="_blank")
    - _Requirements: 5.10, 7.3_

- [x] 14. Checkpoint - Ensure task and link tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement App module and wire components together
  - [x] 15.1 Create App module with initialization logic
    - Implement `init()` to initialize all components in correct order
    - Implement `checkCompatibility()` to verify Local Storage availability
    - Implement `showError(message)` to display error messages
    - Initialize components: StorageManager → ThemeManager → GreetingDisplay → NameManager → FocusTimer → TimerConfig → TaskList → QuickLinks
    - Set up DOMContentLoaded event listener
    - Set up global error handlers
    - Display error if Local Storage unavailable
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 10.3_
  
  - [ ]* 15.2 Write property test for data change persistence
    - **Property 22: Data Change Persistence**
    - **Validates: Requirements 10.1**
  
  - [ ]* 15.3 Write property test for data retrieval completeness
    - **Property 23: Data Retrieval Completeness**
    - **Validates: Requirements 10.2, 4.12, 5.10**
  
  - [ ]* 15.4 Write integration tests for component interactions
    - Test theme changes affect all components
    - Test name changes update greeting display
    - Test timer duration changes update timer display
    - Test storage unavailability error display
    - _Requirements: 10.3_

- [x] 16. Implement performance optimizations
  - [x] 16.1 Optimize DOM operations and storage access
    - Use document fragments for batch DOM insertions (tasks, links)
    - Cache DOM element references in component state
    - Use event delegation for dynamic elements (task items, link items)
    - Debounce rapid storage writes if needed
    - Clear intervals properly to prevent memory leaks
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 16.2 Write unit tests for performance requirements
    - Test page load displays interface within 500ms
    - Test interaction feedback within 50ms
    - Test data updates within 100ms
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 17. Implement accessibility features
  - [x] 17.1 Add keyboard navigation and ARIA labels
    - Ensure all interactive elements accessible via Tab key
    - Add Enter key activation for buttons
    - Add Escape key cancellation for inline editing
    - Add aria-label to icon-only buttons
    - Add aria-live for timer updates
    - Add visible focus indicators to all interactive elements
    - _Requirements: 11.5_

- [x] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- Unit tests focus on edge cases, error conditions, and integration points
- Manual testing required for browser compatibility (Chrome, Firefox, Edge, Safari)
- Manual testing required for visual design and WCAG AA compliance
- All components use IIFE module pattern for encapsulation
- CSS uses BEM naming convention and CSS variables for theming
- Performance targets: <500ms page load, <50ms interaction feedback, <100ms data updates
