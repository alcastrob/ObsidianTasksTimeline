/**
 * Tests de regresión para el bug del checkbox en tasks-timeline.js
 *
 * Bug cubierto:
 *   El checkbox de completar tarea en el panel Kanban era un <input type="checkbox">
 *   dentro de un elemento con draggable="true". En Electron/Chromium esto hace que
 *   el click se interprete como inicio de drag en lugar de activar el checkbox.
 *
 * Solución aplicada (idéntica a la de eisenhower-matrix.js):
 *   - Sustituir <input type="checkbox"> por <button class="task-checkbox">
 *   - draggable="false" en el botón
 *   - pointerdown para detener propagación hacia el padre draggable
 *   - pointerup para ejecutar la acción de completar
 *   - CSS con pointer-events: all !important para contrarrestar las reglas
 *     globales de Obsidian que bloquean los eventos en elementos interactivos
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const TIMELINE_PATH = path.join(__dirname, '..', 'tasks-timeline.js');
let src = '';
try { src = fs.readFileSync(TIMELINE_PATH, 'utf-8'); } catch { /* vacío */ }

// ─── 1. Existencia del fichero ───────────────────────────────────────────────
describe('Existencia del fichero fuente', () => {
  test('tasks-timeline.js existe en el repositorio', () => {
    expect(fs.existsSync(TIMELINE_PATH)).toBe(true);
  });
});

// ─── 2. El checkbox es un <button>, no un <input> ───────────────────────────
describe('Checkbox de completar implementado como <button>', () => {
  test('El checkbox se crea como elemento button, no como input', () => {
    expect(src).toMatch(/createEl\s*\(\s*['"]button['"]\s*,\s*\{[^}]*cls\s*:\s*['"]task-checkbox['"]/s);
  });

  test('No existe createEl("input") con clase task-list-item-checkbox para el checkbox de completar', () => {
    // La clase task-list-item-checkbox era la del input antiguo
    expect(src).not.toMatch(/createEl\s*\(\s*['"]input['"]\s*,\s*\{[^}]*cls\s*:\s*['"]task-list-item-checkbox['"]/s);
  });

  test('El botón tiene type=button para no activar submit de formularios', () => {
    expect(src).toMatch(/checkbox\.setAttribute\s*\(\s*['"]type['"]\s*,\s*['"]button['"]\s*\)/);
  });
});

// ─── 3. Atributo draggable=false en el botón ─────────────────────────────────
describe('draggable=false en el botón de completar', () => {
  test('El código establece draggable=false en el checkbox', () => {
    expect(src).toMatch(/checkbox\.setAttribute\s*\(\s*['"]draggable['"]\s*,\s*['"]false['"]\s*\)/);
  });

  test('El taskEl padre sigue teniendo draggable=true', () => {
    expect(src).toMatch(/taskEl\.setAttribute\s*\(\s*['"]draggable['"]\s*,\s*['"]true['"]\s*\)/);
  });
});

// ─── 4. Eventos pointer en lugar de change/click ────────────────────────────
describe('Uso de pointerdown/pointerup para evitar conflicto con drag', () => {
  test('El handler usa pointerdown para detener propagación', () => {
    expect(src).toContain("'pointerdown'");
  });

  test('El handler usa pointerup para ejecutar la acción', () => {
    expect(src).toContain("'pointerup'");
  });

  test('No hay addEventListener("change") sobre el checkbox de completar', () => {
    // El evento change no llega dentro de un elemento draggable en Electron
    // La línea que queda en el código (si existe) no debe estar asociada al checkbox de completar
    // Buscamos el patrón específico del handler antiguo: checkbox.addEventListener('change'
    expect(src).not.toMatch(/checkbox\.addEventListener\s*\(\s*['"]change['"]/);
  });
});

// ─── 5. CSS del botón de completar ──────────────────────────────────────────
describe('CSS de .task-checkbox con pointer-events forzados', () => {
  test('El CSS de .task-checkbox incluye pointer-events con !important', () => {
    expect(src).toMatch(/\.task-checkbox\s*\{[^}]*pointer-events\s*:[^;]*!important/s);
  });

  test('El valor de pointer-events no es none ni inherit', () => {
    const match = src.match(/\.task-checkbox\s*\{([^}]+)\}/s);
    expect(match).not.toBeNull();
    const block = match[1];
    expect(block).not.toMatch(/pointer-events\s*:\s*none/);
    expect(block).not.toMatch(/pointer-events\s*:\s*inherit/);
  });

  test('El CSS de .task-checkbox incluye cursor: pointer', () => {
    expect(src).toMatch(/\.task-checkbox\s*\{[^}]*cursor\s*:\s*pointer/s);
  });

  test('El CSS de .task-checkbox incluye background: none para parecer un checkbox', () => {
    expect(src).toMatch(/\.task-checkbox\s*\{[^}]*background\s*:/s);
  });

  test('El CSS de .task-checkbox incluye border: none para parecer un checkbox', () => {
    expect(src).toMatch(/\.task-checkbox\s*\{[^}]*border\s*:/s);
  });
});

// ─── 6. Lógica de completado (toggleTaskComplete) ───────────────────────────
describe('Lógica de toggleTaskComplete en tasks-timeline.js', () => {
  // Replica la lógica del método
  const today = new Date();
  const todayStr = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');

  // Simulación simplificada (sin extractTaskMetadata/reconstructTaskLine)
  // que verifica que la fecha se añade al completar
  function simulateComplete(line) {
    line = line.replace(/\[.\]/, '[x]');
    if (!/✅\s*\d{4}-\d{2}-\d{2}/.test(line)) {
      line = line.trimEnd() + ' ✅ ' + todayStr;
    }
    return line;
  }

  test('toggleTaskComplete añade la fecha ✅ al completar', () => {
    // tasks-timeline.js usa extractTaskMetadata que añade dates.done
    // Verificamos que el método existe y contiene la lógica de fecha done
    expect(src).toMatch(/metadata\.dates\.done\s*=/);
  });

  test('El método toggleTaskComplete establece checkboxState a "x"', () => {
    expect(src).toMatch(/metadata\.checkboxState\s*=\s*['"]x['"]/);
  });

  test('El método toggleTaskComplete elimina la fecha done al descompletar', () => {
    expect(src).toMatch(/metadata\.dates\.done\s*=\s*null/);
  });

  test('La lógica de completado usa formatDate para la fecha de hoy', () => {
    expect(src).toMatch(/this\.formatDate\s*\(\s*today\s*\)/);
  });

  test('Simulación: al completar una línea se añade ✅ YYYY-MM-DD', () => {
    const result = simulateComplete('- [ ] Tarea de prueba 🔺');
    expect(result).toContain('✅ ' + todayStr);
    expect(result).toMatch(/\[x\]/);
  });
});
