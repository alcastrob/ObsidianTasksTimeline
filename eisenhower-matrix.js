/**
 * Eisenhower Matrix for Obsidian Tasks
 * Gestión de tareas basada en la matriz de Eisenhower (Urgente/Importante)
 * Compatible con Obsidian Tasks plugin
 * 
 * @version 1.0.0
 * @author Ángel
 */

// Configuración recibida de dv.view()
const config = input || {};

class EisenhowerMatrix {
    constructor(dv, config = {}) {
        this.dv = dv;
        this.dvContainer = dv.container;
        this.config = {
            folder: config.folder || "",
            sortBy: config.sortBy || "priority", // priority | start
            groupBy: config.groupBy || "none"  // none | priority | start
        };
        
        this.tasks = [];
        this.draggedTask = null;
        this.draggedElement = null;
        this.zoomWrapper = null;
        this.container = null;
        this.currentOverlay = null;
        this.overlayHovered = false;
        this.triggerHovered = false;
        this.statesDropdownBtn = null;
        this.filters = {
            sortBy: this.config.sortBy,
            groupBy: this.config.groupBy,
            searchText: "",
            todayOnly: false,
            states: {
                notStarted: true,    // ' '
                inProgress: true,    // '/'
                waiting: true,       // 'w'
                delegated: true      // 'd'
            }
        };
    }

    /**
     * Renderiza la matriz de Eisenhower
     */
    async render() {
        // Crear contenedor persistente
        this.container = this.createPersistentContainer();
        
        // Ocultar contenedor original de Dataview
        this.dvContainer.innerHTML = '';
        this.dvContainer.style.display = 'none';
        
        // Forzar ancho completo
        this.forceFullWidth();
        
        // Cargar tareas
        await this.loadTasks();
        
        // Crear contenedor principal
        const mainContainer = this.container.createDiv({ cls: "eisenhower-matrix-container" });
        
        // Aplicar estilos CSS
        this.applyStyles(this.container);
        
        // Crear barra superior
        this.createTopBar(mainContainer);
        
        // Crear barra de etiquetas
        this.createTagsBar(mainContainer);
        
        // Crear zoom wrapper
        this.zoomWrapper = mainContainer.createDiv({ cls: "eisenhower-zoom-wrapper" });
        
        // Crear la matriz dentro del zoom wrapper
        this.createMatrix(this.zoomWrapper);
    }

    /**
     * Crea un contenedor persistente fuera del bloque de Dataview
     */
    createPersistentContainer() {
        // Generar ID único para este contenedor
        const matrixId = 'eisenhower-matrix-' + Date.now();
        
        // Buscar el padre apropiado
        let targetParent = this.dvContainer.closest('.markdown-preview-view');
        if (!targetParent) targetParent = this.dvContainer.closest('.workspace-leaf-content');
        if (!targetParent) targetParent = this.dvContainer.parentElement;
        
        // Crear contenedor persistente
        const persistentContainer = document.createElement('div');
        persistentContainer.id = matrixId;
        persistentContainer.classList.add('eisenhower-matrix-persistent');
        
        // Insertar después del bloque de Dataview
        const dvBlock = this.dvContainer.closest('.block-language-dataviewjs');
        if (dvBlock) {
            dvBlock.parentNode.insertBefore(persistentContainer, dvBlock.nextSibling);
        } else {
            this.dvContainer.parentNode.insertBefore(persistentContainer, this.dvContainer.nextSibling);
        }
        
        return persistentContainer;
    }

    /**
     * Fuerza el ancho completo del contenedor y sus padres
     */
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
    }

    /**
     * Carga las tareas desde Obsidian
     */
    async loadTasks() {
        let folderPath = this.config.folder;
        if (folderPath && !folderPath.endsWith("/")) {
            folderPath += "/";
        }

        const pages = folderPath 
            ? this.dv.pages(`"${folderPath}"`)
            : this.dv.pages();

        this.tasks = [];
        
        for (const page of pages) {
            if (!page.file?.tasks) continue;

            for (const task of page.file.tasks) {
                // Filtrar tareas completadas
                if (task.completed) continue;
                
                // Filtrar tareas canceladas usando task.status directamente
                if (task.status === '-') continue;

                const taskObj = {
                    text: task.text,
                    status: task.status,
                    checked: task.checked,
                    completed: task.completed,
                    file: task.path,
                    line: task.line,
                    priority: this.extractPriority(task.text),
                    tags: this.extractTags(task.text),
                    start: task.start || null,
                    checkboxState: task.status || ' ',
                    path: page.file.path,
                    section: task.section,
                    link: task.link
                };

                this.tasks.push(taskObj);
            }
        }
    }

    /**
     * Extrae la prioridad de una tarea
     */
    extractPriority(text) {
        const priorityMap = {
            '🔺': 'highest',
            '⏫': 'high',
            '🔼': 'medium',
            '🔽': 'low',
            '⏬': 'lowest'
        };

        for (const [emoji, priority] of Object.entries(priorityMap)) {
            if (text.includes(emoji)) {
                return priority;
            }
        }
        return 'normal';
    }

    /**
     * Extrae las etiquetas de una tarea
     */
    extractTags(text) {
        const tagRegex = /#[\w\-áéíóúñÑ]+/gi;
        const matches = text.match(tagRegex);
        return matches || [];
    }

    /**
     * Extrae el estado del checkbox
     */
    extractCheckboxState(text) {
        const stateMatch = text.match(/^\[(.)\]/);
        return stateMatch ? stateMatch[1] : ' ';
    }

    /**
     * Determina si una tarea es importante
     */
    isImportant(task) {
        return task.priority === 'highest' || task.priority === 'high';
    }

    /**
     * Determina si una tarea es urgente
     */
    isUrgent(task) {
        return task.tags.some(tag => tag.toLowerCase() === '#urgent');
    }

    /**
     * Determina si una tarea es no urgente
     */
    isNotUrgent(task) {
        return task.tags.some(tag => tag.toLowerCase() === '#noturgent');
    }

    /**
     * Clasifica una tarea en un cuadrante
     */
    classifyTask(task) {
        const important = this.isImportant(task);
        const urgent = this.isUrgent(task);
        const notUrgent = this.isNotUrgent(task);

        // Q1: Urgente e Importante
        if (urgent && important) return 'q1';
        
        // Q2: No urgente e Importante
        if (notUrgent && important) return 'q2';
        
        // Q3: Urgente y No importante
        if (urgent && !important) return 'q3';
        
        // Q4: No urgente y No importante
        if (notUrgent && !important) return 'q4';
        
        // Sin clasificar
        return 'unclassified';
    }

    /**
     * Crea la barra superior con filtros y controles
     */
    createTopBar(container) {
        const topBar = container.createDiv({ cls: "eisenhower-top-bar" });

        // Zoom control
        const zoomContainer = topBar.createDiv({ cls: "zoom-container" });
        zoomContainer.createSpan({ text: "🔍", cls: "zoom-icon" });
        
        const savedZoom = localStorage.getItem('eisenhower-zoom') || '100';
        const zoomSlider = zoomContainer.createEl("input", {
            type: "range",
            cls: "zoom-slider",
            attr: {
                min: "50",
                max: "150",
                step: "10",
                value: savedZoom
            }
        });
        
        const zoomValue = zoomContainer.createSpan({
            text: `${savedZoom}%`,
            cls: "zoom-value"
        });

        // Búsqueda
        const searchContainer = topBar.createDiv({ cls: "search-container" });
        searchContainer.createSpan({ text: "🔍", cls: "search-icon" });
        const searchInput = searchContainer.createEl("input", {
            type: "text",
            placeholder: "Buscar tareas...",
            cls: "search-input"
        });
        searchInput.addEventListener("input", (e) => {
            this.filters.searchText = e.target.value.toLowerCase();
            this.refreshMatrix();
        });

        // Filtro "Solo hoy"
        const todayFilterContainer = topBar.createDiv({ cls: "filter-container" });
        const todayCheckbox = todayFilterContainer.createEl("input", {
            type: "checkbox",
            cls: "today-checkbox",
            attr: { id: "today-filter" }
        });
        const todayLabel = todayFilterContainer.createEl("label", {
            text: "Solo hoy",
            cls: "today-label",
            attr: { for: "today-filter" }
        });
        todayCheckbox.addEventListener("change", (e) => {
            this.filters.todayOnly = e.target.checked;
            this.refreshMatrix();
        });

        // Filtro de estados (dropdown con checkboxes)
        const statesContainer = topBar.createDiv({ cls: "states-dropdown-container" });
        statesContainer.createSpan({ text: "Estados: ", cls: "filter-label" });
        
        this.statesDropdownBtn = statesContainer.createEl("button", {
            text: "Todos ▼",
            cls: "states-dropdown-btn"
        });
        
        const statesDropdownMenu = statesContainer.createDiv({ cls: "states-dropdown-menu" });
        statesDropdownMenu.style.display = "none";
        
        // Crear checkboxes dentro del dropdown
        const states = [
            { key: "notStarted", label: "⚪ No comenzadas", icon: "⚪" },
            { key: "inProgress", label: "🔄 En curso", icon: "🔄" },
            { key: "waiting", label: "⏸️ En espera", icon: "⏸️" },
            { key: "delegated", label: "👤 Delegadas", icon: "👤" }
        ];
        
        states.forEach(state => {
            const option = statesDropdownMenu.createDiv({ cls: "dropdown-option" });
            
            const checkbox = option.createEl("input", {
                type: "checkbox",
                cls: "dropdown-checkbox",
                attr: { id: `state-${state.key}`, checked: true }
            });
            
            const label = option.createEl("label", {
                text: state.label,
                cls: "dropdown-label",
                attr: { for: `state-${state.key}` }
            });
            
            checkbox.addEventListener("change", (e) => {
                this.filters.states[state.key] = e.target.checked;
                this.updateStatesButtonText(this.statesDropdownBtn);
                this.refreshMatrix();
            });
        });
        
        // Toggle dropdown al hacer clic en el botón
        this.statesDropdownBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isVisible = statesDropdownMenu.style.display !== "none";
            statesDropdownMenu.style.display = isVisible ? "none" : "block";
        });
        
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener("click", (e) => {
            if (!statesContainer.contains(e.target)) {
                statesDropdownMenu.style.display = "none";
            }
        });
        
        // Evitar que el dropdown se cierre al hacer clic dentro
        statesDropdownMenu.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        // Ordenar por
        const sortContainer = topBar.createDiv({ cls: "filter-container" });
        sortContainer.createSpan({ text: "Ordenar: ", cls: "filter-label" });
        const sortSelect = sortContainer.createEl("select", { cls: "filter-select" });
        
        const sortOptions = [
            { value: "priority", label: "Prioridad" },
            { value: "start", label: "Fecha de inicio" }
        ];
        
        sortOptions.forEach(opt => {
            const option = sortSelect.createEl("option", { 
                value: opt.value, 
                text: opt.label 
            });
            if (opt.value === this.filters.sortBy) {
                option.selected = true;
            }
        });
        
        sortSelect.addEventListener("change", (e) => {
            this.filters.sortBy = e.target.value;
            this.refreshMatrix();
        });

        // Agrupar por
        const groupContainer = topBar.createDiv({ cls: "filter-container" });
        groupContainer.createSpan({ text: "Agrupar: ", cls: "filter-label" });
        const groupSelect = groupContainer.createEl("select", { cls: "filter-select" });
        
        const groupOptions = [
            { value: "none", label: "Sin agrupar" },
            { value: "priority", label: "Por prioridad" },
            { value: "start", label: "Por fecha de inicio" }
        ];
        
        groupOptions.forEach(opt => {
            const option = groupSelect.createEl("option", { 
                value: opt.value, 
                text: opt.label 
            });
            if (opt.value === this.filters.groupBy) {
                option.selected = true;
            }
        });
        
        groupSelect.addEventListener("change", (e) => {
            this.filters.groupBy = e.target.value;
            this.refreshMatrix();
        });

        // Botón refrescar
        const refreshBtn = topBar.createEl("button", {
            text: "🔄 Refrescar",
            cls: "refresh-btn"
        });
        refreshBtn.addEventListener("click", async () => {
            await this.loadTasks();
            this.refreshMatrix();
        });

        // Configurar zoom
        this.setupZoom(zoomSlider, zoomValue, savedZoom);
    }

    /**
     * Actualiza el texto del botón de estados según los filtros activos
     */
    updateStatesButtonText(button) {
        const states = this.filters.states;
        const activeCount = Object.values(states).filter(v => v).length;
        
        if (activeCount === 4) {
            button.textContent = "Todos ▼";
        } else if (activeCount === 0) {
            button.textContent = "Ninguno ▼";
        } else {
            const icons = [];
            if (states.notStarted) icons.push("⚪");
            if (states.inProgress) icons.push("🔄");
            if (states.waiting) icons.push("⏸️");
            if (states.delegated) icons.push("👤");
            button.textContent = `${icons.join(" ")} ▼`;
        }
    }

    /**
     * Configura el control de zoom
     */
    setupZoom(zoomSlider, zoomValue, savedZoom) {
        const applyZoom = (scale) => {
            if (!this.zoomWrapper) return;
            
            const matrixGrid = this.zoomWrapper.querySelector('.eisenhower-matrix-grid');
            if (!matrixGrid) return;
            
            // Aplicar transformación con origin en top left
            matrixGrid.style.transform = `scale(${scale})`;
            matrixGrid.style.transformOrigin = 'top left';
            matrixGrid.style.width = `${100 / scale}%`;
            
            // Forzar re-render para columnas fuera del viewport
            matrixGrid.style.display = 'none';
            matrixGrid.offsetHeight; // Force reflow
            matrixGrid.style.display = 'grid';
            matrixGrid.offsetHeight; // Force reflow again
        };
        
        // Aplicar zoom inicial
        const initialScale = parseInt(savedZoom) / 100;
        setTimeout(() => applyZoom(initialScale), 100);
        
        // Event listener para el slider
        zoomSlider.addEventListener('input', (e) => {
            const zoom = e.target.value;
            const newScale = zoom / 100;
            zoomValue.textContent = `${zoom}%`;
            applyZoom(newScale);
            localStorage.setItem('eisenhower-zoom', zoom);
        });
    }

    /**
     * Crea la barra de etiquetas
     */
    createTagsBar(container) {
        const tagsBar = container.createDiv({ cls: "eisenhower-tags-bar" });
        
        // Recopilar todas las etiquetas visibles
        const visibleTasks = this.getVisibleTasks();
        const tagCounts = {};
        
        visibleTasks.forEach(task => {
            task.tags.forEach(tag => {
                const tagLower = tag.toLowerCase();
                // Filtrar #urgent y #noturgent
                if (tagLower === '#urgent' || tagLower === '#noturgent') {
                    return;
                }
                if (!tagCounts[tagLower]) {
                    tagCounts[tagLower] = { tag: tag, count: 0 };
                }
                tagCounts[tagLower].count++;
            });
        });

        // Mostrar etiquetas
        const tagEntries = Object.values(tagCounts).sort((a, b) => b.count - a.count);
        
        if (tagEntries.length === 0) {
            tagsBar.createSpan({ text: "No hay etiquetas", cls: "no-tags" });
            return;
        }

        tagEntries.forEach(({ tag, count }) => {
            const tagPill = tagsBar.createEl("button", {
                cls: "tag-pill clickable"
            });
            
            const tagText = tagPill.createSpan({ 
                text: tag,
                cls: "tag-text"
            });
            
            const tagCount = tagPill.createSpan({ 
                text: ` (${count})`,
                cls: "tag-count"
            });

            // Al hacer clic, añadir al filtro de búsqueda
            tagPill.addEventListener("click", () => {
                const searchInput = container.querySelector(".search-input");
                if (searchInput) {
                    searchInput.value = tag;
                    this.filters.searchText = tag.toLowerCase();
                    this.refreshMatrix();
                }
            });

            // Color de la etiqueta
            const color = this.getTagColor(tag);
            tagPill.style.backgroundColor = color;
            tagPill.style.color = this.getContrastColor(color);
        });
    }

    /**
     * Obtiene las tareas visibles según el filtro de búsqueda
     */
    getVisibleTasks() {
        let filtered = this.tasks;
        
        // Filtro de búsqueda
        if (this.filters.searchText) {
            const searchLower = this.filters.searchText.toLowerCase();
            filtered = filtered.filter(task => {
                return task.text.toLowerCase().includes(searchLower) ||
                       task.tags.some(tag => tag.toLowerCase().includes(searchLower));
            });
        }
        
        // Filtro "solo hoy"
        if (this.filters.todayOnly) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];
            
            filtered = filtered.filter(task => {
                if (!task.start) return false;
                const taskDate = new Date(task.start);
                taskDate.setHours(0, 0, 0, 0);
                const taskDateStr = taskDate.toISOString().split('T')[0];
                return taskDateStr === todayStr;
            });
        }
        
        // Filtro por estados
        filtered = filtered.filter(task => {
            const state = task.checkboxState || ' ';
            
            if (state === ' ' && !this.filters.states.notStarted) return false;
            if (state === '/' && !this.filters.states.inProgress) return false;
            if (state === 'w' && !this.filters.states.waiting) return false;
            if (state === 'd' && !this.filters.states.delegated) return false;
            
            return true;
        });
        
        return filtered;
    }

    /**
     * Crea la matriz de cuadrantes
     */
    createMatrix(container) {
        const matrixContainer = container.createDiv({ cls: "eisenhower-matrix-grid" });

        // Clasificar tareas
        const visibleTasks = this.getVisibleTasks();
        const tasksByQuadrant = {
            q1: [],
            q2: [],
            q3: [],
            q4: [],
            unclassified: []
        };

        visibleTasks.forEach(task => {
            const quadrant = this.classifyTask(task);
            tasksByQuadrant[quadrant].push(task);
        });

        // Ordenar tareas en cada cuadrante
        Object.keys(tasksByQuadrant).forEach(quadrant => {
            tasksByQuadrant[quadrant] = this.sortTasks(tasksByQuadrant[quadrant]);
        });

        // Crear cuadrantes en orden específico para el layout
        // Fila 1: Q1, Q2, Unclassified (inicio)
        this.createQuadrant(matrixContainer, "q1", "🔴 Urgente e Importante", 
                          "Hacer inmediatamente", tasksByQuadrant.q1);
        
        this.createQuadrant(matrixContainer, "q2", "🟢 No urgente e Importante", 
                          "Planificar y programar", tasksByQuadrant.q2);
        
        this.createQuadrant(matrixContainer, "unclassified", "📋 Sin clasificar", 
                          "Arrastra para clasificar", tasksByQuadrant.unclassified);
        
        // Fila 2: Q3, Q4 (Sin clasificar continúa)
        this.createQuadrant(matrixContainer, "q3", "🟡 Urgente y No importante", 
                          "Delegar si es posible", tasksByQuadrant.q3);
        
        this.createQuadrant(matrixContainer, "q4", "⚪ No urgente y No importante", 
                          "Eliminar o posponer", tasksByQuadrant.q4);
    }

    /**
     * Ordena las tareas según el criterio seleccionado
     */
    sortTasks(tasks) {
        const sorted = [...tasks];
        
        if (this.filters.sortBy === 'priority') {
            const priorityOrder = { 'highest': 0, 'high': 1, 'medium': 2, 'normal': 3, 'low': 4, 'lowest': 5 };
            sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        } else if (this.filters.sortBy === 'start') {
            sorted.sort((a, b) => {
                if (!a.start && !b.start) return 0;
                if (!a.start) return 1;
                if (!b.start) return -1;
                return new Date(a.start) - new Date(b.start);
            });
        }

        return sorted;
    }

    /**
     * Crea un cuadrante
     */
    createQuadrant(container, id, title, subtitle, tasks) {
        const quadrant = container.createDiv({ 
            cls: `eisenhower-quadrant quadrant-${id}`,
            attr: { "data-quadrant": id }
        });

        // Header del cuadrante
        const header = quadrant.createDiv({ cls: "quadrant-header" });
        header.createDiv({ text: title, cls: "quadrant-title" });
        header.createDiv({ text: subtitle, cls: "quadrant-subtitle" });
        header.createDiv({ 
            text: `${tasks.length} tarea${tasks.length !== 1 ? 's' : ''}`,
            cls: "quadrant-count"
        });

        // Contenedor de tareas
        const tasksContainer = quadrant.createDiv({ cls: "quadrant-tasks" });

        // Configurar drag & drop
        this.setupDropZone(tasksContainer, id);

        // Agrupar o mostrar tareas directamente
        if (this.filters.groupBy === 'none') {
            tasks.forEach(task => {
                this.createTaskCard(tasksContainer, task);
            });
        } else {
            this.createGroupedTasks(tasksContainer, tasks);
        }
    }

    /**
     * Crea tareas agrupadas
     */
    createGroupedTasks(container, tasks) {
        const groups = {};

        if (this.filters.groupBy === 'priority') {
            const priorities = ['highest', 'high', 'medium', 'normal', 'low', 'lowest'];
            priorities.forEach(p => { groups[p] = []; });
            tasks.forEach(task => {
                groups[task.priority].push(task);
            });

            priorities.forEach(priority => {
                if (groups[priority].length === 0) return;
                
                const groupDiv = container.createDiv({ cls: "task-group" });
                const groupHeader = groupDiv.createDiv({ cls: "task-group-header" });
                groupHeader.createSpan({ 
                    text: `${this.getPriorityLabel(priority)} (${groups[priority].length})`,
                    cls: "task-group-title"
                });

                const groupTasks = groupDiv.createDiv({ cls: "task-group-tasks" });
                groups[priority].forEach(task => {
                    this.createTaskCard(groupTasks, task);
                });
            });
        } else if (this.filters.groupBy === 'start') {
            tasks.forEach(task => {
                const dateKey = task.start ? task.start.toString() : 'Sin fecha';
                if (!groups[dateKey]) groups[dateKey] = [];
                groups[dateKey].push(task);
            });

            const sortedDates = Object.keys(groups).sort((a, b) => {
                if (a === 'Sin fecha') return 1;
                if (b === 'Sin fecha') return -1;
                return new Date(a) - new Date(b);
            });

            sortedDates.forEach(dateKey => {
                const groupDiv = container.createDiv({ cls: "task-group" });
                const groupHeader = groupDiv.createDiv({ cls: "task-group-header" });
                const displayDate = dateKey === 'Sin fecha' ? dateKey : this.formatDate(dateKey);
                groupHeader.createSpan({ 
                    text: `${displayDate} (${groups[dateKey].length})`,
                    cls: "task-group-title"
                });

                const groupTasks = groupDiv.createDiv({ cls: "task-group-tasks" });
                groups[dateKey].forEach(task => {
                    this.createTaskCard(groupTasks, task);
                });
            });
        }
    }

    /**
     * Crea una tarjeta de tarea
     */
    createTaskCard(container, task) {
        const taskEl = container.createDiv({ cls: "task-item" });
        taskEl.setAttribute("draggable", "true");
        taskEl.dataset.taskPath = task.path;
        taskEl.dataset.taskLine = task.line;

        // Configurar drag & drop
        this.setupDraggable(taskEl, task);

        // Botones de acción (parte superior derecha)
        const actionsContainer = taskEl.createDiv({ cls: "task-actions" });

        // Botón cancelar
        const cancelBtn = actionsContainer.createEl("button", {
            text: "✖",
            cls: "task-cancel-btn"
        });
        cancelBtn.title = "Cancelar tarea";
        cancelBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            await this.cancelTask(task);
            taskEl.style.transition = "all 0.3s ease-out";
            taskEl.style.opacity = "0";
            taskEl.style.transform = "translateX(-20px)";
            setTimeout(() => {
                taskEl.remove();
                this.updateQuadrantCounters();
            }, 300);
        });

        // Selector de prioridad
        this.createPrioritySelector(actionsContainer, task, taskEl);

        // Selector de estado
        this.createStatusSelector(actionsContainer, task, taskEl);

        // Selector de cuadrante
        this.createQuadrantSelector(actionsContainer, task, taskEl);

        // Contenido de la tarea
        const taskContent = taskEl.createDiv({ cls: "task-content-wrapper" });

        // Checkbox
        const checkbox = taskContent.createEl("input", { 
            type: "checkbox",
            cls: "task-checkbox"
        });
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", async (e) => {
            await this.toggleTaskComplete(task, e.target.checked);
            if (e.target.checked) {
                taskEl.style.transition = "all 0.3s ease-out";
                taskEl.style.opacity = "0";
                taskEl.style.transform = "translateX(20px)";
                setTimeout(() => {
                    taskEl.remove();
                    this.updateQuadrantCounters();
                }, 300);
            }
        });

        // Texto de la tarea
        const textContainer = taskContent.createDiv({ cls: "task-text" });
        if (task.completed) {
            textContainer.classList.add("completed");
        }

        // Icono de estado
        const statusIcon = this.getTaskStatusIcon(task.checkboxState || " ");
        if (statusIcon) {
            textContainer.createSpan({ 
                text: statusIcon + " ",
                cls: "task-status-icon"
            });
        }

        // Procesar texto con enlaces y etiquetas
        this.processTaskText(textContainer, task);

        // Metadata
        const meta = taskEl.createDiv({ cls: "task-meta" });

        // Enlace a la página .md que contiene la tarea
        const pageLink = meta.createEl("a", {
            text: `📄 ${task.path.split('/').pop().replace('.md', '')}`,
            cls: "task-page-link"
        });
        pageLink.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await this.openNote(task.path, task.line);
        });

        return taskEl;
    }

    /**
     * Procesa el texto de la tarea con enlaces, etiquetas y tareas enlazadas
     */
    processTaskText(container, task) {
        const text = task.text;
        const parts = [];
        let currentIndex = 0;

        // Regex mejorados
        const taskLinkRegex = /(⛔|🆔)\s*([a-zA-Z0-9,]+)/g; // Soporta múltiples IDs separados por comas
        const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
        const tagRegex = /#[\w\-áéíóúñÑ]+/gi;

        const allMatches = [];
        
        // Primero, encontrar todos los wikilinks para excluirlos al buscar tags
        const wikiLinkPositions = [];
        let match;
        wikiLinkRegex.lastIndex = 0;
        while ((match = wikiLinkRegex.exec(text)) !== null) {
            wikiLinkPositions.push({
                start: match.index,
                end: match.index + match[0].length
            });
            allMatches.push({
                type: 'wikilink',
                index: match.index,
                length: match[0].length,
                content: match[1]
            });
        }
        
        // Buscar task links (pueden tener múltiples IDs)
        taskLinkRegex.lastIndex = 0;
        while ((match = taskLinkRegex.exec(text)) !== null) {
            allMatches.push({
                type: 'taskLink',
                index: match.index,
                length: match[0].length,
                content: match[0],
                linkType: match[1],
                linkIds: match[2].split(',').map(id => id.trim()) // Split múltiples IDs
            });
        }
        
        // Buscar etiquetas, pero solo fuera de wikilinks
        tagRegex.lastIndex = 0;
        while ((match = tagRegex.exec(text)) !== null) {
            const tagStart = match.index;
            const tagEnd = match.index + match[0].length;
            
            // Verificar que el tag no esté dentro de un wikilink
            const isInsideWikilink = wikiLinkPositions.some(pos => 
                tagStart >= pos.start && tagEnd <= pos.end
            );
            
            if (!isInsideWikilink) {
                // Filtrar #urgent y #noturgent
                const tagLower = match[0].toLowerCase();
                if (tagLower !== '#urgent' && tagLower !== '#noturgent') {
                    allMatches.push({
                        type: 'tag',
                        index: match.index,
                        length: match[0].length,
                        content: match[0]
                    });
                }
            }
        }
        
        // Ordenar por posición
        allMatches.sort((a, b) => a.index - b.index);
        
        // Construir partes
        allMatches.forEach(match => {
            if (match.index > currentIndex) {
                parts.push({
                    type: 'text',
                    content: text.substring(currentIndex, match.index)
                });
            }
            parts.push(match);
            currentIndex = match.index + match.length;
        });
        
        // Añadir texto restante
        if (currentIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.substring(currentIndex)
            });
        }

        // Renderizar partes
        parts.forEach(part => {
            if (part.type === 'text') {
                // Limpiar emojis de prioridad, fechas, estado y etiquetas de urgencia del texto
                let cleanText = part.content;
                cleanText = cleanText
                    .replace(/[🔺⏫🔼🔽⏬]/gu, '') // Quitar emojis de prioridad con Unicode
                    .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '') // Quitar fechas
                    .replace(/[🔁♻️]/gu, '') // Quitar emojis de recurrencia
                    .replace(/#urgent\b/gi, '') // Quitar #urgent
                    .replace(/#noturgent\b/gi, '') // Quitar #noturgent
                    .trim();
                if (cleanText) {
                    container.createSpan({ text: cleanText + ' ' });
                }
            } else if (part.type === 'taskLink') {
                const linkSpan = container.createSpan({ 
                    text: part.content, 
                    cls: 'task-link'
                });
                linkSpan.dataset.linkType = part.linkType;
                linkSpan.dataset.linkIds = part.linkIds.join(','); // Guardar todos los IDs
                
                // Eventos para mostrar overlay (ahora con múltiples IDs)
                linkSpan.addEventListener('mouseenter', (e) => {
                    this.triggerHovered = true;
                    this.showTaskOverlay(e, part.linkType, part.linkIds);
                });
                linkSpan.addEventListener('mouseleave', () => {
                    this.triggerHovered = false;
                    setTimeout(() => {
                        if (!this.overlayHovered && !this.triggerHovered) {
                            this.hideTaskOverlay();
                        }
                    }, 100);
                });
            } else if (part.type === 'wikilink') {
                const link = container.createEl('a', {
                    text: part.content,
                    cls: 'wiki-link'
                });
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await this.openNote(part.content);
                });
            } else if (part.type === 'tag') {
                const tagPill = container.createSpan({
                    text: part.content,
                    cls: 'task-tag-pill'
                });
                const color = this.getTagColor(part.content);
                tagPill.style.backgroundColor = color;
                tagPill.style.color = this.getContrastColor(color);
            }
        });
    }

    /**
     * Crea el selector de prioridad
     */
    createPrioritySelector(container, task, taskEl) {
        const btn = container.createEl("button", {
            text: this.getPriorityEmoji(task.priority),
            cls: "task-priority-btn"
        });
        btn.title = "Cambiar prioridad";

        let dropdownOpen = false;

        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            if (dropdownOpen) {
                const existingDropdown = container.querySelector(".priority-dropdown");
                if (existingDropdown) existingDropdown.remove();
                dropdownOpen = false;
                return;
            }

            const dropdown = container.createDiv({ cls: "priority-dropdown" });
            
            const priorities = [
                { value: "highest", emoji: "🔺", label: "Highest" },
                { value: "high", emoji: "⏫", label: "High" },
                { value: "medium", emoji: "🔼", label: "Medium" },
                { value: "normal", emoji: "➖", label: "Normal" },
                { value: "low", emoji: "🔽", label: "Low" },
                { value: "lowest", emoji: "⏬", label: "Lowest" }
            ];

            priorities.forEach(p => {
                const option = dropdown.createDiv({ cls: "priority-option" });
                option.createSpan({ text: p.emoji });
                option.createSpan({ text: ` ${p.label}` });

                if (p.value === task.priority) {
                    option.classList.add("selected");
                }

                option.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    
                    // Calcular cuadrante anterior ANTES de actualizar
                    const oldQuadrant = this.classifyTask(task);
                    const oldPriority = task.priority;
                    
                    // Actualizar prioridad en el archivo
                    await this.updateTaskPriority(task, p.value);
                    
                    // Actualizar botón
                    btn.setText(this.getPriorityEmoji(p.value));
                    
                    // Actualizar metadata en la tarjeta
                    this.updateTaskCardMetadata(taskEl, task);
                    
                    dropdown.remove();
                    dropdownOpen = false;
                    
                    // Calcular nuevo cuadrante
                    const newQuadrant = this.classifyTask(task);
                    
                    if (oldQuadrant !== newQuadrant) {
                        // Mover a nuevo cuadrante con animación
                        taskEl.style.transition = "all 0.3s ease-out";
                        taskEl.style.opacity = "0";
                        taskEl.style.transform = "scale(0.95)";
                        
                        setTimeout(() => {
                            const newQuadrantEl = document.querySelector(`.quadrant-${newQuadrant} .quadrant-tasks`);
                            if (newQuadrantEl) {
                                taskEl.style.opacity = "0";
                                taskEl.style.transform = "scale(0.95)";
                                newQuadrantEl.appendChild(taskEl);
                                
                                setTimeout(() => {
                                    taskEl.style.opacity = "1";
                                    taskEl.style.transform = "scale(1)";
                                    this.updateQuadrantCounters();
                                    
                                    setTimeout(() => {
                                        taskEl.style.transition = "";
                                    }, 300);
                                }, 50);
                            }
                        }, 300);
                    }
                });
            });

            dropdownOpen = true;

            // Cerrar al hacer clic fuera
            setTimeout(() => {
                document.addEventListener("click", function closeDropdown() {
                    dropdown.remove();
                    dropdownOpen = false;
                    document.removeEventListener("click", closeDropdown);
                });
            }, 100);
        });
    }

    /**
     * Crea el selector de estado
     */
    createStatusSelector(container, task, taskEl) {
        const btn = container.createEl("button", {
            text: this.getTaskStatusIcon(task.checkboxState) || "⚪",
            cls: "task-status-btn"
        });
        btn.title = "Cambiar estado";

        let dropdownOpen = false;

        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            if (dropdownOpen) {
                const existingDropdown = container.querySelector(".status-dropdown");
                if (existingDropdown) existingDropdown.remove();
                dropdownOpen = false;
                return;
            }

            const dropdown = container.createDiv({ cls: "status-dropdown" });

            const states = [
                { value: " ", icon: "⚪", label: "No comenzada" },
                { value: "/", icon: "🔄", label: "En curso" },
                { value: "w", icon: "⏸️", label: "En espera" },
                { value: "d", icon: "👤", label: "Delegada" }
            ];

            states.forEach(s => {
                const option = dropdown.createDiv({ cls: "status-option" });
                option.createSpan({ text: s.icon });
                option.createSpan({ text: ` ${s.label}` });

                if (s.value === task.checkboxState) {
                    option.classList.add("selected");
                }

                option.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    await this.updateTaskStatus(task, s.value);
                    btn.setText(s.icon);
                    dropdown.remove();
                    dropdownOpen = false;

                    // Actualizar icono en la tarjeta
                    const statusIconEl = taskEl.querySelector(".task-status-icon");
                    if (statusIconEl) {
                        statusIconEl.setText(s.icon + " ");
                    } else if (s.value !== ' ') {
                        // Añadir icono si no existía y el estado no es "no comenzada"
                        const textContainer = taskEl.querySelector('.task-text');
                        if (textContainer) {
                            const newIcon = textContainer.createSpan({ 
                                text: s.icon + " ",
                                cls: "task-status-icon"
                            });
                            textContainer.insertBefore(newIcon, textContainer.firstChild);
                        }
                    }
                });
            });

            dropdownOpen = true;

            setTimeout(() => {
                document.addEventListener("click", function closeDropdown() {
                    dropdown.remove();
                    dropdownOpen = false;
                    document.removeEventListener("click", closeDropdown);
                });
            }, 100);
        });
    }

    /**
     * Configura el drag & drop para una tarjeta
     */
    setupDraggable(element, task) {
        element.addEventListener("dragstart", (e) => {
            this.draggedTask = task;
            this.draggedElement = element;
            element.classList.add("dragging");
            e.dataTransfer.effectAllowed = "move";
        });

        element.addEventListener("dragend", () => {
            element.classList.remove("dragging");
            this.draggedTask = null;
            this.draggedElement = null;
        });
    }

    /**
     * Actualiza solo la barra de etiquetas sin redibujar la matriz
     */
    updateTagsBar() {
        const tagsBarEl = document.querySelector('.eisenhower-tags-bar');
        if (!tagsBarEl) return;
        
        // Limpiar contenido actual
        tagsBarEl.empty();
        
        // Recopilar todas las etiquetas visibles
        const visibleTasks = this.getVisibleTasks();
        const tagCounts = {};
        
        visibleTasks.forEach(task => {
            task.tags.forEach(tag => {
                const tagLower = tag.toLowerCase();
                // Filtrar #urgent y #noturgent
                if (tagLower === '#urgent' || tagLower === '#noturgent') {
                    return;
                }
                if (!tagCounts[tagLower]) {
                    tagCounts[tagLower] = { tag: tag, count: 0 };
                }
                tagCounts[tagLower].count++;
            });
        });

        // Mostrar etiquetas
        const tagEntries = Object.values(tagCounts).sort((a, b) => b.count - a.count);
        
        if (tagEntries.length === 0) {
            tagsBarEl.createSpan({ text: "No hay etiquetas", cls: "no-tags" });
            return;
        }

        tagEntries.forEach(({ tag, count }) => {
            const tagPill = tagsBarEl.createEl("button", {
                cls: "tag-pill clickable"
            });
            
            const tagText = tagPill.createSpan({ 
                text: tag,
                cls: "tag-text"
            });
            
            const tagCount = tagPill.createSpan({ 
                text: ` (${count})`,
                cls: "tag-count"
            });

            // Al hacer clic, añadir al filtro de búsqueda
            tagPill.addEventListener("click", () => {
                const searchInput = document.querySelector(".search-input");
                if (searchInput) {
                    searchInput.value = tag;
                    this.filters.searchText = tag.toLowerCase();
                    this.refreshMatrix();
                }
            });

            // Color de la etiqueta
            const color = this.getTagColor(tag);
            tagPill.style.backgroundColor = color;
            tagPill.style.color = this.getContrastColor(color);
        });
    }

    /**
     * Crea el selector de cuadrante
     */
    createQuadrantSelector(container, task, taskEl) {
        const currentQuadrant = this.classifyTask(task);
        
        // Iconos para cada cuadrante
        const quadrantIcons = {
            q1: "🔴",
            q2: "🟢",
            q3: "🟡",
            q4: "⚪",
            unclassified: "📋"
        };
        
        const btn = container.createEl("button", {
            text: quadrantIcons[currentQuadrant] || "📋",
            cls: "task-quadrant-btn"
        });
        btn.title = "Mover a cuadrante";

        let dropdownOpen = false;

        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            if (dropdownOpen) {
                const existingDropdown = document.querySelector(".quadrant-dropdown-fixed");
                if (existingDropdown) existingDropdown.remove();
                dropdownOpen = false;
                return;
            }

            // Crear dropdown con posición fixed para evitar recortes
            const dropdown = document.body.createDiv({ cls: "quadrant-dropdown-fixed" });
            
            // Calcular posición alineada a la derecha del botón
            const rect = btn.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + 4) + "px";
            dropdown.style.right = (window.innerWidth - rect.right) + "px";

            const quadrants = [
                { id: "q1", icon: "🔴", label: "Urgente e Importante" },
                { id: "q2", icon: "🟢", label: "No urgente e Importante" },
                { id: "q3", icon: "🟡", label: "Urgente y No importante" },
                { id: "q4", icon: "⚪", label: "No urgente y No importante" }
            ];

            quadrants.forEach(q => {
                const option = dropdown.createDiv({ cls: "quadrant-option" });
                option.createSpan({ text: q.icon });
                option.createSpan({ text: ` ${q.label}` });

                if (q.id === currentQuadrant) {
                    option.classList.add("selected");
                }

                option.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    
                    // Mover tarea al cuadrante seleccionado
                    await this.moveTaskToQuadrant(task, q.id);
                    btn.setText(q.icon);
                    dropdown.remove();
                    dropdownOpen = false;

                    // Animar movimiento de la tarjeta
                    taskEl.style.transition = "all 0.3s ease-out";
                    taskEl.style.opacity = "0";
                    taskEl.style.transform = "scale(0.95)";
                    
                    setTimeout(() => {
                        taskEl.remove();
                        this.updateQuadrantCounters();
                        this.updateTagsBar();
                        // Recrear matriz para mostrar la tarea en su nuevo cuadrante
                        this.refreshMatrix();
                    }, 300);
                });
            });

            dropdownOpen = true;

            setTimeout(() => {
                document.addEventListener("click", function closeDropdown() {
                    dropdown.remove();
                    dropdownOpen = false;
                    document.removeEventListener("click", closeDropdown);
                });
            }, 10);
        });
    }

    /**
     * Actualiza los metadatos visibles de una tarjeta de tarea
     */
    updateTaskCardMetadata(taskEl, task) {
        // Actualizar botón de prioridad
        const priorityBtn = taskEl.querySelector('.task-priority-btn');
        if (priorityBtn) {
            priorityBtn.textContent = this.getPriorityEmoji(task.priority);
        }
        
        // Actualizar etiquetas en el texto de la tarea
        const textContainer = taskEl.querySelector('.task-text');
        if (textContainer) {
            // Limpiar y recrear el contenido
            textContainer.empty();
            
            // Icono de estado
            const statusIcon = this.getTaskStatusIcon(task.checkboxState || " ");
            if (statusIcon) {
                textContainer.createSpan({ 
                    text: statusIcon + " ",
                    cls: "task-status-icon"
                });
            }
            
            // Procesar texto
            this.processTaskText(textContainer, task);
        }
        
        // Actualizar enlace a página (no cambia, pero por consistencia)
        const pageLink = taskEl.querySelector('.task-page-link');
        if (pageLink) {
            pageLink.textContent = `📄 ${task.path.split('/').pop().replace('.md', '')}`;
        }
    }

    /**
     * Actualiza los contadores de todos los cuadrantes
     */
    updateQuadrantCounters() {
        const quadrants = ['q1', 'q2', 'q3', 'q4', 'unclassified'];
        
        quadrants.forEach(qId => {
            const quadrantEl = document.querySelector(`.quadrant-${qId}`);
            if (quadrantEl) {
                const tasksContainer = quadrantEl.querySelector('.quadrant-tasks');
                const taskCount = tasksContainer ? tasksContainer.querySelectorAll('.task-item').length : 0;
                
                const counterEl = quadrantEl.querySelector('.quadrant-count');
                if (counterEl) {
                    counterEl.textContent = `${taskCount} tarea${taskCount !== 1 ? 's' : ''}`;
                }
            }
        });
    }

    /**
     * Configura una zona de drop
     */
    setupDropZone(container, quadrantId) {
        container.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            container.classList.add("drag-over");
        });

        container.addEventListener("dragleave", () => {
            container.classList.remove("drag-over");
        });

        container.addEventListener("drop", async (e) => {
            e.preventDefault();
            container.classList.remove("drag-over");

            if (!this.draggedTask || !this.draggedElement) return;

            const oldQuadrant = this.classifyTask(this.draggedTask);
            
            // Si ya está en el mismo cuadrante, no hacer nada
            if (oldQuadrant === quadrantId) return;

            // Guardar referencia al elemento
            const element = this.draggedElement;
            const task = this.draggedTask;
            
            // Primero: actualizar la tarea en el archivo (asíncrono)
            await this.moveTaskToQuadrant(task, quadrantId);
            
            // Segundo: mover el elemento visualmente (síncrono)
            element.style.transition = "all 0.3s ease-out";
            element.style.opacity = "0";
            element.style.transform = "scale(0.95)";
            
            setTimeout(() => {
                // Remover del contenedor viejo
                element.remove();
                
                // Añadir al nuevo contenedor
                container.appendChild(element);
                
                // Resetear estilos
                element.style.opacity = "0";
                element.style.transform = "scale(0.95)";
                
                // Animar entrada
                requestAnimationFrame(() => {
                    element.style.opacity = "1";
                    element.style.transform = "scale(1)";
                    
                    // Actualizar metadatos después de la animación
                    setTimeout(() => {
                        this.updateTaskCardMetadata(element, task);
                        this.updateQuadrantCounters();
                        this.updateTagsBar();
                        element.style.transition = "";
                    }, 300);
                });
            }, 300);
        });
    }

    /**
     * Mueve una tarea a un cuadrante
     */
    async moveTaskToQuadrant(task, quadrantId) {
        let newPriority = task.priority;
        let tagsToAdd = [];
        let tagsToRemove = [];

        switch (quadrantId) {
            case 'q1': // Urgente e Importante
                newPriority = 'highest';
                tagsToAdd = ['#urgent'];
                tagsToRemove = ['#noturgent'];
                break;
            case 'q2': // No urgente e Importante
                newPriority = 'high';
                tagsToAdd = ['#noturgent'];
                tagsToRemove = ['#urgent'];
                break;
            case 'q3': // Urgente y No importante
                newPriority = 'medium';
                tagsToAdd = ['#urgent'];
                tagsToRemove = ['#noturgent'];
                break;
            case 'q4': // No urgente y No importante
                newPriority = 'low';
                tagsToAdd = ['#noturgent'];
                tagsToRemove = ['#urgent'];
                break;
            case 'unclassified':
                // Mantener prioridad actual pero quitar etiquetas de urgencia
                tagsToRemove = ['#urgent', '#noturgent'];
                break;
        }

        // Actualizar prioridad
        if (newPriority !== task.priority) {
            await this.updateTaskPriority(task, newPriority);
        }

        // Actualizar etiquetas
        await this.updateTaskTags(task, tagsToAdd, tagsToRemove);
    }

    /**
     * Actualiza las etiquetas de una tarea
     */
    async updateTaskTags(task, tagsToAdd, tagsToRemove) {
        try {
            const file = this.dv.app.vault.getAbstractFileByPath(task.path);
            if (!file) return;

            const content = await this.dv.app.vault.read(file);
            const lines = content.split('\n');
            
            if (task.line < 0 || task.line >= lines.length) return;

            let taskLine = lines[task.line];

            // Remover etiquetas (con flag Unicode)
            tagsToRemove.forEach(tag => {
                const tagRegex = new RegExp(tag + '\\b', 'giu');
                taskLine = taskLine.replace(tagRegex, '');
            });

            // Añadir etiquetas si no existen
            tagsToAdd.forEach(tag => {
                if (!taskLine.toLowerCase().includes(tag.toLowerCase())) {
                    taskLine += ' ' + tag;
                }
            });

            // Limpiar espacios múltiples (con flag Unicode)
            taskLine = taskLine.replace(/\s+/gu, ' ').trim();

            lines[task.line] = taskLine;
            await this.dv.app.vault.modify(file, lines.join('\n'));

            // Actualizar tarea en memoria
            task.tags = this.extractTags(taskLine);
        } catch (error) {
            console.error('Error updating task tags:', error);
        }
    }

    /**
     * Actualiza la prioridad de una tarea
     */
    async updateTaskPriority(task, newPriority) {
        try {
            const file = this.dv.app.vault.getAbstractFileByPath(task.path);
            if (!file) return;

            const content = await this.dv.app.vault.read(file);
            const lines = content.split('\n');
            
            if (task.line < 0 || task.line >= lines.length) return;

            let taskLine = lines[task.line];

            // Remover emoji de prioridad anterior (con flag Unicode)
            taskLine = taskLine.replace(/[🔺⏫🔼🔽⏬]/gu, '');

            // Añadir nuevo emoji de prioridad
            const newEmoji = this.getPriorityEmoji(newPriority);
            if (newEmoji !== '➖') {
                taskLine += ' ' + newEmoji;
            }

            taskLine = taskLine.replace(/\s+/gu, ' ').trim();

            lines[task.line] = taskLine;
            await this.dv.app.vault.modify(file, lines.join('\n'));

            // Actualizar tarea en memoria
            task.priority = newPriority;
        } catch (error) {
            console.error('Error updating task priority:', error);
        }
    }

    /**
     * Actualiza el estado de una tarea
     */
    async updateTaskStatus(task, newStatus) {
        try {
            const file = this.dv.app.vault.getAbstractFileByPath(task.path);
            if (!file) return;

            const content = await this.dv.app.vault.read(file);
            const lines = content.split('\n');
            
            if (task.line < 0 || task.line >= lines.length) return;

            let taskLine = lines[task.line];

            // Reemplazar estado del checkbox
            taskLine = taskLine.replace(/^\s*-\s*\[.\]/, `- [${newStatus}]`);

            lines[task.line] = taskLine;
            await this.dv.app.vault.modify(file, lines.join('\n'));

            // Actualizar tarea en memoria
            task.checkboxState = newStatus;
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    }

    /**
     * Marca una tarea como completada
     */
    async toggleTaskComplete(task, completed) {
        try {
            const file = this.dv.app.vault.getAbstractFileByPath(task.path);
            if (!file) return;

            const content = await this.dv.app.vault.read(file);
            const lines = content.split('\n');
            
            if (task.line < 0 || task.line >= lines.length) return;

            let taskLine = lines[task.line];

            if (completed) {
                taskLine = taskLine.replace(/^\s*-\s*\[.\]/, '- [x]');
            } else {
                taskLine = taskLine.replace(/^\s*-\s*\[x\]/, '- [ ]');
            }

            lines[task.line] = taskLine;
            await this.dv.app.vault.modify(file, lines.join('\n'));

            task.completed = completed;
        } catch (error) {
            console.error('Error toggling task completion:', error);
        }
    }

    /**
     * Cancela una tarea
     */
    async cancelTask(task) {
        try {
            const file = this.dv.app.vault.getAbstractFileByPath(task.path);
            if (!file) return;

            const content = await this.dv.app.vault.read(file);
            const lines = content.split('\n');
            
            if (task.line < 0 || task.line >= lines.length) return;

            let taskLine = lines[task.line];
            taskLine = taskLine.replace(/^\s*-\s*\[.\]/, '- [-]');

            lines[task.line] = taskLine;
            await this.dv.app.vault.modify(file, lines.join('\n'));

            task.completed = true;
        } catch (error) {
            console.error('Error cancelling task:', error);
        }
    }

    /**
     * Abre una nota en Obsidian en nueva pestaña y hace scroll a la línea
     */
    async openNote(notePath, lineNumber = null) {
        let file;
        
        // Si es una ruta completa
        if (notePath.includes('/') || notePath.includes('.md')) {
            file = this.dv.app.vault.getAbstractFileByPath(notePath);
        } else {
            // Si es solo un nombre (para wikilinks)
            file = this.dv.app.metadataCache.getFirstLinkpathDest(notePath, '');
        }
        
        if (file) {
            // Abrir en nueva pestaña
            const leaf = this.dv.app.workspace.getLeaf('tab');
            await leaf.openFile(file);
            
            // Si se especifica una línea, hacer scroll a ella
            if (lineNumber !== null) {
                // Esperar un poco a que el archivo se cargue
                setTimeout(() => {
                    const view = leaf.view;
                    if (view && view.editor) {
                        // Posicionar el cursor en la línea
                        view.editor.setCursor({ line: lineNumber, ch: 0 });
                        // Centrar la vista en esa línea
                        view.editor.scrollIntoView({ 
                            from: { line: lineNumber, ch: 0 }, 
                            to: { line: lineNumber, ch: 0 } 
                        }, true);
                    }
                }, 100);
            }
        }
    }

    /**
     * Muestra overlay con información de tarea enlazada
     */
    async showTaskOverlay(event, linkType, taskIds) {
        // Limpiar overlay anterior si existe
        this.hideTaskOverlay();
        
        // taskIds puede ser un array de IDs
        const ids = Array.isArray(taskIds) ? taskIds : [taskIds];
        
        // Buscar tareas para cada ID
        const allLinkedTasks = [];
        for (const taskId of ids) {
            const linkedTasks = await this.findTasksById(taskId, linkType);
            if (linkedTasks && linkedTasks.length > 0) {
                allLinkedTasks.push(...linkedTasks);
            }
        }
        
        if (allLinkedTasks.length === 0) {
            return;
        }

        // Crear overlay
        const overlay = document.body.createDiv('task-overlay');
        overlay.id = 'task-overlay-' + Date.now();
        this.currentOverlay = overlay;

        const header = overlay.createDiv('task-overlay-header');
        if (linkType === '⛔') {
            header.textContent = allLinkedTasks.length > 1
                ? `⛔ Tareas bloqueantes (${allLinkedTasks.length})`
                : '⛔ Tarea bloqueante';
        } else {
            header.textContent = allLinkedTasks.length > 1 
                ? `🆔 Tareas dependientes (${allLinkedTasks.length})`
                : '🆔 Tarea dependiente';
        }

        // Mostrar cada tarea enlazada
        allLinkedTasks.forEach((linkedTask, index) => {
            if (index > 0) {
                const separator = overlay.createDiv();
                separator.style.cssText = `
                    border-top: 1px solid var(--background-modifier-border);
                    margin: 8px 0;
                `;
            }
            
            const content = overlay.createDiv('task-overlay-content');
            content.textContent = linkedTask.text;

            const meta = overlay.createDiv('task-overlay-meta');
            meta.innerHTML = `
                <div>📄 ${linkedTask.file.name}</div>
                ${linkedTask.date ? `<div>🛫 ${linkedTask.date}</div>` : ''}
            `;
        });

        // Posicionar overlay cerca del mouse
        const x = event.clientX + 10;
        const y = event.clientY + 10;
        overlay.style.left = x + 'px';
        overlay.style.top = y + 'px';

        // Ajustar si se sale de la pantalla
        setTimeout(() => {
            const rect = overlay.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                overlay.style.left = (window.innerWidth - rect.width - 10) + 'px';
            }
            if (rect.bottom > window.innerHeight) {
                overlay.style.top = (window.innerHeight - rect.height - 10) + 'px';
            }
        }, 10);

        // Eventos para mantener el overlay visible
        overlay.addEventListener('mouseenter', () => {
            this.overlayHovered = true;
        });
        overlay.addEventListener('mouseleave', () => {
            this.overlayHovered = false;
            setTimeout(() => {
                if (!this.overlayHovered && !this.triggerHovered) {
                    this.hideTaskOverlay();
                }
            }, 100);
        });
    }

    /**
     * Oculta el overlay de tarea
     */
    hideTaskOverlay() {
        if (this.currentOverlay) {
            this.currentOverlay.remove();
            this.currentOverlay = null;
            this.overlayHovered = false;
            this.triggerHovered = false;
        }
    }

    /**
     * Busca tareas por ID
     */
    async findTasksById(taskId, linkType) {
        const foundTasks = [];
        let files = this.dv.app.vault.getMarkdownFiles();

        if (this.config.folder) {
            files = files.filter(f => f.path.startsWith(this.config.folder));
        }
        
        // Determinar qué patrón buscar según el tipo de enlace
        const searchPattern = linkType === '⛔' ? '🆔' : '⛔';
        
        for (const file of files) {
            const content = await this.dv.app.vault.read(file);
            const lines = content.split('\n');
            
            for (let index = 0; index < lines.length; index++) {
                const line = lines[index];
                
                // Buscar tareas (no completadas ni canceladas)
                const taskMatch = line.match(/^[\s]*[-*]\s+\[([x\- \/wd])\]/u);
                if (taskMatch) {
                    const checkboxState = taskMatch[1];
                    
                    // Filtrar completadas (x) y canceladas (-)
                    if (checkboxState === 'x' || checkboxState === '-') {
                        continue;
                    }
                    
                    // Buscar el patrón correcto según el tipo de enlace
                    const regex = new RegExp(`${searchPattern}\\s*([a-zA-Z0-9,]+)`);
                    const idMatch = line.match(regex);
                    if (idMatch) {
                        // Extraer los IDs (puede ser uno o varios separados por comas)
                        const ids = idMatch[1].split(',').map(id => id.trim());
                        
                        // Verificar si alguno de los IDs coincide
                        if (ids.includes(taskId)) {
                            // Extraer texto de la tarea
                            let taskText = line
                                .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
                                .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '')
                                .replace(/[🔺⏫🔼🔽⏬]/gu, '')
                                .replace(/[🔁♻️]/gu, '')
                                .replace(/#[\w-]+/gu, '')
                                .replace(/\s+/g, ' ')
                                .trim();
                            
                            // Buscar fecha de inicio
                            const dateMatch = line.match(/🛫\s*(\d{4}-\d{2}-\d{2})/u);
                            
                            const taskInfo = {
                                text: taskText || 'Sin descripción',
                                file: file,
                                line: index,
                                date: dateMatch ? dateMatch[1] : null,
                                fullLine: line
                            };
                            
                            // Si es ⛔ (before), solo devolver la primera tarea encontrada
                            if (linkType === '⛔') {
                                return [taskInfo];
                            }
                            
                            // Si es 🆔 (after), agregar a la lista para devolver todas
                            foundTasks.push(taskInfo);
                        }
                    }
                }
            }
        }
        
        return foundTasks;
    }

    /**
     * Refresca la matriz sin recargar las tareas
     */
    refreshMatrix() {
        // Usar la referencia guardada al zoom wrapper
        if (!this.zoomWrapper) {
            // Si no existe, buscar en el DOM
            this.zoomWrapper = document.querySelector('.eisenhower-zoom-wrapper');
        }
        
        if (!this.zoomWrapper) return;

        // Remover solo la matriz
        const matrix = this.zoomWrapper.querySelector('.eisenhower-matrix-grid');
        if (matrix) matrix.remove();

        // Actualizar barra de etiquetas
        this.updateTagsBar();

        // Recrear matriz
        this.createMatrix(this.zoomWrapper);
        
        // Reaplicar zoom si existe
        const savedZoom = localStorage.getItem('eisenhower-zoom') || '100';
        const scale = parseInt(savedZoom) / 100;
        const matrixGrid = this.zoomWrapper.querySelector('.eisenhower-matrix-grid');
        if (matrixGrid) {
            matrixGrid.style.transform = `scale(${scale})`;
            matrixGrid.style.transformOrigin = 'top left';
            matrixGrid.style.width = `${100 / scale}%`;
        }
    }

    // ==================== UTILIDADES ====================

    getPriorityEmoji(priority) {
        const emojis = {
            'highest': '🔺',
            'high': '⏫',
            'medium': '🔼',
            'normal': '➖',
            'low': '🔽',
            'lowest': '⏬'
        };
        return emojis[priority] || '➖';
    }

    getPriorityLabel(priority) {
        const labels = {
            'highest': '🔺 Highest',
            'high': '⏫ High',
            'medium': '🔼 Medium',
            'normal': '➖ Normal',
            'low': '🔽 Low',
            'lowest': '⏬ Lowest'
        };
        return labels[priority] || priority;
    }

    getTaskStatusIcon(checkboxState) {
        const icons = {
            '/': '🔄',
            'w': '⏸️',
            'd': '👤'
        };
        return icons[checkboxState] || '';
    }

    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    getTagColor(tag) {
        // Generar color consistente basado en el hash del tag
        let hash = 0;
        for (let i = 0; i < tag.length; i++) {
            hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }

    getContrastColor(bgColor) {
        // Extraer valores RGB del color HSL
        const temp = document.createElement('div');
        temp.style.color = bgColor;
        document.body.appendChild(temp);
        const rgb = window.getComputedStyle(temp).color;
        document.body.removeChild(temp);

        const matches = rgb.match(/\d+/g);
        if (!matches || matches.length < 3) return '#000';

        const r = parseInt(matches[0]);
        const g = parseInt(matches[1]);
        const b = parseInt(matches[2]);

        // Calcular luminancia
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000' : '#fff';
    }

    /**
     * Aplica los estilos CSS
     */
    applyStyles(container) {
        const style = container.createEl('style');
        style.textContent = `
            /* Contenedor principal con ancho completo */
            .eisenhower-matrix-container {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                padding: 15px 20px !important;
                background: var(--background-primary);
                font-family: var(--font-interface);
                box-sizing: border-box;
                overflow-x: visible;
            }

            .eisenhower-matrix-container * {
                box-sizing: border-box;
            }
            
            /* Wrapper para zoom */
            .eisenhower-zoom-wrapper {
                width: 100%;
                overflow-x: auto;
                overflow-y: visible;
                position: relative;
                min-height: 400px;
            }

            .eisenhower-top-bar {
                display: flex;
                gap: 15px;
                align-items: center;
                margin-bottom: 15px;
                margin-top: 20px;
                padding: 12px 16px;
                background: var(--background-secondary);
                border-radius: 8px;
                flex-wrap: wrap;
            }

            .eisenhower-tags-bar {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 20px;
                padding: 12px 16px;
                background: var(--background-secondary);
                border-radius: 8px;
                min-height: 44px;
                align-items: center;
            }

            .zoom-container {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 10px;
                background: var(--background-primary);
                border-radius: 6px;
            }

            .zoom-icon {
                font-size: 14px;
            }

            .zoom-slider {
                width: 100px;
                cursor: pointer;
            }

            .zoom-value {
                font-size: 12px;
                color: var(--text-muted);
                min-width: 40px;
                font-weight: 500;
            }

            .search-container {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
                min-width: 200px;
            }

            .search-icon {
                font-size: 16px;
            }

            .search-input {
                flex: 1;
                padding: 6px 12px;
                border: 1px solid var(--background-modifier-border);
                border-radius: 6px;
                background: var(--background-primary);
                color: var(--text-normal);
                font-size: 14px;
            }

            .filter-container {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .filter-label {
                font-size: 13px;
                color: var(--text-muted);
                font-weight: 500;
            }

            .filter-select {
                padding: 6px 10px;
                border: 1px solid var(--background-modifier-border);
                border-radius: 6px;
                background: var(--background-primary);
                color: var(--text-normal);
                font-size: 13px;
                cursor: pointer;
            }

            .today-checkbox {
                cursor: pointer;
                margin: 0;
            }

            .today-label {
                font-size: 13px;
                color: var(--text-normal);
                cursor: pointer;
                user-select: none;
                font-weight: 500;
            }

            .states-dropdown-container {
                position: relative;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .states-dropdown-btn {
                padding: 6px 12px;
                border: 1px solid var(--background-modifier-border);
                border-radius: 6px;
                background: var(--background-primary);
                color: var(--text-normal);
                font-size: 13px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: background 0.2s;
            }

            .states-dropdown-btn:hover {
                background: var(--background-modifier-hover);
            }

            .states-dropdown-menu {
                position: absolute;
                top: calc(100% + 4px);
                left: 0;
                background: var(--background-primary);
                border: 1px solid var(--background-modifier-border);
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                min-width: 200px;
                padding: 8px;
            }

            .dropdown-option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 8px;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .dropdown-option:hover {
                background: var(--background-modifier-hover);
            }

            .dropdown-checkbox {
                cursor: pointer;
                margin: 0;
            }

            .dropdown-label {
                cursor: pointer;
                user-select: none;
                font-size: 13px;
                color: var(--text-normal);
                flex: 1;
            }

            .refresh-btn {
                padding: 6px 14px;
                background: var(--interactive-accent);
                color: var(--text-on-accent);
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: opacity 0.2s;
            }

            .refresh-btn:hover {
                opacity: 0.8;
            }

            .no-tags {
                color: var(--text-muted);
                font-size: 13px;
                font-style: italic;
            }

            .tag-pill {
                padding: 5px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }

            .tag-pill:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }

            .tag-count {
                opacity: 0.8;
                font-size: 11px;
            }

            .eisenhower-matrix-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: auto auto;
                gap: 20px;
                margin-top: 20px;
                width: fit-content;
                min-width: 100%;
            }

            /* Posicionamiento explícito de cuadrantes */
            .quadrant-q1 {
                grid-column: 1;
                grid-row: 1;
            }

            .quadrant-q2 {
                grid-column: 2;
                grid-row: 1;
            }

            .quadrant-q3 {
                grid-column: 1;
                grid-row: 2;
            }

            .quadrant-q4 {
                grid-column: 2;
                grid-row: 2;
            }

            .quadrant-unclassified {
                grid-column: 3;
                grid-row: 1 / 3;  /* Ocupa 2 filas */
                border-top: 4px solid #6366f1;
            }

            /* Scrollbar personalizado */
            .eisenhower-zoom-wrapper::-webkit-scrollbar {
                height: 12px;
            }

            .eisenhower-zoom-wrapper::-webkit-scrollbar-track {
                background: var(--background-secondary);
                border-radius: 6px;
            }

            .eisenhower-zoom-wrapper::-webkit-scrollbar-thumb {
                background: var(--background-modifier-border);
                border-radius: 6px;
            }

            .eisenhower-zoom-wrapper::-webkit-scrollbar-thumb:hover {
                background: var(--text-muted);
            }

            .eisenhower-quadrant {
                background: var(--background-secondary);
                border-radius: 12px;
                padding: 16px;
                min-height: 300px;
                display: flex;
                flex-direction: column;
                transition: all 0.3s;
            }

            .quadrant-q1 {
                border-top: 4px solid #ef4444;
            }

            .quadrant-q2 {
                border-top: 4px solid #22c55e;
            }

            .quadrant-q3 {
                border-top: 4px solid #eab308;
            }

            .quadrant-q4 {
                border-top: 4px solid #94a3b8;
            }

            .quadrant-header {
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--background-modifier-border);
            }

            .quadrant-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-normal);
                margin-bottom: 4px;
            }

            .quadrant-subtitle {
                font-size: 12px;
                color: var(--text-muted);
                margin-bottom: 6px;
            }

            .quadrant-count {
                font-size: 12px;
                color: var(--text-muted);
                font-weight: 500;
            }

            .quadrant-tasks {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 10px;
                overflow-y: auto;
                min-height: 100px;
                transition: background-color 0.2s;
            }

            .quadrant-tasks.drag-over {
                background: var(--background-modifier-hover);
                border-radius: 8px;
            }

            .task-group {
                margin-bottom: 12px;
            }

            .task-group-header {
                padding: 6px 10px;
                background: var(--background-primary);
                border-radius: 6px;
                margin-bottom: 8px;
            }

            .task-group-title {
                font-size: 13px;
                font-weight: 600;
                color: var(--text-muted);
            }

            .task-group-tasks {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding-left: 12px;
            }

            .task-item {
                background: var(--background-primary);
                border: 1px solid var(--background-modifier-border);
                border-radius: 8px;
                padding: 12px;
                cursor: move;
                transition: all 0.2s;
                position: relative;
            }

            .task-item:hover {
                border-color: var(--interactive-accent);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .task-item.dragging {
                opacity: 0.5;
                transform: rotate(2deg);
            }

            .task-actions {
                position: absolute;
                top: 8px;
                right: 8px;
                display: flex;
                gap: 4px;
                z-index: 10;
            }

            .task-cancel-btn,
            .task-priority-btn,
            .task-status-btn {
                width: 24px;
                height: 24px;
                border: 1px solid var(--background-modifier-border);
                background: var(--background-secondary);
                color: var(--text-muted);
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                padding: 0;
            }

            .task-cancel-btn:hover {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .task-priority-btn:hover,
            .task-status-btn:hover,
            .task-quadrant-btn:hover {
                background: var(--interactive-accent);
                color: var(--text-on-accent);
                border-color: var(--interactive-accent);
            }

            .task-quadrant-btn {
                width: 24px;
                height: 24px;
                border: 1px solid var(--background-modifier-border);
                background: var(--background-secondary);
                color: var(--text-muted);
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                padding: 0;
            }

            .priority-dropdown,
            .status-dropdown,
            .quadrant-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 4px;
                background: var(--background-primary);
                border: 1px solid var(--background-modifier-border);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                min-width: 200px;
                overflow: hidden;
            }

            .quadrant-dropdown-fixed {
                position: fixed;
                background: var(--background-primary);
                border: 1px solid var(--background-modifier-border);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                min-width: 240px;
                overflow: hidden;
            }

            .priority-option,
            .status-option,
            .quadrant-option {
                padding: 8px 12px;
                cursor: pointer;
                font-size: 13px;
                transition: background 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .priority-option:hover,
            .status-option:hover,
            .quadrant-option:hover {
                background: var(--background-modifier-hover);
            }

            .priority-option.selected,
            .status-option.selected,
            .quadrant-option.selected {
                background: var(--interactive-accent);
                color: var(--text-on-accent);
            }

            .task-content-wrapper {
                display: flex;
                gap: 10px;
                align-items: flex-start;
                margin-top: 4px;
                padding-right: 110px;
            }

            .task-checkbox {
                flex-shrink: 0;
                margin-top: 3px;
                cursor: pointer;
            }

            .task-text {
                flex: 1;
                color: var(--text-normal);
                font-size: 14px;
                line-height: 1.5;
                word-wrap: break-word;
            }

            .task-text.completed {
                text-decoration: line-through;
                color: var(--text-muted);
            }

            .task-status-icon {
                margin-right: 4px;
            }

            .wiki-link {
                color: var(--link-color);
                text-decoration: none;
                cursor: pointer;
                padding: 0 2px;
                border-radius: 3px;
                transition: background 0.2s;
            }

            .wiki-link:hover {
                background: var(--background-modifier-hover);
                text-decoration: underline;
            }

            .task-link {
                cursor: help;
                position: relative;
                display: inline;
                text-decoration: underline dotted;
                text-decoration-color: var(--text-muted);
            }

            .task-overlay {
                position: fixed;
                background: var(--background-primary);
                border: 2px solid var(--interactive-accent);
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                max-width: 400px;
                min-width: 250px;
                max-height: 400px;
                overflow-y: auto;
            }

            .task-overlay-header {
                font-size: 11px;
                color: var(--text-muted);
                margin-bottom: 8px;
                font-weight: 600;
                text-transform: uppercase;
            }

            .task-overlay-content {
                font-size: 13px;
                color: var(--text-normal);
                line-height: 1.5;
            }

            .task-overlay-meta {
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid var(--background-modifier-border);
                font-size: 11px;
                color: var(--text-muted);
            }

            .task-tag-pill {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 500;
                margin: 0 2px;
            }

            .task-meta {
                margin-top: 8px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                font-size: 12px;
            }

            .task-priority {
                padding: 3px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 500;
            }

            .priority-highest {
                background: rgba(239, 68, 68, 0.15);
                color: #ef4444;
            }

            .priority-high {
                background: rgba(249, 115, 22, 0.15);
                color: #f97316;
            }

            .priority-medium {
                background: rgba(234, 179, 8, 0.15);
                color: #eab308;
            }

            .priority-low {
                background: rgba(34, 197, 94, 0.15);
                color: #22c55e;
            }

            .priority-lowest {
                background: rgba(59, 130, 246, 0.15);
                color: #3b82f6;
            }

            .task-start-date {
                color: var(--text-muted);
                font-size: 12px;
            }

            .task-page-link {
                color: var(--link-color);
                text-decoration: none;
                font-size: 12px;
                padding: 4px 8px;
                border-radius: 4px;
                transition: all 0.2s;
                cursor: pointer;
                display: inline-block;
            }

            .task-page-link:hover {
                background: var(--background-modifier-hover);
                text-decoration: underline;
            }

            /* Responsive */
            @media (max-width: 1200px) {
                .eisenhower-matrix-grid {
                    grid-template-columns: repeat(2, 1fr);
                    grid-template-rows: auto auto auto;
                }
                
                /* Resetear posicionamiento para layout de 2 columnas */
                .quadrant-q1 {
                    grid-column: 1;
                    grid-row: 1;
                }
                
                .quadrant-q2 {
                    grid-column: 2;
                    grid-row: 1;
                }
                
                .quadrant-q3 {
                    grid-column: 1;
                    grid-row: 2;
                }
                
                .quadrant-q4 {
                    grid-column: 2;
                    grid-row: 2;
                }
                
                .quadrant-unclassified {
                    grid-column: 1 / 3;  /* Ocupa 2 columnas */
                    grid-row: 3;
                }
            }

            @media (max-width: 768px) {
                .eisenhower-matrix-grid {
                    grid-template-columns: 1fr;
                }
                
                /* Resetear todo el posicionamiento para 1 columna */
                .quadrant-q1,
                .quadrant-q2,
                .quadrant-q3,
                .quadrant-q4,
                .quadrant-unclassified {
                    grid-column: auto;
                    grid-row: auto;
                }

                .eisenhower-top-bar {
                    flex-direction: column;
                    align-items: stretch;
                }

                .search-container {
                    width: 100%;
                }
            }
        `;
    }
}

// Instanciar y renderizar automáticamente
const matrix = new EisenhowerMatrix(dv, config);
await matrix.render();
