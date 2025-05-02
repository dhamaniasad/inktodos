// Simple todo list app optimized for e-readers
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const dateDisplay = document.getElementById('current-date');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const storageStatus = document.getElementById('storage-status');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Theme handling
    function initTheme() {
        // Check if user previously set a theme preference
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☾';
        } else if (savedTheme === 'light') {
            document.body.classList.remove('dark-mode');
            themeToggle.textContent = '☀';
        } else {
            // Check system preference using media query if available
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (prefersDark) {
                document.body.classList.add('dark-mode');
                themeToggle.textContent = '☾';
            }
        }
    }
    
    // Toggle theme
    function toggleTheme() {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '☀';
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☾';
        }
    }
    
    // Add event listener to theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Initialize theme
    initTheme();
    
    // Check if localStorage is available
    function checkStorageAvailability() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            storageStatus.textContent = '✓ Storage enabled';
            storageStatus.style.color = 'var(--completed-color)';
            return true;
        } catch (e) {
            storageStatus.textContent = '⚠ Storage disabled';
            storageStatus.style.color = 'black';
            alert('Local storage is not available. Your tasks will not be saved between sessions.');
            return false;
        }
    }
    
    // Run storage check on load
    const isStorageAvailable = checkStorageAvailability();
    
    // Display current date
    function updateDateDisplay() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateDisplay.textContent = now.toLocaleDateString(undefined, options);
    }
    
    // Get a consistent date key (YYYY-MM-DD format)
    function getTodayKey() {
        const now = new Date();
        const year = now.getFullYear();
        // Month is 0-indexed, so we add 1 and pad with 0 if needed
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Load tasks from localStorage with error handling
    function loadTasks() {
        if (!isStorageAvailable) {
            return window._todaysTasks || [];
        }
        
        try {
            const todayKey = getTodayKey();
            let storedTasks = localStorage.getItem('tasks-' + todayKey);
            return storedTasks ? JSON.parse(storedTasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }
    
    // Save tasks to localStorage with error handling
    function saveTasks(tasks) {
        // Keep a copy in memory if localStorage is unavailable
        window._todaysTasks = tasks;
        
        if (!isStorageAvailable) {
            return;
        }
        
        try {
            const todayKey = getTodayKey();
            localStorage.setItem('tasks-' + todayKey, JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            storageStatus.textContent = '⚠ Storage error';
            storageStatus.style.color = 'black';
        }
    }
    
    // Update progress bar
    function updateProgressBar(tasks) {
        const progressBar = document.getElementById('progress-bar');
        if (!progressBar) return;
        
        if (tasks.length === 0) {
            progressBar.style.width = '0%';
            return;
        }
        
        const completedTasks = tasks.filter(task => task.completed).length;
        const percentage = Math.round((completedTasks / tasks.length) * 100);
        
        progressBar.style.width = percentage + '%';
    }
    
    // Render the task list
    function renderTasks() {
        const tasks = loadTasks();
        
        // Update progress bar
        updateProgressBar(tasks);
        
        // Clear the current list
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'task-item empty-list';
            emptyMessage.textContent = 'No tasks for today. Add one above!';
            taskList.appendChild(emptyMessage);
            return;
        }
        
        // Add each task to the list
        tasks.forEach(function(task, index) {
            const taskItem = document.createElement('li');
            taskItem.className = task.completed ? 'task-item completed' : 'task-item';
            taskItem.dataset.index = index;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', function() {
                toggleTaskStatus(index);
            });
            
            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            taskText.textContent = task.text;
            taskText.addEventListener('click', function() {
                toggleTaskStatus(index);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '×';
            deleteBtn.setAttribute('aria-label', 'Delete task');
            deleteBtn.addEventListener('click', function() {
                deleteTask(index);
            });
            
            taskItem.appendChild(checkbox);
            taskItem.appendChild(taskText);
            taskItem.appendChild(deleteBtn);
            
            taskList.appendChild(taskItem);
        });
    }
    
    // Add a new task
    function addTask(text) {
        if (!text.trim()) return;
        
        const tasks = loadTasks();
        tasks.push({
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        });
        
        saveTasks(tasks);
        renderTasks();
    }
    
    // Delete a task
    function deleteTask(index) {
        const tasks = loadTasks();
        tasks.splice(index, 1);
        saveTasks(tasks);
        renderTasks();
    }
    
    // Toggle task completed status
    function toggleTaskStatus(index) {
        const tasks = loadTasks();
        tasks[index].completed = !tasks[index].completed;
        saveTasks(tasks);
        renderTasks();
    }
    
    // Event Listeners
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addTask(taskInput.value);
        taskInput.value = '';
    });
    
    // Initialize the app
    updateDateDisplay();
    renderTasks();
    
    // Archive old tasks (keeps localStorage clean by removing tasks older than 30 days)
    function cleanupOldTasks() {
        if (!isStorageAvailable) {
            return;
        }
        
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            // Create a list of keys to remove (avoids issues with modifying during iteration)
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                if (key && key.startsWith('tasks-')) {
                    try {
                        // Handle both old and new format keys
                        const dateStr = key.replace('tasks-', '');
                        
                        let taskDate;
                        
                        // Try to parse the YYYY-MM-DD format first
                        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const [year, month, day] = dateStr.split('-').map(Number);
                            // Month is 0-indexed in JS Date
                            taskDate = new Date(year, month - 1, day);
                        } 
                        // Try locale format (which might be MM/DD/YYYY or similar)
                        else {
                            taskDate = new Date(dateStr);
                        }
                        
                        if (!isNaN(taskDate.getTime()) && taskDate < thirtyDaysAgo) {
                            keysToRemove.push(key);
                        }
                    } catch (parseError) {
                        console.error('Error parsing date:', parseError);
                        // Skip this key if date parsing failed
                    }
                }
            }
            
            // Remove the old keys
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error during cleanup:', error);
            // Don't let cleanup errors break the app
        }
    }
    
    // Run cleanup once when app loads
    if (isStorageAvailable) {
        cleanupOldTasks();
    }
});