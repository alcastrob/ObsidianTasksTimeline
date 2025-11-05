/**
 * Tasks Timeline - Dataview View v2.0
 * 
 * Uso:
 * ```dataviewjs
 * await dv.view("tasks-timeline", {filter: "Proyectos/"})
 * ```
 */

// Identificador único para esta instancia
const timelineId = 'tasks-timeline-' + Date.now();

// CSS embebido directamente en el código
const cssId = 'tasks-timeline-css-v18';

// Eliminar versiones antiguas del CSS
const oldCssVersions = [];
for (let i = 0; i <= 17; i++) {
    if (i === 0) oldCssVersions.push('tasks-timeline-css');
    else oldCssVersions.push(`tasks-timeline-css-v${i}`);
}
oldCssVersions.forEach(oldId => {
    const oldStyle = document.getElementById(oldId);
    if (oldStyle) oldStyle.remove();
});

if (!document.getElementById(cssId)) {
    const style = document.createElement('style');
    style.id = cssId;
    style.textContent = `
/* Tasks Timeline Full Width */
.tasks-timeline-container {
    width: 100vw !important;
    max-width: 100vw !important;
    margin-left: calc(50% - 50vw) !important;
    margin-right: calc(50% - 50vw) !important;
    padding: 20px 50px !important;
    background: var(--background-primary);
    font-family: var(--font-interface);
    box-sizing: border-box;
}

.tasks-timeline-container * {
    box-sizing: border-box;
}

.timeline-main {
    display: flex !important;
    gap: 15px !important;
    margin: 0;
    padding: 10px 0;
    overflow-x: auto;
    min-height: 400px;
}

.day-container {
    flex: 1 1 0 !important;
    min-width: 220px !important;
    max-width: none !important;
    background: var(--background-secondary);
    border-radius: 12px;
    padding: 16px;
    border: 2px solid var(--background-modifier-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
}

.day-container:hover {
    border-color: var(--interactive-accent);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.overdue-container {
    border-color: rgba(255, 100, 100, 0.5);
    background: linear-gradient(135deg, var(--background-secondary) 0%, rgba(255, 100, 100, 0.05) 100%);
}

.overdue-container:hover {
    border-color: rgba(255, 100, 100, 0.8);
}

.overdue-container .day-label {
    color: #ff6464;
}

.no-date-container {
    border-color: rgba(150, 150, 150, 0.5);
    background: linear-gradient(135deg, var(--background-secondary) 0%, rgba(150, 150, 150, 0.05) 100%);
}

.no-date-container:hover {
    border-color: rgba(150, 150, 150, 0.8);
}

.no-date-container .day-label {
    color: var(--text-muted);
}

.day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--background-modifier-border);
    flex-shrink: 0;
}

.day-label {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-accent);
}

.day-date {
    font-size: 11px;
    color: var(--text-muted);
    background: var(--background-primary);
    padding: 4px 8px;
    border-radius: 4px;
}

.tasks-list {
    flex: 1;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
}

.tasks-list.droppable {
    border: 2px dashed transparent;
    border-radius: 8px;
    padding: 8px;
    transition: all 0.3s ease;
}

.tasks-list.drag-over {
    border-color: var(--interactive-accent);
    background: var(--background-modifier-hover);
}

.empty-message {
    text-align: center;
    color: var(--text-muted);
    font-style: italic;
    padding: 40px 10px;
    font-size: 12px;
}

.task-item {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px;
    padding: 10px;
    cursor: grab;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.task-item:hover {
    border-color: var(--interactive-accent);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.task-item:active {
    cursor: grabbing;
}

.task-item.dragging {
    opacity: 0.4;
    transform: rotate(3deg);
    cursor: grabbing;
}

.task-content {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 6px;
}

.task-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
    margin-top: 2px;
    flex-shrink: 0;
}

.task-text {
    flex: 1;
    color: var(--text-normal);
    font-size: 13px;
    line-height: 1.5;
    word-wrap: break-word;
}

.task-text.completed {
    text-decoration: line-through;
    color: var(--text-muted);
    opacity: 0.7;
}

.task-cancel-btn {
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.task-cancel-btn:hover {
    background: rgba(255, 100, 100, 0.2);
    color: #ff6464;
}

.task-file-info {
    font-size: 10px;
    color: var(--text-muted);
    padding: 4px 6px;
    background: var(--background-secondary);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
}

.task-file-info:hover {
    background: var(--background-modifier-hover);
    color: var(--text-accent);
}

.file-name {
    font-weight: 500;
}

.timeline-controls {
    text-align: center;
    padding: 10px 20px 20px;
}

.timeline-refresh-btn {
    padding: 10px 20px;
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.timeline-refresh-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    opacity: 0.9;
}

.timeline-refresh-btn:active {
    transform: translateY(0);
}

.timeline-main::-webkit-scrollbar {
    height: 10px;
}

.timeline-main::-webkit-scrollbar-track {
    background: var(--background-secondary);
    border-radius: 5px;
}

.timeline-main::-webkit-scrollbar-thumb {
    background: var(--background-modifier-border);
    border-radius: 5px;
}

.timeline-main::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
}

.tasks-list::-webkit-scrollbar {
    width: 6px;
}

.tasks-list::-webkit-scrollbar-track {
    background: transparent;
}

.tasks-list::-webkit-scrollbar-thumb {
    background: var(--background-modifier-border);
    border-radius: 3px;
}

.tasks-list::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
}

@media (max-width: 768px) {
    .timeline-main {
        flex-direction: column;
    }
    .day-container {
        flex: 1 1 auto;
        min-width: 100%;
    }
}
    `;
    document.head.appendChild(style);
    console.log('CSS embebido insertado');
}

// Configuración
const config = {
    filter: input?.filter || "",
    showCompleted: input?.showCompleted !== false
};

class TasksTimeline {
    constructor(container, app, dv, config) {
        this.dvContainer = container;
        this.app = app;
        this.dv = dv;
        this.config = config;
        
        // Buscar si ya existe un timeline persistente
        const existingTimeline = document.getElementById(timelineId);
        
        if (existingTimeline) {
            console.log('Timeline ya existe, reutilizando');
            existingTimeline.style.display = 'block';
            this.dvContainer.innerHTML = '';
            this.dvContainer.style.display = 'none';
            return;
        }
        
        // Crear contenedor persistente
        this.container = this.createPersistentContainer();
        this.dvContainer.innerHTML = '';
        this.dvContainer.style.display = 'none';
        this.forceFullWidth();
        this.init();
    }

    createPersistentContainer() {
        let targetParent = this.dvContainer.closest('.markdown-preview-view');
        if (!targetParent) targetParent = this.dvContainer.closest('.workspace-leaf-content');
        if (!targetParent) targetParent = this.dvContainer.parentElement;
        
        const persistentContainer = document.createElement('div');
        persistentContainer.id = timelineId;
        persistentContainer.classList.add('tasks-timeline-persistent');
        
        const dvBlock = this.dvContainer.closest('.block-language-dataviewjs');
        if (dvBlock) {
            dvBlock.parentNode.insertBefore(persistentContainer, dvBlock.nextSibling);
        } else {
            this.dvContainer.parentNode.insertBefore(persistentContainer, this.dvContainer.nextSibling);
        }
        
        console.log('Contenedor persistente creado:', timelineId);
        return persistentContainer;
    }

    forceFullWidth() {
        this.container.style.width = '100%';
        this.container.style.maxWidth = 'none';
        this.container.style.margin = '0';
        this.container.style.padding = '0';
        
        let parent = this.container.parentElement;
        let attempts = 0;
        
        while (parent && attempts < 10) {
            parent.style.width = '100%';
            parent.style.maxWidth = 'none';
            parent.style.padding = '0';
            parent.style.margin = '0';
            
            if (parent.classList.contains('view-content')) {
                parent.style.padding = '0 !important';
                parent.style.width = '100% !important';
            }
            
            if (parent.classList.contains('markdown-preview-view')) {
                parent.style.padding = '0 !important';
                parent.style.width = '100% !important';
            }
            
            parent = parent.parentElement;
            attempts++;
        }
        
        console.log('Forzando ancho completo...');
    }

    async init() {
        this.container.classList.add('tasks-timeline-container');
        await this.render();
    }

    async render() {
        this.container.empty();

        const timelineMain = this.container.createDiv('timeline-main');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayOfWeek = today.getDay();

        await this.createOverdueContainer(timelineMain, today);
        await this.createDayContainer(timelineMain, 'Hoy', 0, today);

        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const daysUntilFriday = 5 - dayOfWeek;
            const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            
            for (let i = 1; i <= daysUntilFriday; i++) {
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate() + i);
                const dayName = dayNames[futureDate.getDay()];
                await this.createDayContainer(timelineMain, dayName, i, today);
            }
        }

        let daysUntilNextMonday;
        if (dayOfWeek === 0) {
            daysUntilNextMonday = 1;
        } else {
            daysUntilNextMonday = 8 - dayOfWeek;
        }
        await this.createDayContainer(timelineMain, 'Próxima Semana', daysUntilNextMonday, today);

        await this.createNoDateContainer(timelineMain);

        const controls = this.container.createDiv('timeline-controls');
        const refreshBtn = controls.createEl('button', { text: '🔄 Refrescar' });
        refreshBtn.classList.add('timeline-refresh-btn');
        refreshBtn.addEventListener('click', () => this.render());
    }

    async createDayContainer(parent, label, daysOffset, referenceDate) {
        const dayContainer = parent.createDiv('day-container');
        dayContainer.setAttribute('data-days-offset', daysOffset.toString());

        const dateObj = new Date(referenceDate);
        dateObj.setDate(referenceDate.getDate() + daysOffset);
        const dateStr = this.formatDate(dateObj);

        const header = dayContainer.createEl('div', { cls: 'day-header' });
        header.createEl('span', { text: label, cls: 'day-label' });
        header.createEl('span', { text: this.formatDateDisplay(dateObj), cls: 'day-date' });

        const tasksList = dayContainer.createDiv('tasks-list');
        tasksList.classList.add('droppable');

        const tasks = await this.getTasksForDate(dateStr);
        const activeTasks = tasks.filter(t => !t.completed && !t.cancelled);
        
        if (activeTasks.length === 0) {
            const emptyMsg = tasksList.createDiv('empty-message');
            emptyMsg.setText('Sin tareas');
        } else {
            for (const task of activeTasks) {
                this.createTaskElement(tasksList, task);
            }
        }

        this.setupDropZone(tasksList, dateStr, label);
    }

    async createOverdueContainer(parent, today) {
        const dayContainer = parent.createDiv('day-container');
        dayContainer.classList.add('overdue-container');
        dayContainer.setAttribute('data-days-offset', '0');

        const header = dayContainer.createEl('div', { cls: 'day-header' });
        header.createEl('span', { text: '⚠️ Retrasadas', cls: 'day-label' });

        const tasksList = dayContainer.createDiv('tasks-list');

        const overdueTasks = await this.getOverdueTasks(today);
        
        if (overdueTasks.length === 0) {
            const emptyMsg = tasksList.createDiv('empty-message');
            emptyMsg.setText('Sin tareas retrasadas');
        } else {
            for (const task of overdueTasks) {
                this.createTaskElement(tasksList, task);
            }
        }
    }

    async createNoDateContainer(parent) {
        const dayContainer = parent.createDiv('day-container');
        dayContainer.classList.add('no-date-container');
        dayContainer.setAttribute('data-days-offset', '0');

        const header = dayContainer.createEl('div', { cls: 'day-header' });
        header.createEl('span', { text: '📋 Sin Fecha', cls: 'day-label' });

        const tasksList = dayContainer.createDiv('tasks-list');
        tasksList.classList.add('droppable');

        const noDateTasks = await this.getTasksWithoutDate();
        
        if (noDateTasks.length === 0) {
            const emptyMsg = tasksList.createDiv('empty-message');
            emptyMsg.setText('Sin tareas');
        } else {
            for (const task of noDateTasks) {
                this.createTaskElement(tasksList, task);
            }
        }

        const today = new Date();
        this.setupDropZone(tasksList, this.formatDate(today), 'Hoy');
    }

    createTaskElement(parent, task) {
        const taskEl = parent.createDiv('task-item');
        
        // Crear ID único basado en archivo y línea
        const taskId = `task-${task.file.path.replace(/[^a-zA-Z0-9]/g, '_')}-${task.line}`;
        taskEl.id = taskId;
        taskEl.setAttribute('draggable', 'true');

        const taskContent = taskEl.createDiv('task-content');

        const checkbox = taskContent.createEl('input', { type: 'checkbox' });
        checkbox.classList.add('task-checkbox');
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', async (e) => {
            const scrollPos = this.container.querySelector('.timeline-main')?.scrollLeft || 0;
            await this.toggleTaskComplete(task, e.target.checked);
            
            if (e.target.checked) {
                taskEl.style.opacity = '0';
                taskEl.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    taskEl.remove();
                    const timelineMain = this.container.querySelector('.timeline-main');
                    if (timelineMain) timelineMain.scrollLeft = scrollPos;
                }, 300);
            }
        });

        const text = taskContent.createSpan({ text: task.text });
        text.classList.add('task-text');
        if (task.completed) {
            text.classList.add('completed');
        }

        const cancelBtn = taskContent.createEl('button', { text: '✖' });
        cancelBtn.classList.add('task-cancel-btn');
        cancelBtn.title = 'Cancelar tarea';
        cancelBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const scrollPos = this.container.querySelector('.timeline-main')?.scrollLeft || 0;
            await this.cancelTask(task);
            
            taskEl.style.opacity = '0';
            taskEl.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                taskEl.remove();
                const timelineMain = this.container.querySelector('.timeline-main');
                if (timelineMain) timelineMain.scrollLeft = scrollPos;
            }, 300);
            
            new Notice('🚫 Tarea cancelada');
        });

        const fileInfo = taskEl.createDiv('task-file-info');
        fileInfo.innerHTML = `📄 <span class="file-name">${task.file.basename}</span>`;
        fileInfo.addEventListener('click', async () => {
            // Abrir en nueva pestaña
            const leaf = this.app.workspace.getLeaf('tab');
            await leaf.openFile(task.file);
            
            // Esperar a que se cargue la vista
            setTimeout(() => {
                // Obtener el editor de la nueva pestaña
                const view = leaf.view;
                if (view && view.editor) {
                    // Hacer scroll a la línea de la tarea
                    view.editor.setCursor({ line: task.line, ch: 0 });
                    view.editor.scrollIntoView({ from: { line: task.line, ch: 0 }, to: { line: task.line, ch: 0 } }, true);
                    
                    // Opcional: resaltar brevemente la línea
                    const lineElement = view.containerEl.querySelector(`.cm-line:nth-child(${task.line + 1})`);
                    if (lineElement) {
                        lineElement.style.backgroundColor = 'var(--text-highlight-bg)';
                        setTimeout(() => {
                            lineElement.style.backgroundColor = '';
                        }, 1000);
                    }
                }
            }, 100);
        });

        taskEl.dataset.taskData = JSON.stringify({
            file: task.file.path,
            line: task.line,
            fullLine: task.fullLine,
            text: task.text,
            taskId: taskId
        });

        taskEl.addEventListener('dragstart', (e) => {
            const taskData = {
                file: task.file.path,
                line: task.line,
                fullLine: task.fullLine,
                text: task.text,
                taskId: taskId
            };
            console.log('Drag start - Datos:', taskData);
            e.dataTransfer.setData('text/plain', JSON.stringify(taskData));
            e.dataTransfer.effectAllowed = 'move';
            taskEl.classList.add('dragging');
        });

        taskEl.addEventListener('dragend', (e) => {
            taskEl.classList.remove('dragging');
        });
    }

    setupDropZone(dropZone, targetDate, label) {
        dropZone.dataset.targetDate = targetDate;
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });

        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');

            const data = e.dataTransfer.getData('text/plain');
            
            if (!data) {
                new Notice('❌ No se pudo obtener los datos de la tarea');
                return;
            }

            try {
                const taskData = JSON.parse(data);
                console.log('Drop - taskId:', taskData.taskId, 'Fecha destino:', targetDate);
                
                const originalElement = document.getElementById(taskData.taskId);
                
                if (!originalElement) {
                    console.log('⚠️ NO se encontró elemento original');
                    new Notice('❌ Error: No se encontró la tarea original');
                    return;
                }
                
                const originalParent = originalElement.closest('.tasks-list');
                if (originalParent === dropZone) {
                    console.log('⚠️ Misma columna, ignorando');
                    new Notice('ℹ️ La tarea ya está en esta columna');
                    return;
                }
                
                const scrollPos = this.container.querySelector('.timeline-main')?.scrollLeft || 0;
                
                originalElement.remove();
                console.log('✅ Elemento original eliminado');
                
                await new Promise(resolve => setTimeout(resolve, 50));
                await this.updateTaskDate(taskData.file, taskData.line, taskData.fullLine, targetDate);
                
                const emptyMsg = dropZone.querySelector('.empty-message');
                if (emptyMsg) emptyMsg.remove();
                
                const taskInfo = {
                    text: taskData.text || 'Tarea',
                    file: this.app.vault.getAbstractFileByPath(taskData.file),
                    line: taskData.line,
                    date: targetDate,
                    fullLine: taskData.fullLine,
                    completed: false,
                    cancelled: false
                };
                
                this.createTaskElement(dropZone, taskInfo);
                console.log('✅ Nueva tarea creada');
                
                setTimeout(() => {
                    const timelineMain = this.container.querySelector('.timeline-main');
                    if (timelineMain) timelineMain.scrollLeft = scrollPos;
                }, 0);
                
                new Notice(`✅ Tarea movida a: ${label}`);
            } catch (error) {
                new Notice(`❌ Error: ${error.message}`);
                console.error('Error:', error);
            }
        });
    }

    async getTasksForDate(date) {
        const tasks = [];
        let files = this.app.vault.getMarkdownFiles();

        if (this.config.filter) {
            files = files.filter(f => f.path.startsWith(this.config.filter));
        }

        for (const file of files) {
            const content = await this.app.vault.read(file);
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                const taskMatch = line.match(/^[\s]*[-*]\s+\[([x\-\s])\]/);
                if (taskMatch) {
                    const dateMatch = line.match(/[📅🗓️⏳🛫]\s*(\d{4}-\d{2}-\d{2})/);

                    if (dateMatch && dateMatch[1] === date) {
                        let taskText = line
                            .replace(/^[\s]*[-*]\s+\[[x\-\s]\]/, '')
                            .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/g, '')
                            .replace(/[⏫🔼🔽⏬🔁♻️]/g, '')
                            .replace(/#[\w-]+/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();

                        tasks.push({
                            text: taskText || 'Sin descripción',
                            file: file,
                            line: index,
                            date: dateMatch[1],
                            fullLine: line,
                            completed: taskMatch[1] === 'x',
                            cancelled: taskMatch[1] === '-'
                        });
                    }
                }
            });
        }

        return tasks;
    }

    async getOverdueTasks(today) {
        const tasks = [];
        let files = this.app.vault.getMarkdownFiles();

        if (this.config.filter) {
            files = files.filter(f => f.path.startsWith(this.config.filter));
        }

        const todayStr = this.formatDate(today);

        for (const file of files) {
            const content = await this.app.vault.read(file);
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                const taskMatch = line.match(/^[\s]*[-*]\s+\[([x\-\s])\]/);
                if (taskMatch) {
                    const dateMatch = line.match(/[📅🗓️⏳🛫]\s*(\d{4}-\d{2}-\d{2})/);

                    if (dateMatch && dateMatch[1] < todayStr && taskMatch[1] !== 'x' && taskMatch[1] !== '-') {
                        let taskText = line
                            .replace(/^[\s]*[-*]\s+\[[x\-\s]\]/, '')
                            .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/g, '')
                            .replace(/[⏫🔼🔽⏬🔁♻️]/g, '')
                            .replace(/#[\w-]+/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();

                        tasks.push({
                            text: taskText || 'Sin descripción',
                            file: file,
                            line: index,
                            date: dateMatch[1],
                            fullLine: line,
                            completed: false,
                            cancelled: false
                        });
                    }
                }
            });
        }

        return tasks;
    }

    async getTasksWithoutDate() {
        const tasks = [];
        let files = this.app.vault.getMarkdownFiles();

        if (this.config.filter) {
            files = files.filter(f => f.path.startsWith(this.config.filter));
        }

        for (const file of files) {
            const content = await this.app.vault.read(file);
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                const taskMatch = line.match(/^[\s]*[-*]\s+\[([x\-\s])\]/);
                if (taskMatch) {
                    const hasDate = line.match(/[📅🗓️⏳🛫]\s*\d{4}-\d{2}-\d{2}/);

                    if (!hasDate && taskMatch[1] !== 'x' && taskMatch[1] !== '-') {
                        let taskText = line
                            .replace(/^[\s]*[-*]\s+\[[x\-\s]\]/, '')
                            .replace(/[⏫🔼🔽⏬🔁♻️]/g, '')
                            .replace(/#[\w-]+/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();

                        tasks.push({
                            text: taskText || 'Sin descripción',
                            file: file,
                            line: index,
                            date: null,
                            fullLine: line,
                            completed: false,
                            cancelled: false
                        });
                    }
                }
            });
        }

        return tasks;
    }

    async updateTaskDate(filePath, lineNumber, oldLine, newDate) {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        
        if (!file || file.extension !== 'md') {
            throw new Error('Archivo no válido');
        }

        const content = await this.app.vault.read(file);
        const lines = content.split('\n');

        if (lineNumber >= lines.length) {
            throw new Error('Línea no válida');
        }

        const originalLine = lines[lineNumber];
        
        const indentMatch = originalLine.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '';
        
        const listMarkerMatch = originalLine.match(/^[\s]*([-*])/);
        const listMarker = listMarkerMatch ? listMarkerMatch[1] : '-';
        
        const checkboxMatch = originalLine.match(/\[([x\-\s])\]/);
        const checkboxState = checkboxMatch ? checkboxMatch[1] : ' ';
        
        let taskText = originalLine
            .replace(/^[\s]*[-*]\s+\[[x\-\s]\]/, '')
            .replace(/[📅🗓️⏳🛫🛬✅⏫🔼🔽⏬🔁♻️]\s*\d{4}-\d{2}-\d{2}/g, '')
            .replace(/[⏫🔼🔽⏬]/g, '')
            .replace(/[🔁♻️]\s*[^📅🗓️⏳🛫🛬✅]*/g, '')
            .trim();
        
        const newLine = `${indent}${listMarker} [${checkboxState}] ${taskText} 📅 ${newDate}`;
        
        lines[lineNumber] = newLine;
        await this.app.vault.modify(file, lines.join('\n'));
    }

    async toggleTaskComplete(task, completed) {
        const file = this.app.vault.getAbstractFileByPath(task.file.path);
        if (!file || file.extension !== 'md') return;

        const content = await this.app.vault.read(file);
        const lines = content.split('\n');

        if (task.line >= lines.length) return;

        const line = lines[task.line];
        const newLine = completed 
            ? line.replace(/\[[ ]\]/, '[x]')
            : line.replace(/\[x\]/, '[ ]');

        lines[task.line] = newLine;
        await this.app.vault.modify(file, lines.join('\n'));
    }

    async cancelTask(task) {
        const file = this.app.vault.getAbstractFileByPath(task.file.path);
        if (!file || file.extension !== 'md') return;

        const content = await this.app.vault.read(file);
        const lines = content.split('\n');

        if (task.line >= lines.length) return;

        const line = lines[task.line];
        const newLine = line.replace(/\[[ x]\]/, '[-]');

        lines[task.line] = newLine;
        await this.app.vault.modify(file, lines.join('\n'));
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDateDisplay(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
    }
}

// Inicializar
new TasksTimeline(dv.container, app, dv, config);