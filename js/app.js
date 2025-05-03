// Simple todo list app optimized for e-readers
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const dateDisplay = document.getElementById('current-date');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const storageStatus = document.getElementById('storage-status');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Basic storage check
    let canUseStorage = false;
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        canUseStorage = true;
        storageStatus.textContent = '✓ Storage enabled';
        storageStatus.style.color = 'var(--completed-color)';
    } catch (e) {
        storageStatus.textContent = '⚠ Storage disabled';
        storageStatus.style.color = 'black';
    }
    
    // Ultra-simple dark mode initialization
    if (canUseStorage && localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.textContent = '☾';
    }
    
    // Direct toggle function - the absolute simplest implementation possible
    if (themeToggle) {
        themeToggle.onclick = function() {
            if (document.body.classList.contains('dark-mode')) {
                // Switch to light mode
                document.body.classList.remove('dark-mode');
                themeToggle.textContent = '☀';
                if (canUseStorage) {
                    localStorage.setItem('theme', 'light');
                }
            } else {
                // Switch to dark mode
                document.body.classList.add('dark-mode');
                themeToggle.textContent = '☾';
                if (canUseStorage) {
                    localStorage.setItem('theme', 'dark');
                }
            }
            return false;
        };
    }
    
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
        if (!canUseStorage) {
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
        
        if (!canUseStorage) {
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
            
            // Set final position directly without animation to prevent ghosting
            particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            
            confettiContainer.appendChild(particle);
        }
        
        // Remove the confetti after a short display time
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 800);
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
    
    // Export tasks to TXT file - Server-side with clipboard fallback
    function exportTasksToTxt(e) {
        // Prevent default action for links
        if (e) e.preventDefault();
        
        try {
            const tasks = loadTasks();
            
            if (tasks.length === 0) {
                alert('No tasks to export.');
                return;
            }
            
            // Format the date in a readable way
            const now = new Date();
            const dateString = now.toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Try server-side download first
            const useServerExport = function() {
                // Create a hidden form to post data to server
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/api/export';
                form.target = '_blank'; // Open in new tab for Kindle compatibility
                form.style.display = 'none';
                
                // Create a hidden input for JSON data
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'data';
                input.value = JSON.stringify({
                    tasks: tasks,
                    date: dateString
                });
                
                // Add input to form and form to document
                form.appendChild(input);
                document.body.appendChild(form);
                
                // Submit the form
                form.submit();
                
                // Clean up
                setTimeout(function() {
                    document.body.removeChild(form);
                }, 1000);
            };
            
            // Fallback to clipboard method
            const useClipboardExport = function() {
                // Create the content
                let content = "InkTodos - Tasks for " + dateString + "\r\n";
                content += "----------------------------------------\r\n\r\n";
                
                tasks.forEach((task) => {
                    const status = task.completed ? "[✓]" : "[ ]";
                    const rolledOver = task.rolledOver ? "↻ " : "";
                    content += status + " " + rolledOver + task.text + "\r\n";
                });
                
                content += "\r\n----------------------------------------\r\n";
                content += "Exported from InkTodos\r\n";
                
                // Create the export overlay
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'var(--bg-color)';
                overlay.style.zIndex = '9999';
                overlay.style.padding = '1rem';
                overlay.style.display = 'flex';
                overlay.style.flexDirection = 'column';
                overlay.style.alignItems = 'center';
                
                // Add header
                const header = document.createElement('div');
                header.style.width = '100%';
                header.style.display = 'flex';
                header.style.justifyContent = 'space-between';
                header.style.padding = '0.5rem';
                header.style.marginBottom = '1rem';
                
                const title = document.createElement('h2');
                title.textContent = 'Export Tasks';
                title.style.margin = '0';
                
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.style.padding = '0.5rem 1rem';
                closeButton.style.backgroundColor = 'var(--accent-color)';
                closeButton.style.color = 'var(--bg-color)';
                closeButton.style.border = 'none';
                closeButton.style.borderRadius = '4px';
                closeButton.style.cursor = 'pointer';
                
                header.appendChild(title);
                header.appendChild(closeButton);
                
                // Add instructions
                const instructions = document.createElement('p');
                instructions.textContent = 'Copy the text below to save your tasks:';
                instructions.style.width = '100%';
                instructions.style.marginBottom = '1rem';
                
                // Add text area
                const textArea = document.createElement('textarea');
                textArea.value = content;
                textArea.style.width = '100%';
                textArea.style.height = '70%';
                textArea.style.padding = '0.5rem';
                textArea.style.border = '1px solid var(--light-gray)';
                textArea.style.backgroundColor = 'var(--bg-color)';
                textArea.style.color = 'var(--text-color)';
                textArea.style.resize = 'none';
                textArea.style.fontFamily = 'monospace';
                textArea.style.fontSize = '0.9rem';
                textArea.setAttribute('readonly', 'readonly');
                
                // Add components to the overlay
                overlay.appendChild(header);
                overlay.appendChild(instructions);
                overlay.appendChild(textArea);
                
                // Add the overlay to the document
                document.body.appendChild(overlay);
                
                // Set up the close button
                closeButton.addEventListener('click', function() {
                    document.body.removeChild(overlay);
                });
                
                // Focus and select the text for easy copying
                setTimeout(function() {
                    textArea.focus();
                    textArea.select();
                    
                    // Try to copy automatically if the browser supports it
                    try {
                        const successful = document.execCommand('copy');
                        if (successful) {
                            alert('Text copied to clipboard!');
                        }
                    } catch (err) {
                        // Silent fallback - manual copy still works
                    }
                }, 100);
            };
            
            // Check if we're on Kindle - if yes, directly use clipboard method
            const isKindle = navigator.userAgent.toLowerCase().indexOf('kindle') !== -1;
            
            if (isKindle) {
                // For Kindle, just use the reliable clipboard method
                useClipboardExport();
            } else {
                // For modern browsers, try server-side export with option to fall back
                try {
                    // Ask user which export method they prefer with Kindle warning
                    const useServer = confirm("Export tasks as a file download? (May not work on Kindle browsers. Click Cancel to use clipboard method instead)");
                    
                    if (useServer) {
                        useServerExport();
                    } else {
                        useClipboardExport();
                    }
                } catch (e) {
                    // If anything goes wrong, fall back to clipboard
                    console.error("Server export failed, using clipboard fallback", e);
                    useClipboardExport();
                }
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting tasks. Please try again.');
        }
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
    
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTasksToTxt);
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
        if (!canUseStorage) {
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
        if (!canUseStorage) {
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
    if (canUseStorage) {
        cleanupOldTasks();
    }
});