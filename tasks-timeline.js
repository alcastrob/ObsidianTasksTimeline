/**
 * Tasks Timeline - Dataview View v2.3 (Refactorizado)
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
    min-height: 40px;
}

.task-text::before {
    content: '';
    float: right;
    width: 1px;
    height: 35px;
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

.task-priority-selector, .task-status-selector {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
}

.priority-button, .status-button {
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

.priority-button:hover, .status-button:hover {
    background: var(--background-secondary) !important;
    color: var(--interactive-accent) !important;
}

.priority-dropdown, .status-dropdown {
    position: fixed;
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    min-width: 120px;
}

.status-dropdown {
    min-width: 130px;
}

.priority-option, .status-option {
    padding: 6px 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    border-bottom: 1px solid var(--background-modifier-border);
}

.priority-option:last-child, .status-option:last-child {
    border-bottom: none;
    border-radius: 0 0 6px 6px;
}

.priority-option:first-child, .status-option:first-child {
    border-radius: 6px 6px 0 0;
}

.priority-option:hover, .status-option:hover {
    background: var(--background-modifier-hover);
}

.priority-option.selected, .status-option.selected {
    background: var(--background-modifier-active-hover);
    font-weight: 600;
}

.priority-emoji, .status-emoji {
    font-size: 12px;
    width: 16px;
    text-align: center;
}

.priority-label, .status-label {
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

.task-link {
    cursor: help;
    position: relative;
    display: inline;
    text-decoration: underline dotted;
    text-decoration-color: var(--text-muted);
}

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

.task-status-icon {
    display: inline;
}

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
  daysView: input?.daysView || 'full',
};

class TasksTimeline {
  constructor(container, app, dv, config) {
    this.dvContainer = container;
    this.app = app;
    this.dv = dv;
    this.config = config;

    this.filters = {
      showNormal: true,
      showInProgress: true,
      showWaiting: true,
      showDelegated: true,
      showNextWeek: true,
      showNoDate: true,
      showOverdue: null,
      searchText: '',
    };

    const existingTimeline = document.getElementById(timelineId);

    if (existingTimeline) {
      existingTimeline.style.display = 'block';
      this.dvContainer.innerHTML = '';
      this.dvContainer.style.display = 'none';
      return;
    }

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

  // ==================== MÉTODOS HELPER REFACTORIZADOS ====================

  normalizeLine(line) {
    return line.replace(/[\uFE0E\uFE0F]/g, '');
  }

  extractTaskMetadata(line) {
    const indentMatch = line.match(/^(\s*)/u);
    const listMarkerMatch = line.match(/^[\s]*([-*])/u);
    const checkboxMatch = line.match(/\[([x\- \/wd])\]/u);
    const priorityMatch = line.match(/[🔺⏫🔼🔽⬇]/u);
    const recurrenceMatch = line.match(/[🔁♻️]/u);

    const startDateMatch = line.match(/🛫\s*(\d{4}-\d{2}-\d{2})/u);
    const dueDateMatch = line.match(/📅\s*(\d{4}-\d{2}-\d{2})/u);
    const scheduledMatch = line.match(/⏳\s*(\d{4}-\d{2}-\d{2})/u);
    const doneDateMatch = line.match(/✅\s*(\d{4}-\d{2}-\d{2})/u);

    return {
      indent: indentMatch ? indentMatch[1] : '',
      listMarker: listMarkerMatch ? listMarkerMatch[1] : '-',
      checkboxState: checkboxMatch ? checkboxMatch[1] : ' ',
      priority: priorityMatch ? priorityMatch[0] : '',
      recurrence: recurrenceMatch ? recurrenceMatch[0] : '',
      dates: {
        start: startDateMatch ? startDateMatch[1] : null,
        due: dueDateMatch ? dueDateMatch[1] : null,
        scheduled: scheduledMatch ? scheduledMatch[1] : null,
        done: doneDateMatch ? doneDateMatch[1] : null,
      },
    };
  }

  formatDatesForLine(dates) {
    const formattedDates = [];
    if (dates.start) formattedDates.push(`🛫 ${dates.start}`);
    if (dates.due) formattedDates.push(`📅 ${dates.due}`);
    if (dates.scheduled) formattedDates.push(`⏳ ${dates.scheduled}`);
    if (dates.done) formattedDates.push(`✅ ${dates.done}`);
    return formattedDates;
  }

  cleanTaskText(line) {
    return line
      .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
      .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '')
      .replace(/[🔺⏫🔼🔽⬇]/gu, '')
      .replace(/[🔁♻️]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  reconstructTaskLine(metadata, taskText) {
    let line = `${metadata.indent}${metadata.listMarker} [${metadata.checkboxState}] ${taskText}`;

    if (metadata.priority) line += ` ${metadata.priority}`;
    if (metadata.recurrence) line += ` ${metadata.recurrence}`;

    const dates = this.formatDatesForLine(metadata.dates);
    if (dates.length > 0) {
      line += ' ' + dates.join(' ');
    }

    return line;
  }

  async modifyTaskLine(filePath, lineNumber, modifierFn) {
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
    const metadata = this.extractTaskMetadata(originalLine);
    const taskText = this.cleanTaskText(originalLine);

    const modifiedMetadata = modifierFn(metadata, taskText);
    const newLine = this.reconstructTaskLine(modifiedMetadata, taskText);

    lines[lineNumber] = newLine;
    await this.app.vault.modify(file, lines.join('\n'));
  }

  // ==================== MÉTODOS DE ACTUALIZACIÓN SIMPLIFICADOS ====================

  async updateTaskDate(filePath, lineNumber, oldLine, newDate) {
    await this.modifyTaskLine(filePath, lineNumber, (metadata) => {
      metadata.dates.start = newDate;
      return metadata;
    });
  }

  async removeTaskDate(filePath, lineNumber, oldLine) {
    await this.modifyTaskLine(filePath, lineNumber, (metadata) => {
      metadata.dates.start = null;
      return metadata;
    });
  }

  async updateTaskPriority(filePath, lineNumber, oldLine, newPriority) {
    await this.modifyTaskLine(filePath, lineNumber, (metadata) => {
      metadata.priority = newPriority || '';
      return metadata;
    });
  }

  async updateTaskStatus(filePath, lineNumber, oldLine, newStatus) {
    await this.modifyTaskLine(filePath, lineNumber, (metadata) => {
      metadata.checkboxState = newStatus;
      return metadata;
    });
  }

  async toggleTaskComplete(task, completed) {
    const file = this.app.vault.getAbstractFileByPath(task.file.path);
    if (!file || file.extension !== 'md') return;

    const content = await this.app.vault.read(file);
    const lines = content.split('\n');
    if (task.line >= lines.length) return;

    const originalLine = lines[task.line];
    const metadata = this.extractTaskMetadata(originalLine);
    const taskText = this.cleanTaskText(originalLine);

    if (completed) {
      metadata.checkboxState = 'x';
      if (!metadata.dates.done) {
        const today = new Date();
        metadata.dates.done = this.formatDate(today);
      }
    } else {
      metadata.checkboxState = ' ';
      metadata.dates.done = null;
    }

    const newLine = this.reconstructTaskLine(metadata, taskText);
    lines[task.line] = newLine;
    await this.app.vault.modify(file, lines.join('\n'));
  }

  async cancelTask(task) {
    await this.modifyTaskLine(task.file.path, task.line, (metadata) => {
      metadata.checkboxState = '-';
      return metadata;
    });
  }

  // ==================== MÉTODOS DE BÚSQUEDA REFACTORIZADOS ====================

  async getTasksFromFiles(filterFn) {
    const tasks = [];
    let files = this.app.vault.getMarkdownFiles();

    if (this.config.filter) {
      files = files.filter((f) => f.path.startsWith(this.config.filter));
    }

    for (const file of files) {
      const content = await this.app.vault.read(file);
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const normalizedLine = this.normalizeLine(line);
        const taskMatch = normalizedLine.match(/^[\s]*[-*]\s+\[([x\- \/wd])\]/u);

        if (!taskMatch) return;

        const checkboxState = taskMatch[1];

        if (checkboxState === '-') return;
        if (!this.shouldShowTask(checkboxState)) return;

        const metadata = this.extractTaskMetadata(line);

        if (!filterFn(metadata, normalizedLine, checkboxState)) return;

        const taskText = this.cleanTaskText(line);

        if (!this.matchesSearchFilter(taskText)) return;

        tasks.push({
          text: taskText || 'Sin descripción',
          file: file,
          line: index,
          date: metadata.dates.start,
          fullLine: line,
          completed: checkboxState === 'x',
          cancelled: checkboxState === '-',
          checkboxState: checkboxState,
        });
      });
    }

    return tasks;
  }

  async getTasksForDate(date) {
    return this.getTasksFromFiles((metadata) => {
      return metadata.dates.start === date;
    });
  }

  async getOverdueTasks(today) {
    const todayStr = this.formatDate(today);
    return this.getTasksFromFiles((metadata, normalizedLine, checkboxState) => {
      return metadata.dates.start && metadata.dates.start < todayStr && checkboxState !== 'x';
    });
  }

  async getTasksWithoutDate() {
    return this.getTasksFromFiles((metadata, normalizedLine, checkboxState) => {
      return !metadata.dates.start && checkboxState !== 'x';
    });
  }

  // ==================== MÉTODOS DE UI Y ESTADO ====================

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
        return '⏳';
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
    if (!this.filters.searchText || this.filters.searchText.trim() === '') {
      return true;
    }
    return taskText.toLowerCase().includes(this.filters.searchText);
  }

  comparePriority(lineA, lineB) {
    const getPriorityValue = (line) => {
      const cleanLine = line.replace(/[\uFE0E\uFE0F]/g, '');
      if (cleanLine.includes('🔺')) return 0;
      if (cleanLine.includes('⏫')) return 1;
      if (cleanLine.includes('🔼')) return 2;
      if (cleanLine.includes('🔽')) return 4;
      if (cleanLine.includes('⬇')) return 5;
      return 3;
    };

    const getStatusGroup = (line) => {
      const checkboxMatch = line.match(/\[([x\- \/wd])\]/);
      if (!checkboxMatch) return 0;

      const state = checkboxMatch[1];
      if (state === ' ' || state === '/') return 0;
      if (state === 'w') return 1;
      if (state === 'd') return 2;
      return 3;
    };

    const groupA = getStatusGroup(lineA);
    const groupB = getStatusGroup(lineB);

    if (groupA !== groupB) {
      return groupA - groupB;
    }

    const priorityA = getPriorityValue(lineA);
    const priorityB = getPriorityValue(lineB);
    return priorityA - priorityB;
  }

  extractTags(text) {
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const wikiLinkRanges = [];
    let match;

    while ((match = wikiLinkRegex.exec(text)) !== null) {
      wikiLinkRanges.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    const tagRegex = /#[\w\-áéíóúñü]+/gi;
    const tags = [];

    while ((match = tagRegex.exec(text)) !== null) {
      const tagStart = match.index;
      const tagEnd = tagStart + match[0].length;

      const isInsideWikiLink = wikiLinkRanges.some((range) => tagStart >= range.start && tagEnd <= range.end);

      const tagText = match[0].toLowerCase();
      const isHiddenTag = tagText === '#urgent' || tagText === '#noturgent';

      if (!isInsideWikiLink && !isHiddenTag) {
        tags.push(tagText);
      }
    }

    return tags;
  }

  getColorForTag(tag) {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);
    const saturation = 60 + (Math.abs(hash) % 20);
    const lightness = 45 + (Math.abs(hash >> 8) % 15);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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

  // ==================== RENDER Y CREACIÓN DE ELEMENTOS ====================

  async init() {
    this.container.classList.add('tasks-timeline-container');
    await this.render();
  }

  async render() {
    this.container.empty();

    const header = this.container.createDiv('timeline-header');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.width = '100%';
    header.style.maxWidth = '100%';
    header.style.gap = '8px';
    header.style.flexWrap = 'wrap';
    header.style.overflow = 'visible';
    header.style.boxSizing = 'border-box';

    const leftGroup = header.createDiv();
    leftGroup.style.display = 'flex';
    leftGroup.style.alignItems = 'center';
    leftGroup.style.gap = '8px';
    leftGroup.style.flex = '0 1 auto';
    leftGroup.style.minWidth = '0';

    const zoomControl = leftGroup.createDiv('zoom-control');
    zoomControl.createSpan({ text: '🔍 Zoom:', cls: 'zoom-label' });

    const zoomSlider = zoomControl.createEl('input', { type: 'range' });
    zoomSlider.classList.add('zoom-slider');
    zoomSlider.min = '50';
    zoomSlider.max = '150';
    zoomSlider.step = '5';

    const savedZoom = localStorage.getItem('tasks-timeline-zoom') || '100';
    zoomSlider.value = savedZoom;

    const zoomValue = zoomControl.createSpan({ text: `${savedZoom}%`, cls: 'zoom-value' });

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

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const searchText = e.target.value;
      clearSearchBtn.style.display = searchText ? 'block' : 'none';

      searchTimeout = setTimeout(() => {
        this.filters.searchText = searchText.toLowerCase();
        this.applySearchFilter();
      }, 300);
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      this.filters.searchText = '';
      clearSearchBtn.style.display = 'none';
      this.applySearchFilter();
    });

    const rightGroup = header.createDiv();
    rightGroup.style.display = 'flex';
    rightGroup.style.alignItems = 'center';
    rightGroup.style.gap = '8px';
    rightGroup.style.flexWrap = 'wrap';
    rightGroup.style.justifyContent = 'flex-end';
    rightGroup.style.flex = '0 1 auto';

    const refreshBtn = rightGroup.createEl('button', { text: '🔄 Refrescar' });
    refreshBtn.classList.add('timeline-refresh-btn');
    refreshBtn.style.fontSize = '11px';
    refreshBtn.style.padding = '4px 8px';
    refreshBtn.style.fontWeight = 'normal';
    refreshBtn.addEventListener('click', () => {
      this.hideTaskOverlay();
      this.render();
    });

    if (this.config.daysView !== 'nextWeek') {
      this.createColumnFilterDropdown(rightGroup);
    }

    this.createStatusFilterDropdown(rightGroup);

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

    const tagsBar = this.container.createDiv('tags-bar');
    tagsBar.style.display = 'none';
    this.tagsBar = tagsBar;

    const zoomWrapper = this.container.createDiv('zoom-wrapper');
    zoomWrapper.style.cssText = `
      width: 100%;
      overflow-x: auto;
      overflow-y: visible;
      position: relative;
    `;

    const timelineMain = zoomWrapper.createDiv('timeline-main');

    const zoomPercent = parseInt(savedZoom);
    const scale = zoomPercent / 100;

    const applyZoom = (scaleValue) => {
      const prevScrollLeft = timelineMain.scrollLeft;
      const prevScrollTop = zoomWrapper.scrollTop;

      timelineMain.style.willChange = 'transform';
      timelineMain.style.transform = `scale(${scaleValue})`;
      timelineMain.style.transformOrigin = 'top left';

      requestAnimationFrame(() => {
        const currentHeight = timelineMain.scrollHeight;
        zoomWrapper.style.minHeight = `${currentHeight * scaleValue}px`;
        timelineMain.getBoundingClientRect();

        requestAnimationFrame(() => {
          const prevDisplay = timelineMain.style.display;
          timelineMain.style.display = 'none';
          timelineMain.offsetHeight;
          timelineMain.style.display = prevDisplay || 'flex';

          requestAnimationFrame(() => {
            timelineMain.scrollLeft = prevScrollLeft;
            zoomWrapper.scrollTop = prevScrollTop;

            setTimeout(() => {
              timelineMain.style.willChange = 'auto';
            }, 300);
          });
        });
      });
    };

    applyZoom(scale);

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

    const isNextWeekMode = this.config.daysView === 'nextWeek';

    if (isNextWeekMode) {
      let daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

      const overdueTasks = await this.getOverdueTasks(today);
      const shouldShowOverdue =
        this.filters.showOverdue === null ? overdueTasks.length > 0 : this.filters.showOverdue;

      if (shouldShowOverdue) {
        await this.createOverdueContainer(timelineMain, today, overdueTasks);
      }

      const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      for (let i = 0; i < 5; i++) {
        const offset = daysUntilNextMonday + i;
        await this.createDayContainer(timelineMain, dayNames[i], offset, today);
      }

      if (this.filters.showNoDate) {
        await this.createNoDateContainer(timelineMain);
      }
    } else {
      let maxDaysToShow = Infinity;
      if (this.config.daysView !== 'full') {
        const match = this.config.daysView.match(/^(\d+)\s*days?$/i);
        if (match) {
          maxDaysToShow = parseInt(match[1]);
        }
      }

      const overdueTasks = await this.getOverdueTasks(today);
      let shouldShowOverdue = false;

      if (this.filters.showOverdue === null) {
        shouldShowOverdue = overdueTasks.length > 0;
      } else if (this.filters.showOverdue === true) {
        shouldShowOverdue = true;
      } else if (this.filters.showOverdue === false) {
        shouldShowOverdue = false;
      }

      if (shouldShowOverdue) {
        await this.createOverdueContainer(timelineMain, today, overdueTasks);
      }

      await this.createDayContainer(timelineMain, 'Hoy', 0, today);
      let daysShown = 1;

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

      if (this.filters.showNextWeek) {
        let daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        await this.createDayContainer(timelineMain, 'Próxima Semana', daysUntilNextMonday, today);
      }

      if (this.filters.showNoDate) {
        await this.createNoDateContainer(timelineMain);
      }
    }

    this.updateTagsBar();
  }

  createColumnFilterDropdown(parent) {
    const columnDropdownContainer = parent.createDiv('filter-dropdown-container');
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

    const overdueOption = columnDropdownMenu.createDiv('filter-option');
    const overdueCheckbox = overdueOption.createDiv('filter-checkbox');

    if (this.filters.showOverdue === null) {
      overdueCheckbox.style.background = 'var(--interactive-accent)';
      overdueCheckbox.style.borderColor = 'var(--interactive-accent)';
      overdueCheckbox.style.opacity = '0.5';
      const autoIcon = overdueCheckbox.createSpan({ text: 'A' });
      autoIcon.style.cssText = 'color: var(--text-on-accent); font-size: 10px; font-weight: bold;';
    } else if (this.filters.showOverdue === true) {
      overdueCheckbox.classList.add('checked');
    }

    const overdueLabel = overdueOption.createSpan({ cls: 'filter-option-label' });
    overdueLabel.createSpan({ text: '⚠️ Retrasadas' });

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

      if (this.filters.showOverdue === null) {
        this.filters.showOverdue = false;
      } else if (this.filters.showOverdue === false) {
        this.filters.showOverdue = true;
      } else {
        this.filters.showOverdue = null;
      }

      this.render();
    });

    const nextWeekOption = columnDropdownMenu.createDiv('filter-option');
    const nextWeekCheckbox = nextWeekOption.createDiv('filter-checkbox');
    if (this.filters.showNextWeek) nextWeekCheckbox.classList.add('checked');
    nextWeekOption.createSpan({ text: 'Próxima semana', cls: 'filter-option-label' });
    nextWeekOption.addEventListener('click', (e) => {
      e.stopPropagation();
      this.filters.showNextWeek = !this.filters.showNextWeek;
      this.render();
    });

    const noDateOption = columnDropdownMenu.createDiv('filter-option');
    const noDateCheckbox = noDateOption.createDiv('filter-checkbox');
    if (this.filters.showNoDate) noDateCheckbox.classList.add('checked');
    noDateOption.createSpan({ text: 'Sin fecha', cls: 'filter-option-label' });
    noDateOption.addEventListener('click', (e) => {
      e.stopPropagation();
      this.filters.showNoDate = !this.filters.showNoDate;
      this.render();
    });

    columnDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = columnDropdownMenu.classList.contains('show');

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

  createStatusFilterDropdown(parent) {
    const statusDropdownContainer = parent.createDiv('filter-dropdown-container');
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

    const statusOptions = [
      { filter: 'showNormal', label: '⚪ No comenzadas' },
      { filter: 'showInProgress', label: '🔄 En curso' },
      { filter: 'showWaiting', label: '⏳ En espera' },
      { filter: 'showDelegated', label: '👤 Delegadas' },
    ];

    statusOptions.forEach(({ filter, label }) => {
      const option = statusDropdownMenu.createDiv('filter-option');
      const checkbox = option.createDiv('filter-checkbox');
      if (this.filters[filter]) checkbox.classList.add('checked');
      option.createSpan({ text: label, cls: 'filter-option-label' });
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        this.filters[filter] = !this.filters[filter];
        checkbox.classList.toggle('checked');
        this.applyStatusFilters();
      });
    });

    statusDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = statusDropdownMenu.classList.contains('show');

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
  }

  updateTagsBar() {
    const tagsBar = this.tagsBar;
    if (!tagsBar) return;

    tagsBar.empty();

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

    tagsBar.createSpan({ text: '🏷️ Etiquetas:', cls: 'tags-bar-label' });

    uniqueTags.sort();

    uniqueTags.forEach((tag) => {
      const tagButton = tagsBar.createDiv('tags-bar-tag');
      const color = this.getColorForTag(tag);
      tagButton.style.background = color;
      tagButton.style.color = '#ffffff';
      tagButton.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';

      const tagTextWithoutHash = tag.startsWith('#') ? tag.substring(1) : tag;
      tagButton.createSpan({ text: tagTextWithoutHash });
      tagButton.createSpan({
        text: `(${tagCounts[tag]})`,
        cls: 'tags-bar-count',
      });

      tagButton.addEventListener('click', () => {
        const searchInput = this.container.querySelector('.search-input');
        if (searchInput) {
          if (!searchInput.value.includes(tag)) {
            searchInput.value = searchInput.value ? `${searchInput.value} ${tag}` : tag;
            this.filters.searchText = searchInput.value.toLowerCase();

            const clearBtn = this.container.querySelector('.clear-search-btn');
            if (clearBtn) {
              clearBtn.style.display = 'block';
            }

            this.applySearchFilter();
          }
        }
      });

      tagButton.title = `Click para filtrar por ${tag}`;
    });
  }

  applySearchFilter() {
    const searchText = this.filters.searchText;
    const taskItems = this.container.querySelectorAll('.task-item');

    taskItems.forEach((taskItem) => {
      const taskLine = taskItem.getAttribute('data-task-line') || '';
      const taskText = taskLine.toLowerCase();

      const matchesSearch = !searchText || taskText.includes(searchText);

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

    this.updateTagsBar();
    this.updateEmptyMessages();
  }

  updateEmptyMessages() {
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
    const taskItems = this.container.querySelectorAll('.task-item');

    taskItems.forEach((taskItem) => {
      const status = taskItem.getAttribute('data-status') || ' ';
      let shouldShow = true;

      if (status === ' ' && !this.filters.showNormal) shouldShow = false;
      else if (status === '/' && !this.filters.showInProgress) shouldShow = false;
      else if (status === 'w' && !this.filters.showWaiting) shouldShow = false;
      else if (status === 'd' && !this.filters.showDelegated) shouldShow = false;

      if (shouldShow && this.filters.searchText) {
        const taskLine = taskItem.getAttribute('data-task-line') || '';
        shouldShow = taskLine.toLowerCase().includes(this.filters.searchText);
      }

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
    const activeTasks = tasks.filter((t) => !t.completed);

    activeTasks.sort((a, b) => this.comparePriority(a.fullLine, b.fullLine));

    if (activeTasks.length === 0) {
      const emptyMsg = tasksList.createDiv('empty-message');
      emptyMsg.setText('Sin tareas');
    } else {
      for (const task of activeTasks) {
        this.createTaskElement(tasksList, task);
      }
      countBadge.textContent = ` (${activeTasks.length})`;
    }

    countBadge.textContent = ` (${activeTasks.length})`;
    this.setupDropZone(tasksList, dateStr, label);
  }

  async createOverdueContainer(parent, today, overdueTasks = null) {
    if (!overdueTasks) {
      overdueTasks = await this.getOverdueTasks(today);
    }

    overdueTasks.sort((a, b) => this.comparePriority(a.fullLine, b.fullLine));

    const dayContainer = parent.createDiv('day-container');
    dayContainer.classList.add('overdue-container');
    dayContainer.setAttribute('data-days-offset', '0');

    const header = dayContainer.createEl('div', { cls: 'day-header' });
    const labelSpan = header.createEl('span', { cls: 'day-label' });
    labelSpan.createSpan({ text: '⚠️ Retrasadas' });
    const countBadge = labelSpan.createSpan({ text: ` (${overdueTasks.length})`, cls: 'task-count-badge' });
    countBadge.style.cssText = 'font-size: 11px; opacity: 0.7; font-weight: normal;';

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

      setTimeout(() => this.render(), 500);
    });

    const tasksList = dayContainer.createDiv('tasks-list');
    tasksList.classList.add('droppable');

    for (const task of overdueTasks) {
      this.createTaskElement(tasksList, task);
    }

    // Configurar drop zone para permitir arrastrar tareas a "Retrasadas"
    // targetDate se ignora porque se calculará como "ayer" en setupDropZone
    this.setupDropZone(tasksList, null, '⚠️ Retrasadas');
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

    noDateTasks.sort((a, b) => this.comparePriority(a.fullLine, b.fullLine));

    if (noDateTasks.length === 0) {
      const emptyMsg = tasksList.createDiv('empty-message');
      emptyMsg.setText('Sin tareas');
    } else {
      for (const task of noDateTasks) {
        this.createTaskElement(tasksList, task);
      }
      countBadge.textContent = ` (${noDateTasks.length})`;
    }

    this.setupDropZone(tasksList, null, 'Sin Fecha');
  }

  createTaskElement(parent, task) {
    const taskEl = parent.createDiv('task-item');

    const taskId = `task-${task.file.path.replace(/[^a-zA-Z0-9]/g, '_')}-${task.line}`;
    taskEl.id = taskId;
    taskEl.setAttribute('draggable', 'true');
    taskEl.setAttribute('data-task-line', task.fullLine || task.text);
    taskEl.setAttribute('data-status', task.checkboxState || ' ');

    const taskContent = taskEl.createDiv('task-content');

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

    const prioritySelector = actions.createDiv('task-priority-selector');
    this.createPrioritySelector(prioritySelector, task, taskEl);

    const statusSelector = actions.createDiv('task-status-selector');
    this.createStatusSelector(statusSelector, task, taskEl);

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

    const text = taskContent.createSpan();
    text.classList.add('task-text');
    if (task.completed) {
      text.classList.add('completed');
    }

    const statusIcon = this.getTaskStatusIcon(task.checkboxState || (task.completed ? 'x' : ' '));
    if (statusIcon) {
      text.createSpan({ text: statusIcon + ' ', cls: 'task-status-icon' });
    }

    this.processTaskLinks(text, task.text);

    const clearfix = taskContent.createDiv();
    clearfix.style.clear = 'both';

    const fileInfo = taskEl.createDiv('task-file-info');
    fileInfo.innerHTML = `📄 <span class="file-name">${task.file.basename}</span>`;
    fileInfo.addEventListener('click', async () => {
      const leaf = this.app.workspace.getLeaf('tab');
      await leaf.openFile(task.file);

      setTimeout(() => {
        const view = leaf.view;
        if (view && view.editor) {
          view.editor.setCursor({ line: task.line, ch: 0 });
          view.editor.scrollIntoView({ from: { line: task.line, ch: 0 }, to: { line: task.line, ch: 0 } }, true);

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

    taskEl.addEventListener('dragend', () => {
      taskEl.classList.remove('dragging');
    });
  }

  processTaskLinks(textElement, taskText) {
    const taskLinkRegex = /(⛓|🆔)\s*([a-zA-Z0-9,]+)/g;
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const tagRegex = /#[\w\-áéíóúñü]+/gi;

    const parts = [];
    let lastIndex = 0;

    const allMatches = [];

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

    const taskLinkEmojiRegex = /[⛓🆔]/g;
    let lastTaskLinkPos = -1;
    let taskLinkMatch;
    while ((taskLinkMatch = taskLinkEmojiRegex.exec(taskText)) !== null) {
      lastTaskLinkPos = Math.max(lastTaskLinkPos, taskLinkMatch.index);
    }

    taskLinkRegex.lastIndex = 0;
    while ((match = taskLinkRegex.exec(taskText)) !== null) {
      const linkType = match[1];
      const idsString = match[2];
      const ids = idsString.split(',').map((id) => id.trim());

      allMatches.push({
        type: 'taskLink',
        index: match.index,
        length: match[0].length,
        content: match[0],
        linkType: linkType,
        linkIds: ids,
      });
    }

    tagRegex.lastIndex = 0;
    while ((match = tagRegex.exec(taskText)) !== null) {
      const tagStart = match.index;
      const tagEnd = tagStart + match[0].length;
      const tagText = match[0].toLowerCase();

      const isInsideWikiLink = wikiLinkRanges.some((range) => tagStart >= range.start && tagEnd <= range.end);

      const isHiddenTag = tagText === '#urgent' || tagText === '#noturgent';

      if (!isInsideWikiLink) {
        if (isHiddenTag) {
          allMatches.push({
            type: 'hiddenTag',
            index: match.index,
            length: match[0].length,
            tagText: match[0],
          });
        } else {
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

    allMatches.sort((a, b) => a.index - b.index);

    allMatches.forEach((match) => {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: taskText.substring(lastIndex, match.index) });
      }

      parts.push(match);

      lastIndex = match.index + match.length;
    });

    if (lastIndex < taskText.length) {
      parts.push({ type: 'text', content: taskText.substring(lastIndex) });
    }

    if (parts.length === 0) {
      textElement.appendText(taskText);
      return;
    }

    parts.forEach((part) => {
      if (part.type === 'text') {
        textElement.appendText(part.content);
      } else if (part.type === 'taskLink') {
        const linkSpan = textElement.createSpan({ text: part.content, cls: 'task-link' });
        linkSpan.dataset.linkType = part.linkType;
        linkSpan.dataset.linkIds = JSON.stringify(part.linkIds);

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
      } else if (part.type === 'wikiLink') {
        const wikiLinkSpan = textElement.createSpan({ text: part.linkText, cls: 'wiki-link' });
        wikiLinkSpan.dataset.linkTarget = part.linkText;

        wikiLinkSpan.addEventListener('click', async (e) => {
          e.stopPropagation();

          const targetFile = this.app.metadataCache.getFirstLinkpathDest(part.linkText, '');

          if (targetFile) {
            const leaf = this.app.workspace.getLeaf('tab');
            await leaf.openFile(targetFile);
          } else {
            new Notice(`❌ No se encontró el archivo: ${part.linkText}`);
          }
        });
      } else if (part.type === 'hiddenTag') {
        // No mostrar nada
      } else if (part.type === 'inlineTag') {
        textElement.appendText(part.tagText);
      } else if (part.type === 'tag') {
        const tagTextWithoutHash = part.tagText.substring(1);
        const tagSpan = textElement.createSpan({ text: tagTextWithoutHash, cls: 'task-tag' });
        const color = this.getColorForTag(part.tagText.toLowerCase());
        tagSpan.style.background = color;
        tagSpan.style.color = '#ffffff';
        tagSpan.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';

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
    this.hideTaskOverlay();

    const ids = Array.isArray(taskIds) ? taskIds : [taskIds];

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

    const rect = event.target.getBoundingClientRect();
    overlay.style.left = rect.right + 10 + 'px';
    overlay.style.top = rect.top + 'px';

    setTimeout(() => {
      const overlayRect = overlay.getBoundingClientRect();
      if (overlayRect.right > window.innerWidth) {
        overlay.style.left = rect.left - overlayRect.width - 10 + 'px';
      }
      if (overlayRect.bottom > window.innerHeight) {
        overlay.style.top = window.innerHeight - overlayRect.height - 10 + 'px';
      }
    }, 0);

    this.currentOverlay = overlay;
    this.currentOverlayTrigger = event.target;

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

    const scrollHandler = () => {
      this.hideTaskOverlay();
    };

    const zoomWrapper = this.container.querySelector('.zoom-wrapper');
    const timelineMain = this.container.querySelector('.timeline-main');
    const tasksLists = this.container.querySelectorAll('.tasks-list');

    if (zoomWrapper) zoomWrapper.addEventListener('scroll', scrollHandler, { once: true });
    if (timelineMain) timelineMain.addEventListener('scroll', scrollHandler, { once: true });
    tasksLists.forEach((list) => list.addEventListener('scroll', scrollHandler, { once: true }));

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

    const orphanOverlays = document.querySelectorAll('.task-overlay');
    orphanOverlays.forEach((overlay) => overlay.remove());

    if (this.currentOverlayScrollHandlers) {
      this.currentOverlayScrollHandlers = null;
    }
  }

  async findTasksById(taskId, linkType) {
    let files = this.app.vault.getMarkdownFiles();

    if (this.config.filter) {
      files = files.filter((f) => f.path.startsWith(this.config.filter));
    }

    const searchPattern = linkType === '⛓' ? '🆔' : '⛓';
    const foundTasks = [];

    for (const file of files) {
      const content = await this.app.vault.read(file);
      const lines = content.split('\n');

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const normalizedLine = this.normalizeLine(line);

        const taskMatch = normalizedLine.match(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u);
        if (taskMatch) {
          const regex = new RegExp(`${searchPattern}\\s*([a-zA-Z0-9,]+)`);
          const idMatch = normalizedLine.match(regex);

          if (idMatch) {
            const ids = idMatch[1].split(',').map((id) => id.trim());

            if (ids.includes(taskId)) {
              let taskText = line
                .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
                .replace(/[⛓🆔]\s*[a-zA-Z0-9,]+/gu, '')
                .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '')
                .replace(/[🔺⏫🔼🔽⬇]/gu, '')
                .replace(/[🔁♻️]/gu, '')
                .replace(/#[\w-]+/gu, '')
                .replace(/\s+/g, ' ')
                .trim();

              const dateMatch = normalizedLine.match(/🛫\s*(\d{4}-\d{2}-\d{2})/u);

              const taskInfo = {
                text: taskText || 'Sin descripción',
                file: file,
                line: index,
                date: dateMatch ? dateMatch[1] : null,
                fullLine: line,
              };

              if (linkType === '⛓') {
                return [taskInfo];
              }

              foundTasks.push(taskInfo);
            }
          }
        }
      }
    }

    return foundTasks;
  }

  insertTaskByPriority(parent, task) {
    const existingTasks = Array.from(parent.querySelectorAll('.task-item'));

    if (existingTasks.length === 0) {
      this.createTaskElement(parent, task);
      return;
    }

    const getPriorityValue = (line) => {
      const cleanLine = line.replace(/[\uFE0E\uFE0F]/g, '');
      if (cleanLine.includes('🔺')) return 0;
      if (cleanLine.includes('⏫')) return 1;
      if (cleanLine.includes('🔼')) return 2;
      if (cleanLine.includes('🔽')) return 4;
      if (cleanLine.includes('⬇')) return 5;
      return 3;
    };

    const getStatusGroup = (line) => {
      const checkboxMatch = line.match(/\[([x\- \/wd])\]/);
      if (!checkboxMatch) return 0;

      const state = checkboxMatch[1];
      if (state === ' ' || state === '/') return 0;
      if (state === 'w' || state === 'd') return 1;
      return 2;
    };

    const newTaskPriority = getPriorityValue(task.fullLine);
    const newTaskGroup = getStatusGroup(task.fullLine);

    let insertIndex = -1;
    for (let i = 0; i < existingTasks.length; i++) {
      try {
        const existingTaskData = JSON.parse(existingTasks[i].dataset.taskData);
        const existingFullLine = existingTaskData.fullLine || '';
        const existingPriority = getPriorityValue(existingFullLine);
        const existingGroup = getStatusGroup(existingFullLine);

        if (newTaskGroup < existingGroup) {
          insertIndex = i;
          break;
        }

        if (newTaskGroup === existingGroup && newTaskPriority < existingPriority) {
          insertIndex = i;
          break;
        }
      } catch (e) {
        console.error('Error al parsear taskData:', e);
      }
    }

    if (insertIndex === -1) {
      this.createTaskElement(parent, task);
    } else {
      const tempContainer = document.createElement('div');
      this.createTaskElement(tempContainer, task);
      const newTaskEl = tempContainer.firstChild;

      parent.insertBefore(newTaskEl, existingTasks[insertIndex]);
    }
  }

  // ==================== SELECTORES REFACTORIZADOS ====================

  createDropdownOption(option, currentValue, onClickFn) {
    const optionEl = document.createElement('div');
    optionEl.classList.add('priority-option');
    optionEl.style.cssText = `
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

    if (option.value === currentValue) {
      optionEl.classList.add('selected');
      optionEl.style.background = 'var(--background-modifier-active-hover)';
      optionEl.style.fontWeight = '600';
    }

    const emoji = document.createElement('span');
    emoji.classList.add('priority-emoji');
    emoji.textContent = option.emoji;
    emoji.style.cssText = `
      font-size: 12px;
      width: 16px;
      text-align: center;
    `;
    optionEl.appendChild(emoji);

    const label = document.createElement('span');
    label.classList.add('priority-label');
    label.textContent = option.label;
    label.style.cssText = `
      flex: 1;
      white-space: nowrap;
    `;
    optionEl.appendChild(label);

    optionEl.addEventListener('mouseenter', () => {
      if (option.value !== currentValue) {
        optionEl.style.background = 'var(--background-modifier-hover)';
      }
    });
    optionEl.addEventListener('mouseleave', () => {
      if (option.value !== currentValue) {
        optionEl.style.background = 'var(--background-primary)';
      } else {
        optionEl.style.background = 'var(--background-modifier-active-hover)';
      }
    });

    optionEl.addEventListener('click', onClickFn);

    return optionEl;
  }

  setupSelectorEvents(button, dropdown, container, taskEl) {
    button.addEventListener('mouseenter', () => {
      button.style.background = 'var(--background-secondary)';
      button.style.color = 'var(--interactive-accent)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = 'transparent';
      button.style.color = 'var(--text-muted)';
    });

    button.addEventListener('click', (e) => {
      e.stopPropagation();

      if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        document.querySelectorAll('.priority-dropdown, .status-dropdown').forEach((otherDropdown) => {
          if (otherDropdown !== dropdown) {
            otherDropdown.style.display = 'none';
            otherDropdown.style.visibility = 'visible';
          }
        });

        const rect = button.getBoundingClientRect();

        dropdown.style.visibility = 'hidden';
        dropdown.style.display = 'block';

        const dropdownHeight = dropdown.offsetHeight;
        const leftPos = rect.left;
        const topPos = rect.top - dropdownHeight - 4;

        dropdown.style.left = leftPos + 'px';
        dropdown.style.top = topPos + 'px';

        dropdown.style.visibility = 'visible';
      } else {
        dropdown.style.display = 'none';
      }
    });

    const closeDropdown = (e) => {
      if (!container.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
        dropdown.style.visibility = 'visible';
      }
    };

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

    const parentList = taskEl.closest('.tasks-list');
    if (parentList) {
      observer.observe(parentList, { childList: true, subtree: true });
    }

    setTimeout(() => {
      document.addEventListener('click', closeDropdown);
    }, 0);
  }

  createPrioritySelector(container, task, taskEl) {
    const priorities = [
      { emoji: '🔺', label: 'Highest', value: '🔺' },
      { emoji: '⏫', label: 'High', value: '⏫' },
      { emoji: '🔼', label: 'Medium', value: '🔼' },
      { emoji: '➖', label: 'Normal', value: null },
      { emoji: '🔽', label: 'Low', value: '🔽' },
      { emoji: '⬇', label: 'Lowest', value: '⬇' },
    ];

    const getCurrentPriority = () => {
      const cleanLine = task.fullLine.replace(/[\uFE0E\uFE0F]/g, '');
      if (cleanLine.includes('🔺')) return '🔺';
      if (cleanLine.includes('⏫')) return '⏫';
      if (cleanLine.includes('🔼')) return '🔼';
      if (cleanLine.includes('🔽')) return '🔽';
      if (cleanLine.includes('⬇')) return '⬇';
      return null;
    };

    let currentPriority = getCurrentPriority();

    const priorityButton = container.createEl('button');
    priorityButton.classList.add('priority-button');
    priorityButton.title = 'Cambiar prioridad';
    priorityButton.textContent = currentPriority || '➖';

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

    const dropdown = document.createElement('div');
    dropdown.classList.add('priority-dropdown');

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

    priorities.forEach((priority) => {
      const option = this.createDropdownOption(priority, currentPriority, async (e) => {
        e.stopPropagation();

        if (priority.value === currentPriority) {
          dropdown.style.display = 'none';
          dropdown.style.visibility = 'visible';
          return;
        }

        const scrollPos = this.container.querySelector('.timeline-main')?.scrollLeft || 0;

        try {
          await this.updateTaskPriority(task.file.path, task.line, task.fullLine, priority.value);

          const file = this.app.vault.getAbstractFileByPath(task.file.path);
          const content = await this.app.vault.read(file);
          const lines = content.split('\n');
          const updatedFullLine = lines[task.line];

          task.fullLine = updatedFullLine;
          currentPriority = priority.value;

          priorityButton.textContent = currentPriority || '➖';

          dropdown.querySelectorAll('.priority-option').forEach((opt) => {
            opt.classList.remove('selected');
          });
          option.classList.add('selected');

          dropdown.style.display = 'none';
          dropdown.style.visibility = 'visible';

          const parentList = taskEl.closest('.tasks-list');
          taskEl.remove();

          if (dropdown && dropdown.parentNode) {
            dropdown.parentNode.removeChild(dropdown);
          }

          this.insertTaskByPriority(parentList, task);

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

    this.setupSelectorEvents(priorityButton, dropdown, container, taskEl);
  }

  createStatusSelector(container, task, taskEl) {
    const statuses = [
      { emoji: '✔', label: 'Normal', value: ' ' },
      { emoji: '🔄', label: 'En curso', value: '/' },
      { emoji: '⏳', label: 'En espera', value: 'w' },
      { emoji: '👤', label: 'Delegada', value: 'd' },
    ];

    const getCurrentStatus = () => {
      return task.checkboxState || ' ';
    };

    let currentStatus = getCurrentStatus();

    const statusButton = container.createEl('button');
    statusButton.classList.add('status-button');
    statusButton.title = 'Cambiar estado';

    const currentStatusObj = statuses.find((s) => s.value === currentStatus);
    statusButton.textContent = currentStatusObj ? currentStatusObj.emoji : '✔';

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

    const dropdown = document.createElement('div');
    dropdown.classList.add('status-dropdown');

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

    statuses.forEach((status) => {
      const shouldShow = currentStatus === ' ' ? status.value !== ' ' : true;

      if (!shouldShow) return;

      const option = this.createDropdownOption(status, currentStatus, async (e) => {
        e.stopPropagation();

        if (status.value === currentStatus) {
          dropdown.style.display = 'none';
          dropdown.style.visibility = 'visible';
          return;
        }

        const scrollPos = this.container.querySelector('.timeline-main')?.scrollLeft || 0;

        try {
          await this.updateTaskStatus(task.file.path, task.line, task.fullLine, status.value);

          const file = this.app.vault.getAbstractFileByPath(task.file.path);
          const content = await this.app.vault.read(file);
          const lines = content.split('\n');
          const updatedFullLine = lines[task.line];

          task.fullLine = updatedFullLine;
          task.checkboxState = status.value;
          currentStatus = status.value;

          taskEl.setAttribute('data-status', status.value);

          statusButton.textContent = status.emoji;

          dropdown.querySelectorAll('.status-option').forEach((opt) => {
            opt.classList.remove('selected');
          });
          option.classList.add('selected');

          dropdown.style.display = 'none';
          dropdown.style.visibility = 'visible';

          const taskText = taskEl.querySelector('.task-text');
          if (taskText) {
            const statusIconEl = taskText.querySelector('.task-status-icon');
            const newStatusIcon = this.getTaskStatusIcon(status.value);

            if (newStatusIcon && !statusIconEl) {
              const iconSpan = document.createElement('span');
              iconSpan.className = 'task-status-icon';
              iconSpan.textContent = newStatusIcon + ' ';
              taskText.insertBefore(iconSpan, taskText.firstChild);
            } else if (newStatusIcon && statusIconEl) {
              statusIconEl.textContent = newStatusIcon + ' ';
            } else if (!newStatusIcon && statusIconEl) {
              statusIconEl.remove();
            }
          }

          this.applyStatusFilters();

          new Notice(`✅ Estado actualizado a: ${status.label}`);
        } catch (error) {
          new Notice(`❌ Error al actualizar estado: ${error.message}`);
          console.error('Error:', error);
        }
      });

      option.classList.remove('priority-option');
      option.classList.add('status-option');

      dropdown.appendChild(option);
    });

    this.setupSelectorEvents(statusButton, dropdown, container, taskEl);
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

      let data = e.dataTransfer.getData('application/x-obsidian-task');

      if (!data) {
        data = e.dataTransfer.getData('text/plain');
      }

      if (!data) {
        new Notice('❌ No se pudo obtener los datos de la tarea');
        return;
      }

      let taskData;

      try {
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

      // Determinar la fecha objetivo
      let finalTargetDate = targetDate;
      
      // Si se arrastra a la columna "Retrasadas", usar la fecha de ayer
      const isOverdueColumn = dropZone.closest('.overdue-container');
      if (isOverdueColumn) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        finalTargetDate = this.formatDate(yesterday);
      }

      if (finalTargetDate === null) {
        await this.removeTaskDate(taskData.file, taskData.line, taskData.fullLine);
      } else {
        await this.updateTaskDate(taskData.file, taskData.line, taskData.fullLine, finalTargetDate);
      }

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
        date: finalTargetDate,
        fullLine: updatedFullLine,
        completed: false,
        cancelled: false,
      };

      this.insertTaskByPriority(dropZone, taskInfo);

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

    const visibleTasks = Array.from(tasksList.querySelectorAll('.task-item')).filter(
      (task) => task.style.display !== 'none',
    );

    countBadge.textContent = ` (${visibleTasks.length})`;
  }
}

// Inicializar
new TasksTimeline(dv.container, app, dv, config);