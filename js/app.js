// Productivity Dashboard Application

// ============================================================================
// Accessibility Manager Module
// ============================================================================
const AccessibilityManager = (() => {
  /**
   * Add keyboard navigation support to buttons
   * @param {HTMLElement} element - Button element
   */
  const addButtonKeyboardSupport = (element) => {
    if (!element) return;
    
    element.addEventListener('keydown', (e) => {
      // Enter key activates button (space is handled by browser)
      if (e.key === 'Enter') {
        e.preventDefault();
        element.click();
      }
    });
  };

  /**
   * Add escape key support for canceling inline editing
   * @param {HTMLElement} element - Input element
   * @param {Function} cancelCallback - Function to call on escape
   */
  const addEscapeKeySupport = (element, cancelCallback) => {
    if (!element || typeof cancelCallback !== 'function') return;
    
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelCallback();
      }
    });
  };

  /**
   * Ensure all interactive elements are keyboard accessible
   */
  const enhanceKeyboardNavigation = () => {
    // Add keyboard support to all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(addButtonKeyboardSupport);
    
    // Add tabindex to make elements focusable if needed
    const interactiveElements = document.querySelectorAll('button, input, a, [tabindex]');
    interactiveElements.forEach(element => {
      if (!element.hasAttribute('tabindex') && element.tagName !== 'INPUT') {
        element.setAttribute('tabindex', '0');
      }
    });
  };

  /**
   * Initialize accessibility features
   */
  const init = () => {
    enhanceKeyboardNavigation();
    
    // Re-enhance when DOM changes (for dynamically added elements)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const buttons = node.querySelectorAll ? node.querySelectorAll('button') : [];
              buttons.forEach(addButtonKeyboardSupport);
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  // Public API
  return {
    init,
    addButtonKeyboardSupport,
    addEscapeKeySupport,
    enhanceKeyboardNavigation
  };
})();

// ============================================================================
// StorageManager Module
// ============================================================================
const StorageManager = (() => {
  // Storage keys constants
  const KEYS = {
    TASKS: 'productivity-tasks',
    LINKS: 'productivity-links',
    THEME: 'productivity-theme',
    NAME: 'productivity-name',
    TIMER_DURATION: 'productivity-timer-duration'
  };

  /**
   * Check if Local Storage is available
   * @returns {boolean} True if Local Storage is available
   */
  const isAvailable = () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * Save data to Local Storage with JSON serialization
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be JSON serialized)
   * @returns {boolean} True if save succeeded, false otherwise
   */
  const save = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded:', e);
      } else {
        console.error('Failed to save to storage:', e);
      }
      return false;
    }
  };

  /**
   * Load data from Local Storage with JSON parsing
   * @param {string} key - Storage key
   * @returns {*} Parsed value or null if not found or error
   */
  const load = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`Failed to parse ${key}:`, e);
      return null;
    }
  };

  /**
   * Remove data from Local Storage
   * @param {string} key - Storage key
   * @returns {boolean} True if remove succeeded, false otherwise
   */
  const remove = (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Failed to remove from storage:', e);
      return false;
    }
  };

  // Public API
  return {
    KEYS,
    isAvailable,
    save,
    load,
    remove
  };
})();
// ============================================================================
// ThemeManager Module
// ============================================================================
const ThemeManager = (() => {
  let currentTheme = 'light';

  /**
   * Apply a specific theme to the document
   * @param {string} theme - Theme to apply ('light' or 'dark')
   */
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    currentTheme = theme;
  };

  /**
   * Initialize theme from storage or default to light
   */
  const init = () => {
    const savedTheme = StorageManager.load(StorageManager.KEYS.THEME);
    const theme = savedTheme || 'light';
    applyTheme(theme);
  };

  /**
   * Toggle between light and dark themes
   */
  const toggle = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    StorageManager.save(StorageManager.KEYS.THEME, newTheme);
  };

  /**
   * Get current theme
   * @returns {string} Current theme ('light' or 'dark')
   */
  const getCurrentTheme = () => {
    return currentTheme;
  };

  // Public API
  return {
    init,
    toggle,
    applyTheme,
    getCurrentTheme
  };
})();

// ============================================================================
// GreetingDisplay Module
// ============================================================================
const GreetingDisplay = (() => {
  let intervalId = null;
  let timeDisplayElement = null; // Cached DOM reference
  let dateDisplayElement = null; // Cached DOM reference
  let greetingMessageElement = null; // Cached DOM reference

  /**
   * Get appropriate greeting based on hour
   * @param {number} hour - Hour in 24-hour format (0-23)
   * @returns {string} Greeting message
   */
  const getGreeting = (hour) => {
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  /**
   * Format time as HH:MM:SS
   * @param {Date} date - Date object
   * @returns {string} Formatted time string
   */
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  /**
   * Format date as human-readable string
   * @param {Date} date - Date object
   * @returns {string} Formatted date string
   */
  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  /**
   * Update time, date, and greeting display using cached DOM references
   */
  const update = () => {
    const now = new Date();
    
    // Cache DOM references on first use
    if (!timeDisplayElement) {
      timeDisplayElement = document.getElementById('time-display');
    }
    if (!dateDisplayElement) {
      dateDisplayElement = document.getElementById('date-display');
    }
    if (!greetingMessageElement) {
      greetingMessageElement = document.getElementById('greeting-message');
    }
    
    // Update time display
    if (timeDisplayElement) {
      timeDisplayElement.textContent = formatTime(now);
    }
    
    // Update date display
    if (dateDisplayElement) {
      dateDisplayElement.textContent = formatDate(now);
    }
    
    // Update greeting message
    if (greetingMessageElement) {
      const hour = now.getHours();
      const greeting = getGreeting(hour);
      const customName = StorageManager.load(StorageManager.KEYS.NAME);
      
      if (customName) {
        greetingMessageElement.textContent = `${greeting}, ${customName}`;
      } else {
        greetingMessageElement.textContent = greeting;
      }
    }
  };

  /**
   * Initialize and start clock
   */
  const init = () => {
    // Cache DOM references
    timeDisplayElement = document.getElementById('time-display');
    dateDisplayElement = document.getElementById('date-display');
    greetingMessageElement = document.getElementById('greeting-message');
    
    // Update immediately
    update();
    
    // Update every second
    intervalId = setInterval(update, 1000);
  };

  /**
   * Stop the clock and cleanup (prevent memory leaks)
   */
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  // Public API
  return {
    init,
    stop,
    update,
    getGreeting,
    formatTime,
    formatDate
  };
})();

// ============================================================================
// NameManager Module
// ============================================================================
const NameManager = (() => {
  /**
   * Get stored name from Local Storage
   * @returns {string|null} Stored name or null if not set
   */
  const getName = () => {
    return StorageManager.load(StorageManager.KEYS.NAME);
  };

  /**
   * Save name to Local Storage
   * @param {string} name - Name to save (will be trimmed)
   */
  const saveName = (name) => {
    const trimmedName = name.trim();
    if (trimmedName) {
      StorageManager.save(StorageManager.KEYS.NAME, trimmedName);
    } else {
      // Allow empty name for removal
      StorageManager.remove(StorageManager.KEYS.NAME);
    }
    // Update greeting display immediately
    GreetingDisplay.update();
  };

  /**
   * Show name input UI
   */
  const showInput = () => {
    const inputContainer = document.getElementById('name-input-container');
    const nameInput = document.getElementById('name-input');
    
    if (inputContainer && nameInput) {
      // Load current name into input
      const currentName = getName();
      nameInput.value = currentName || '';
      
      // Show input container
      inputContainer.hidden = false;
      
      // Focus on input
      nameInput.focus();
    }
  };

  /**
   * Hide name input UI
   */
  const hideInput = () => {
    const inputContainer = document.getElementById('name-input-container');
    const nameInput = document.getElementById('name-input');
    
    if (inputContainer && nameInput) {
      inputContainer.hidden = true;
      nameInput.value = '';
    }
  };

  /**
   * Initialize name input functionality
   */
  const init = () => {
    const editBtn = document.getElementById('name-edit-btn');
    const saveBtn = document.getElementById('name-save-btn');
    const cancelBtn = document.getElementById('name-cancel-btn');
    const nameInput = document.getElementById('name-input');

    // Edit button - show input
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        showInput();
      });
    }

    // Save button - save name and hide input
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (nameInput) {
          saveName(nameInput.value);
          hideInput();
        }
      });
    }

    // Cancel button - hide input without saving
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        hideInput();
      });
    }

    // Enter key in input - save name
    if (nameInput) {
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveName(nameInput.value);
          hideInput();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          hideInput();
        }
      });
    }
  };

  // Public API
  return {
    init,
    getName,
    saveName,
    showInput,
    hideInput
  };
})();

// ============================================================================
// FocusTimer Module
// ============================================================================
const FocusTimer = (() => {
  const DEFAULT_DURATION = 1500; // 25 minutes in seconds
  let remainingSeconds = DEFAULT_DURATION;
  let isRunning = false;
  let intervalId = null;
  let configuredDuration = DEFAULT_DURATION;
  let timerDisplayElement = null; // Cached DOM reference

  /**
   * Format seconds as MM:SS
   * @param {number} seconds - Seconds to format
   * @returns {string} Formatted time string
   */
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  /**
   * Update timer display using cached DOM reference
   */
  const updateDisplay = () => {
    if (!timerDisplayElement) {
      timerDisplayElement = document.getElementById('timer-display');
    }
    
    if (timerDisplayElement) {
      timerDisplayElement.textContent = formatTime(remainingSeconds);
    }
  };

  /**
   * Handle timer completion
   */
  const onComplete = () => {
    stop();
    remainingSeconds = 0;
    updateDisplay();
    
    // Visual indication
    if (timerDisplayElement) {
      timerDisplayElement.style.color = '#4CAF50';
      setTimeout(() => {
        timerDisplayElement.style.color = '';
      }, 2000);
    }
    
    // Alert user
    alert('Focus session complete! Time for a break.');
  };

  /**
   * Update button states based on timer status
   */
  const updateButtonStates = () => {
    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');
    
    if (startBtn) {
      startBtn.disabled = isRunning;
    }
    
    if (stopBtn) {
      stopBtn.disabled = !isRunning;
    }
    
    if (resetBtn) {
      resetBtn.disabled = false; // Reset is always available
    }
  };

  /**
   * Start countdown timer
   */
  const start = () => {
    if (isRunning) return;
    
    isRunning = true;
    intervalId = setInterval(() => {
      remainingSeconds--;
      updateDisplay();
      
      if (remainingSeconds <= 0) {
        onComplete();
      }
    }, 1000);
    
    updateButtonStates();
  };

  /**
   * Stop/pause countdown timer and ensure cleanup
   */
  const stop = () => {
    if (!isRunning) return;
    
    isRunning = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    
    updateButtonStates();
  };

  /**
   * Reset timer to configured duration
   */
  const reset = () => {
    stop();
    remainingSeconds = configuredDuration;
    updateDisplay();
    updateButtonStates();
  };

  /**
   * Initialize timer from storage
   */
  const init = () => {
    // Cache DOM reference
    timerDisplayElement = document.getElementById('timer-display');
    
    // Load custom duration from storage
    const savedDuration = StorageManager.load(StorageManager.KEYS.TIMER_DURATION);
    if (savedDuration && typeof savedDuration === 'number' && savedDuration > 0) {
      configuredDuration = savedDuration;
    } else {
      configuredDuration = DEFAULT_DURATION;
    }
    
    remainingSeconds = configuredDuration;
    updateDisplay();
    updateButtonStates(); // Set initial button states
    
    // Set up event listeners
    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');
    
    if (startBtn) {
      startBtn.addEventListener('click', start);
    }
    
    if (stopBtn) {
      stopBtn.addEventListener('click', stop);
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', reset);
    }
  };

  /**
   * Cleanup function to prevent memory leaks
   */
  const cleanup = () => {
    stop(); // This will clear the interval
  };

  // Public API
  return {
    init,
    cleanup,
    start,
    stop,
    reset,
    updateDisplay,
    formatTime,
    onComplete,
    get remainingSeconds() { return remainingSeconds; },
    get isRunning() { return isRunning; },
    get intervalId() { return intervalId; }
  };
})();

// ============================================================================
// TimerConfig Module
// ============================================================================
const TimerConfig = (() => {
  /**
   * Get configured duration from storage
   * @returns {number} Duration in seconds
   */
  const getDuration = () => {
    const savedDuration = StorageManager.load(StorageManager.KEYS.TIMER_DURATION);
    if (savedDuration && typeof savedDuration === 'number' && savedDuration > 0) {
      return savedDuration;
    }
    return 1500; // Default 25 minutes
  };

  /**
   * Save duration to storage and notify FocusTimer
   * @param {number} minutes - Duration in minutes (max 180 minutes)
   * @returns {boolean} True if save succeeded
   */
  const saveDuration = (minutes) => {
    // Validate input
    const minutesNum = parseInt(minutes, 10);
    if (isNaN(minutesNum) || minutesNum <= 0) {
      alert('Please enter a positive number of minutes.');
      return false;
    }

    // Check maximum limit of 180 minutes (3 hours)
    if (minutesNum > 180) {
      alert('Timer duration cannot exceed 180 minutes (3 hours). Please enter a shorter duration.');
      return false;
    }

    // Convert minutes to seconds
    const seconds = minutesNum * 60;
    
    // Save to storage
    const success = StorageManager.save(StorageManager.KEYS.TIMER_DURATION, seconds);
    
    if (success) {
      // Notify FocusTimer to reload configuration
      if (typeof FocusTimer !== 'undefined' && FocusTimer.init) {
        FocusTimer.init();
      }
    }
    
    return success;
  };

  /**
   * Show configuration UI
   */
  const showConfig = () => {
    const configContainer = document.getElementById('timer-config-container');
    const durationInput = document.getElementById('timer-duration-input');
    
    if (configContainer && durationInput) {
      // Load current duration into input (convert seconds to minutes)
      const currentDuration = getDuration();
      durationInput.value = Math.floor(currentDuration / 60);
      
      // Show config container
      configContainer.hidden = false;
      
      // Focus on input
      durationInput.focus();
    }
  };

  /**
   * Hide configuration UI
   */
  const hideConfig = () => {
    const configContainer = document.getElementById('timer-config-container');
    const durationInput = document.getElementById('timer-duration-input');
    
    if (configContainer && durationInput) {
      configContainer.hidden = true;
      durationInput.value = '';
    }
  };

  /**
   * Initialize timer configuration functionality
   */
  const init = () => {
    const configBtn = document.getElementById('timer-config-btn');
    const saveBtn = document.getElementById('timer-duration-save');
    const cancelBtn = document.getElementById('timer-duration-cancel');
    const durationInput = document.getElementById('timer-duration-input');

    // Config button - show configuration UI
    if (configBtn) {
      configBtn.addEventListener('click', () => {
        showConfig();
      });
    }

    // Save button - save duration and hide config
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (durationInput) {
          const success = saveDuration(durationInput.value);
          if (success) {
            hideConfig();
          }
        }
      });
    }

    // Cancel button - hide config without saving
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        hideConfig();
      });
    }

    // Enter key in input - save duration
    if (durationInput) {
      durationInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const success = saveDuration(durationInput.value);
          if (success) {
            hideConfig();
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          hideConfig();
        }
      });
    }
  };

  // Public API
  return {
    init,
    getDuration,
    saveDuration,
    showConfig,
    hideConfig
  };
})();

// ============================================================================
// TaskList Module
// ============================================================================
const TaskList = (() => {
  let tasks = [];
  let taskListElement = null; // Cached DOM reference
  let saveTimeout = null; // For debouncing storage writes

  /**
   * Debounced save to prevent rapid storage writes
   * @returns {boolean} True if save succeeded
   */
  const debouncedSave = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    saveTimeout = setTimeout(() => {
      StorageManager.save(StorageManager.KEYS.TASKS, tasks);
      saveTimeout = null;
    }, 100); // 100ms debounce
    
    return true;
  };

  /**
   * Load tasks from Local Storage
   */
  const loadTasks = () => {
    const savedTasks = StorageManager.load(StorageManager.KEYS.TASKS);
    if (savedTasks && Array.isArray(savedTasks)) {
      tasks = savedTasks;
    } else {
      tasks = [];
    }
  };

  /**
   * Save tasks to Local Storage
   * @returns {boolean} True if save succeeded
   */
  const saveTasks = () => {
    return StorageManager.save(StorageManager.KEYS.TASKS, tasks);
  };

  /**
   * Add a new task with duplicate validation
   * @param {string} text - Task text
   * @returns {object} Result object with success status and error message
   */
  const addTask = (text) => {
    // Validate task text is non-empty after trimming
    const trimmedText = text.trim();
    if (!trimmedText) {
      return { success: false, error: 'Task text cannot be empty.' };
    }

    // Check for duplicate task names (case-insensitive)
    const isDuplicate = tasks.some(task => 
      task.text.toLowerCase() === trimmedText.toLowerCase()
    );
    
    if (isDuplicate) {
      return { success: false, error: 'A task with this name already exists. Please choose a different name.' };
    }

    // Create task with unique ID (timestamp-based)
    const task = {
      id: Date.now().toString(),
      text: trimmedText,
      completed: false,
      createdAt: Date.now()
    };

    tasks.push(task);
    debouncedSave(); // Use debounced save
    render();
    return { success: true };
  };

  /**
   * Edit task text with duplicate validation
   * @param {string} id - Task ID
   * @param {string} newText - New task text
   * @returns {object} Result object with success status and error message
   */
  const editTask = (id, newText) => {
    // Validate new text is non-empty after trimming
    const trimmedText = newText.trim();
    if (!trimmedText) {
      return { success: false, error: 'Task text cannot be empty.' };
    }

    const task = tasks.find(t => t.id === id);
    if (task) {
      // Check for duplicate task names (case-insensitive), excluding the current task
      const isDuplicate = tasks.some(t => 
        t.id !== id && t.text.toLowerCase() === trimmedText.toLowerCase()
      );
      
      if (isDuplicate) {
        return { success: false, error: 'A task with this name already exists. Please choose a different name.' };
      }

      task.text = trimmedText;
      debouncedSave(); // Use debounced save
      render();
      return { success: true };
    }
    return { success: false, error: 'Task not found.' };
  };

  /**
   * Toggle task completion status
   * @param {string} id - Task ID
   */
  const toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      // Toggle the completion status
      task.completed = !task.completed;
      
      // Save to storage
      debouncedSave();
      
      // Re-render to update task position and styling
      render();
    }
  };

  /**
   * Delete a task
   * @param {string} id - Task ID
   */
  const deleteTask = (id) => {
    tasks = tasks.filter(t => t.id !== id);
    debouncedSave(); // Use debounced save
    render();
  };

  /**
   * Create a single task element
   * @param {Object} task - Task object
   * @returns {HTMLElement} Task list item element
   */
  const createTaskElement = (task) => {
    const li = document.createElement('li');
    li.className = 'tasks__item';
    li.dataset.taskId = task.id;

    // Apply visual distinction for completed tasks
    if (task.completed) {
      li.classList.add('tasks__item--completed');
    }

    // Create task content
    const taskContent = document.createElement('div');
    taskContent.className = 'tasks__content';

    // Checkbox for completion toggle
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'tasks__checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark task "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
    
    // Add direct event listener to checkbox
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      toggleTask(task.id);
    });

    // Task text
    const taskText = document.createElement('span');
    taskText.className = 'tasks__text';
    taskText.textContent = task.text;

    // Task controls
    const controls = document.createElement('div');
    controls.className = 'tasks__controls';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn--small tasks__edit-btn';
    editBtn.textContent = '✏️';
    editBtn.setAttribute('aria-label', `Edit task "${task.text}"`);
    editBtn.dataset.action = 'edit';
    editBtn.dataset.taskId = task.id;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--small btn--danger tasks__delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.setAttribute('aria-label', `Delete task "${task.text}"`);
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.taskId = task.id;

    controls.appendChild(editBtn);
    controls.appendChild(deleteBtn);

    taskContent.appendChild(checkbox);
    taskContent.appendChild(taskText);
    taskContent.appendChild(controls);

    li.appendChild(taskContent);
    return li;
  };

  /**
   * Render all tasks with completed tasks at bottom, incomplete at top
   */
  const render = () => {
    if (!taskListElement) {
      taskListElement = document.getElementById('task-list');
    }
    
    if (!taskListElement) return;

    // Clear existing tasks
    taskListElement.innerHTML = '';

    // Check if there are no tasks
    if (tasks.length === 0) {
      const emptyState = document.createElement('li');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <div class="empty-state__icon">📝</div>
        <div>No tasks yet. Add your first task above!</div>
      `;
      taskListElement.appendChild(emptyState);
      return;
    }

    // Sort tasks: incomplete first (by creation order), then completed (by creation order)
    const incompleteTasks = tasks.filter(task => !task.completed).sort((a, b) => a.createdAt - b.createdAt);
    const completedTasks = tasks.filter(task => task.completed).sort((a, b) => a.createdAt - b.createdAt);

    // Use document fragment for batch DOM insertion
    const fragment = document.createDocumentFragment();

    // Add incomplete tasks
    incompleteTasks.forEach(task => {
      const taskElement = createTaskElement(task);
      fragment.appendChild(taskElement);
    });

    // Add separator if there are both incomplete and completed tasks
    if (incompleteTasks.length > 0 && completedTasks.length > 0) {
      const separator = document.createElement('li');
      separator.className = 'tasks__separator';
      separator.innerHTML = '<div class="tasks__separator-line"><span class="tasks__separator-text">Completed</span></div>';
      fragment.appendChild(separator);
    }

    // Add completed tasks
    completedTasks.forEach(task => {
      const taskElement = createTaskElement(task);
      fragment.appendChild(taskElement);
    });

    // Single DOM insertion
    taskListElement.appendChild(fragment);
  };

  /**
   * Show inline editing UI for a task
   * @param {string} id - Task ID
   * @param {HTMLElement} li - List item element
   */
  const showEditUI = (id, li) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Clear existing content
    li.innerHTML = '';

    // Create edit form
    const editForm = document.createElement('div');
    editForm.className = 'tasks__edit-form';

    // Edit input
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'tasks__edit-input';
    editInput.value = task.text;
    editInput.setAttribute('aria-label', 'Edit task text');

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn--small';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      const result = editTask(id, editInput.value);
      if (!result.success) {
        alert(result.error);
      }
    });

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn--small btn--secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      render();
    });

    // Enter key to save, Escape to cancel
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const result = editTask(id, editInput.value);
        if (!result.success) {
          alert(result.error);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        render();
      }
    });

    editForm.appendChild(editInput);
    editForm.appendChild(saveBtn);
    editForm.appendChild(cancelBtn);

    li.appendChild(editForm);

    // Focus on input
    editInput.focus();
    editInput.select();
  };

  /**
   * Handle task list events using event delegation
   * @param {Event} e - Event object
   */
  const handleTaskListEvents = (e) => {
    const target = e.target;
    const taskId = target.dataset.taskId;
    
    if (!taskId) return;

    // Handle button clicks
    if (target.tagName === 'BUTTON') {
      const action = target.dataset.action;
      
      if (action === 'edit') {
        const li = target.closest('.tasks__item');
        if (li) {
          showEditUI(taskId, li);
        }
      } else if (action === 'delete') {
        if (confirm('Are you sure you want to delete this task?')) {
          deleteTask(taskId);
        }
      }
    }
  };

  /**
   * Initialize task list with event delegation
   */
  const init = () => {
    // Cache DOM reference
    taskListElement = document.getElementById('task-list');
    
    // Load tasks from storage
    loadTasks();

    // Render tasks
    render();

    // Set up event delegation for task list (buttons only now)
    if (taskListElement) {
      taskListElement.addEventListener('click', handleTaskListEvents);
    }

    // Set up form submission
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');

    if (taskForm && taskInput) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Remove any existing error styling
        taskInput.classList.remove('tasks__input--error');
        
        const result = addTask(taskInput.value);
        if (result.success) {
          taskInput.value = '';
        } else {
          // Add error styling and show alert
          taskInput.classList.add('tasks__input--error');
          alert(result.error);
          
          // Remove error styling after a few seconds
          setTimeout(() => {
            taskInput.classList.remove('tasks__input--error');
          }, 3000);
        }
      });
      
      // Remove error styling when user starts typing
      taskInput.addEventListener('input', () => {
        taskInput.classList.remove('tasks__input--error');
      });
    }
  };

  /**
   * Cleanup function to clear timeouts and prevent memory leaks
   */
  const cleanup = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    
    // Remove event listeners
    if (taskListElement) {
      taskListElement.removeEventListener('click', handleTaskListEvents);
      taskListElement.removeEventListener('change', handleTaskListEvents);
    }
  };

  // Public API
  return {
    init,
    cleanup,
    loadTasks,
    addTask,
    editTask,
    toggleTask,
    deleteTask,
    render,
    saveTasks,
    get tasks() { return tasks; }
  };
})();

// ============================================================================
// QuickLinks Module
// ============================================================================
const QuickLinks = (() => {
  let links = [];
  let linkListElement = null; // Cached DOM reference
  let saveTimeout = null; // For debouncing storage writes

  /**
   * Debounced save to prevent rapid storage writes
   * @returns {boolean} True if save succeeded
   */
  const debouncedSave = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    saveTimeout = setTimeout(() => {
      StorageManager.save(StorageManager.KEYS.LINKS, links);
      saveTimeout = null;
    }, 100); // 100ms debounce
    
    return true;
  };

  /**
   * Validate URL format (must start with http:// or https://)
   * @param {string} url - URL to validate
   * @returns {boolean} True if URL is valid
   */
  const isValidUrl = (url) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  /**
   * Load links from Local Storage
   */
  const loadLinks = () => {
    const savedLinks = StorageManager.load(StorageManager.KEYS.LINKS);
    if (savedLinks && Array.isArray(savedLinks)) {
      links = savedLinks;
    } else {
      links = [];
    }
  };

  /**
   * Save links to Local Storage
   * @returns {boolean} True if save succeeded
   */
  const saveLinks = () => {
    return StorageManager.save(StorageManager.KEYS.LINKS, links);
  };

  /**
   * Add a new link
   * @param {string} name - Link name
   * @param {string} url - Link URL
   * @returns {boolean} True if link was added
   */
  const addLink = (name, url) => {
    // Validate link name is non-empty after trimming
    const trimmedName = name.trim();
    if (!trimmedName) {
      return false;
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      alert('URL must start with http:// or https://');
      return false;
    }

    // Create link with unique ID (timestamp-based)
    const link = {
      id: Date.now().toString(),
      name: trimmedName,
      url: url,
      createdAt: Date.now()
    };

    links.push(link);
    debouncedSave(); // Use debounced save
    render();
    return true;
  };

  /**
   * Edit link data
   * @param {string} id - Link ID
   * @param {string} name - New link name
   * @param {string} url - New link URL
   * @returns {boolean} True if link was edited
   */
  const editLink = (id, name, url) => {
    // Validate name is non-empty after trimming
    const trimmedName = name.trim();
    if (!trimmedName) {
      return false;
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      alert('URL must start with http:// or https://');
      return false;
    }

    const link = links.find(l => l.id === id);
    if (link) {
      link.name = trimmedName;
      link.url = url;
      debouncedSave(); // Use debounced save
      render();
      return true;
    }
    return false;
  };

  /**
   * Delete a link
   * @param {string} id - Link ID
   */
  const deleteLink = (id) => {
    links = links.filter(l => l.id !== id);
    debouncedSave(); // Use debounced save
    render();
  };

  /**
   * Create a single link element
   * @param {Object} link - Link object
   * @returns {HTMLElement} Link list item element
   */
  const createLinkElement = (link) => {
    const li = document.createElement('li');
    li.className = 'links__item';
    li.dataset.linkId = link.id;

    // Create link content
    const linkContent = document.createElement('div');
    linkContent.className = 'links__content';

    // Link anchor (opens in new tab)
    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.className = 'links__anchor';
    anchor.textContent = link.name;
    anchor.setAttribute('aria-label', `Open ${link.name} in new tab`);

    // Link controls
    const controls = document.createElement('div');
    controls.className = 'links__controls';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn--small links__edit-btn';
    editBtn.textContent = '✏️';
    editBtn.setAttribute('aria-label', `Edit link "${link.name}"`);
    editBtn.dataset.action = 'edit';
    editBtn.dataset.linkId = link.id;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--small btn--danger links__delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.setAttribute('aria-label', `Delete link "${link.name}"`);
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.linkId = link.id;

    controls.appendChild(editBtn);
    controls.appendChild(deleteBtn);

    linkContent.appendChild(anchor);
    linkContent.appendChild(controls);

    li.appendChild(linkContent);
    return li;
  };

  /**
   * Render all links using document fragment for batch insertion
   */
  const render = () => {
    if (!linkListElement) {
      linkListElement = document.getElementById('link-list');
    }
    
    if (!linkListElement) return;

    // Clear existing links
    linkListElement.innerHTML = '';

    // Check if there are no links
    if (links.length === 0) {
      const emptyState = document.createElement('li');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <div class="empty-state__icon">🔗</div>
        <div>No quick links yet. Add your first link above!</div>
      `;
      linkListElement.appendChild(emptyState);
      return;
    }

    // Use document fragment for batch DOM insertion
    const fragment = document.createDocumentFragment();

    // Create all link elements and add to fragment
    links.forEach(link => {
      const linkElement = createLinkElement(link);
      fragment.appendChild(linkElement);
    });

    // Single DOM insertion
    linkListElement.appendChild(fragment);
  };

  /**
   * Show inline editing UI for a link
   * @param {string} id - Link ID
   * @param {HTMLElement} li - List item element
   */
  const showEditUI = (id, li) => {
    const link = links.find(l => l.id === id);
    if (!link) return;

    // Clear existing content
    li.innerHTML = '';

    // Create edit form
    const editForm = document.createElement('div');
    editForm.className = 'links__edit-form';

    // Edit name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'links__edit-input';
    nameInput.value = link.name;
    nameInput.placeholder = 'Link name';
    nameInput.setAttribute('aria-label', 'Edit link name');

    // Edit URL input
    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'links__edit-input';
    urlInput.value = link.url;
    urlInput.placeholder = 'https://...';
    urlInput.setAttribute('aria-label', 'Edit link URL');

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn--small';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      const success = editLink(id, nameInput.value, urlInput.value);
      if (!success) {
        alert('Link name cannot be empty and URL must be valid.');
      }
    });

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn--small btn--secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      render();
    });

    // Enter key to save, Escape to cancel
    const handleKeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const success = editLink(id, nameInput.value, urlInput.value);
        if (!success) {
          alert('Link name cannot be empty and URL must be valid.');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        render();
      }
    };

    nameInput.addEventListener('keydown', handleKeydown);
    urlInput.addEventListener('keydown', handleKeydown);

    editForm.appendChild(nameInput);
    editForm.appendChild(urlInput);
    editForm.appendChild(saveBtn);
    editForm.appendChild(cancelBtn);

    li.appendChild(editForm);

    // Focus on name input
    nameInput.focus();
    nameInput.select();
  };

  /**
   * Handle link list events using event delegation
   * @param {Event} e - Event object
   */
  const handleLinkListEvents = (e) => {
    const target = e.target;
    const linkId = target.dataset.linkId;
    
    if (!linkId) return;

    // Handle button clicks
    if (target.tagName === 'BUTTON') {
      const action = target.dataset.action;
      
      if (action === 'edit') {
        const li = target.closest('.links__item');
        if (li) {
          showEditUI(linkId, li);
        }
      } else if (action === 'delete') {
        if (confirm('Are you sure you want to delete this link?')) {
          deleteLink(linkId);
        }
      }
    }
  };

  /**
   * Initialize quick links with event delegation
   */
  const init = () => {
    // Cache DOM reference
    linkListElement = document.getElementById('link-list');
    
    // Load links from storage
    loadLinks();

    // Render links
    render();

    // Set up event delegation for link list
    if (linkListElement) {
      linkListElement.addEventListener('click', handleLinkListEvents);
    }

    // Set up form submission
    const linkForm = document.getElementById('link-form');
    const nameInput = document.getElementById('link-name-input');
    const urlInput = document.getElementById('link-url-input');

    if (linkForm && nameInput && urlInput) {
      linkForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const success = addLink(nameInput.value, urlInput.value);
        if (success) {
          nameInput.value = '';
          urlInput.value = '';
        } else {
          alert('Link name cannot be empty.');
        }
      });
    }
  };

  /**
   * Cleanup function to clear timeouts and prevent memory leaks
   */
  const cleanup = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    
    // Remove event listeners
    if (linkListElement) {
      linkListElement.removeEventListener('click', handleLinkListEvents);
    }
  };

  // Public API
  return {
    init,
    cleanup,
    loadLinks,
    addLink,
    editLink,
    deleteLink,
    render,
    saveLinks,
    get links() { return links; }
  };
})();

// ============================================================================
// App Module
// ============================================================================
const App = (() => {
  /**
   * Check browser compatibility
   * @returns {boolean} True if browser is compatible
   */
  const checkCompatibility = () => {
    if (!StorageManager.isAvailable()) {
      showError('Data persistence is not available. Your changes will not be saved.');
      return false;
    }
    return true;
  };

  /**
   * Show error message to user
   * @param {string} message - Error message to display
   */
  const showError = (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #f44336; color: white; padding: 16px 24px; border-radius: 4px; z-index: 1000;';
    document.body.appendChild(errorDiv);
  };

  /**
   * Cleanup all modules to prevent memory leaks
   */
  const cleanup = () => {
    // Stop all intervals and clear timeouts
    if (typeof GreetingDisplay !== 'undefined' && GreetingDisplay.stop) {
      GreetingDisplay.stop();
    }
    
    if (typeof FocusTimer !== 'undefined' && FocusTimer.cleanup) {
      FocusTimer.cleanup();
    }
    
    if (typeof TaskList !== 'undefined' && TaskList.cleanup) {
      TaskList.cleanup();
    }
    
    if (typeof QuickLinks !== 'undefined' && QuickLinks.cleanup) {
      QuickLinks.cleanup();
    }
  };

  /**
   * Initialize application
   */
  const init = () => {
    // Check compatibility first
    if (!checkCompatibility()) {
      return; // Stop initialization if not compatible
    }

    // Set up global error handlers
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      showError('An unexpected error occurred. Please refresh the page.');
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      showError('An unexpected error occurred. Please refresh the page.');
    });

    // Set up cleanup on page unload to prevent memory leaks
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('unload', cleanup);

    // Initialize components in correct order:
    // StorageManager → ThemeManager → GreetingDisplay → NameManager → FocusTimer → TimerConfig → TaskList → QuickLinks → AccessibilityManager
    
    // StorageManager is already available (no init needed)
    
    // Initialize ThemeManager
    ThemeManager.init();

    // Initialize GreetingDisplay
    GreetingDisplay.init();

    // Initialize NameManager
    NameManager.init();

    // Initialize FocusTimer
    FocusTimer.init();

    // Initialize TimerConfig
    TimerConfig.init();

    // Initialize TaskList
    TaskList.init();

    // Initialize QuickLinks
    QuickLinks.init();

    // Initialize AccessibilityManager
    AccessibilityManager.init();

    // Set up theme toggle button
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      const toggleTheme = () => {
        ThemeManager.toggle();
        // Update icon based on theme
        const icon = themeToggleBtn.querySelector('.theme-icon');
        if (icon) {
          icon.textContent = ThemeManager.getCurrentTheme() === 'dark' ? '☀️' : '🌙';
        }
        // Update aria-label for better accessibility
        const currentTheme = ThemeManager.getCurrentTheme();
        themeToggleBtn.setAttribute('aria-label', 
          `Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} theme`);
      };
      
      themeToggleBtn.addEventListener('click', toggleTheme);
      
      // Add keyboard support
      themeToggleBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
      
      // Set initial aria-label
      const currentTheme = ThemeManager.getCurrentTheme();
      themeToggleBtn.setAttribute('aria-label', 
        `Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} theme`);
    }
  };

  // Public API
  return {
    init,
    cleanup,
    checkCompatibility,
    showError
  };
})();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Export modules for testing (if in test environment)
if (typeof window !== 'undefined') {
  window.AccessibilityManager = AccessibilityManager;
  window.StorageManager = StorageManager;
  window.ThemeManager = ThemeManager;
  window.GreetingDisplay = GreetingDisplay;
  window.NameManager = NameManager;
  window.FocusTimer = FocusTimer;
  window.TimerConfig = TimerConfig;
  window.TaskList = TaskList;
  window.QuickLinks = QuickLinks;
  window.App = App;
}
