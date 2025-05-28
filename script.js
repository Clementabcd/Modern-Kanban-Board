        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const columnsContainer = document.getElementById('columnsContainer');
            const addColumnBtn = document.getElementById('addColumnBtn');
            const addColumnModal = document.getElementById('addColumnModal');
            const cancelAddColumn = document.getElementById('cancelAddColumn');
            const confirmAddColumn = document.getElementById('confirmAddColumn');
            const newColumnName = document.getElementById('newColumnName');
            
            const addTaskModal = document.getElementById('addTaskModal');
            const cancelAddTask = document.getElementById('cancelAddTask');
            const confirmAddTask = document.getElementById('confirmAddTask');
            const newTaskTitle = document.getElementById('newTaskTitle');
            const newTaskDescription = document.getElementById('newTaskDescription');
            const newTaskPriority = document.getElementById('newTaskPriority');
            const newTaskDueDate = document.getElementById('newTaskDueDate');
            
            const editTaskModal = document.getElementById('editTaskModal');
            const cancelEditTask = document.getElementById('cancelEditTask');
            const confirmEditTask = document.getElementById('confirmEditTask');
            const deleteTask = document.getElementById('deleteTask');
            const editTaskTitle = document.getElementById('editTaskTitle');
            const editTaskDescription = document.getElementById('editTaskDescription');
            const editTaskPriority = document.getElementById('editTaskPriority');
            const editTaskDueDate = document.getElementById('editTaskDueDate');
            const editTaskCompleted = document.getElementById('editTaskCompleted');
            const taskCreatedAt = document.getElementById('taskCreatedAt');
            
            const exportBtn = document.getElementById('exportBtn');
            const importBtn = document.getElementById('importBtn');
            const clearBoardBtn = document.getElementById('clearBoardBtn');
            const fileInput = document.getElementById('fileInput');
            
            const quickAddTaskBtn = document.getElementById('quickAddTaskBtn');
            const quickAddTaskModal = document.getElementById('quickAddTaskModal');
            const quickTaskTitle = document.getElementById('quickTaskTitle');
            const cancelQuickAddTask = document.getElementById('cancelQuickAddTask');
            const confirmQuickAddTask = document.getElementById('confirmQuickAddTask');
            
            const darkModeToggle = document.getElementById('darkModeToggle');
            const toggleCompactView = document.getElementById('toggleCompactView');
            const searchToggle = document.getElementById('searchToggle');
            const searchContainer = document.getElementById('searchContainer');
            const searchInput = document.getElementById('searchInput');
            
            const totalTasksElement = document.getElementById('totalTasks');
            const completedTasksElement = document.getElementById('completedTasks');
            const inProgressTasksElement = document.getElementById('inProgressTasks');

            // State variables
            let currentColumnId = null;
            let currentTaskId = null;
            let selectedTags = [];
            let isDarkMode = localStorage.getItem('darkMode') === 'true';
            let isCompactView = localStorage.getItem('compactView') === 'true';
            let board = {
                columns: []
            };

            // Column colors
            const columnColors = [
                'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700',
                'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700',
                'bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-700',
                'bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700',
                'bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-700',
                'bg-pink-100 border-pink-300 dark:bg-pink-900 dark:border-pink-700',
                'bg-indigo-100 border-indigo-300 dark:bg-indigo-900 dark:border-indigo-700'
            ];

            // Initialize the board
            function initBoard() {
                // Apply saved theme
                applyDarkMode();
                
                // Apply compact view if enabled
                if (isCompactView) {
                    document.body.classList.add('compact-view');
                    toggleCompactView.innerHTML = '<i class="fas fa-expand mr-2"></i> Normal View';
                }
                
                // Load board from localStorage
                const savedBoard = localStorage.getItem('kanbanBoard');
                if (savedBoard) {
                    board = JSON.parse(savedBoard);
                    renderBoard();
                    updateStats();
                } else {
                    // Default board
                    board = {
                        columns: [
                            {
                                id: generateId(),
                                name: 'To Do',
                                color: columnColors[0],
                                tasks: []
                            },
                            {
                                id: generateId(),
                                name: 'In Progress',
                                color: columnColors[1],
                                tasks: []
                            },
                            {
                                id: generateId(),
                                name: 'Done',
                                color: columnColors[2],
                                tasks: []
                            }
                        ]
                    };
                    saveBoard();
                    renderBoard();
                    updateStats();
                }
            }

            // Generate unique ID
            function generateId() {
                return Date.now().toString(36) + Math.random().toString(36).substr(2);
            }

            // Save board to localStorage
            function saveBoard() {
                localStorage.setItem('kanbanBoard', JSON.stringify(board));
                updateStats();
            }

            // Render the board
            function renderBoard(filterText = '') {
                columnsContainer.innerHTML = '';
                
                board.columns.forEach((column, columnIndex) => {
                    const columnElement = document.createElement('div');
                    columnElement.className = `flex-shrink-0 w-72 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 column-${column.id} dark:bg-gray-700 ${isCompactView ? 'compact-column' : ''}`;
                    columnElement.dataset.columnId = column.id;
                    
                    // Filter tasks if search is active
                    const filteredTasks = filterText ? 
                        column.tasks.filter(task => 
                            task.title.toLowerCase().includes(filterText.toLowerCase()) || 
                            (task.description && task.description.toLowerCase().includes(filterText.toLowerCase()))
                        ) : 
                        column.tasks;
                    
                    columnElement.innerHTML = `
                        <div class="p-4 ${column.color} border-b-2 dark:border-gray-600">
                            <div class="flex justify-between items-center">
                                <h3 class="font-semibold text-gray-800 dark:text-white">${column.name} <span class="text-sm font-normal">(${filteredTasks.length}/${column.tasks.length})</span></h3>
                                <div class="flex space-x-2">
                                    <button class="edit-column-btn p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200 transition dark:hover:bg-gray-600">
                                        <i class="fas fa-pen fa-xs"></i>
                                    </button>
                                    <button class="delete-column-btn p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200 transition dark:hover:bg-gray-600">
                                        <i class="fas fa-times fa-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="p-3 h-[400px] overflow-y-auto task-list dark:bg-gray-700" data-column-id="${column.id}">
                            ${filteredTasks.length > 0 ? 
                                filteredTasks.map(task => createTaskCard(task)).join('') : 
                                `<div class="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <i class="fas fa-tasks text-3xl mb-2"></i>
                                    <p>No tasks found</p>
                                </div>`
                            }
                        </div>
                        <div class="p-3 border-t border-gray-200 dark:border-gray-600">
                            <button class="add-task-btn w-full py-2 text-gray-500 hover:text-blue-500 rounded-lg hover:bg-gray-100 transition flex items-center justify-center dark:hover:bg-gray-600" data-column-id="${column.id}">
                                <i class="fas fa-plus mr-2"></i> Add Task
                            </button>
                        </div>
                    `;
                    
                    columnsContainer.appendChild(columnElement);
                });
                
                // Add event listeners after rendering
                addEventListeners();
                
                // Set up drag and drop
                setupDragAndDrop();
            }

            // Create task card HTML
            function createTaskCard(task) {
                const priorityClass = task.priority ? `priority-${task.priority}` : '';
                const isCompleted = task.completed ? 'opacity-70' : '';
                const completedClass = task.completed ? 'line-through' : '';
                
                // Format due date if exists
                let dueDateBadge = '';
                if (task.dueDate) {
                    const dueDate = new Date(task.dueDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    let badgeColor = 'bg-gray-100 text-gray-800';
                    if (dueDate < today && !task.completed) {
                        badgeColor = 'bg-red-100 text-red-800';
                    } else if (dueDate.toDateString() === today.toDateString()) {
                        badgeColor = 'bg-yellow-100 text-yellow-800';
                    }
                    
                    dueDateBadge = `
                        <div class="flex items-center text-xs ${badgeColor} rounded-full px-2 py-1">
                            <i class="fas fa-calendar-day mr-1"></i>
                            ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                    `;
                }
                
                // Create tags badges
                let tagsBadges = '';
                if (task.tags && task.tags.length > 0) {
                    tagsBadges = task.tags.map(tag => {
                        const tagClasses = {
                            'design': 'tag-design',
                            'dev': 'tag-dev',
                            'bug': 'tag-bug',
                            'feature': 'tag-feature',
                            'documentation': 'tag-documentation'
                        };
                        const tagLabels = {
                            'design': 'Design',
                            'dev': 'Dev',
                            'bug': 'Bug',
                            'feature': 'Feature',
                            'documentation': 'Docs'
                        };
                        return `<span class="text-xs ${tagClasses[tag]} rounded-full px-2 py-1">${tagLabels[tag]}</span>`;
                    }).join('');
                }
                
                return `
                    <div class="task-card mb-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer dark:bg-gray-600 dark:border-gray-500 ${priorityClass} ${isCompleted}" data-task-id="${task.id}" draggable="true">
                        <div class="flex justify-between items-start mb-1">
                            <div class="font-medium text-gray-800 dark:text-white ${completedClass}">${task.title}</div>
                            <button class="edit-task-btn p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 transition dark:hover:bg-gray-500">
                                <i class="fas fa-pen fa-xs"></i>
                            </button>
                        </div>
                        ${task.description ? `<div class="text-gray-600 text-sm mb-2 dark:text-gray-300 ${completedClass}">${task.description}</div>` : ''}
                        <div class="flex justify-between items-center">
                            <div class="flex space-x-1">
                                ${tagsBadges}
                            </div>
                            <div>
                                ${dueDateBadge}
                            </div>
                        </div>
                    </div>
                `;
            }

            // Add event listeners
            function addEventListeners() {
                // Add column button
                addColumnBtn.addEventListener('click', () => {
                    addColumnModal.classList.remove('hidden');
                    newColumnName.focus();
                });
                
                cancelAddColumn.addEventListener('click', () => {
                    addColumnModal.classList.add('hidden');
                    newColumnName.value = '';
                });
                
                confirmAddColumn.addEventListener('click', () => {
                    const name = newColumnName.value.trim();
                    if (name) {
                        const randomColor = columnColors[Math.floor(Math.random() * columnColors.length)];
                        board.columns.push({
                            id: generateId(),
                            name,
                            color: randomColor,
                            tasks: []
                        });
                        saveBoard();
                        renderBoard();
                        addColumnModal.classList.add('hidden');
                        newColumnName.value = '';
                    }
                });
                
                // Add task button
                document.querySelectorAll('.add-task-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        currentColumnId = e.target.dataset.columnId || e.target.closest('.add-task-btn').dataset.columnId;
                        addTaskModal.classList.remove('hidden');
                        newTaskTitle.focus();
                        selectedTags = []; // Reset selected tags
                    });
                });
                
                cancelAddTask.addEventListener('click', () => {
                    addTaskModal.classList.add('hidden');
                    newTaskTitle.value = '';
                    newTaskDescription.value = '';
                    newTaskPriority.value = 'medium';
                    newTaskDueDate.value = '';
                    selectedTags = [];
                });
                
                confirmAddTask.addEventListener('click', () => {
                    const title = newTaskTitle.value.trim();
                    if (title && currentColumnId) {
                        const column = board.columns.find(c => c.id === currentColumnId);
                        if (column) {
                            column.tasks.push({
                                id: generateId(),
                                title,
                                description: newTaskDescription.value.trim(),
                                priority: newTaskPriority.value,
                                dueDate: newTaskDueDate.value || null,
                                tags: selectedTags,
                                completed: false,
                                createdAt: new Date().toISOString()
                            });
                            saveBoard();
                            renderBoard();
                            addTaskModal.classList.add('hidden');
                            newTaskTitle.value = '';
                            newTaskDescription.value = '';
                            newTaskPriority.value = 'medium';
                            newTaskDueDate.value = '';
                            selectedTags = [];
                        }
                    }
                });
                
                // Tag selection
                document.querySelectorAll('.tag-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const tag = e.target.dataset.tag;
                        if (selectedTags.includes(tag)) {
                            selectedTags = selectedTags.filter(t => t !== tag);
                            e.target.classList.remove('ring-2', 'ring-blue-500');
                        } else {
                            selectedTags.push(tag);
                            e.target.classList.add('ring-2', 'ring-blue-500');
                        }
                    });
                });
                
                // Edit task button
                document.querySelectorAll('.edit-task-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const taskCard = e.target.closest('.task-card');
                        currentTaskId = taskCard.dataset.taskId;
                        
                        // Find the task
                        let task = null;
                        for (const column of board.columns) {
                            task = column.tasks.find(t => t.id === currentTaskId);
                            if (task) {
                                currentColumnId = column.id;
                                break;
                            }
                        }
                        
                        if (task) {
                            editTaskTitle.value = task.title;
                            editTaskDescription.value = task.description || '';
                            editTaskPriority.value = task.priority || 'medium';
                            editTaskDueDate.value = task.dueDate || '';
                            editTaskCompleted.checked = task.completed || false;
                            
                            // Format creation date
                            if (task.createdAt) {
                                const createdDate = new Date(task.createdAt);
                                taskCreatedAt.textContent = `Created: ${createdDate.toLocaleDateString()} ${createdDate.toLocaleTimeString()}`;
                            } else {
                                taskCreatedAt.textContent = '';
                            }
                            
                            // Highlight selected tags
                            const tagButtons = editTaskModal.querySelectorAll('.tag-btn');
                            tagButtons.forEach(btn => {
                                btn.classList.remove('ring-2', 'ring-blue-500');
                                if (task.tags && task.tags.includes(btn.dataset.tag)) {
                                    btn.classList.add('ring-2', 'ring-blue-500');
                                }
                            });
                            
                            selectedTags = task.tags ? [...task.tags] : [];
                            editTaskModal.classList.remove('hidden');
                        }
                    });
                });
                
                // Task card click
                document.querySelectorAll('.task-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        // Don't trigger if clicking a button inside
                        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
                        
                        currentTaskId = card.dataset.taskId;
                        
                        // Find the task
                        let task = null;
                        for (const column of board.columns) {
                            task = column.tasks.find(t => t.id === currentTaskId);
                            if (task) {
                                currentColumnId = column.id;
                                break;
                            }
                        }
                        
                        if (task) {
                            editTaskTitle.value = task.title;
                            editTaskDescription.value = task.description || '';
                            editTaskPriority.value = task.priority || 'medium';
                            editTaskDueDate.value = task.dueDate || '';
                            editTaskCompleted.checked = task.completed || false;
                            
                            // Format creation date
                            if (task.createdAt) {
                                const createdDate = new Date(task.createdAt);
                                taskCreatedAt.textContent = `Created: ${createdDate.toLocaleDateString()} ${createdDate.toLocaleTimeString()}`;
                            } else {
                                taskCreatedAt.textContent = '';
                            }
                            
                            // Highlight selected tags
                            const tagButtons = editTaskModal.querySelectorAll('.tag-btn');
                            tagButtons.forEach(btn => {
                                btn.classList.remove('ring-2', 'ring-blue-500');
                                if (task.tags && task.tags.includes(btn.dataset.tag)) {
                                    btn.classList.add('ring-2', 'ring-blue-500');
                                }
                            });
                            
                            selectedTags = task.tags ? [...task.tags] : [];
                            editTaskModal.classList.remove('hidden');
                        }
                    });
                });
                
                // Save/delete task
                cancelEditTask.addEventListener('click', () => {
                    editTaskModal.classList.add('hidden');
                });
                
                confirmEditTask.addEventListener('click', () => {
                    const title = editTaskTitle.value.trim();
                    if (title && currentTaskId && currentColumnId) {
                        const column = board.columns.find(c => c.id === currentColumnId);
                        if (column) {
                            const task = column.tasks.find(t => t.id === currentTaskId);
                            if (task) {
                                task.title = title;
                                task.description = editTaskDescription.value.trim();
                                task.priority = editTaskPriority.value;
                                task.dueDate = editTaskDueDate.value || null;
                                task.tags = selectedTags;
                                task.completed = editTaskCompleted.checked;
                                saveBoard();
                                renderBoard();
                                editTaskModal.classList.add('hidden');
                            }
                        }
                    }
                });
                
                deleteTask.addEventListener('click', () => {
                    if (currentTaskId && currentColumnId) {
                        const column = board.columns.find(c => c.id === currentColumnId);
                        if (column) {
                            column.tasks = column.tasks.filter(t => t.id !== currentTaskId);
                            saveBoard();
                            renderBoard();
                            editTaskModal.classList.add('hidden');
                        }
                    }
                });
                
                // Edit/delete column
                document.querySelectorAll('.edit-column-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const columnElement = e.target.closest(`[data-column-id]`);
                    const columnId = columnElement.dataset.columnId;
                    const column = board.columns.find(c => c.id === columnId);
                    
                    if (column) {
                        newColumnName.value = column.name;
                        currentColumnId = columnId;
                        addColumnModal.classList.remove('hidden');
                        // Change button text to "Update"
                        confirmAddColumn.textContent = 'Update';
                        // Temporarily change the event handler
                        const originalHandler = confirmAddColumn.onclick;
                        confirmAddColumn.onclick = function() {
                            const name = newColumnName.value.trim();
                            if (name) {
                                column.name = name;
                                saveBoard();
                                renderBoard();
                                addColumnModal.classList.add('hidden');
                                newColumnName.value = '';
                                // Restore original handler
                                confirmAddColumn.onclick = originalHandler;
                                confirmAddColumn.textContent = 'Add';
                            }
                        };
                    }
                });
            });
            
            document.querySelectorAll('.delete-column-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const columnElement = e.target.closest(`[data-column-id]`);
                    const columnId = columnElement.dataset.columnId;
                    
                    if (confirm('Are you sure you want to delete this column and all its tasks?')) {
                        board.columns = board.columns.filter(c => c.id !== columnId);
                        saveBoard();
                        renderBoard();
                    }
                });
            });
            
            // Quick add task
            quickAddTaskBtn.addEventListener('click', () => {
                quickAddTaskModal.classList.remove('hidden');
                quickTaskTitle.focus();
            });
            
            cancelQuickAddTask.addEventListener('click', () => {
                quickAddTaskModal.classList.add('hidden');
                quickTaskTitle.value = '';
            });
            
            confirmQuickAddTask.addEventListener('click', () => {
                const title = quickTaskTitle.value.trim();
                if (title && board.columns.length > 0) {
                    // Add to first column by default
                    const firstColumn = board.columns[0];
                    firstColumn.tasks.push({
                        id: generateId(),
                        title,
                        description: '',
                        priority: 'medium',
                        dueDate: null,
                        tags: [],
                        completed: false,
                        createdAt: new Date().toISOString()
                    });
                    saveBoard();
                    renderBoard();
                    quickAddTaskModal.classList.add('hidden');
                    quickTaskTitle.value = '';
                }
            });
            
            // Export/Import
            exportBtn.addEventListener('click', () => {
                const dataStr = JSON.stringify(board, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `kanban-board-${new Date().toISOString().slice(0,10)}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
            });
            
            importBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importedBoard = JSON.parse(event.target.result);
                        if (importedBoard && Array.isArray(importedBoard.columns)) {
                            if (confirm('Importing this board will replace your current board. Continue?')) {
                                board = importedBoard;
                                saveBoard();
                                renderBoard();
                            }
                        } else {
                            alert('Invalid file. The format should match an exported Kanban board.');
                        }
                    } catch (error) {
                        alert('Error reading file: ' + error.message);
                    }
                    fileInput.value = '';
                };
                reader.readAsText(file);
            });
            
            // Clear board
            clearBoardBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear the entire board? This cannot be undone.')) {
                    board = {
                        columns: [
                            {
                                id: generateId(),
                                name: 'To Do',
                                color: columnColors[0],
                                tasks: []
                            },
                            {
                                id: generateId(),
                                name: 'In Progress',
                                color: columnColors[1],
                                tasks: []
                            },
                            {
                                id: generateId(),
                                name: 'Done',
                                color: columnColors[2],
                                tasks: []
                            }
                        ]
                    };
                    saveBoard();
                    renderBoard();
                }
            });
            
            // Dark mode toggle
            darkModeToggle.addEventListener('click', () => {
                isDarkMode = !isDarkMode;
                localStorage.setItem('darkMode', isDarkMode);
                applyDarkMode();
            });
            
            // Compact view toggle
            toggleCompactView.addEventListener('click', () => {
                isCompactView = !isCompactView;
                localStorage.setItem('compactView', isCompactView);
                
                if (isCompactView) {
                    document.body.classList.add('compact-view');
                    toggleCompactView.innerHTML = '<i class="fas fa-expand mr-2"></i> Normal View';
                } else {
                    document.body.classList.remove('compact-view');
                    toggleCompactView.innerHTML = '<i class="fas fa-compress mr-2"></i> Compact View';
                }
                
                renderBoard();
            });
            
            // Search functionality
            searchToggle.addEventListener('click', () => {
                searchContainer.classList.toggle('hidden');
                if (!searchContainer.classList.contains('hidden')) {
                    searchInput.focus();
                } else {
                    searchInput.value = '';
                    renderBoard();
                }
            });
            
            searchInput.addEventListener('input', (e) => {
                renderBoard(e.target.value);
            });
        }

        // Apply dark mode
        function applyDarkMode() {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
                darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                darkModeToggle.classList.replace('bg-gray-200', 'bg-gray-700');
                darkModeToggle.classList.replace('text-gray-700', 'text-yellow-300');
            } else {
                document.documentElement.classList.remove('dark');
                darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                darkModeToggle.classList.replace('bg-gray-700', 'bg-gray-200');
                darkModeToggle.classList.replace('text-yellow-300', 'text-gray-700');
            }
        }

        // Update statistics
        function updateStats() {
            let total = 0;
            let completed = 0;
            let inProgress = 0;
            
            board.columns.forEach(column => {
                total += column.tasks.length;
                
                if (column.name.toLowerCase().includes('done')) {
                    completed += column.tasks.length;
                } else if (column.name.toLowerCase().includes('progress')) {
                    inProgress += column.tasks.length;
                }
            });
            
            totalTasksElement.textContent = total;
            completedTasksElement.textContent = completed;
            inProgressTasksElement.textContent = inProgress;
        }

        // Set up drag and drop
        function setupDragAndDrop() {
            const taskLists = document.querySelectorAll('.task-list');
            
            let draggedTask = null;
            let sourceColumn = null;
            
            taskLists.forEach(list => {
                list.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    const afterElement = getDragAfterElement(list, e.clientY);
                    if (afterElement == null) {
                        list.appendChild(draggedTask);
                    } else {
                        list.insertBefore(draggedTask, afterElement);
                    }
                });
                
                list.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    list.classList.add('bg-gray-50', 'dark:bg-gray-600');
                });
                
                list.addEventListener('dragleave', () => {
                    list.classList.remove('bg-gray-50', 'dark:bg-gray-600');
                });
                
                list.addEventListener('drop', (e) => {
                    e.preventDefault();
                    list.classList.remove('bg-gray-50', 'dark:bg-gray-600');
                    
                    if (draggedTask && sourceColumn) {
                        const targetColumnId = list.dataset.columnId;
                        const taskId = draggedTask.dataset.taskId;
                        
                        // Find task in source column
                        const sourceCol = board.columns.find(c => c.id === sourceColumn);
                        const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId);
                        
                        if (taskIndex !== -1) {
                            // Remove task from source column
                            const [task] = sourceCol.tasks.splice(taskIndex, 1);
                            
                            // Find target column
                            const targetCol = board.columns.find(c => c.id === targetColumnId);
                            
                            // Find new position in target column
                            const children = Array.from(list.children);
                            const newIndex = children.indexOf(draggedTask);
                            
                            // Insert task at new position
                            targetCol.tasks.splice(newIndex, 0, task);
                            
                            saveBoard();
                        }
                    }
                });
            });
            
            document.querySelectorAll('.task-card').forEach(task => {
                task.setAttribute('draggable', 'true');
                
                task.addEventListener('dragstart', () => {
                    draggedTask = task;
                    sourceColumn = task.closest('.task-list').dataset.columnId;
                    setTimeout(() => {
                        task.classList.add('opacity-0');
                    }, 0);
                });
                
                task.addEventListener('dragend', () => {
                    task.classList.remove('opacity-0');
                    draggedTask = null;
                    sourceColumn = null;
                });
            });
        }

        // Helper for drag and drop
        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.task-card:not(.opacity-0)')];
            
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        // Initialize the app
        initBoard();
    });
