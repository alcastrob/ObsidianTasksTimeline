/**
 * Tasks Timeline - Dataview View v2.2
 *
 * Uso:
 * ```dataviewjs
 * await dv.view("tasks-timeline", {filter: "Proyectos/", daysView: "nextWeek"})
 * ```
 */

// Identificador único para esta instancia
const timelineId = 'tasks-timeline-' + Date.now();

// CSS embebido directamente en el código
const cssId = 'tasks-timeline-css-v25';

// Eliminar versiones antiguas del CSS
const oldCssVersions = [];
for (let i = 0; i <= 24; i++) {
  if (i === 0) oldCssVersions.push('tasks-timeline-css');
  else oldCssVersions.push(`tasks-timeline-css-v${i}`);
}
oldCssVersions.forEach((oldId) => {
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

/* Wrapper para zoom - permite que el contenido escalado se muestre completo */
.zoom-wrapper {
    width: 100%;
    overflow-x: auto;
    overflow-y: visible;
    position: relative;
    min-height: 400px;
}

.timeline-main {
    display: flex !important;
    gap: 15px !important;
    margin: 0;
    padding: 10px 0;
    overflow-x: visible;
    overflow-y: visible;
    min-height: 400px;
    width: fit-content;
    min-width: 100%;
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
    /* No padding-right fijo - usaremos un pseudo-elemento flotante */
    min-height: 40px; /* Mínimo 2 líneas para acomodar los botones */
}

/* Pseudo-elemento invisible que reserva espacio solo en las primeras líneas */
.task-text::before {
    content: '';
    float: right;
    width: 1px; /* Espacio mínimo entre texto y botones */
    height: 35px; /* Exactamente 2 líneas: (13px * 1.5 * 2 = 39px, usamos 35px para evitar overflow a 3ra línea) */
    margin-left: 8px;
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

/* Búsqueda de tareas */
.search-container {
    position: relative;
    display: flex;
    align-items: center;
}

.search-input {
    padding: 4px 30px 4px 8px;
    font-size: 11px;
    border: 1px solid var(--background-modifier-border);
    background: var(--background-primary);
    color: var(--text-normal);
    border-radius: 6px;
    outline: none;
    transition: all 0.2s ease;
    width: 180px;
}

.search-input:focus {
    border-color: var(--interactive-accent);
    box-shadow: 0 0 0 2px rgba(var(--interactive-accent-rgb), 0.1);
}

.search-input::placeholder {
    color: var(--text-muted);
}

.clear-search-btn {
    position: absolute;
    right: 4px;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    background: var(--background-modifier-hover);
    color: var(--text-muted);
    border-radius: 4px;
    cursor: pointer;
    font-size: 10px;
    line-height: 1;
    transition: all 0.2s ease;
    display: none;
}

.clear-search-btn:hover {
    background: rgba(255, 100, 100, 0.2);
    color: #ff6464;
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

/* Scrollbar para zoom-wrapper (scroll horizontal principal) */
.zoom-wrapper::-webkit-scrollbar {
    height: 10px;
}

.zoom-wrapper::-webkit-scrollbar-track {
    background: var(--background-secondary);
    border-radius: 5px;
}

.zoom-wrapper::-webkit-scrollbar-thumb {
    background: var(--background-modifier-border);
    border-radius: 5px;
}

.zoom-wrapper::-webkit-scrollbar-thumb:hover {
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

/* Wikilinks */
.wiki-link {
    cursor: pointer;
    color: var(--link-color);
    text-decoration: none;
    transition: all 0.2s ease;
}

.wiki-link:hover {
    color: var(--link-color-hover);
    text-decoration: underline;
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

/* Etiquetas (Tags) como píldoras */
.task-tag {
    display: inline-block;
    padding: 2px 8px;
    margin: 0 4px 4px 0;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0.9;
    white-space: nowrap;
}

.task-tag:hover {
    opacity: 1;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Barra de etiquetas */
.tags-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--background-secondary);
    border-radius: 12px;
    border: 2px solid var(--background-modifier-border);
    margin-bottom: 10px;
    flex-wrap: wrap;
    min-height: 40px;
}

.tags-bar-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    margin-right: 8px;
    white-space: nowrap;
}

.tags-bar-tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 14px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.tags-bar-tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
}

.tags-bar-count {
    margin-left: 6px;
    font-size: 10px;
    opacity: 0.8;
    font-weight: 700;
}

.tags-bar-empty {
    font-size: 11px;
    color: var(--text-muted);
    font-style: italic;
}

/* Ajuste del zoom para scroll horizontal */
.timeline-main {
    transform-origin: top left !important;
}
    `;

  document.head.appendChild(style);
}

// Configuración
const config = {
  filter: input?.filter || '',
  showCompleted: input?.showCompleted !== false,
  daysView: input?.daysView || 'full', // "full", "2 days", "3 days", etc.
};

class TasksTimeline {
  constructor(container, app, dv, config) {
    this.dvContainer = container;
    this.app = app;
    this.dv = dv;
    this.config = config;

    // Filtros de visualización
    this.filters = {
      showNormal: true,
      showInProgress: true,
      showWaiting: true,
      showDelegated: true,
      showNextWeek: true,
      showNoDate: true,
      showOverdue: null, // null = automático, true = siempre mostrar, false = nunca mostrar
      searchText: '', // Texto de búsqueda
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
    switch (status) {
      case 'in-progress':
        return '🔄';
      case 'waiting':
        return '⏸️';
      case 'delegated':
        return '👤';
      default:
        return '';
    }
  }

  shouldShowTask(checkboxState) {
    const status = this.getTaskStatus(checkboxState);

    if (status === 'todo' && !this.filters.showNormal) return false;
    if (status === 'in-progress' && !this.filters.showInProgress) return false;
    if (status === 'waiting' && !this.filters.showWaiting) return false;
    if (status === 'delegated' && !this.filters.showDelegated) return false;

    return true;
  }

  matchesSearchFilter(taskText) {
    // Si no hay texto de búsqueda, mostrar todas las tareas
    if (!this.filters.searchText || this.filters.searchText.trim() === '') {
      return true;
    }

    // Buscar el texto en el contenido de la tarea (insensible a mayúsculas)
    return taskText.toLowerCase().includes(this.filters.searchText);
  }

  async init() {
    this.container.classList.add('tasks-timeline-container');
    await this.render();
  }

  // Función para comparar prioridades
  // Orden:
  // 1. Primero: Tareas normales y "en curso" mezcladas por prioridad
  // 2. Después: Tareas delegadas y "en espera" mezcladas por prioridad
  // Dentro de cada grupo: 🔺 ⏫ (highest) > 🔼 (high) > sin prioridad > 🔽 (low) > ⏬ (lowest)
  comparePriority(lineA, lineB) {
    const getPriorityValue = (line) => {
      // Limpiar selectores de variación antes de comparar
      const cleanLine = line.replace(/[\uFE0E\uFE0F]/g, '');
      if (cleanLine.includes('🔺')) return 0; // highest
      if (cleanLine.includes('⏫')) return 1; // highest
      if (cleanLine.includes('🔼')) return 2; // high
      if (cleanLine.includes('🔽')) return 4; // low
      if (cleanLine.includes('⬇')) return 5; // lowest
      return 3; // sin prioridad (normal/medium)
    };

    const getStatusGroup = (line) => {
      // Extraer el estado del checkbox
      const checkboxMatch = line.match(/\[([x\- \/wd])\]/);
      if (!checkboxMatch) return 0; // Por defecto, grupo normal

      const state = checkboxMatch[1];
      // Grupo 0: Normal (espacio) y En curso (/)
      if (state === ' ' || state === '/') return 0;
      // Grupo 1: En espera (w)
      if (state === 'w') return 1;
      // Grupo 2: Delegada (d)
      if (state === 'd') return 2;
      // Otros estados (completada, cancelada, etc.)
      return 3;
    };

    // PRIMERO ordenar por estado (grupo)
    const groupA = getStatusGroup(lineA);
    const groupB = getStatusGroup(lineB);

    if (groupA !== groupB) {
      return groupA - groupB;
    }

    // Si están en el mismo grupo, ENTONCES ordenar por prioridad
    const priorityA = getPriorityValue(lineA);
    const priorityB = getPriorityValue(lineB);
    return priorityA - priorityB;
  }

  // Función helper para normalizar líneas eliminando selectores de variación problemáticos
  normalizeLine(line) {
    // Eliminar selectores de variación Unicode que pueden causar problemas
    return line.replace(/[\uFE0E\uFE0F]/g, '');
  }

  extractTags(text) {
    // Primero, encontrar todos los wikilinks para excluir # que están dentro
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const wikiLinkRanges = [];
    let match;

    while ((match = wikiLinkRegex.exec(text)) !== null) {
      wikiLinkRanges.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Extraer TODAS las etiquetas para la barra superior y filtrado
    // (tanto inline como trailing - todas son útiles para búsqueda)
    const tagRegex = /#[\w\-áéíóúñü]+/gi;
    const tags = [];

    while ((match = tagRegex.exec(text)) !== null) {
      const tagStart = match.index;
      const tagEnd = tagStart + match[0].length;

      // Verificar si esta etiqueta está dentro de algún wikilink
      const isInsideWikiLink = wikiLinkRanges.some((range) => tagStart >= range.start && tagEnd <= range.end);

      // Verificar si es una etiqueta que debe ocultarse
      const tagText = match[0].toLowerCase();
      const isHiddenTag = tagText === '#urgent' || tagText === '#noturgent';

      // Agregar todas las etiquetas que NO están dentro de wikilinks
      // Y que NO son etiquetas ocultas (#urgent, #noturgent)
      if (!isInsideWikiLink && !isHiddenTag) {
        tags.push(tagText);
      }
    }

    return tags;
  }

  getColorForTag(tag) {
    // Generar color consistente basado en hash del tag
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);
    const saturation = 60 + (Math.abs(hash) % 20); // 60-80%
    const lightness = 45 + (Math.abs(hash >> 8) % 15); // 45-60%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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

    // Campo de búsqueda
    const searchContainer = leftGroup.createDiv('search-container');
    searchContainer.style.display = 'flex';
    searchContainer.style.alignItems = 'center';
    searchContainer.style.gap = '4px';
    searchContainer.style.position = 'relative';

    const searchInput = searchContainer.createEl('input', {
      type: 'text',
      placeholder: '🔎 Buscar tareas...',
    });
    searchInput.classList.add('search-input');
    searchInput.value = this.filters.searchText;

    const clearSearchBtn = searchContainer.createEl('button', { text: '✖' });
    clearSearchBtn.classList.add('clear-search-btn');
    clearSearchBtn.style.display = this.filters.searchText ? 'block' : 'none';

    // Evento de búsqueda con debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const searchText = e.target.value;

      // Mostrar/ocultar botón de limpiar
      clearSearchBtn.style.display = searchText ? 'block' : 'none';

      searchTimeout = setTimeout(() => {
        this.filters.searchText = searchText.toLowerCase();
        this.applySearchFilter();
      }, 300);
    });

    // Limpiar búsqueda
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      this.filters.searchText = '';
      clearSearchBtn.style.display = 'none';
      this.applySearchFilter();
    });

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
    refreshBtn.addEventListener('click', () => {
      this.hideTaskOverlay();
      this.render();
    });

    // Dropdown de Columnas (solo si NO estamos en modo nextWeek)
    if (this.config.daysView !== 'nextWeek') {
      const columnDropdownContainer = rightGroup.createDiv('filter-dropdown-container');
      columnDropdownContainer.style.display = 'inline-block';
      columnDropdownContainer.style.position = 'relative';
      columnDropdownContainer.style.visibility = 'visible';
      columnDropdownContainer.style.opacity = '1';

      const columnDropdownBtn = columnDropdownContainer.createEl('button', {
        text: '📋 Columnas ▼',
        cls: 'filter-dropdown-btn',
      });
      columnDropdownBtn.style.display = 'inline-flex';
      columnDropdownBtn.style.visibility = 'visible';

      const columnDropdownMenu = columnDropdownContainer.createDiv('filter-dropdown-menu');

      // Opción: Retrasadas
      const overdueOption = columnDropdownMenu.createDiv('filter-option');
      const overdueCheckbox = overdueOption.createDiv('filter-checkbox');

      // Estado visual del checkbox según el filtro
      if (this.filters.showOverdue === null) {
        // Auto: mostrar icono especial para indicar modo automático
        overdueCheckbox.style.background = 'var(--interactive-accent)';
        overdueCheckbox.style.borderColor = 'var(--interactive-accent)';
        overdueCheckbox.style.opacity = '0.5';
        const autoIcon = overdueCheckbox.createSpan({ text: 'A' });
        autoIcon.style.cssText = 'color: var(--text-on-accent); font-size: 10px; font-weight: bold;';
      } else if (this.filters.showOverdue === true) {
        // Forzar mostrar: checkbox marcado normal
        overdueCheckbox.classList.add('checked');
      } else {
        // Forzar ocultar: checkbox desmarcado
        // (sin clase 'checked')
      }

      const overdueLabel = overdueOption.createSpan({ cls: 'filter-option-label' });
      overdueLabel.createSpan({ text: '⚠️ Retrasadas' });

      // Añadir indicador de modo
      if (this.filters.showOverdue === null) {
        overdueLabel.createSpan({
          text: ' (auto)',
          cls: 'mode-indicator',
        }).style.cssText = 'font-size: 10px; opacity: 0.6; margin-left: 4px;';
      } else if (this.filters.showOverdue === true) {
        overdueLabel.createSpan({
          text: ' (siempre)',
          cls: 'mode-indicator',
        }).style.cssText = 'font-size: 10px; opacity: 0.6; margin-left: 4px;';
      } else {
        overdueLabel.createSpan({
          text: ' (oculto)',
          cls: 'mode-indicator',
        }).style.cssText = 'font-size: 10px; opacity: 0.6; margin-left: 4px;';
      }

      overdueOption.addEventListener('click', (e) => {
        e.stopPropagation();

        // Ciclo de tres estados: auto → ocultar → mostrar → auto
        if (this.filters.showOverdue === null) {
          this.filters.showOverdue = false; // Auto → Ocultar
        } else if (this.filters.showOverdue === false) {
          this.filters.showOverdue = true; // Ocultar → Mostrar siempre
        } else {
          this.filters.showOverdue = null; // Mostrar → Auto
        }

        this.render();
      });

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
        document.querySelectorAll('.filter-dropdown-menu.show').forEach((menu) => {
          menu.classList.remove('show');
        });
        document.querySelectorAll('.filter-dropdown-btn.open').forEach((btn) => {
          btn.classList.remove('open');
        });

        if (!isOpen) {
          columnDropdownMenu.classList.add('show');
          columnDropdownBtn.classList.add('open');
        }
      });
    }

    // Dropdown de Estados
    const statusDropdownContainer = rightGroup.createDiv('filter-dropdown-container');
    statusDropdownContainer.style.display = 'inline-block';
    statusDropdownContainer.style.position = 'relative';
    statusDropdownContainer.style.visibility = 'visible';
    statusDropdownContainer.style.opacity = '1';

    const statusDropdownBtn = statusDropdownContainer.createEl('button', {
      text: '🏷️ Estados ▼',
      cls: 'filter-dropdown-btn',
    });
    statusDropdownBtn.style.display = 'inline-flex';
    statusDropdownBtn.style.visibility = 'visible';

    const statusDropdownMenu = statusDropdownContainer.createDiv('filter-dropdown-menu');

    // Opción: No comenzadas
    const normalOption = statusDropdownMenu.createDiv('filter-option');
    const normalCheckbox = normalOption.createDiv('filter-checkbox');
    if (this.filters.showNormal) normalCheckbox.classList.add('checked');
    normalOption.createSpan({ text: '⚪ No comenzadas', cls: 'filter-option-label' });
    normalOption.addEventListener('click', (e) => {
      e.stopPropagation();
      this.filters.showNormal = !this.filters.showNormal;
      normalCheckbox.classList.toggle('checked');
      this.applyStatusFilters();
    });

    // Opción: En curso
    const inProgressOption = statusDropdownMenu.createDiv('filter-option');
    const inProgressCheckbox = inProgressOption.createDiv('filter-checkbox');
    if (this.filters.showInProgress) inProgressCheckbox.classList.add('checked');
    inProgressOption.createSpan({ text: '🔄 En curso', cls: 'filter-option-label' });
    inProgressOption.addEventListener('click', (e) => {
      e.stopPropagation();
      this.filters.showInProgress = !this.filters.showInProgress;
      inProgressCheckbox.classList.toggle('checked');
      this.applyStatusFilters();
    });

    // Opción: En espera
    const waitingOption = statusDropdownMenu.createDiv('filter-option');
    const waitingCheckbox = waitingOption.createDiv('filter-checkbox');
    if (this.filters.showWaiting) waitingCheckbox.classList.add('checked');
    waitingOption.createSpan({ text: '⏸️ En espera', cls: 'filter-option-label' });
    waitingOption.addEventListener('click', (e) => {
      e.stopPropagation();
      this.filters.showWaiting = !this.filters.showWaiting;
      waitingCheckbox.classList.toggle('checked');
      this.applyStatusFilters();
    });

    // Opción: Delegadas
    const delegatedOption = statusDropdownMenu.createDiv('filter-option');
    const delegatedCheckbox = delegatedOption.createDiv('filter-checkbox');
    if (this.filters.showDelegated) delegatedCheckbox.classList.add('checked');
    delegatedOption.createSpan({ text: '👤 Delegadas', cls: 'filter-option-label' });
    delegatedOption.addEventListener('click', (e) => {
      e.stopPropagation();
      this.filters.showDelegated = !this.filters.showDelegated;
      delegatedCheckbox.classList.toggle('checked');
      this.applyStatusFilters();
    });

    // Toggle del dropdown de estados
    statusDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = statusDropdownMenu.classList.contains('show');

      // Cerrar todos los otros dropdowns
      document.querySelectorAll('.filter-dropdown-menu.show').forEach((menu) => {
        menu.classList.remove('show');
      });
      document.querySelectorAll('.filter-dropdown-btn.open').forEach((btn) => {
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
          document.querySelectorAll('.filter-dropdown-menu.show').forEach((menu) => {
            menu.classList.remove('show');
          });
          document.querySelectorAll('.filter-dropdown-btn.open').forEach((btn) => {
            btn.classList.remove('open');
          });
        }
      };
      document.addEventListener('click', closeDropdowns);
    }, 0);

    // Barra de etiquetas (se actualizará después de cargar las tareas)
    const tagsBar = this.container.createDiv('tags-bar');
    tagsBar.style.display = 'none'; // Oculto inicialmente
    this.tagsBar = tagsBar; // Guardar referencia

    // Crear wrapper de zoom para manejar el escalado correctamente
    const zoomWrapper = this.container.createDiv('zoom-wrapper');
    zoomWrapper.style.cssText = `
            width: 100%;
            overflow-x: auto;
            overflow-y: visible;
            position: relative;
        `;

    const timelineMain = zoomWrapper.createDiv('timeline-main');

    // Aplicar zoom inicial desde top-left
    const zoomPercent = parseInt(savedZoom);
    const scale = zoomPercent / 100;

    // Función para aplicar zoom correctamente
    const applyZoom = (scaleValue) => {
      const prevScrollLeft = timelineMain.scrollLeft;
      const prevScrollTop = zoomWrapper.scrollTop;

      // Paso 1: Preparar el navegador para la transformación
      timelineMain.style.willChange = 'transform';

      // Paso 2: Aplicar el scale
      timelineMain.style.transform = `scale(${scaleValue})`;
      timelineMain.style.transformOrigin = 'top left';

      // Paso 3: Forzar múltiples reflows para asegurar renderizado completo
      // Esto es crítico para que las columnas fuera de vista se rendericen
      requestAnimationFrame(() => {
        // Primer reflow
        const currentHeight = timelineMain.scrollHeight;
        const currentWidth = timelineMain.scrollWidth;

        // Ajustar el height del wrapper
        zoomWrapper.style.minHeight = `${currentHeight * scaleValue}px`;

        // Segundo reflow - forzar con getBoundingClientRect
        timelineMain.getBoundingClientRect();

        requestAnimationFrame(() => {
          // Tercer reflow - cambiar y restaurar display
          const prevDisplay = timelineMain.style.display;
          timelineMain.style.display = 'none';
          timelineMain.offsetHeight; // Trigger reflow
          timelineMain.style.display = prevDisplay || 'flex';

          // Cuarto reflow - ajustar scroll
          requestAnimationFrame(() => {
            timelineMain.scrollLeft = prevScrollLeft;
            zoomWrapper.scrollTop = prevScrollTop;

            // Limpiar will-change después de la animación
            setTimeout(() => {
              timelineMain.style.willChange = 'auto';
            }, 300);
          });
        });
      });
    };

    applyZoom(scale);

    // Event listener para el slider de zoom
    zoomSlider.addEventListener('input', (e) => {
      const zoom = e.target.value;
      const newScale = zoom / 100;
      zoomValue.textContent = `${zoom}%`;
      applyZoom(newScale);
      localStorage.setItem('tasks-timeline-zoom', zoom);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();

    // Verificar si estamos en modo nextWeek
    const isNextWeekMode = this.config.daysView === 'nextWeek';

    if (isNextWeekMode) {
      // Modo nextWeek: Mostrar los 5 días de la próxima semana

      // Calcular el lunes de la próxima semana
      let daysUntilNextMonday;
      if (dayOfWeek === 0) {
        daysUntilNextMonday = 1;
      } else {
        daysUntilNextMonday = 8 - dayOfWeek;
      }

      // Mostrar tareas atrasadas según filtro
      const overdueTasks = await this.getOverdueTasks(today);
      const shouldShowOverdue =
        this.filters.showOverdue === null
          ? overdueTasks.length > 0 // Automático: mostrar solo si hay tareas
          : this.filters.showOverdue; // Manual: respetar configuración del usuario

      if (shouldShowOverdue) {
        await this.createOverdueContainer(timelineMain, today, overdueTasks);
      }

      // Mostrar los 5 días de la próxima semana (Lunes a Viernes)
      const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      for (let i = 0; i < 5; i++) {
        const offset = daysUntilNextMonday + i;
        await this.createDayContainer(timelineMain, dayNames[i], offset, today);
      }

      // Mostrar "Sin Fecha" si el filtro está activo
      if (this.filters.showNoDate) {
        await this.createNoDateContainer(timelineMain);
      }
    } else {
      // Modo normal: Comportamiento original

      // Calcular cuántos días mostrar según el modo
      let maxDaysToShow = Infinity;
      if (this.config.daysView !== 'full') {
        const match = this.config.daysView.match(/^(\d+)\s*days?$/i);
        if (match) {
          maxDaysToShow = parseInt(match[1]);
        }
      }

      // Mostrar tareas atrasadas según filtro
      const overdueTasks = await this.getOverdueTasks(today);
      let shouldShowOverdue = false;

      if (this.filters.showOverdue === null) {
        // Automático: mostrar solo si hay tareas
        shouldShowOverdue = overdueTasks.length > 0;
      } else if (this.filters.showOverdue === true) {
        // Forzar mostrar siempre
        shouldShowOverdue = true;
      } else if (this.filters.showOverdue === false) {
        // Forzar ocultar siempre
        shouldShowOverdue = false;
      }

      if (shouldShowOverdue) {
        await this.createOverdueContainer(timelineMain, today, overdueTasks);
      }

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

    // Actualizar barra de etiquetas después de crear todas las columnas
    this.updateTagsBar();
  }

  updateTagsBar() {
    const tagsBar = this.tagsBar;
    if (!tagsBar) return;

    tagsBar.empty();

    // Recolectar todas las etiquetas visibles en las tareas actuales
    const tagCounts = {};
    const taskItems = this.container.querySelectorAll('.task-item:not([style*="display: none"])');

    taskItems.forEach((taskItem) => {
      const taskLine = taskItem.getAttribute('data-task-line');
      if (taskLine) {
        const tags = this.extractTags(taskLine);
        tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const uniqueTags = Object.keys(tagCounts);

    if (uniqueTags.length === 0) {
      tagsBar.style.display = 'none';
      return;
    }

    tagsBar.style.display = 'flex';

    // Label
    const label = tagsBar.createSpan({ text: '🏷️ Etiquetas:', cls: 'tags-bar-label' });

    // Ordenar tags alfabéticamente
    uniqueTags.sort();

    // Crear botón para cada tag
    uniqueTags.forEach((tag) => {
      const tagButton = tagsBar.createDiv('tags-bar-tag');
      const color = this.getColorForTag(tag);
      tagButton.style.background = color;
      tagButton.style.color = '#ffffff';
      tagButton.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)'; // Mejor legibilidad

      // Mostrar texto sin el #
      const tagTextWithoutHash = tag.startsWith('#') ? tag.substring(1) : tag;
      const tagText = tagButton.createSpan({ text: tagTextWithoutHash });
      const countSpan = tagButton.createSpan({
        text: `(${tagCounts[tag]})`,
        cls: 'tags-bar-count',
      });

      // Click en tag para agregar al filtro de búsqueda
      tagButton.addEventListener('click', () => {
        const searchInput = this.container.querySelector('.search-input');
        if (searchInput) {
          // Si ya está en el filtro, no agregarlo de nuevo
          if (!searchInput.value.includes(tag)) {
            searchInput.value = searchInput.value ? `${searchInput.value} ${tag}` : tag;
            this.filters.searchText = searchInput.value.toLowerCase();

            // Mostrar botón de limpiar
            const clearBtn = this.container.querySelector('.clear-search-btn');
            if (clearBtn) {
              clearBtn.style.display = 'block';
            }

            // Aplicar filtro sin re-render
            this.applySearchFilter();
          }
        }
      });

      tagButton.title = `Click para filtrar por ${tag}`;
    });
  }

  applySearchFilter() {
    // Aplicar filtro de búsqueda sin re-render completo
    const searchText = this.filters.searchText;
    const taskItems = this.container.querySelectorAll('.task-item');

    taskItems.forEach((taskItem) => {
      const taskLine = taskItem.getAttribute('data-task-line') || '';
      const taskText = taskLine.toLowerCase();

      // Verificar si coincide con el filtro de búsqueda
      const matchesSearch = !searchText || taskText.includes(searchText);

      // Mostrar/ocultar con transición
      if (matchesSearch) {
        taskItem.style.display = '';
        taskItem.style.opacity = '1';
        taskItem.style.transform = 'translateX(0)';
      } else {
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateX(-10px)';
        setTimeout(() => {
          if (!taskText.includes(this.filters.searchText)) {
            taskItem.style.display = 'none';
          }
        }, 200);
      }
    });

    // Actualizar barra de etiquetas para reflejar solo tags visibles
    this.updateTagsBar();

    // Actualizar mensajes "Sin tareas" en columnas vacías
    this.updateEmptyMessages();
  }

  updateEmptyMessages() {
    // Actualizar los mensajes "Sin tareas" en cada columna
    const columns = this.container.querySelectorAll('.tasks-list');

    columns.forEach((column) => {
      const visibleTasks = Array.from(column.querySelectorAll('.task-item')).filter(
        (task) => task.style.display !== 'none',
      );

      let emptyMsg = column.querySelector('.empty-message');

      if (visibleTasks.length === 0) {
        if (!emptyMsg) {
          emptyMsg = column.createDiv('empty-message');
          emptyMsg.setText('Sin tareas');
        }
      } else {
        if (emptyMsg) {
          emptyMsg.remove();
        }
      }
    });
  }

  applyStatusFilters() {
    // Aplicar filtros de estado sin re-render completo
    const taskItems = this.container.querySelectorAll('.task-item');

    taskItems.forEach((taskItem) => {
      const status = taskItem.getAttribute('data-status') || ' ';
      let shouldShow = true;

      // Determinar si debe mostrarse según los filtros
      if (status === ' ' && !this.filters.showNormal) shouldShow = false;
      else if (status === '/' && !this.filters.showInProgress) shouldShow = false;
      else if (status === 'w' && !this.filters.showWaiting) shouldShow = false;
      else if (status === 'd' && !this.filters.showDelegated) shouldShow = false;

      // También aplicar filtro de búsqueda si está activo
      if (shouldShow && this.filters.searchText) {
        const taskLine = taskItem.getAttribute('data-task-line') || '';
        shouldShow = taskLine.toLowerCase().includes(this.filters.searchText);
      }

      // Mostrar/ocultar con transición
      if (shouldShow) {
        taskItem.style.display = '';
        setTimeout(() => {
          taskItem.style.opacity = '1';
          taskItem.style.transform = 'translateX(0)';
        }, 10);
      } else {
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateX(-10px)';
        setTimeout(() => {
          taskItem.style.display = 'none';
        }, 200);
      }
    });

    // Actualizar barra de etiquetas
    setTimeout(() => {
      this.updateTagsBar();
      this.updateEmptyMessages();
    }, 250);
  }

  async createDayContainer(parent, label, daysOffset, referenceDate) {
    const dayContainer = parent.createDiv('day-container');
    dayContainer.setAttribute('data-days-offset', daysOffset.toString());

    const dateObj = new Date(referenceDate);
    dateObj.setDate(referenceDate.getDate() + daysOffset);
    const dateStr = this.formatDate(dateObj);

    const header = dayContainer.createEl('div', { cls: 'day-header' });
    const labelSpan = header.createEl('span', { cls: 'day-label' });
    labelSpan.createSpan({ text: label });
    const countBadge = labelSpan.createSpan({ text: ' (0)', cls: 'task-count-badge' });
    countBadge.style.cssText = 'font-size: 11px; opacity: 0.7; font-weight: normal;';
    header.createEl('span', { text: this.formatDateDisplay(dateObj), cls: 'day-date' });

    const tasksList = dayContainer.createDiv('tasks-list');
    tasksList.classList.add('droppable');

    const tasks = await this.getTasksForDate(dateStr);
    // Solo filtrar tareas completadas, no las waiting/delegated/in-progress
    const activeTasks = tasks.filter((t) => !t.completed);

    // Ordenar tareas por prioridad
    activeTasks.sort((a, b) => this.comparePriority(a.fullLine, b.fullLine));

    if (activeTasks.length === 0) {
      const emptyMsg = tasksList.createDiv('empty-message');
      emptyMsg.setText('Sin tareas');
    } else {
      for (const task of activeTasks) {
        this.createTaskElement(tasksList, task);
      }
      // Actualizar contador inicial
      countBadge.textContent = ` (${activeTasks.length})`;
    }

    // Actualizar contador inicial
    countBadge.textContent = ` (${activeTasks.length})`;
    this.setupDropZone(tasksList, dateStr, label);
  }

  async createOverdueContainer(parent, today, overdueTasks = null) {
    if (!overdueTasks) {
      overdueTasks = await this.getOverdueTasks(today);
    }

    // Ordenar tareas por prioridad
    overdueTasks.sort((a, b) => this.comparePriority(a.fullLine, b.fullLine));

    const dayContainer = parent.createDiv('day-container');
    dayContainer.classList.add('overdue-container');
    dayContainer.setAttribute('data-days-offset', '0');

    const header = dayContainer.createEl('div', { cls: 'day-header' });
    const labelSpan = header.createEl('span', { cls: 'day-label' });
    labelSpan.createSpan({ text: '⚠️ Retrasadas' });
    const countBadge = labelSpan.createSpan({ text: ` (${overdueTasks.length})`, cls: 'task-count-badge' });
    countBadge.style.cssText = 'font-size: 11px; opacity: 0.7; font-weight: normal;';

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
    const labelSpan = header.createEl('span', { cls: 'day-label' });
    labelSpan.createSpan({ text: '📋 Sin Fecha' });
    const countBadge = labelSpan.createSpan({ text: ' (0)', cls: 'task-count-badge' });
    countBadge.style.cssText = 'font-size: 11px; opacity: 0.7; font-weight: normal;';

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
      // Actualizar contador inicial
      countBadge.textContent = ` (${noDateTasks.length})`;
    }

    this.setupDropZone(tasksList, null, 'Sin Fecha');
  }

  createTaskElement(parent, task) {
    const taskEl = parent.createDiv('task-item');

    // Crear ID único basado en archivo y línea
    const taskId = `task-${task.file.path.replace(/[^a-zA-Z0-9]/g, '_')}-${task.line}`;
    taskEl.id = taskId;
    taskEl.setAttribute('draggable', 'true');
    taskEl.setAttribute('data-task-line', task.fullLine || task.text);
    taskEl.setAttribute('data-status', task.checkboxState || ' ');

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
        const parentList = taskEl.closest('.tasks-list');
        taskEl.remove();
        this.updateColumnCount(parentList);
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
          const parentList = taskEl.closest('.tasks-list');
          taskEl.remove();
          this.updateColumnCount(parentList);
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
      taskId: taskId,
    });

    taskEl.addEventListener('dragstart', (e) => {
      const taskData = {
        file: task.file.path,
        line: task.line,
        fullLine: task.fullLine,
        text: task.text,
        taskId: taskId,
      };
      e.dataTransfer.setData('application/x-obsidian-task', JSON.stringify(taskData));
      e.dataTransfer.effectAllowed = 'move';
      taskEl.classList.add('dragging');
    });

    taskEl.addEventListener('dragend', (e) => {
      taskEl.classList.remove('dragging');
    });
  }

  processTaskLinks(textElement, taskText) {
    // Buscar emojis de tareas enlazadas: ⛔ (before) y 🆔 (after)
    // Wikilinks: [[nombre del enlace]]
    // Y etiquetas: #etiqueta (pero NO dentro de wikilinks)
    // IMPORTANTE: Solo las etiquetas AL FINAL (después de emojis/fechas) se convierten en píldoras
    // Las etiquetas en medio del texto se mantienen como texto normal
    const taskLinkRegex = /(⛔|🆔)\s*([a-zA-Z0-9,]+)/g;
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const tagRegex = /#[\w\-áéíóúñü]+/gi;

    // Regex para encontrar emojis de metadatos (prioridad, fechas, recurrencia)
    const metadataRegex = /[🔺⏫🔼🔽⏬📅🗓️⏳🛫🛬✅🔁♻️⛔🆔]/g;

    const parts = [];
    let lastIndex = 0;

    // Encontrar todas las coincidencias y ordenarlas por posición
    const allMatches = [];

    // Primero, identificar todos los wikilinks y sus rangos
    const wikiLinkRanges = [];
    let match;

    while ((match = wikiLinkRegex.exec(taskText)) !== null) {
      wikiLinkRanges.push({
        start: match.index,
        end: match.index + match[0].length,
      });

      allMatches.push({
        type: 'wikiLink',
        index: match.index,
        length: match[0].length,
        fullMatch: match[0],
        linkText: match[1],
      });
    }

    // Encontrar la posición del último emoji de enlaces de tareas (⛔ o 🆔)
    // Las etiquetas DESPUÉS de estos enlaces son "trailing" (píldoras)
    // Las etiquetas ANTES son "inline" (texto normal)
    const taskLinkEmojiRegex = /[⛔🆔]/g;
    let lastTaskLinkPos = -1;
    let taskLinkMatch;
    while ((taskLinkMatch = taskLinkEmojiRegex.exec(taskText)) !== null) {
      lastTaskLinkPos = Math.max(lastTaskLinkPos, taskLinkMatch.index);
    }

    // Task links - SOPORTA MÚLTIPLES IDs SEPARADOS POR COMAS
    taskLinkRegex.lastIndex = 0;
    while ((match = taskLinkRegex.exec(taskText)) !== null) {
      const linkType = match[1]; // ⛔ o 🆔
      const idsString = match[2]; // Puede ser "id1" o "id1,id2,id3"
      const ids = idsString.split(',').map((id) => id.trim());

      // Crear un match para el conjunto completo de IDs
      allMatches.push({
        type: 'taskLink',
        index: match.index,
        length: match[0].length,
        content: match[0],
        linkType: linkType,
        linkIds: ids, // Array de IDs
      });
    }

    // Tags - SOLO los que NO están dentro de wikilinks
    // Distinguir entre inline (texto normal) y trailing (píldoras)
    // IMPORTANTE: #urgent y #noturgent NUNCA se muestran (ni texto ni píldora)
    tagRegex.lastIndex = 0;
    while ((match = tagRegex.exec(taskText)) !== null) {
      const tagStart = match.index;
      const tagEnd = tagStart + match[0].length;
      const tagText = match[0].toLowerCase();

      // Verificar si este tag está dentro de algún wikilink
      const isInsideWikiLink = wikiLinkRanges.some((range) => tagStart >= range.start && tagEnd <= range.end);

      // Verificar si es una etiqueta que debe ocultarse
      const isHiddenTag = tagText === '#urgent' || tagText === '#noturgent';

      if (!isInsideWikiLink) {
        if (isHiddenTag) {
          // Agregar como tipo especial que se saltará en el renderizado
          allMatches.push({
            type: 'hiddenTag',
            index: match.index,
            length: match[0].length,
            tagText: match[0],
          });
        } else {
          // Determinar si es "trailing" o "inline"
          // Trailing = después del último emoji de enlace de tarea
          const isTrailing = lastTaskLinkPos !== -1 && tagStart > lastTaskLinkPos;

          allMatches.push({
            type: isTrailing ? 'tag' : 'inlineTag',
            index: match.index,
            length: match[0].length,
            tagText: match[0],
          });
        }
      }
    }

    // Ordenar por posición
    allMatches.sort((a, b) => a.index - b.index);

    // Construir las partes del texto
    allMatches.forEach((match) => {
      // Añadir texto antes del match
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: taskText.substring(lastIndex, match.index) });
      }

      // Añadir el match
      parts.push(match);

      lastIndex = match.index + match.length;
    });

    // Añadir texto restante
    if (lastIndex < taskText.length) {
      parts.push({ type: 'text', content: taskText.substring(lastIndex) });
    }

    // Si no hay matches, solo mostrar el texto
    if (parts.length === 0) {
      textElement.appendText(taskText);
      return;
    }

    // Construir el elemento con enlaces y etiquetas
    parts.forEach((part) => {
      if (part.type === 'text') {
        textElement.appendText(part.content);
      } else if (part.type === 'taskLink') {
        const linkSpan = textElement.createSpan({ text: part.content, cls: 'task-link' });
        linkSpan.dataset.linkType = part.linkType;
        linkSpan.dataset.linkIds = JSON.stringify(part.linkIds); // Guardar array como JSON

        // Eventos para mostrar overlay
        linkSpan.addEventListener('mouseenter', (e) => {
          this.triggerHovered = true;
          this.showTaskOverlay(e, part.linkType, part.linkIds);
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
      } else if (part.type === 'wikiLink') {
        const wikiLinkSpan = textElement.createSpan({ text: part.linkText, cls: 'wiki-link' });
        wikiLinkSpan.dataset.linkTarget = part.linkText;

        // Evento para abrir el archivo
        wikiLinkSpan.addEventListener('click', async (e) => {
          e.stopPropagation();

          // Buscar el archivo en el vault
          const targetFile = this.app.metadataCache.getFirstLinkpathDest(part.linkText, '');

          if (targetFile) {
            // Abrir el archivo en una nueva pestaña
            const leaf = this.app.workspace.getLeaf('tab');
            await leaf.openFile(targetFile);
          } else {
            new Notice(`❌ No se encontró el archivo: ${part.linkText}`);
          }
        });
      } else if (part.type === 'hiddenTag') {
        // Etiquetas ocultas (#urgent, #noturgent) - NO mostrar nada
        // Simplemente saltar este match
      } else if (part.type === 'inlineTag') {
        // Etiqueta INLINE (en medio del texto) - mostrar como texto normal
        textElement.appendText(part.tagText);
      } else if (part.type === 'tag') {
        // Etiqueta TRAILING (al final) - mostrar como píldora
        // Extraer texto sin el # para mostrar en la píldora
        const tagTextWithoutHash = part.tagText.substring(1); // Eliminar el #
        const tagSpan = textElement.createSpan({ text: tagTextWithoutHash, cls: 'task-tag' });
        const color = this.getColorForTag(part.tagText.toLowerCase());
        tagSpan.style.background = color;
        tagSpan.style.color = '#ffffff';
        tagSpan.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)'; // Mejor legibilidad

        // Click en tag para filtrar
        tagSpan.addEventListener('click', (e) => {
          e.stopPropagation();
          const searchInput = this.container.querySelector('.search-input');
          if (searchInput) {
            if (!searchInput.value.includes(part.tagText.toLowerCase())) {
              searchInput.value = searchInput.value
                ? `${searchInput.value} ${part.tagText.toLowerCase()}`
                : part.tagText.toLowerCase();
              this.filters.searchText = searchInput.value.toLowerCase();

              const clearBtn = this.container.querySelector('.clear-search-btn');
              if (clearBtn) {
                clearBtn.style.display = 'block';
              }

              this.applySearchFilter();
            }
          }
        });

        tagSpan.title = `Click para filtrar por ${part.tagText}`;
      }
    });
  }

  async showTaskOverlay(event, linkType, taskIds) {
    // Limpiar overlay anterior si existe
    this.hideTaskOverlay();

    // taskIds puede ser un string (retrocompatibilidad) o un array
    const ids = Array.isArray(taskIds) ? taskIds : [taskIds];

    // Buscar todas las tareas enlazadas para TODOS los IDs
    const allLinkedTasks = [];
    for (const taskId of ids) {
      const tasksForId = await this.findTasksById(taskId, linkType);
      if (tasksForId && tasksForId.length > 0) {
        allLinkedTasks.push(...tasksForId);
      }
    }

    if (allLinkedTasks.length === 0) {
      return;
    }

    // Crear overlay
    const overlay = document.body.createDiv('task-overlay');
    overlay.id = 'task-overlay-' + Date.now();

    const header = overlay.createDiv('task-overlay-header');
    if (linkType === '⛓') {
      header.textContent =
        allLinkedTasks.length > 1 ? `⛓ Tareas bloqueantes (${allLinkedTasks.length})` : '⛓ Tarea bloqueante';
    } else {
      header.textContent =
        allLinkedTasks.length > 1 ? `🆔 Tareas dependientes (${allLinkedTasks.length})` : '🆔 Tarea dependiente';
    }

    // Mostrar cada tarea enlazada
    allLinkedTasks.forEach((linkedTask, index) => {
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
      // Cerrar inmediatamente si el trigger tampoco está hovered
      setTimeout(() => {
        if (!this.overlayHovered && !this.triggerHovered) {
          this.hideTaskOverlay();
        }
      }, 100);
    });

    // NUEVO: Cerrar overlay al hacer scroll
    const scrollHandler = () => {
      this.hideTaskOverlay();
    };

    // Escuchar scroll en múltiples contenedores
    const zoomWrapper = this.container.querySelector('.zoom-wrapper');
    const timelineMain = this.container.querySelector('.timeline-main');
    const tasksLists = this.container.querySelectorAll('.tasks-list');

    if (zoomWrapper) zoomWrapper.addEventListener('scroll', scrollHandler, { once: true });
    if (timelineMain) timelineMain.addEventListener('scroll', scrollHandler, { once: true });
    tasksLists.forEach((list) => list.addEventListener('scroll', scrollHandler, { once: true }));

    // Guardar referencias para limpiar después
    this.currentOverlayScrollHandlers = {
      zoomWrapper,
      timelineMain,
      tasksLists: Array.from(tasksLists),
      handler: scrollHandler,
    };
  }

  hideTaskOverlay() {
    if (this.currentOverlay) {
      this.currentOverlay.remove();
      this.currentOverlay = null;
      this.currentOverlayTrigger = null;
      this.overlayHovered = false;
      this.triggerHovered = false;
    }

    // Limpiar cualquier overlay huérfano que pueda existir
    const orphanOverlays = document.querySelectorAll('.task-overlay');
    orphanOverlays.forEach((overlay) => overlay.remove());

    // Limpiar scroll handlers si existen
    if (this.currentOverlayScrollHandlers) {
      this.currentOverlayScrollHandlers = null;
    }
  }

  async findTasksById(taskId, linkType) {
    // Buscar en todos los archivos markdown
    let files = this.app.vault.getMarkdownFiles();

    if (this.config.filter) {
      files = files.filter((f) => f.path.startsWith(this.config.filter));
    }

    // Determinar qué patrón buscar según el tipo de enlace
    // ⛔ (before) significa "esta tarea necesita que se complete X primero"
    //    -> buscar LA tarea que tiene 🆔 X (la que bloquea)
    // 🆔 (after) significa "esta tarea tiene el ID X"
    //    -> buscar TODAS las tareas que tienen ⛔ X (las que dependen de esta)
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
          // NOTA: Ahora captura toda la cadena de IDs (con comas)
          const regex = new RegExp(`${searchPattern}\\s*([a-zA-Z0-9,]+)`);
          const idMatch = normalizedLine.match(regex);

          if (idMatch) {
            // Dividir por comas y verificar si alguno coincide con taskId
            const ids = idMatch[1].split(',').map((id) => id.trim());

            if (ids.includes(taskId)) {
              // Extraer texto de la tarea
              let taskText = line
                .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
                .replace(/[⛔🆔]\s*[a-zA-Z0-9,]+/gu, '') // Eliminar enlaces de tareas
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
                fullLine: line,
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
      if (cleanLine.includes('🔺')) return 0; // highest
      if (cleanLine.includes('⏫')) return 1; // highest
      if (cleanLine.includes('🔼')) return 2; // high
      if (cleanLine.includes('🔽')) return 4; // low
      if (cleanLine.includes('⏬')) return 5; // lowest
      return 3; // sin prioridad (medio)
    };

    const getStatusGroup = (line) => {
      // Extraer el estado del checkbox
      const checkboxMatch = line.match(/\[([x\- \/wd])\]/);
      if (!checkboxMatch) return 0; // Por defecto, grupo normal

      const state = checkboxMatch[1];
      // Grupo 0: Normal (espacio) y En curso (/)
      if (state === ' ' || state === '/') return 0;
      // Grupo 1: En espera (w) y Delegada (d)
      if (state === 'w' || state === 'd') return 1;
      // Otros estados (completada, cancelada, etc.)
      return 2;
    };

    const newTaskPriority = getPriorityValue(task.fullLine);
    const newTaskGroup = getStatusGroup(task.fullLine);

    // Encontrar la posición correcta según grupo y prioridad
    let insertIndex = -1;
    for (let i = 0; i < existingTasks.length; i++) {
      try {
        const existingTaskData = JSON.parse(existingTasks[i].dataset.taskData);
        const existingFullLine = existingTaskData.fullLine || '';
        const existingPriority = getPriorityValue(existingFullLine);
        const existingGroup = getStatusGroup(existingFullLine);

        // Primero comparar por grupo
        if (newTaskGroup < existingGroup) {
          insertIndex = i;
          break;
        }

        // Si están en el mismo grupo, comparar por prioridad
        if (newTaskGroup === existingGroup && newTaskPriority < existingPriority) {
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
      { emoji: '⏬', label: 'Lowest', value: '⏬' },
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
    priorities.forEach((priority) => {
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
          dropdown.querySelectorAll('.priority-option').forEach((opt) => {
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
        document.querySelectorAll('.priority-dropdown').forEach((otherDropdown) => {
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
      { emoji: '👤', label: 'Delegada', value: 'd' },
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
    const currentStatusObj = statuses.find((s) => s.value === currentStatus);
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
    statuses.forEach((status) => {
      // Si el estado actual no es normal, mostrar todas menos la actual
      // Si el estado actual es normal, mostrar solo los estados especiales
      const shouldShow =
        currentStatus === ' '
          ? status.value !== ' ' // Mostrar solo opciones especiales
          : true; // Mostrar todas las opciones

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

          // Actualizar el data-status del elemento
          taskEl.setAttribute('data-status', status.value);

          // Actualizar el botón
          statusButton.textContent = status.emoji;

          // Actualizar las opciones seleccionadas
          dropdown.querySelectorAll('.status-option').forEach((opt) => {
            opt.classList.remove('selected');
          });
          option.classList.add('selected');

          // Cerrar dropdown
          dropdown.style.display = 'none';
          dropdown.style.visibility = 'visible';

          // Actualizar el icono de estado en el texto
          const taskText = taskEl.querySelector('.task-text');
          if (taskText) {
            const statusIconEl = taskText.querySelector('.task-status-icon');
            const newStatusIcon = this.getTaskStatusIcon(status.value);

            if (newStatusIcon && !statusIconEl) {
              // Agregar icono si no existe
              const iconSpan = document.createElement('span');
              iconSpan.className = 'task-status-icon';
              iconSpan.textContent = newStatusIcon + ' ';
              taskText.insertBefore(iconSpan, taskText.firstChild);
            } else if (newStatusIcon && statusIconEl) {
              // Actualizar icono existente
              statusIconEl.textContent = newStatusIcon + ' ';
            } else if (!newStatusIcon && statusIconEl) {
              // Remover icono si ya no es necesario
              statusIconEl.remove();
            }
          }

          // Aplicar filtros de estado por si el elemento debe ocultarse
          this.applyStatusFilters();

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
        document.querySelectorAll('.status-dropdown, .priority-dropdown').forEach((otherDropdown) => {
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

      // Intentar obtener datos con nuestro tipo específico primero
      let data = e.dataTransfer.getData('application/x-obsidian-task');

      if (!data) {
        data = e.dataTransfer.getData('text/plain');
      }

      if (!data) {
        new Notice('❌ No se pudo obtener los datos de la tarea');
        return;
      }

      // Validar que los datos sean JSON válido antes de parsear
      let taskData;

      try {
        // Verificar que parece JSON (empieza con { o [)
        if (!data.trim().startsWith('{') && !data.trim().startsWith('[')) {
          new Notice('❌ Datos de tarea inválidos');
          return;
        }

        taskData = JSON.parse(data);
      } catch (error) {
        console.error('Error al parsear datos de tarea:', error);
        new Notice('❌ Error al procesar los datos de la tarea');
        return;
      }

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

      await new Promise((resolve) => setTimeout(resolve, 50));

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
        fullLine: updatedFullLine, // Usar la línea actualizada
        completed: false,
        cancelled: false,
      };

      // Encontrar la posición correcta para insertar la tarea según su prioridad
      this.insertTaskByPriority(dropZone, taskInfo);

      // Actualizar contadores de ambas columnas
      this.updateColumnCount(originalParent);
      this.updateColumnCount(dropZone);

      setTimeout(() => {
        const timelineMain = this.container.querySelector('.timeline-main');
        if (timelineMain) timelineMain.scrollLeft = scrollPos;
      }, 0);

      new Notice(`✅ Tarea movida a: ${label}`);
    });
  }

  updateColumnCount(tasksList) {
    const dayContainer = tasksList.closest('.day-container');
    if (!dayContainer) return;

    const countBadge = dayContainer.querySelector('.task-count-badge');
    if (!countBadge) return;

    // Contar tareas visibles (no ocultas por filtros)
    const visibleTasks = Array.from(tasksList.querySelectorAll('.task-item')).filter(
      (task) => task.style.display !== 'none',
    );

    countBadge.textContent = ` (${visibleTasks.length})`;
  }

  async getTasksForDate(date) {
    const tasks = [];
    let files = this.app.vault.getMarkdownFiles();

    if (this.config.filter) {
      files = files.filter((f) => f.path.startsWith(this.config.filter));
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
              // NO eliminar etiquetas aquí - se procesarán en processTaskLinks
              .replace(/\s+/g, ' ')
              .trim();

            // Filtrar por texto de búsqueda
            if (!this.matchesSearchFilter(taskText)) {
              return;
            }

            tasks.push({
              text: taskText || 'Sin descripción',
              file: file,
              line: index,
              date: dateMatch[1],
              fullLine: line, // Guardar línea original
              completed: taskMatch[1] === 'x',
              cancelled: taskMatch[1] === '-',
              checkboxState: taskMatch[1],
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
      files = files.filter((f) => f.path.startsWith(this.config.filter));
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
              // NO eliminar etiquetas aquí - se procesarán en processTaskLinks
              .replace(/\s+/g, ' ')
              .trim();

            // Filtrar por texto de búsqueda
            if (!this.matchesSearchFilter(taskText)) {
              return;
            }

            tasks.push({
              text: taskText || 'Sin descripción',
              file: file,
              line: index,
              date: dateMatch[1],
              fullLine: line, // Guardar línea original
              completed: false,
              cancelled: false,
              checkboxState: taskMatch[1],
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
      files = files.filter((f) => f.path.startsWith(this.config.filter));
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
              // NO eliminar etiquetas aquí - se procesarán en processTaskLinks
              .replace(/\s+/g, ' ')
              .trim();

            // Filtrar por texto de búsqueda
            if (!this.matchesSearchFilter(taskText)) {
              return;
            }

            tasks.push({
              text: taskText || 'Sin descripción',
              file: file,
              line: index,
              date: null,
              fullLine: line, // Guardar línea original
              completed: false,
              cancelled: false,
              checkboxState: taskMatch[1],
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
      .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
      .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '')
      .replace(/[🔺⏫🔼🔽⬇]/gu, '')
      .replace(/[🔁♻️]/gu, '')
      .replace(/\s+/g, ' ')
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
      .replace(/[🔺⏫🔼🔽⬇]/gu, '')
      .replace(/[🔁♻️]/gu, '')
      .replace(/\s+/g, ' ')
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
      .replace(/[🔺⏫🔼🔽⬇]/gu, '')
      .replace(/[🔁♻️]/gu, '')
      .replace(/\s+/g, ' ')
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
      .replace(/[🔺⏫🔼🔽⬇]/gu, '')
      .replace(/[🔁♻️]/gu, '')
      .replace(/\s+/g, ' ')
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

    const originalLine = lines[task.line];

    if (completed) {
      // Completar tarea: cambiar estado a [x] y añadir fecha de finalización

      // Extraer indentación
      const indentMatch = originalLine.match(/^(\s*)/u);
      const indent = indentMatch ? indentMatch[1] : '';

      // Extraer tipo de lista
      const listMarkerMatch = originalLine.match(/^[\s]*([-*])/u);
      const listMarker = listMarkerMatch ? listMarkerMatch[1] : '-';

      // Extraer emojis de prioridad
      const priorityMatch = originalLine.match(/[🔺⏫🔼🔽⬇]/u);
      const priority = priorityMatch ? priorityMatch[0] : '';

      // Extraer emojis de recurrencia
      const recurrenceMatch = originalLine.match(/[🔁♻️]/u);
      const recurrence = recurrenceMatch ? recurrenceMatch[0] : '';

      // Extraer otras fechas para preservarlas
      const dates = [];
      const startDateMatch = originalLine.match(/🛫\s*(\d{4}-\d{2}-\d{2})/u);
      if (startDateMatch) dates.push(`🛫 ${startDateMatch[1]}`);

      const dueDateMatch = originalLine.match(/📅\s*(\d{4}-\d{2}-\d{2})/u);
      if (dueDateMatch) dates.push(`📅 ${dueDateMatch[1]}`);

      const scheduledMatch = originalLine.match(/⏳\s*(\d{4}-\d{2}-\d{2})/u);
      if (scheduledMatch) dates.push(`⏳ ${scheduledMatch[1]}`);

      // Verificar si ya tiene fecha de finalización (no duplicar)
      const doneDateMatch = originalLine.match(/✅\s*(\d{4}-\d{2}-\d{2})/u);

      // Extraer texto limpio
      let taskText = originalLine
        .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
        .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '')
        .replace(/[🔺⏫🔼🔽⬇]/gu, '')
        .replace(/[🔁♻️]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Reconstruir la línea con estado completado [x]
      let newLine = `${indent}${listMarker} [x] ${taskText}`;

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

      // Añadir fecha de finalización si no existe ya
      if (!doneDateMatch) {
        const today = new Date();
        const doneDate = this.formatDate(today);
        newLine += ` ✅ ${doneDate}`;
      } else {
        // Si ya existía, preservarla
        newLine += ` ✅ ${doneDateMatch[1]}`;
      }
      lines[task.line] = newLine;
    } else {
      // Descompletar tarea: cambiar [x] a [ ] y quitar fecha de finalización
      const newLine = originalLine.replace(/\[x\]/u, '[ ]').replace(/\s*✅\s*\d{4}-\d{2}-\d{2}/u, ''); // Eliminar fecha de finalización
      lines[task.line] = newLine;
    }

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
