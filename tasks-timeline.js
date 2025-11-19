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
const cssId = 'tasks-timeline-css-v24';

// Eliminar versiones antiguas del CSS
const oldCssVersions = [];
for (let i = 0; i <= 23; i++) {
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
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    padding: 15px 20px !important;
    background: var(--background-primary);
    font-family: var(--font-interface);
    box-sizing: border-box;
    transition: padding 0.3s ease;
    overflow-x: visible;
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
    display: block;
    margin-bottom: 6px;
    overflow: hidden;
}

.task-actions {
    float: right;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
    margin-bottom: 4px;
}

.task-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
    margin-top: 2px;
    margin-right: 8px;
    float: left;
}

.task-text {
    display: block;
    color: var(--text-normal);
    font-size: 13px;
    line-height: 1.5;
    word-wrap: break-word;
    word-break: break-word;
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

.task-priority-selector {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
}

.priority-button {
    width: 20px !important;
    height: 20px !important;
    padding: 0 !important;
    border: 1px solid red !important; /* DEBUG: ver el botón */
    background: transparent !important;
    color: var(--text-muted) !important;
    cursor: pointer !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    line-height: 1 !important;
    transition: all 0.2s ease;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
    min-width: 20px !important;
    max-width: 20px !important;
    min-height: 20px !important;
    max-height: 20px !important;
}

.priority-button:hover {
    background: var(--background-secondary);
    color: var(--interactive-accent);
}

.priority-dropdown {
    position: fixed;
    background: yellow; /* DEBUG: ver el dropdown */
    border: 2px solid red; /* DEBUG: ver el dropdown */
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    min-width: 120px;
}

.priority-option {
    padding: 6px 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    border-bottom: 1px solid var(--background-modifier-border);
}

.priority-option:last-child {
    border-bottom: none;
    border-radius: 0 0 6px 6px;
}

.priority-option:first-child {
    border-radius: 6px 6px 0 0;
}

.priority-option:hover {
    background: var(--background-modifier-hover);
}

.priority-option.selected {
    background: var(--background-modifier-active-hover);
    font-weight: 600;
}

.priority-emoji {
    font-size: 12px;
    width: 16px;
    text-align: center;
}

.priority-label {
    flex: 1;
    white-space: nowrap;
}

/* Selector de estado */
.task-status-selector {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
}

.status-button {
    width: 20px !important;
    height: 20px !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
    color: var(--text-muted) !important;
    cursor: pointer !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    line-height: 1 !important;
    transition: all 0.2s ease;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
    min-width: 20px !important;
    max-width: 20px !important;
    min-height: 20px !important;
    max-height: 20px !important;
}

.status-button:hover {
    background: var(--background-secondary);
    color: var(--interactive-accent);
}

.status-dropdown {
    position: fixed;
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    min-width: 130px;
}

.status-option {
    padding: 6px 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    border-bottom: 1px solid var(--background-modifier-border);
}

.status-option:last-child {
    border-bottom: none;
    border-radius: 0 0 6px 6px;
}

.status-option:first-child {
    border-radius: 6px 6px 0 0;
}

.status-option:hover {
    background: var(--background-modifier-hover);
}

.status-option.selected {
    background: var(--background-modifier-active-hover);
    font-weight: 600;
}

.status-emoji {
    font-size: 12px;
    width: 16px;
    text-align: center;
}

.status-label {
    flex: 1;
    white-space: nowrap;
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

.timeline-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    padding: 10px 20px;
    margin-bottom: 10px;
    gap: 20px;
}

.zoom-control {
    display: flex;
    align-items: center;
    gap: 10px;
}

.zoom-label {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
}

.zoom-slider {
    width: 100px;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--background-modifier-border);
    border-radius: 2px;
    outline: none;
}

.zoom-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--interactive-accent);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
}

.zoom-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
}

.zoom-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: var(--interactive-accent);
    border-radius: 50%;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
}

.zoom-slider::-moz-range-thumb:hover {
    transform: scale(1.2);
}

.zoom-value {
    font-size: 12px;
    color: var(--text-normal);
    font-weight: 600;
    min-width: 40px;
    text-align: center;
}

.timeline-refresh-btn {
    padding: 8px 16px;
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

/* Botón Postponer */
.postpone-btn {
    margin-top: 8px;
    padding: 6px 12px;
    font-size: 11px;
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 600;
    width: 100%;
}

.postpone-btn:hover {
    opacity: 0.85;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.postpone-btn:active {
    transform: translateY(0);
}

/* Filtros de estado y columnas - Dropdown */
.filter-dropdown-container {
    position: relative;
    display: inline-block;
}

.filter-dropdown-btn {
    padding: 4px 8px;
    font-size: 11px;
    border: 1px solid var(--background-modifier-border);
    background: var(--background-primary);
    color: var(--text-normal);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.filter-dropdown-btn:hover {
    background: var(--background-modifier-hover);
    border-color: var(--interactive-accent);
}

.filter-dropdown-btn.active {
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    border-color: var(--interactive-accent);
}

.filter-dropdown-arrow {
    font-size: 10px;
    transition: transform 0.2s ease;
}

.filter-dropdown-btn.open .filter-dropdown-arrow {
    transform: rotate(180deg);
}

.filter-dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 180px;
    padding: 8px;
    display: none;
}

.filter-dropdown-menu.show {
    display: block;
}

.filter-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.15s ease;
    font-size: 12px;
}

.filter-option:hover {
    background: var(--background-modifier-hover);
}

.filter-checkbox {
    width: 16px;
    height: 16px;
    border: 2px solid var(--background-modifier-border);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
}

.filter-checkbox.checked {
    background: var(--interactive-accent);
    border-color: var(--interactive-accent);
}

.filter-checkbox.checked::after {
    content: '✓';
    color: var(--text-on-accent);
    font-size: 12px;
    font-weight: bold;
}

.filter-option-label {
    flex: 1;
}

.filter-separator {
    width: 1px;
    height: 20px;
    background: var(--background-modifier-border);
    margin: 0 5px;
}

/* Overlay para tareas enlazadas */
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

/* Indicadores de estado de tarea */
.task-status-icon {
    display: inline;
}
    `;

    document.head.appendChild(style);
}

// Configuración
const config = {
    filter: input?.filter || "",
    showCompleted: input?.showCompleted !== false,
    daysView: input?.daysView || "full"  // "full", "2 days", "3 days", etc.
};

class TasksTimeline {
    constructor(container, app, dv, config) {
        this.dvContainer = container;
        this.app = app;
        this.dv = dv;
        this.config = config;
        
        // Filtros de visualización
        this.filters = {
            showInProgress: true,
            showWaiting: true,
            showDelegated: true,
            showNextWeek: true,
            showNoDate: true
        };
        
        // Buscar si ya existe un timeline persistente
        const existingTimeline = document.getElementById(timelineId);
        
        if (existingTimeline) {
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
    }

    getTaskStatus(checkboxState) {
        if (checkboxState === '/') return 'in-progress';
        if (checkboxState === 'w') return 'waiting';
        if (checkboxState === 'd') return 'delegated';
        if (checkboxState === 'x') return 'completed';
        if (checkboxState === '-') return 'cancelled';
        return 'todo';
    }

    getTaskStatusIcon(checkboxState) {
        const status = this.getTaskStatus(checkboxState);
        switch(status) {
            case 'in-progress': return '🔄';
            case 'waiting': return '⏸️';
            case 'delegated': return '👤';
            default: return '';
        }
    }

    shouldShowTask(checkboxState) {
        const status = this.getTaskStatus(checkboxState);
        
        if (status === 'in-progress' && !this.filters.showInProgress) return false;
        if (status === 'waiting' && !this.filters.showWaiting) return false;
        if (status === 'delegated' && !this.filters.showDelegated) return false;
        
        return true;
    }

    async init() {
        this.container.classList.add('tasks-timeline-container');
        await this.render();
    }

    // Función para comparar prioridades
    // Orden: 🔺 ⏫ (highest) > 🔼 (high) > sin prioridad > 🔽 (low) > ⏬ (lowest)
    comparePriority(lineA, lineB) {
        const getPriorityValue = (line) => {
            // Limpiar selectores de variación antes de comparar
            const cleanLine = line.replace(/[\uFE0E\uFE0F]/g, '');
            if (cleanLine.includes('🔺')) return 0;  // highest
            if (cleanLine.includes('⏫')) return 1;  // highest
            if (cleanLine.includes('🔼')) return 2;  // high
            if (cleanLine.includes('🔽')) return 4;  // low
            if (cleanLine.includes('⏬')) return 5;  // lowest
            return 3;  // sin prioridad (medio)
        };

        return getPriorityValue(lineA) - getPriorityValue(lineB);
    }

    // Función helper para normalizar líneas eliminando selectores de variación problemáticos
    normalizeLine(line) {
        // Eliminar selectores de variación Unicode que pueden causar problemas
        return line.replace(/[\uFE0E\uFE0F]/g, '');
    }

    async render() {
        this.container.empty();

        // Header con controles de zoom y botón de refrescar (ambos a la derecha)
        const header = this.container.createDiv('timeline-header');
        
        // Forzar alineación con estilos inline - usar space-between
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.width = '100%';
        header.style.maxWidth = '100%';
        header.style.gap = '8px';
        header.style.flexWrap = 'wrap';
        header.style.overflow = 'visible';
        header.style.boxSizing = 'border-box';
        
        // Grupo izquierdo: Control de zoom
        const leftGroup = header.createDiv();
        leftGroup.style.display = 'flex';
        leftGroup.style.alignItems = 'center';
        leftGroup.style.gap = '8px';
        leftGroup.style.flex = '0 1 auto'; // Puede encogerse si es necesario
        leftGroup.style.minWidth = '0'; // Permite que se encoja
        
        const zoomControl = leftGroup.createDiv('zoom-control');
        const zoomLabel = zoomControl.createSpan({ text: '🔍 Zoom:', cls: 'zoom-label' });
        
        const zoomSlider = zoomControl.createEl('input', { type: 'range' });
        zoomSlider.classList.add('zoom-slider');
        zoomSlider.min = '50';
        zoomSlider.max = '150';
        zoomSlider.step = '5';
        
        // Cargar zoom guardado o usar 100% por defecto
        const savedZoom = localStorage.getItem('tasks-timeline-zoom') || '100';
        zoomSlider.value = savedZoom;
        
        const zoomValue = zoomControl.createSpan({ text: `${savedZoom}%`, cls: 'zoom-value' });
        
        // Grupo derecho: Botones de control
        const rightGroup = header.createDiv();
        rightGroup.style.display = 'flex';
        rightGroup.style.alignItems = 'center';
        rightGroup.style.gap = '8px';
        rightGroup.style.flexWrap = 'wrap';
        rightGroup.style.justifyContent = 'flex-end';
        rightGroup.style.flex = '0 1 auto'; // No crecer pero puede encogerse
        
        // Botón de refrescar - más pequeño
        const refreshBtn = rightGroup.createEl('button', { text: '🔄 Refrescar' });
        refreshBtn.classList.add('timeline-refresh-btn');
        refreshBtn.style.fontSize = '11px';
        refreshBtn.style.padding = '4px 8px';
        refreshBtn.style.fontWeight = 'normal';
        refreshBtn.addEventListener('click', () => this.render());
        
        // Dropdown de Columnas
        const columnDropdownContainer = rightGroup.createDiv('filter-dropdown-container');
        columnDropdownContainer.style.display = 'inline-block';
        columnDropdownContainer.style.position = 'relative';
        columnDropdownContainer.style.visibility = 'visible';
        columnDropdownContainer.style.opacity = '1';
        
        const columnDropdownBtn = columnDropdownContainer.createEl('button', { text: '📋 Columnas ▼', cls: 'filter-dropdown-btn' });
        columnDropdownBtn.style.display = 'inline-flex';
        columnDropdownBtn.style.visibility = 'visible';
        
        const columnDropdownMenu = columnDropdownContainer.createDiv('filter-dropdown-menu');
        
        // Opción: Próxima semana
        const nextWeekOption = columnDropdownMenu.createDiv('filter-option');
        const nextWeekCheckbox = nextWeekOption.createDiv('filter-checkbox');
        if (this.filters.showNextWeek) nextWeekCheckbox.classList.add('checked');
        nextWeekOption.createSpan({ text: 'Próxima semana', cls: 'filter-option-label' });
        nextWeekOption.addEventListener('click', (e) => {
            e.stopPropagation();
            this.filters.showNextWeek = !this.filters.showNextWeek;
            this.render();
        });
        
        // Opción: Sin fecha
        const noDateOption = columnDropdownMenu.createDiv('filter-option');
        const noDateCheckbox = noDateOption.createDiv('filter-checkbox');
        if (this.filters.showNoDate) noDateCheckbox.classList.add('checked');
        noDateOption.createSpan({ text: 'Sin fecha', cls: 'filter-option-label' });
        noDateOption.addEventListener('click', (e) => {
            e.stopPropagation();
            this.filters.showNoDate = !this.filters.showNoDate;
            this.render();
        });
        
        // Toggle del dropdown de columnas
        columnDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = columnDropdownMenu.classList.contains('show');
            
            // Cerrar todos los otros dropdowns
            document.querySelectorAll('.filter-dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
            document.querySelectorAll('.filter-dropdown-btn.open').forEach(btn => {
                btn.classList.remove('open');
            });
            
            if (!isOpen) {
                columnDropdownMenu.classList.add('show');
                columnDropdownBtn.classList.add('open');
            }
        });
        
        // Dropdown de Estados
        const statusDropdownContainer = rightGroup.createDiv('filter-dropdown-container');
        statusDropdownContainer.style.display = 'inline-block';
        statusDropdownContainer.style.position = 'relative';
        statusDropdownContainer.style.visibility = 'visible';
        statusDropdownContainer.style.opacity = '1';
        
        const statusDropdownBtn = statusDropdownContainer.createEl('button', { text: '🏷️ Estados ▼', cls: 'filter-dropdown-btn' });
        statusDropdownBtn.style.display = 'inline-flex';
        statusDropdownBtn.style.visibility = 'visible';
        
        const statusDropdownMenu = statusDropdownContainer.createDiv('filter-dropdown-menu');
        
        // Opción: En curso
        const inProgressOption = statusDropdownMenu.createDiv('filter-option');
        const inProgressCheckbox = inProgressOption.createDiv('filter-checkbox');
        if (this.filters.showInProgress) inProgressCheckbox.classList.add('checked');
        inProgressOption.createSpan({ text: '🔄 En curso', cls: 'filter-option-label' });
        inProgressOption.addEventListener('click', (e) => {
            e.stopPropagation();
            this.filters.showInProgress = !this.filters.showInProgress;
            this.render();
        });
        
        // Opción: En espera
        const waitingOption = statusDropdownMenu.createDiv('filter-option');
        const waitingCheckbox = waitingOption.createDiv('filter-checkbox');
        if (this.filters.showWaiting) waitingCheckbox.classList.add('checked');
        waitingOption.createSpan({ text: '⏸️ En espera', cls: 'filter-option-label' });
        waitingOption.addEventListener('click', (e) => {
            e.stopPropagation();
            this.filters.showWaiting = !this.filters.showWaiting;
            this.render();
        });
        
        // Opción: Delegadas
        const delegatedOption = statusDropdownMenu.createDiv('filter-option');
        const delegatedCheckbox = delegatedOption.createDiv('filter-checkbox');
        if (this.filters.showDelegated) delegatedCheckbox.classList.add('checked');
        delegatedOption.createSpan({ text: '👤 Delegadas', cls: 'filter-option-label' });
        delegatedOption.addEventListener('click', (e) => {
            e.stopPropagation();
            this.filters.showDelegated = !this.filters.showDelegated;
            this.render();
        });
        
        // Toggle del dropdown de estados
        statusDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = statusDropdownMenu.classList.contains('show');
            
            // Cerrar todos los otros dropdowns
            document.querySelectorAll('.filter-dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
            document.querySelectorAll('.filter-dropdown-btn.open').forEach(btn => {
                btn.classList.remove('open');
            });
            
            if (!isOpen) {
                statusDropdownMenu.classList.add('show');
                statusDropdownBtn.classList.add('open');
            }
        });
        
        // Cerrar dropdowns al hacer clic fuera
        setTimeout(() => {
            const closeDropdowns = (e) => {
                if (!e.target.closest('.filter-dropdown-container')) {
                    document.querySelectorAll('.filter-dropdown-menu.show').forEach(menu => {
                        menu.classList.remove('show');
                    });
                    document.querySelectorAll('.filter-dropdown-btn.open').forEach(btn => {
                        btn.classList.remove('open');
                    });
                }
            };
            document.addEventListener('click', closeDropdowns);
        }, 0);

        const timelineMain = this.container.createDiv('timeline-main');

        // Aplicar zoom inicial centrado
        const zoomPercent = parseInt(savedZoom);
        timelineMain.style.transform = `scale(${zoomPercent / 100})`;
        timelineMain.style.transformOrigin = 'top center';
        
        // Event listener para el slider de zoom
        zoomSlider.addEventListener('input', (e) => {
            const zoom = e.target.value;
            zoomValue.textContent = `${zoom}%`;
            timelineMain.style.transform = `scale(${zoom / 100})`;
            localStorage.setItem('tasks-timeline-zoom', zoom);
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayOfWeek = today.getDay();

        // Calcular cuántos días mostrar según el modo
        let maxDaysToShow = Infinity;
        if (this.config.daysView !== "full") {
            const match = this.config.daysView.match(/^(\d+)\s*days?$/i);
            if (match) {
                maxDaysToShow = parseInt(match[1]);
            }
        }

        // Siempre mostrar tareas atrasadas
        await this.createOverdueContainer(timelineMain, today);
        
        // Mostrar "Hoy" (siempre)
        await this.createDayContainer(timelineMain, 'Hoy', 0, today);
        let daysShown = 1;

        // Mostrar días adicionales según el modo
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const daysUntilFriday = 5 - dayOfWeek;
            const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            
            for (let i = 1; i <= daysUntilFriday && daysShown < maxDaysToShow; i++) {
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate() + i);
                const dayName = dayNames[futureDate.getDay()];
                await this.createDayContainer(timelineMain, dayName, i, today);
                daysShown++;
            }
        }

        // Mostrar "Próxima Semana" si el filtro está activo
        if (this.filters.showNextWeek) {
            let daysUntilNextMonday;
            if (dayOfWeek === 0) {
                daysUntilNextMonday = 1;
            } else {
                daysUntilNextMonday = 8 - dayOfWeek;
            }
            await this.createDayContainer(timelineMain, 'Próxima Semana', daysUntilNextMonday, today);
        }

        // Mostrar "Sin Fecha" si el filtro está activo
        if (this.filters.showNoDate) {
            await this.createNoDateContainer(timelineMain);
        }
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
        // Solo filtrar tareas completadas, no las waiting/delegated/in-progress
        const activeTasks = tasks.filter(t => !t.completed);
        
        // Ordenar tareas por prioridad
        activeTasks.sort((a, b) => this.comparePriority(a.fullLine, b.fullLine));
        
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
        const overdueTasks = await this.getOverdueTasks(today);
        
        // Ordenar tareas por prioridad
        overdueTasks.sort((a, b) => this.comparePriority(a.fullLine, b.fullLine));
        
        // Si no hay tareas retrasadas, no crear la columna
        if (overdueTasks.length === 0) {
            return;
        }

        const dayContainer = parent.createDiv('day-container');
        dayContainer.classList.add('overdue-container');
        dayContainer.setAttribute('data-days-offset', '0');

        const header = dayContainer.createEl('div', { cls: 'day-header' });
        header.createEl('span', { text: '⚠️ Retrasadas', cls: 'day-label' });

        // Botón "Postponer" para mover todas las tareas a hoy
        const postponeBtn = dayContainer.createEl('button', { text: '⏭️ Postponer todas', cls: 'postpone-btn' });
        postponeBtn.addEventListener('click', async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = this.formatDate(today);
            
            for (const task of overdueTasks) {
                try {
                    await this.updateTaskDate(task.file.path, task.line, task.fullLine, todayStr);
                } catch (error) {
                    console.error('Error al postponer tarea:', error);
                }
            }
            
            // Refrescar después de mover todas
            setTimeout(() => this.render(), 500);
        });

        const tasksList = dayContainer.createDiv('tasks-list');

        for (const task of overdueTasks) {
            this.createTaskElement(tasksList, task);
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
        
        // Ordenar tareas por prioridad
        noDateTasks.sort((a, b) => this.comparePriority(a.fullLine, b.fullLine));
        
        if (noDateTasks.length === 0) {
            const emptyMsg = tasksList.createDiv('empty-message');
            emptyMsg.setText('Sin tareas');
        } else {
            for (const task of noDateTasks) {
                this.createTaskElement(tasksList, task);
            }
        }

        this.setupDropZone(tasksList, null, 'Sin Fecha');
    }

    createTaskElement(parent, task) {
        const taskEl = parent.createDiv('task-item');
        
        // Crear ID único basado en archivo y línea
        const taskId = `task-${task.file.path.replace(/[^a-zA-Z0-9]/g, '_')}-${task.line}`;
        taskEl.id = taskId;
        taskEl.setAttribute('draggable', 'true');

        const taskContent = taskEl.createDiv('task-content');

        // Contenedor de acciones: botones (primero en el DOM para float:right)
        const actions = taskContent.createDiv('task-actions');

        const cancelBtn = actions.createEl('button', { text: '✖' });
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

        // Selector de prioridad
        const prioritySelector = actions.createDiv('task-priority-selector');
        this.createPrioritySelector(prioritySelector, task, taskEl);

        // Selector de estado
        const statusSelector = actions.createDiv('task-status-selector');
        this.createStatusSelector(statusSelector, task, taskEl);

        // Checkbox (float: left)
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

        // Texto (fluye alrededor de checkbox y botones)
        const text = taskContent.createSpan();
        text.classList.add('task-text');
        if (task.completed) {
            text.classList.add('completed');
        }
        
        // Agregar icono de estado si aplica
        const statusIcon = this.getTaskStatusIcon(task.checkboxState || (task.completed ? 'x' : ' '));
        if (statusIcon) {
            const iconSpan = text.createSpan({ text: statusIcon + ' ', cls: 'task-status-icon' });
        }
        
        // Procesar texto para enlaces de tareas
        this.processTaskLinks(text, task.text);

        // Clearfix para limpiar los floats
        const clearfix = taskContent.createDiv();
        clearfix.style.clear = 'both';

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
            e.dataTransfer.setData('text/plain', JSON.stringify(taskData));
            e.dataTransfer.effectAllowed = 'move';
            taskEl.classList.add('dragging');
        });

        taskEl.addEventListener('dragend', (e) => {
            taskEl.classList.remove('dragging');
        });
    }

    processTaskLinks(textElement, taskText) {
        // Buscar emojis de tareas enlazadas: ⛔ (before) y 🆔 (after)
        const linkRegex = /(⛔|🆔)\s*([a-zA-Z0-9]+)/g;
        let lastIndex = 0;
        let match;
        
        const parts = [];

        while ((match = linkRegex.exec(taskText)) !== null) {
            // Añadir texto antes del enlace
            if (match.index > lastIndex) {
                parts.push({ type: 'text', content: taskText.substring(lastIndex, match.index) });
            }

            // Añadir el enlace
            parts.push({ 
                type: 'link', 
                content: match[0],
                linkType: match[1],
                linkId: match[2]
            });
            
            lastIndex = match.index + match[0].length;
        }

        // Añadir texto restante
        if (lastIndex < taskText.length) {
            parts.push({ type: 'text', content: taskText.substring(lastIndex) });
        }

        // Si no hay enlaces, solo mostrar el texto
        if (parts.length === 0) {
            textElement.appendText(taskText);
            return;
        }

        // Construir el elemento con enlaces
        parts.forEach(part => {
            if (part.type === 'text') {
                textElement.appendText(part.content);
            } else {
                const linkSpan = textElement.createSpan({ text: part.content, cls: 'task-link' });
                linkSpan.dataset.linkType = part.linkType;
                linkSpan.dataset.linkId = part.linkId;
                
                // Eventos para mostrar overlay
                linkSpan.addEventListener('mouseenter', (e) => {
                    this.triggerHovered = true;
                    this.showTaskOverlay(e, part.linkType, part.linkId);
                });
                linkSpan.addEventListener('mouseleave', () => {
                    this.triggerHovered = false;
                    // Delay para permitir mover el mouse al overlay
                    setTimeout(() => {
                        if (!this.overlayHovered && !this.triggerHovered) {
                            this.hideTaskOverlay();
                        }
                    }, 100);
                });
            }
        });
    }

    async showTaskOverlay(event, linkType, taskId) {
        // Limpiar overlay anterior si existe
        this.hideTaskOverlay();
        
        // Buscar la(s) tarea(s) enlazada(s) pasando el linkType
        const linkedTasks = await this.findTasksById(taskId, linkType);
        
        if (!linkedTasks || linkedTasks.length === 0) {
            return;
        }

        // Crear overlay
        const overlay = document.body.createDiv('task-overlay');
        overlay.id = 'task-overlay-' + Date.now();

        const header = overlay.createDiv('task-overlay-header');
        if (linkType === '⛔') {
            header.textContent = '⛔ Tarea bloqueante';
        } else {
            header.textContent = linkedTasks.length > 1 
                ? `🆔 Tareas dependientes (${linkedTasks.length})`
                : '🆔 Tarea dependiente';
        }

        // Mostrar cada tarea enlazada
        linkedTasks.forEach((linkedTask, index) => {
            if (index > 0) {
                // Separador entre tareas
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

        // Posicionar cerca del cursor
        const rect = event.target.getBoundingClientRect();
        overlay.style.left = rect.right + 10 + 'px';
        overlay.style.top = rect.top + 'px';

        // Ajustar si se sale de la pantalla
        setTimeout(() => {
            const overlayRect = overlay.getBoundingClientRect();
            if (overlayRect.right > window.innerWidth) {
                overlay.style.left = rect.left - overlayRect.width - 10 + 'px';
            }
            if (overlayRect.bottom > window.innerHeight) {
                overlay.style.top = window.innerHeight - overlayRect.height - 10 + 'px';
            }
        }, 0);

        // Guardar referencia
        this.currentOverlay = overlay;
        this.currentOverlayTrigger = event.target;
        
        // Agregar listener para mantener el overlay visible cuando el mouse está sobre él
        overlay.addEventListener('mouseenter', () => {
            this.overlayHovered = true;
        });
        
        overlay.addEventListener('mouseleave', () => {
            this.overlayHovered = false;
            // Delay para permitir regresar al trigger
            setTimeout(() => {
                if (!this.overlayHovered && !this.triggerHovered) {
                    this.hideTaskOverlay();
                }
            }, 100);
        });
    }

    hideTaskOverlay() {
        if (this.currentOverlay) {
            this.currentOverlay.remove();
            this.currentOverlay = null;
            this.currentOverlayTrigger = null;
            this.overlayHovered = false;
            this.triggerHovered = false;
        }
    }

    async findTasksById(taskId, linkType) {
        // Buscar en todos los archivos markdown
        let files = this.app.vault.getMarkdownFiles();
        
        if (this.config.filter) {
            files = files.filter(f => f.path.startsWith(this.config.filter));
        }
        
        // Determinar qué patrón buscar según el tipo de enlace
        // ⛔ (before) significa "esta tarea necesita que se complete X primero"
        //    -> buscar LA tarea que tiene 🆔 X (la que bloquea) - UNA SOLA
        // 🆔 (after) significa "esta tarea tiene el ID X"
        //    -> buscar TODAS las tareas que tienen ⛔ X (las que dependen de esta) - MÚLTIPLES
        const searchPattern = linkType === '⛔' ? '🆔' : '⛔';
        const foundTasks = [];
        
        for (const file of files) {
            const content = await this.app.vault.read(file);
            const lines = content.split('\n');
            
            for (let index = 0; index < lines.length; index++) {
                const line = lines[index];
                const normalizedLine = this.normalizeLine(line);
                
                // Buscar tareas
                const taskMatch = normalizedLine.match(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u);
                if (taskMatch) {
                    // Buscar el patrón correcto según el tipo de enlace
                    const regex = new RegExp(`${searchPattern}\\s*([a-zA-Z0-9]+)`);
                    const idMatch = normalizedLine.match(regex);
                    if (idMatch && idMatch[1] === taskId) {
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
                        const dateMatch = normalizedLine.match(/🛫\s*(\d{4}-\d{2}-\d{2})/u);
                        
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
        
        return foundTasks;
    }

    insertTaskByPriority(parent, task) {
        // Obtener todas las tareas existentes en el contenedor
        const existingTasks = Array.from(parent.querySelectorAll('.task-item'));
        
        // Si no hay tareas, simplemente crear la tarea
        if (existingTasks.length === 0) {
            this.createTaskElement(parent, task);
            return;
        }
        
        // Extraer el valor de prioridad de la nueva tarea
        const getPriorityValue = (line) => {
            const cleanLine = line.replace(/[\uFE0E\uFE0F]/g, '');
            if (cleanLine.includes('🔺')) return 0;  // highest
            if (cleanLine.includes('⏫')) return 1;  // highest
            if (cleanLine.includes('🔼')) return 2;  // high
            if (cleanLine.includes('🔽')) return 4;  // low
            if (cleanLine.includes('⏬')) return 5;  // lowest
            return 3;  // sin prioridad (medio)
        };
        
        const newTaskPriority = getPriorityValue(task.fullLine);
        
        // Encontrar la posición correcta según la prioridad
        let insertIndex = -1;
        for (let i = 0; i < existingTasks.length; i++) {
            try {
                const existingTaskData = JSON.parse(existingTasks[i].dataset.taskData);
                const existingFullLine = existingTaskData.fullLine || '';
                const existingPriority = getPriorityValue(existingFullLine);
                
                // Si la nueva tarea tiene mayor prioridad (menor valor),
                // debe insertarse antes de la tarea existente
                if (newTaskPriority < existingPriority) {
                    insertIndex = i;
                    break;
                }
            } catch (e) {
                console.error('Error al parsear taskData:', e);
            }
        }
        
        // Si insertIndex es -1, la tarea va al final (menor prioridad que todas las existentes)
        if (insertIndex === -1) {
            this.createTaskElement(parent, task);
        } else {
            // Crear la tarea en un contenedor temporal
            const tempContainer = document.createElement('div');
            this.createTaskElement(tempContainer, task);
            const newTaskEl = tempContainer.firstChild;
            
            // Insertar antes de la tarea en insertIndex
            parent.insertBefore(newTaskEl, existingTasks[insertIndex]);
        }
    }

    createPrioritySelector(container, task, taskEl) {
        const priorities = [
            { emoji: '🔺', label: 'Highest', value: '🔺' },
            { emoji: '⏫', label: 'High', value: '⏫' },
            { emoji: '🔼', label: 'Medium', value: '🔼' },
            { emoji: '➖', label: 'Normal', value: null },
            { emoji: '🔽', label: 'Low', value: '🔽' },
            { emoji: '⏬', label: 'Lowest', value: '⏬' }
        ];

        // Detectar prioridad actual
        const getCurrentPriority = () => {
            const cleanLine = task.fullLine.replace(/[\uFE0E\uFE0F]/g, '');
            if (cleanLine.includes('🔺')) return '🔺';
            if (cleanLine.includes('⏫')) return '⏫';
            if (cleanLine.includes('🔼')) return '🔼';
            if (cleanLine.includes('🔽')) return '🔽';
            if (cleanLine.includes('⏬')) return '⏬';
            return null;
        };

        let currentPriority = getCurrentPriority();

        // Botón principal
        const priorityButton = container.createEl('button');
        priorityButton.classList.add('priority-button');
        priorityButton.title = 'Cambiar prioridad';
        priorityButton.textContent = currentPriority || '➖';
        
        // Aplicar estilos inline para asegurar el tamaño correcto
        priorityButton.style.cssText = `
            width: 20px !important;
            height: 20px !important;
            min-width: 20px !important;
            max-width: 20px !important;
            min-height: 20px !important;
            max-height: 20px !important;
            padding: 0 !important;
            border: none !important;
            background: transparent !important;
            color: var(--text-muted) !important;
            cursor: pointer !important;
            border-radius: 4px !important;
            font-size: 12px !important;
            line-height: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
        `;
        
        // Añadir efectos hover al botón
        priorityButton.addEventListener('mouseenter', () => {
            priorityButton.style.background = 'var(--background-secondary)';
            priorityButton.style.color = 'var(--interactive-accent)';
        });
        priorityButton.addEventListener('mouseleave', () => {
            priorityButton.style.background = 'transparent';
            priorityButton.style.color = 'var(--text-muted)';
        });

        // Dropdown (añadirlo al body para que sea un verdadero overlay)
        const dropdown = document.createElement('div');
        dropdown.classList.add('priority-dropdown');
        
        // Aplicar estilos inline para asegurar que se apliquen
        dropdown.style.cssText = `
            position: fixed;
            display: none;
            background: var(--background-primary);
            border: 1px solid var(--background-modifier-border);
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            min-width: 120px;
            max-width: 120px;
            width: 120px;
        `;
        
        document.body.appendChild(dropdown);

        // Crear opciones
        priorities.forEach(priority => {
            const option = document.createElement('div');
            option.classList.add('priority-option');
            option.style.cssText = `
                padding: 6px 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                border-bottom: 1px solid var(--background-modifier-border);
                background: var(--background-primary);
                transition: all 0.2s ease;
            `;
            
            if (priority.value === currentPriority) {
                option.classList.add('selected');
                option.style.background = 'var(--background-modifier-active-hover)';
                option.style.fontWeight = '600';
            }

            const emoji = document.createElement('span');
            emoji.classList.add('priority-emoji');
            emoji.textContent = priority.emoji;
            emoji.style.cssText = `
                font-size: 12px;
                width: 16px;
                text-align: center;
            `;
            option.appendChild(emoji);

            const label = document.createElement('span');
            label.classList.add('priority-label');
            label.textContent = priority.label;
            label.style.cssText = `
                flex: 1;
                white-space: nowrap;
            `;
            option.appendChild(label);
            
            // Añadir efectos hover
            option.addEventListener('mouseenter', () => {
                if (priority.value !== currentPriority) {
                    option.style.background = 'var(--background-modifier-hover)';
                }
            });
            option.addEventListener('mouseleave', () => {
                if (priority.value !== currentPriority) {
                    option.style.background = 'var(--background-primary)';
                } else {
                    option.style.background = 'var(--background-modifier-active-hover)';
                }
            });

            option.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                // Si es la misma prioridad, no hacer nada
                if (priority.value === currentPriority) {
                    dropdown.style.display = 'none';
                    dropdown.style.visibility = 'visible';
                    return;
                }

                const scrollPos = this.container.querySelector('.timeline-main')?.scrollLeft || 0;

                try {
                    // Actualizar prioridad en el archivo
                    await this.updateTaskPriority(task.file.path, task.line, task.fullLine, priority.value);
                    
                    // Releer el archivo para obtener la línea actualizada
                    const file = this.app.vault.getAbstractFileByPath(task.file.path);
                    const content = await this.app.vault.read(file);
                    const lines = content.split('\n');
                    const updatedFullLine = lines[task.line];
                    
                    // Actualizar task con la nueva línea
                    task.fullLine = updatedFullLine;
                    currentPriority = priority.value;
                    
                    // Actualizar el botón
                    priorityButton.textContent = currentPriority || '➖';
                    
                    // Actualizar las opciones seleccionadas
                    dropdown.querySelectorAll('.priority-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    option.classList.add('selected');
                    
                    // Cerrar dropdown
                    dropdown.style.display = 'none';
                    dropdown.style.visibility = 'visible';
                    
                    // Reordenar la tarea en su columna
                    const parentList = taskEl.closest('.tasks-list');
                    taskEl.remove();
                    
                    // Limpiar el dropdown del DOM
                    if (dropdown && dropdown.parentNode) {
                        dropdown.parentNode.removeChild(dropdown);
                    }
                    
                    this.insertTaskByPriority(parentList, task);
                    
                    // Restaurar scroll
                    setTimeout(() => {
                        const timelineMain = this.container.querySelector('.timeline-main');
                        if (timelineMain) timelineMain.scrollLeft = scrollPos;
                    }, 0);
                    
                    new Notice(`✅ Prioridad actualizada a: ${priority.label}`);
                } catch (error) {
                    new Notice(`❌ Error al actualizar prioridad: ${error.message}`);
                    console.error('Error:', error);
                }
            });
            
            dropdown.appendChild(option);
        });

        // Toggle dropdown
        priorityButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (dropdown.style.display === 'none' || dropdown.style.display === '') {
                // Cerrar todos los otros dropdowns abiertos
                document.querySelectorAll('.priority-dropdown').forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.style.display = 'none';
                        otherDropdown.style.visibility = 'visible';
                    }
                });
                
                // Calcular posición del botón
                const rect = priorityButton.getBoundingClientRect();
                
                // Mostrar dropdown temporalmente invisible para calcular su altura
                dropdown.style.visibility = 'hidden';
                dropdown.style.display = 'block';
                
                // Calcular posición (arriba del botón)
                const dropdownHeight = dropdown.offsetHeight;
                const leftPos = rect.left;
                const topPos = rect.top - dropdownHeight - 4;
                
                dropdown.style.left = leftPos + 'px';
                dropdown.style.top = topPos + 'px';
                
                // Hacer visible el dropdown
                dropdown.style.visibility = 'visible';
            } else {
                dropdown.style.display = 'none';
            }
        });

        // Cerrar dropdown al hacer clic fuera
        const closeDropdown = (e) => {
            if (!container.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
                dropdown.style.visibility = 'visible';
            }
        };
        
        // Limpiar el dropdown del DOM cuando se elimina la tarea
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node === taskEl || (node.contains && node.contains(taskEl))) {
                        if (dropdown && dropdown.parentNode) {
                            dropdown.parentNode.removeChild(dropdown);
                        }
                        document.removeEventListener('click', closeDropdown);
                        observer.disconnect();
                    }
                });
            });
        });
        
        // Observar el padre de la tarea para detectar cuando se elimina
        const parentList = taskEl.closest('.tasks-list');
        if (parentList) {
            observer.observe(parentList, { childList: true, subtree: true });
        }
        
        // Usar setTimeout para evitar que el mismo click que abre el dropdown lo cierre
        setTimeout(() => {
            document.addEventListener('click', closeDropdown);
        }, 0);
    }

    createStatusSelector(container, task, taskEl) {
        const statuses = [
            { emoji: '✓', label: 'Normal', value: ' ' },
            { emoji: '🔄', label: 'En curso', value: '/' },
            { emoji: '⏸️', label: 'En espera', value: 'w' },
            { emoji: '👤', label: 'Delegada', value: 'd' }
        ];

        // Detectar estado actual del checkbox
        const getCurrentStatus = () => {
            return task.checkboxState || ' ';
        };

        let currentStatus = getCurrentStatus();

        // Botón principal
        const statusButton = container.createEl('button');
        statusButton.classList.add('status-button');
        statusButton.title = 'Cambiar estado';
        
        // Mostrar el emoji correspondiente al estado actual
        const currentStatusObj = statuses.find(s => s.value === currentStatus);
        statusButton.textContent = currentStatusObj ? currentStatusObj.emoji : '✓';
        
        // Aplicar estilos inline para asegurar el tamaño correcto
        statusButton.style.cssText = `
            width: 20px !important;
            height: 20px !important;
            min-width: 20px !important;
            max-width: 20px !important;
            min-height: 20px !important;
            max-height: 20px !important;
            padding: 0 !important;
            border: none !important;
            background: transparent !important;
            color: var(--text-muted) !important;
            cursor: pointer !important;
            border-radius: 4px !important;
            font-size: 12px !important;
            line-height: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
        `;
        
        // Añadir efectos hover al botón
        statusButton.addEventListener('mouseenter', () => {
            statusButton.style.background = 'var(--background-secondary)';
            statusButton.style.color = 'var(--interactive-accent)';
        });
        statusButton.addEventListener('mouseleave', () => {
            statusButton.style.background = 'transparent';
            statusButton.style.color = 'var(--text-muted)';
        });

        // Dropdown (añadirlo al body para que sea un verdadero overlay)
        const dropdown = document.createElement('div');
        dropdown.classList.add('status-dropdown');
        
        // Aplicar estilos inline para asegurar que se apliquen
        dropdown.style.cssText = `
            position: fixed;
            display: none;
            background: var(--background-primary);
            border: 1px solid var(--background-modifier-border);
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            min-width: 130px;
            max-width: 130px;
            width: 130px;
        `;
        
        document.body.appendChild(dropdown);

        // Crear opciones (filtrar la opción actual si no es normal)
        statuses.forEach(status => {
            // Si el estado actual no es normal, mostrar todas menos la actual
            // Si el estado actual es normal, mostrar solo los estados especiales
            const shouldShow = currentStatus === ' ' 
                ? status.value !== ' '  // Mostrar solo opciones especiales
                : true;  // Mostrar todas las opciones
            
            if (!shouldShow) return;
            
            const option = document.createElement('div');
            option.classList.add('status-option');
            option.style.cssText = `
                padding: 6px 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                border-bottom: 1px solid var(--background-modifier-border);
                background: var(--background-primary);
                transition: all 0.2s ease;
            `;
            
            if (status.value === currentStatus) {
                option.classList.add('selected');
                option.style.background = 'var(--background-modifier-active-hover)';
                option.style.fontWeight = '600';
            }

            const emoji = document.createElement('span');
            emoji.classList.add('status-emoji');
            emoji.textContent = status.emoji;
            emoji.style.cssText = `
                font-size: 12px;
                width: 16px;
                text-align: center;
            `;
            option.appendChild(emoji);

            const label = document.createElement('span');
            label.classList.add('status-label');
            label.textContent = status.label;
            label.style.cssText = `
                flex: 1;
                white-space: nowrap;
            `;
            option.appendChild(label);
            
            // Añadir efectos hover
            option.addEventListener('mouseenter', () => {
                if (status.value !== currentStatus) {
                    option.style.background = 'var(--background-modifier-hover)';
                }
            });
            option.addEventListener('mouseleave', () => {
                if (status.value !== currentStatus) {
                    option.style.background = 'var(--background-primary)';
                } else {
                    option.style.background = 'var(--background-modifier-active-hover)';
                }
            });

            option.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                // Si es el mismo estado, no hacer nada
                if (status.value === currentStatus) {
                    dropdown.style.display = 'none';
                    dropdown.style.visibility = 'visible';
                    return;
                }

                const scrollPos = this.container.querySelector('.timeline-main')?.scrollLeft || 0;

                try {
                    // Actualizar estado en el archivo
                    await this.updateTaskStatus(task.file.path, task.line, task.fullLine, status.value);
                    
                    // Releer el archivo para obtener la línea actualizada
                    const file = this.app.vault.getAbstractFileByPath(task.file.path);
                    const content = await this.app.vault.read(file);
                    const lines = content.split('\n');
                    const updatedFullLine = lines[task.line];
                    
                    // Actualizar task con la nueva línea
                    task.fullLine = updatedFullLine;
                    task.checkboxState = status.value;
                    currentStatus = status.value;
                    
                    // Actualizar el botón
                    statusButton.textContent = status.emoji;
                    
                    // Actualizar las opciones seleccionadas
                    dropdown.querySelectorAll('.status-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    option.classList.add('selected');
                    
                    // Cerrar dropdown
                    dropdown.style.display = 'none';
                    dropdown.style.visibility = 'visible';
                    
                    // Refrescar la vista para mostrar/ocultar el icono de estado
                    setTimeout(() => {
                        this.render();
                        const timelineMain = this.container.querySelector('.timeline-main');
                        if (timelineMain) timelineMain.scrollLeft = scrollPos;
                    }, 100);
                    
                    new Notice(`✅ Estado actualizado a: ${status.label}`);
                } catch (error) {
                    new Notice(`❌ Error al actualizar estado: ${error.message}`);
                    console.error('Error:', error);
                }
            });
            
            dropdown.appendChild(option);
        });

        // Toggle dropdown
        statusButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (dropdown.style.display === 'none' || dropdown.style.display === '') {
                // Cerrar todos los otros dropdowns abiertos
                document.querySelectorAll('.status-dropdown, .priority-dropdown').forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.style.display = 'none';
                        otherDropdown.style.visibility = 'visible';
                    }
                });
                
                // Calcular posición del botón
                const rect = statusButton.getBoundingClientRect();
                
                // Mostrar dropdown temporalmente invisible para calcular su altura
                dropdown.style.visibility = 'hidden';
                dropdown.style.display = 'block';
                
                // Calcular posición (arriba del botón)
                const dropdownHeight = dropdown.offsetHeight;
                const leftPos = rect.left;
                const topPos = rect.top - dropdownHeight - 4;
                
                dropdown.style.left = leftPos + 'px';
                dropdown.style.top = topPos + 'px';
                
                // Hacer visible el dropdown
                dropdown.style.visibility = 'visible';
            } else {
                dropdown.style.display = 'none';
            }
        });

        // Cerrar dropdown al hacer clic fuera
        const closeDropdown = (e) => {
            if (!container.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
                dropdown.style.visibility = 'visible';
            }
        };
        
        // Limpiar el dropdown del DOM cuando se elimina la tarea
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node === taskEl || (node.contains && node.contains(taskEl))) {
                        if (dropdown && dropdown.parentNode) {
                            dropdown.parentNode.removeChild(dropdown);
                        }
                        document.removeEventListener('click', closeDropdown);
                        observer.disconnect();
                    }
                });
            });
        });
        
        // Observar el padre de la tarea para detectar cuando se elimina
        const parentList = taskEl.closest('.tasks-list');
        if (parentList) {
            observer.observe(parentList, { childList: true, subtree: true });
        }
        
        // Usar setTimeout para evitar que el mismo click que abre el dropdown lo cierre
        setTimeout(() => {
            document.addEventListener('click', closeDropdown);
        }, 0);
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
                
                const originalElement = document.getElementById(taskData.taskId);
                
                if (!originalElement) {
                    new Notice('❌ Error: No se encontró la tarea original');
                    return;
                }
                
                const originalParent = originalElement.closest('.tasks-list');
                if (originalParent === dropZone) {
                    new Notice('ℹ️ La tarea ya está en esta columna');
                    return;
                }
                
                const scrollPos = this.container.querySelector('.timeline-main')?.scrollLeft || 0;
                
                originalElement.remove();
                
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Si targetDate es null, eliminar la fecha de inicio; si no, actualizarla
                if (targetDate === null) {
                    await this.removeTaskDate(taskData.file, taskData.line, taskData.fullLine);
                } else {
                    await this.updateTaskDate(taskData.file, taskData.line, taskData.fullLine, targetDate);
                }
                
                // Releer el archivo para obtener la línea actualizada con la nueva fecha
                const file = this.app.vault.getAbstractFileByPath(taskData.file);
                const content = await this.app.vault.read(file);
                const lines = content.split('\n');
                const updatedFullLine = lines[taskData.line];
                
                const emptyMsg = dropZone.querySelector('.empty-message');
                if (emptyMsg) emptyMsg.remove();
                
                const taskInfo = {
                    text: taskData.text || 'Tarea',
                    file: file,
                    line: taskData.line,
                    date: targetDate,
                    fullLine: updatedFullLine,  // Usar la línea actualizada
                    completed: false,
                    cancelled: false
                };
                
                // Encontrar la posición correcta para insertar la tarea según su prioridad
                this.insertTaskByPriority(dropZone, taskInfo);
                
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
                // Normalizar línea solo para búsqueda
                const normalizedLine = this.normalizeLine(line);
                
                const taskMatch = normalizedLine.match(/^[\s]*[-*]\s+\[([x\- \/wd])\]/u);
                if (taskMatch) {
                    // Buscar fecha de inicio (🛫) en lugar de fecha de vencimiento
                    const dateMatch = normalizedLine.match(/🛫\s*(\d{4}-\d{2}-\d{2})/u);

                    if (dateMatch && dateMatch[1] === date) {
                        // Excluir tareas canceladas
                        if (taskMatch[1] === '-') {
                            return;
                        }
                        
                        // Filtrar según el estado y los filtros activos
                        if (!this.shouldShowTask(taskMatch[1])) {
                            return;
                        }
                        
                        // Extraer texto de la línea ORIGINAL (sin normalizar) para preservar emojis
                        let taskText = line
                            .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
                            .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '')
                            .replace(/[🔺⏫🔼🔽⏬]/gu, '') // Quitar emojis de prioridad
                            .replace(/[🔁♻️]/gu, '')
                            .replace(/#[\w-]+/gu, '')
                            .replace(/\s+/g, ' ')
                            .trim();

                        tasks.push({
                            text: taskText || 'Sin descripción',
                            file: file,
                            line: index,
                            date: dateMatch[1],
                            fullLine: line,  // Guardar línea original
                            completed: taskMatch[1] === 'x',
                            cancelled: taskMatch[1] === '-',
                            checkboxState: taskMatch[1]
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
                // Normalizar línea solo para búsqueda
                const normalizedLine = this.normalizeLine(line);
                
                const taskMatch = normalizedLine.match(/^[\s]*[-*]\s+\[([x\- \/wd])\]/u);
                if (taskMatch) {
                    // Buscar fecha de inicio (🛫) en lugar de fecha de vencimiento
                    const dateMatch = normalizedLine.match(/🛫\s*(\d{4}-\d{2}-\d{2})/u);

                    if (dateMatch && dateMatch[1] < todayStr && taskMatch[1] !== 'x') {
                        // Excluir tareas canceladas
                        if (taskMatch[1] === '-') {
                            return;
                        }
                        
                        // Filtrar según el estado y los filtros activos
                        if (!this.shouldShowTask(taskMatch[1])) {
                            return;
                        }
                        
                        // Extraer texto de la línea ORIGINAL para preservar emojis
                        let taskText = line
                            .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
                            .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '')
                            .replace(/[🔺⏫🔼🔽⏬]/gu, '') // Quitar emojis de prioridad
                            .replace(/[🔁♻️]/gu, '')
                            .replace(/#[\w-]+/gu, '')
                            .replace(/\s+/g, ' ')
                            .trim();

                        tasks.push({
                            text: taskText || 'Sin descripción',
                            file: file,
                            line: index,
                            date: dateMatch[1],
                            fullLine: line,  // Guardar línea original
                            completed: false,
                            cancelled: false,
                            checkboxState: taskMatch[1]
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
                // Normalizar línea solo para búsqueda
                const normalizedLine = this.normalizeLine(line);
                
                const taskMatch = normalizedLine.match(/^[\s]*[-*]\s+\[([x\- \/wd])\]/u);
                if (taskMatch) {
                    // Buscar solo fecha de inicio (🛫)
                    const hasDate = normalizedLine.match(/🛫\s*\d{4}-\d{2}-\d{2}/u);

                    if (!hasDate && taskMatch[1] !== 'x') {
                        // Excluir tareas canceladas
                        if (taskMatch[1] === '-') {
                            return;
                        }
                        
                        // Filtrar según el estado y los filtros activos
                        if (!this.shouldShowTask(taskMatch[1])) {
                            return;
                        }
                        
                        // Extraer texto de la línea ORIGINAL para preservar emojis
                        let taskText = line
                            .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
                            .replace(/[🔺⏫🔼🔽⏬]/gu, '') // Quitar emojis de prioridad
                            .replace(/[🔁♻️]/gu, '')
                            .replace(/#[\w-]+/gu, '')
                            .replace(/\s+/g, ' ')
                            .trim();

                        tasks.push({
                            text: taskText || 'Sin descripción',
                            file: file,
                            line: index,
                            date: null,
                            fullLine: line,  // Guardar línea original
                            completed: false,
                            cancelled: false,
                            checkboxState: taskMatch[1]
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
        
        // Normalizar solo para procesamiento interno
        const normalizedOriginalLine = this.normalizeLine(originalLine);
        
        // Extraer indentación
        const indentMatch = originalLine.match(/^(\s*)/u);
        const indent = indentMatch ? indentMatch[1] : '';
        
        // Extraer tipo de lista
        const listMarkerMatch = originalLine.match(/^[\s]*([-*])/u);
        const listMarker = listMarkerMatch ? listMarkerMatch[1] : '-';
        
        // Extraer estado del checkbox
        const checkboxMatch = originalLine.match(/\[([x\- \/wd])\]/u);
        const checkboxState = checkboxMatch ? checkboxMatch[1] : ' ';
        
        // Extraer emojis de prioridad de la línea ORIGINAL (sin normalizar)
        const priorityMatch = originalLine.match(/[🔺⏫🔼🔽⏬]/u);
        const priority = priorityMatch ? priorityMatch[0] : '';
        
        // Extraer emojis de recurrencia de la línea ORIGINAL
        const recurrenceMatch = originalLine.match(/[🔁♻️]/u);
        const recurrence = recurrenceMatch ? recurrenceMatch[0] : '';
        
        // Extraer otras fechas (due date, scheduled, etc.) para preservarlas
        const otherDates = [];
        const dueDateMatch = originalLine.match(/📅\s*(\d{4}-\d{2}-\d{2})/u);
        if (dueDateMatch) otherDates.push(`📅 ${dueDateMatch[1]}`);
        
        const scheduledMatch = originalLine.match(/⏳\s*(\d{4}-\d{2}-\d{2})/u);
        if (scheduledMatch) otherDates.push(`⏳ ${scheduledMatch[1]}`);
        
        // Extraer texto limpio de la línea ORIGINAL
        let taskText = originalLine
            .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '') // Quitar checkbox
            .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '') // Quitar fechas
            .replace(/[🔺⏫🔼🔽⏬]/gu, '') // Quitar prioridad temporalmente
            .replace(/[🔁♻️]/gu, '') // Quitar recurrencia temporalmente
            .replace(/#[\w-]+\s*$/gu, '') // Quitar tags al final
            .trim();
        
        // Reconstruir la línea con todos los metadatos preservados
        let newLine = `${indent}${listMarker} [${checkboxState}] ${taskText}`;
        
        // Añadir prioridad si existía
        if (priority) {
            newLine += ` ${priority}`;
        }
        
        // Añadir recurrencia si existía
        if (recurrence) {
            newLine += ` ${recurrence}`;
        }
        
        // Añadir la nueva fecha de INICIO (🛫) al final
        newLine += ` 🛫 ${newDate}`;
        
        // Añadir otras fechas que existían
        if (otherDates.length > 0) {
            newLine += ' ' + otherDates.join(' ');
        }
        
        lines[lineNumber] = newLine;
        await this.app.vault.modify(file, lines.join('\n'));
    }

    async removeTaskDate(filePath, lineNumber, oldLine) {
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

        // Normalizar solo para procesamiento interno
        const normalizedOriginalLine = this.normalizeLine(originalLine);

        // Extraer indentación
        const indentMatch = originalLine.match(/^(\s*)/u);
        const indent = indentMatch ? indentMatch[1] : '';

        // Extraer tipo de lista
        const listMarkerMatch = originalLine.match(/^[\s]*([-*])/u);
        const listMarker = listMarkerMatch ? listMarkerMatch[1] : '-';

        // Extraer estado del checkbox
        const checkboxMatch = originalLine.match(/\[([x\- \/wd])\]/u);
        const checkboxState = checkboxMatch ? checkboxMatch[1] : ' ';

        // Extraer emojis de prioridad de la línea ORIGINAL
        const priorityMatch = originalLine.match(/[🔺⏫🔼🔽⏬]/u);
        const priority = priorityMatch ? priorityMatch[0] : '';

        // Extraer emojis de recurrencia de la línea ORIGINAL
        const recurrenceMatch = originalLine.match(/[🔁♻️]/u);
        const recurrence = recurrenceMatch ? recurrenceMatch[0] : '';

        // Extraer otras fechas que NO sean start date para preservarlas
        const otherDates = [];
        const dueDateMatch = originalLine.match(/📅\s*(\d{4}-\d{2}-\d{2})/u);
        if (dueDateMatch) otherDates.push(`📅 ${dueDateMatch[1]}`);
        
        const scheduledMatch = originalLine.match(/⏳\s*(\d{4}-\d{2}-\d{2})/u);
        if (scheduledMatch) otherDates.push(`⏳ ${scheduledMatch[1]}`);

        // Extraer texto limpio de la línea ORIGINAL
        let taskText = originalLine
            .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
            .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '')
            .replace(/[🔺⏫🔼🔽⏬]/gu, '')
            .replace(/[🔁♻️]/gu, '')
            .replace(/#[\w-]+\s*$/gu, '')
            .trim();

        // Reconstruir la línea sin fecha de inicio
        let newLine = `${indent}${listMarker} [${checkboxState}] ${taskText}`;

        if (priority) {
            newLine += ` ${priority}`;
        }

        if (recurrence) {
            newLine += ` ${recurrence}`;
        }

        // Añadir otras fechas que existían
        if (otherDates.length > 0) {
            newLine += ' ' + otherDates.join(' ');
        }

        lines[lineNumber] = newLine;
        await this.app.vault.modify(file, lines.join('\n'));
    }

    async updateTaskPriority(filePath, lineNumber, oldLine, newPriority) {
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

        // Extraer indentación
        const indentMatch = originalLine.match(/^(\s*)/u);
        const indent = indentMatch ? indentMatch[1] : '';

        // Extraer tipo de lista
        const listMarkerMatch = originalLine.match(/^[\s]*([-*])/u);
        const listMarker = listMarkerMatch ? listMarkerMatch[1] : '-';

        // Extraer estado del checkbox
        const checkboxMatch = originalLine.match(/\[([x\- \/wd])\]/u);
        const checkboxState = checkboxMatch ? checkboxMatch[1] : ' ';

        // Extraer emojis de recurrencia de la línea ORIGINAL
        const recurrenceMatch = originalLine.match(/[🔁♻️]/u);
        const recurrence = recurrenceMatch ? recurrenceMatch[0] : '';

        // Extraer todas las fechas para preservarlas
        const dates = [];
        const startDateMatch = originalLine.match(/🛫\s*(\d{4}-\d{2}-\d{2})/u);
        if (startDateMatch) dates.push(`🛫 ${startDateMatch[1]}`);
        
        const dueDateMatch = originalLine.match(/📅\s*(\d{4}-\d{2}-\d{2})/u);
        if (dueDateMatch) dates.push(`📅 ${dueDateMatch[1]}`);
        
        const scheduledMatch = originalLine.match(/⏳\s*(\d{4}-\d{2}-\d{2})/u);
        if (scheduledMatch) dates.push(`⏳ ${scheduledMatch[1]}`);

        // Extraer texto limpio de la línea ORIGINAL
        let taskText = originalLine
            .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
            .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '')
            .replace(/[🔺⏫🔼🔽⏬]/gu, '') // Quitar prioridad antigua
            .replace(/[🔁♻️]/gu, '')
            .replace(/#[\w-]+\s*$/gu, '')
            .trim();

        // Reconstruir la línea
        let newLine = `${indent}${listMarker} [${checkboxState}] ${taskText}`;

        // Añadir la nueva prioridad si existe
        if (newPriority) {
            newLine += ` ${newPriority}`;
        }

        // Añadir recurrencia si existía
        if (recurrence) {
            newLine += ` ${recurrence}`;
        }

        // Añadir fechas que existían
        if (dates.length > 0) {
            newLine += ' ' + dates.join(' ');
        }

        lines[lineNumber] = newLine;
        await this.app.vault.modify(file, lines.join('\n'));
    }

    async updateTaskStatus(filePath, lineNumber, oldLine, newStatus) {
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

        // Extraer indentación
        const indentMatch = originalLine.match(/^(\s*)/u);
        const indent = indentMatch ? indentMatch[1] : '';

        // Extraer tipo de lista
        const listMarkerMatch = originalLine.match(/^[\s]*([-*])/u);
        const listMarker = listMarkerMatch ? listMarkerMatch[1] : '-';

        // Extraer emojis de prioridad de la línea ORIGINAL
        const priorityMatch = originalLine.match(/[🔺⏫🔼🔽⏬]/u);
        const priority = priorityMatch ? priorityMatch[0] : '';

        // Extraer emojis de recurrencia de la línea ORIGINAL
        const recurrenceMatch = originalLine.match(/[🔁♻️]/u);
        const recurrence = recurrenceMatch ? recurrenceMatch[0] : '';

        // Extraer todas las fechas para preservarlas
        const dates = [];
        const startDateMatch = originalLine.match(/🛫\s*(\d{4}-\d{2}-\d{2})/u);
        if (startDateMatch) dates.push(`🛫 ${startDateMatch[1]}`);
        
        const dueDateMatch = originalLine.match(/📅\s*(\d{4}-\d{2}-\d{2})/u);
        if (dueDateMatch) dates.push(`📅 ${dueDateMatch[1]}`);
        
        const scheduledMatch = originalLine.match(/⏳\s*(\d{4}-\d{2}-\d{2})/u);
        if (scheduledMatch) dates.push(`⏳ ${scheduledMatch[1]}`);

        // Extraer texto limpio de la línea ORIGINAL
        let taskText = originalLine
            .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
            .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '')
            .replace(/[🔺⏫🔼🔽⏬]/gu, '')
            .replace(/[🔁♻️]/gu, '')
            .replace(/#[\w-]+\s*$/gu, '')
            .trim();

        // Reconstruir la línea con el nuevo estado
        let newLine = `${indent}${listMarker} [${newStatus}] ${taskText}`;

        // Añadir prioridad si existía
        if (priority) {
            newLine += ` ${priority}`;
        }

        // Añadir recurrencia si existía
        if (recurrence) {
            newLine += ` ${recurrence}`;
        }

        // Añadir fechas que existían
        if (dates.length > 0) {
            newLine += ' ' + dates.join(' ');
        }

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
            ? line.replace(/\[[x\- \/wd]\]/, '[x]')  // Reemplazar cualquier estado por [x]
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