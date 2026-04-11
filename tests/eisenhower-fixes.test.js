/**
 * Tests de regresión para los bugs corregidos en eisenhower-matrix.js
 *
 * Bugs cubiertos:
 *
 * 1. EMOJI INCORRECTO EN ENLACES (⛓ vs ⛔)
 *    El panel Eisenhower usaba ⛓ (U+26D3, cadenas) en lugar de ⛔ (U+26D4,
 *    prohibido), que es el emoji que el plugin Tasks usa para "bloqueado por".
 *    La regex no coincidía nunca, el span de tarea enlazada no se creaba y el
 *    popup de detalles nunca aparecía al pasar el cursor.
 *
 * 2. CHECKBOX SIN FECHA DE COMPLETADO (✅)
 *    Al marcar una tarea como completada solo se cambiaba el estado [x] pero
 *    no se añadía la fecha ✅ YYYY-MM-DD al final de la línea.
 *
 * 3. POINTER-EVENTS BLOQUEADOS EN EL BOTÓN DE COMPLETAR
 *    Obsidian aplica pointer-events: none a inputs/botones dentro de la vista
 *    de lectura salvo que se fuerce pointer-events explícitamente.
 *    El CSS del botón .task-checkbox debe incluir pointer-events: all !important.
 *
 * 4. DRAG ACTIVADO AL PULSAR EL BOTÓN DE COMPLETAR
 *    El elemento padre .task-item tiene draggable="true". El botón de completar
 *    debe tener draggable="false" para que Chromium/Electron no inicie un drag
 *    al hacer clic sobre él.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const EISENHOWER_PATH = path.join(__dirname, '..', 'eisenhower-matrix.js');
let src = '';
try { src = fs.readFileSync(EISENHOWER_PATH, 'utf-8'); } catch { /* vacío */ }

// ─── Constantes de emoji ─────────────────────────────────────────────────────
const EMOJI_BLOQUEA = '⛔'; // U+26D4 — correcto (plugin Tasks)
const EMOJI_ID      = '🆔'; // U+1F194
const EMOJI_CADENAS = '⛓'; // U+26D3 — incorrecto

// ─── 1. Existencia del fichero ───────────────────────────────────────────────
describe('Existencia del fichero fuente', () => {
  test('eisenhower-matrix.js existe en el repositorio', () => {
    expect(fs.existsSync(EISENHOWER_PATH)).toBe(true);
  });
});

// ─── 2. Emojis correctos para enlaces entre tareas ──────────────────────────
describe('Bug 1 — Emojis correctos en enlaces de tareas (⛔ no ⛓)', () => {
  test('taskLinkRegex usa ⛔, no ⛓', () => {
    expect(src).toMatch(
      new RegExp(`\\(${EMOJI_BLOQUEA}\\|${EMOJI_ID}\\)|\\(${EMOJI_ID}\\|${EMOJI_BLOQUEA}\\)`)
    );
    expect(src).not.toMatch(
      new RegExp(`\\(${EMOJI_CADENAS}\\|${EMOJI_ID}\\)|\\(${EMOJI_ID}\\|${EMOJI_CADENAS}\\)`)
    );
  });

  test('findTasksById compara linkType con ⛔, no con ⛓', () => {
    expect(src).toContain(`linkType === '${EMOJI_BLOQUEA}'`);
    expect(src).not.toContain(`linkType === '${EMOJI_CADENAS}'`);
  });

  test('searchPattern usa ⛔ como valor de retorno alternativo', () => {
    expect(src).toContain(`'${EMOJI_BLOQUEA}' ? '${EMOJI_ID}' : '${EMOJI_BLOQUEA}'`);
    expect(src).not.toContain(`'${EMOJI_CADENAS}' ? '${EMOJI_ID}' : '${EMOJI_CADENAS}'`);
  });

  test('El encabezado del overlay menciona ⛔, no ⛓', () => {
    expect(src).toContain(`${EMOJI_BLOQUEA} Tarea`);
    expect(src).not.toContain(`${EMOJI_CADENAS} Tarea`);
  });
});

// ─── 3. Regex de detección de enlaces (comportamiento) ──────────────────────
describe('Bug 1 — Regex de enlaces: comportamiento esperado', () => {
  const regex = () => new RegExp(`(${EMOJI_BLOQUEA}|${EMOJI_ID})\\s*([a-zA-Z0-9,]+)`, 'g');

  test('Detecta ⛔ seguido de un ID simple', () => {
    const m = regex().exec(`Tarea bloqueada ${EMOJI_BLOQUEA} abc123`);
    expect(m).not.toBeNull();
    expect(m[1]).toBe(EMOJI_BLOQUEA);
    expect(m[2]).toBe('abc123');
  });

  test('Detecta 🆔 seguido de un ID simple', () => {
    const m = regex().exec(`Tarea con ID ${EMOJI_ID} xyz789`);
    expect(m).not.toBeNull();
    expect(m[1]).toBe(EMOJI_ID);
    expect(m[2]).toBe('xyz789');
  });

  test('NO detecta ⛓ (emoji incorrecto)', () => {
    const m = regex().exec(`Tarea con emoji incorrecto ${EMOJI_CADENAS} abc123`);
    expect(m).toBeNull();
  });

  test('Detecta múltiples IDs separados por coma', () => {
    const m = regex().exec(`${EMOJI_BLOQUEA} id1,id2,id3`);
    expect(m).not.toBeNull();
    expect(m[2]).toBe('id1,id2,id3');
  });
});

// ─── 4. Fecha ✅ al completar tarea ──────────────────────────────────────────
describe('Bug 2 — Fecha de completado (✅) al marcar tarea como hecha', () => {
  // Replica la lógica de toggleTaskComplete de eisenhower-matrix.js
  const today = new Date();
  const todayStr = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');

  function applyComplete(taskLine) {
    let line = taskLine.replace(/^\s*-\s*\[.\]/, '- [x]');
    if (!/✅\s*\d{4}-\d{2}-\d{2}/.test(line)) {
      line = line.trimEnd() + ' ✅ ' + todayStr;
    }
    return line;
  }

  function applyUncomplete(taskLine) {
    let line = taskLine.replace(/^\s*-\s*\[x\]/, '- [ ]');
    line = line.replace(/\s*✅\s*\d{4}-\d{2}-\d{2}/, '');
    return line;
  }

  test('Al completar una tarea se añade ✅ con la fecha de hoy', () => {
    const result = applyComplete('- [ ] Revisar informe 🔺');
    expect(result).toContain('✅ ' + todayStr);
    expect(result).toMatch(/^- \[x\]/);
  });

  test('Si ya existe ✅, no se añade una segunda fecha', () => {
    const result = applyComplete('- [ ] Tarea ya completada ✅ 2024-01-15');
    const count = (result.match(/✅/g) || []).length;
    expect(count).toBe(1);
  });

  test('Al descompletar se elimina la fecha ✅', () => {
    const result = applyUncomplete('- [x] Revisar informe ✅ 2024-03-10');
    expect(result).not.toContain('✅');
    expect(result).toMatch(/^- \[ \]/);
  });

  test('Al descompletar no se pierde el texto de la tarea', () => {
    const result = applyUncomplete('- [x] Revisar informe 🔺 ✅ 2024-03-10');
    expect(result).toContain('Revisar informe');
  });

  test('El estado cambia de [ ] a [x] al completar', () => {
    const result = applyComplete('- [ ] Tarea pendiente');
    expect(result).toMatch(/^- \[x\]/);
  });

  test('El estado cambia de [/] a [x] al completar (tarea en progreso)', () => {
    const result = applyComplete('- [/] Tarea en progreso');
    expect(result).toMatch(/^- \[x\]/);
  });

  test('La fecha de completado tiene formato YYYY-MM-DD', () => {
    const result = applyComplete('- [ ] Tarea');
    expect(result).toMatch(/✅ \d{4}-\d{2}-\d{2}/);
  });
});

// ─── 5. CSS del botón de completar ──────────────────────────────────────────
describe('Bug 3 — pointer-events en el botón de completar (.task-checkbox)', () => {
  test('El CSS de .task-checkbox incluye pointer-events con !important', () => {
    // Sin !important, Obsidian sobreescribe con pointer-events: none
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
});

// ─── 6. Atributo draggable en el botón de completar ─────────────────────────
describe('Bug 4 — draggable=false en el botón de completar', () => {
  test('El código establece draggable=false en el checkbox de completar', () => {
    // Debe existir setAttribute('draggable', 'false') sobre el elemento checkbox
    expect(src).toMatch(/checkbox\.setAttribute\s*\(\s*['"]draggable['"]\s*,\s*['"]false['"]\s*\)/);
  });

  test('El elemento padre .task-item sigue teniendo draggable=true', () => {
    expect(src).toMatch(/taskEl\.setAttribute\s*\(\s*['"]draggable['"]\s*,\s*['"]true['"]\s*\)/);
  });
});

// ─── 7. El botón de completar es un <button>, no un <input> ─────────────────
describe('Implementación del checkbox como <button> para evitar conflicto con drag', () => {
  test('El checkbox se crea como elemento button, no como input', () => {
    // createEl('button', ...) no createEl('input', ...)
    expect(src).toMatch(/createEl\s*\(\s*['"]button['"]\s*,\s*\{[^}]*cls\s*:\s*['"]task-checkbox['"]/s);
  });

  test('El botón tiene type=button para no activar submit de formularios', () => {
    expect(src).toMatch(/checkbox\.setAttribute\s*\(\s*['"]type['"]\s*,\s*['"]button['"]\s*\)/);
  });

  test('El handler de completar usa pointerdown para detener propagación', () => {
    expect(src).toContain("'pointerdown'");
  });

  test('El handler de completar usa pointerup para ejecutar la acción', () => {
    expect(src).toContain("'pointerup'");
  });
});
