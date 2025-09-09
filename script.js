document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const taskInput = document.getElementById('task-name');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortButtons = document.querySelectorAll('.sort-btn');
    const totalTasksEl = document.getElementById('total-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    const pendingTasksEl = document.getElementById('pending-tasks');
    const modeToggleTop = document.getElementById('mode-toggle');
    const modeToggleBottom = document.getElementById('mode-toggle-bottom');
    const categorySelector = document.getElementById('task-category');
    const prioritySelector = document.getElementById('task-priority');
    const dateInput = document.getElementById('task-date');

    // Variáveis de estado
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let currentSort = 'date';
    let darkMode = localStorage.getItem('darkMode') === 'true';

    // Inicialização
    initApp();

    // Event Listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentFilter = this.dataset.filter;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderTasks();
        });
    });

    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentSort = this.dataset.sort;
            sortButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderTasks();
        });
    });

    modeToggleTop.addEventListener('click', toggleDarkMode);
    modeToggleBottom.addEventListener('click', toggleDarkMode);

    // Funções
    function initApp() {
        // Configurar data mínima como hoje
        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];
        dateInput.min = today.toISOString().split('T')[0];
        
        // Configurar modo escuro
        if (darkMode) {
            document.body.classList.add('light-mode');
            updateModeToggleButtons('sun', 'Modo Claro');
        } else {
            document.body.classList.remove('light-mode');
            updateModeToggleButtons('moon', 'Modo Escuro');
        }
        
        // Renderizar tarefas
        renderTasks();
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            category: categorySelector.value,
            priority: prioritySelector.value,
            date: dateInput.value,
            createdAt: new Date().toISOString()
        };

        tasks.push(task);
        saveTasks();
        renderTasks();

        taskInput.value = '';
        taskInput.focus();
    }

    function renderTasks() {
        let filteredTasks = tasks;
        
        // Aplicar filtro
        if (currentFilter !== 'all') {
            filteredTasks = tasks.filter(task => task.category === currentFilter);
        }
        
        // Aplicar ordenação
        if (currentSort === 'priority') {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        } else if (currentSort === 'date') {
            filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        
        // Atualizar lista
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <li class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Nenhuma tarefa encontrada</p>
                </li>
            `;
        } else {
            taskList.innerHTML = '';
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = 'task-item';
                if (task.completed) {
                    taskItem.classList.add('completed');
                }
                
                const formattedDate = formatDate(task.date);
                
                taskItem.innerHTML = `
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
                    <div class="task-content">
                        <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
                        <div class="task-details">
                            <span class="task-priority priority-${task.priority}">${getPriorityText(task.priority)}</span>
                            <span class="task-category">${getCategoryText(task.category)}</span>
                            ${formattedDate ? `<span><i class="fas fa-calendar"></i> ${formattedDate}</span>` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                taskList.appendChild(taskItem);
            });
        }
        
        // Adicionar event listeners para as novas tarefas
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', function() {
                toggleTask(this.dataset.id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                deleteTask(this.dataset.id);
            });
        });
        
        // Atualizar estatísticas
        updateStats();
    }

    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id == id) {
                task.completed = !task.completed;
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id != id);
        saveTasks();
        renderTasks();
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        totalTasksEl.textContent = `Total: ${total}`;
        completedTasksEl.textContent = `Concluídas: ${completed}`;
        pendingTasksEl.textContent = `Pendentes: ${pending}`;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function toggleDarkMode() {
        darkMode = !darkMode;
        localStorage.setItem('darkMode', darkMode);
        
        if (darkMode) {
            document.body.classList.add('light-mode');
            updateModeToggleButtons('sun', 'Modo Claro');
        } else {
            document.body.classList.remove('light-mode');
            updateModeToggleButtons('moon', 'Modo Escuro');
        }
    }

    function updateModeToggleButtons(icon, text) {
        modeToggleTop.innerHTML = `<i class="fas fa-${icon}"></i> ${text}`;
        modeToggleBottom.innerHTML = `<i class="fas fa-${icon}"></i> ${text}`;
    }

    function getPriorityText(priority) {
        switch(priority) {
            case 'low': return 'Baixa';
            case 'medium': return 'Média';
            case 'high': return 'Alta';
            default: return 'Média';
        }
    }

    function getCategoryText(category) {
        const textMap = {
            'trabalho': 'Trabalho',
            'estudos': 'Estudos',
            'pessoal': 'Pessoal',
            'saude': 'Saúde',
            'outros': 'Outros'
        };
        return textMap[category] || category;
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }
});