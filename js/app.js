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
        
        // Update Clear button visibility
        updateClearButtonVisibility();
        
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
            let className = task.completed ? 'task-item completed' : 'task-item';
            if (task.rolledOver) {
                className += ' rolled-over';
            }
            taskItem.className = className;
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
    
    // Simple confetti animation
    function showConfetti(x, y) {
        // Create confetti container
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        confettiContainer.style.position = 'absolute';
        confettiContainer.style.left = x + 'px';
        confettiContainer.style.top = y + 'px';
        confettiContainer.style.pointerEvents = 'none';
        document.body.appendChild(confettiContainer);
        
        // Create confetti pieces
        const colors = ['#555', '#777', '#999', '#bbb'];
        const shapes = ['●', '■', '★', '✦'];
        
        // Number of particles (keeping it minimal for e-ink displays)
        const particleCount = 10;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.textContent = shapes[Math.floor(Math.random() * shapes.length)];
            particle.style.position = 'absolute';
            particle.style.color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.fontSize = (Math.random() * 10 + 8) + 'px';
            
            // Random starting position around the center
            particle.style.left = (Math.random() * 20 - 10) + 'px';
            particle.style.top = (Math.random() * 20 - 10) + 'px';
            
            // Random movement
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40 + 10;
            const duration = Math.random() * 1000 + 500;
            
            // Apply animation
            particle.animate([
                { transform: 'translate(0, 0)' },
                { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)` }
            ], {
                duration: duration,
                easing: 'ease-out',
                fill: 'forwards'
            });
            
            confettiContainer.appendChild(particle);
        }
        
        // Remove the confetti after animation completes
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 1500);
    }

    // Toggle task completed status
    function toggleTaskStatus(index) {
        const tasks = loadTasks();
        const wasCompleted = tasks[index].completed;
        tasks[index].completed = !wasCompleted;
        saveTasks(tasks);
        
        // Show confetti only when completing a task (not when unchecking)
        if (!wasCompleted) {
            // Find the corresponding element in the DOM
            const taskElement = document.querySelector(`#task-list li[data-index="${index}"]`);
            if (taskElement) {
                const rect = taskElement.getBoundingClientRect();
                showConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }
        }
        
        renderTasks();
    }
    
    // Clear all rolled over tasks
    function clearPendingTasks() {
        const tasks = loadTasks();
        // Keep all tasks that are either completed OR not rolled over
        const filteredTasks = tasks.filter(task => task.completed || !task.rolledOver);
        saveTasks(filteredTasks);
        renderTasks();
    }
    
    // Show or hide clear button depending on if we have rolled over tasks
    function updateClearButtonVisibility() {
        const clearPendingBtn = document.getElementById('clear-pending-btn');
        if (!clearPendingBtn) return;
        
        const tasks = loadTasks();
        const hasRolledOverTasks = tasks.some(task => task.rolledOver && !task.completed);
        
        clearPendingBtn.style.display = hasRolledOverTasks ? 'block' : 'none';
    }
    
    // Event Listeners
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addTask(taskInput.value);
        taskInput.value = '';
    });
    
    const clearPendingBtn = document.getElementById('clear-pending-btn');
    if (clearPendingBtn) {
        clearPendingBtn.addEventListener('click', clearPendingTasks);
    }
    
    // Get yesterday's date key
    function getYesterdayKey() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const year = yesterday.getFullYear();
        const month = String(yesterday.getMonth() + 1).padStart(2, '0');
        const day = String(yesterday.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Rollover uncompleted tasks from yesterday
    function rolloverTasks() {
        if (!isStorageAvailable) {
            return;
        }
        
        try {
            // First, check if we already did rollover today
            const todayKey = getTodayKey();
            const rolloverFlagKey = 'rollover-done-' + todayKey;
            
            // If we already did the rollover today, don't do it again
            if (localStorage.getItem(rolloverFlagKey)) {
                return;
            }
            
            const yesterdayKey = getYesterdayKey();
            const storedYesterdayTasks = localStorage.getItem('tasks-' + yesterdayKey);
            
            if (storedYesterdayTasks) {
                const yesterdayTasks = JSON.parse(storedYesterdayTasks);
                const uncompletedTasks = yesterdayTasks.filter(task => !task.completed);
                
                if (uncompletedTasks.length > 0) {
                    // Get today's tasks
                    const todayTasks = loadTasks();
                    
                    // Add uncompleted tasks to today's list
                    uncompletedTasks.forEach(task => {
                        // Add a note that this was rolled over
                        task.rolledOver = true;
                        todayTasks.push(task);
                    });
                    
                    // Save the updated task list
                    saveTasks(todayTasks);
                }
            }
            
            // Mark that we've done the rollover for today
            localStorage.setItem(rolloverFlagKey, 'true');
        } catch (error) {
            console.error('Error rolling over tasks:', error);
        }
    }

    // Initialize the app
    updateDateDisplay();
    rolloverTasks();
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
                
                // Clean up tasks and rollover flags that are older than 30 days
                if (key && (key.startsWith('tasks-') || key.startsWith('rollover-done-'))) {
                    try {
                        // Handle both old and new format keys
                        const dateStr = key.replace('tasks-', '').replace('rollover-done-', '');
                        
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