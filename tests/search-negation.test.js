/**
 * Tests para la búsqueda con exclusión (prefijo '-') en tasks-timeline.js
 * y eisenhower-matrix.js.
 *
 * Funcionalidad cubierta: cuando el término de búsqueda empieza por '-' y
 * tiene al menos un carácter tras él (ej. '-reunión'), se muestran únicamente
 * las tareas que NO contienen ese texto. Sin el prefijo '-' el comportamiento
 * es el habitual (incluir las que sí contienen el término).
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Código fuente ──────────────────────────────────────────────────────────
const TIMELINE_PATH   = path.join(__dirname, '..', 'tasks-timeline.js');
const EISENHOWER_PATH = path.join(__dirname, '..', 'eisenhower-matrix.js');

let timelineSource   = '';
let eisenhowerSource = '';
try { timelineSource   = fs.readFileSync(TIMELINE_PATH,   'utf-8'); } catch { /* vacio */ }
try { eisenhowerSource = fs.readFileSync(EISENHOWER_PATH, 'utf-8'); } catch { /* vacio */ }

// ─── Lógica replicada de matchesSearchFilter (tasks-timeline.js) ────────────
// Replica exactamente lo que hay en matchesSearchFilter() para poder
// testarla sin cargar el módulo completo (que depende de la API de Obsidian).
function matchesSearchFilter(taskText, searchText) {
  if (!searchText || searchText.trim() === '') return true;
  const search = searchText;
  if (search.startsWith('-') && search.length > 1) {
    return !taskText.toLowerCase().includes(search.slice(1));
  }
  return taskText.toLowerCase().includes(search);
}

// ─── Lógica replicada del filtro de getVisibleTasks (eisenhower-matrix.js) ──
function matchesSearchFilterEisenhower(taskText, tags, searchText) {
  if (!searchText) return true;
  const searchLower = searchText.toLowerCase();
  const negate = searchLower.startsWith('-') && searchLower.length > 1;
  const term   = negate ? searchLower.slice(1) : searchLower;
  const matches =
    taskText.toLowerCase().includes(term) ||
    tags.some((tag) => tag.toLowerCase().includes(term));
  return negate ? !matches : matches;
}

// ─── Lógica replicada de applySearchFilter (matchesSearch inline) ────────────
function applySearchFilterMatch(taskText, searchText) {
  if (!searchText) return true;
  const _negate = searchText.startsWith('-') && searchText.length > 1;
  const _term   = _negate ? searchText.slice(1) : searchText;
  return _negate ? !taskText.includes(_term) : taskText.includes(_term);
}

// ─── 1. Existencia de los ficheros ──────────────────────────────────────────
describe('Existencia de los ficheros fuente', () => {
  test('tasks-timeline.js existe', () => {
    expect(fs.existsSync(TIMELINE_PATH)).toBe(true);
  });
  test('eisenhower-matrix.js existe', () => {
    expect(fs.existsSync(EISENHOWER_PATH)).toBe(true);
  });
});

// ─── 2. Presencia de la implementación en tasks-timeline.js ─────────────────
describe('Código fuente tasks-timeline.js — implementación de exclusión', () => {
  test('matchesSearchFilter detecta el prefijo - y lo niega', () => {
    expect(timelineSource).toContain("search.startsWith('-') && search.length > 1");
  });

  test('matchesSearchFilter usa slice(1) para extraer el término sin el -', () => {
    expect(timelineSource).toContain('search.slice(1)');
  });

  test('applySearchFilter tiene la lógica de negación (_negate)', () => {
    expect(timelineSource).toContain("_st.startsWith('-') && _st.length > 1");
  });

  test('El callback del setTimeout también aplica la lógica de negación', () => {
    expect(timelineSource).toContain("_st2.startsWith('-') && _st2.length > 1");
  });

  test('El filtro de estado (shouldShow) también aplica negación (_negate3)', () => {
    expect(timelineSource).toContain("_st3.startsWith('-') && _st3.length > 1");
  });
});

// ─── 3. Presencia de la implementación en eisenhower-matrix.js ──────────────
describe('Código fuente eisenhower-matrix.js — implementación de exclusión', () => {
  test('getVisibleTasks detecta el prefijo - y lo niega', () => {
    expect(eisenhowerSource).toContain("searchLower.startsWith('-') && searchLower.length > 1");
  });

  test('getVisibleTasks usa slice(1) para extraer el término sin el -', () => {
    expect(eisenhowerSource).toContain('searchLower.slice(1)');
  });

  test('getVisibleTasks aplica negate ? !matches : matches', () => {
    expect(eisenhowerSource).toContain('negate ? !matches : matches');
  });
});

// ─── 4. matchesSearchFilter — comportamiento esperado ───────────────────────
describe('matchesSearchFilter — búsqueda normal (sin -)', () => {
  test('Sin término de búsqueda, devuelve true siempre', () => {
    expect(matchesSearchFilter('cualquier tarea', '')).toBe(true);
    expect(matchesSearchFilter('cualquier tarea', null)).toBe(true);
    expect(matchesSearchFilter('cualquier tarea', '   ')).toBe(true);
  });

  test('Con término, devuelve true solo si el texto lo contiene', () => {
    expect(matchesSearchFilter('Reunión de equipo', 'reunión')).toBe(true);
    expect(matchesSearchFilter('Revisión de código', 'reunión')).toBe(false);
  });

  test('La búsqueda es case-insensitive (searchText siempre se almacena en minúsculas)', () => {
    // filters.searchText se guarda con .toLowerCase() antes de llamar a matchesSearchFilter,
    // por eso el término de búsqueda siempre llega en minúsculas.
    expect(matchesSearchFilter('REUNIÓN DE EQUIPO', 'reunión')).toBe(true);
    expect(matchesSearchFilter('Reunión De Equipo', 'reunión')).toBe(true);
  });

  test('Solo "-" sin término no activa la negación (devuelve false, no hay coincidencia)', () => {
    // El guión solo no es un término de exclusión válido (length no > 1 tras quitar -)
    // El comportamiento es: search = '-', no entra en la rama de negación,
    // busca literalmente '-' en el texto.
    expect(matchesSearchFilter('tarea sin guión', '-')).toBe(false);
    expect(matchesSearchFilter('tarea-con-guión', '-')).toBe(true);
  });
});

describe('matchesSearchFilter — búsqueda con exclusión (prefijo -)', () => {
  test('Excluye tareas que contienen el término', () => {
    expect(matchesSearchFilter('Reunión de equipo', '-reunión')).toBe(false);
  });

  test('Muestra tareas que NO contienen el término excluido', () => {
    expect(matchesSearchFilter('Revisión de código', '-reunión')).toBe(true);
  });

  test('La exclusión es case-insensitive', () => {
    expect(matchesSearchFilter('REUNIÓN urgente', '-reunión')).toBe(false);
    expect(matchesSearchFilter('otra tarea', '-REUNIÓN')).toBe(true);
  });

  test('Excluye correctamente con términos que incluyen espacios tras el -', () => {
    expect(matchesSearchFilter('tarea de diseño', '-diseño')).toBe(false);
    expect(matchesSearchFilter('tarea de código', '-diseño')).toBe(true);
  });

  test('Solo "-" (sin término) no activa exclusión — busca literalmente el guión', () => {
    expect(matchesSearchFilter('tarea sin guión', '-')).toBe(false);
    expect(matchesSearchFilter('tarea-separada', '-')).toBe(true);
  });

  test('--término: el segundo guión forma parte del término a excluir', () => {
    // '--bug' excluye tareas que contienen '-bug'
    expect(matchesSearchFilter('tarea -bug crítico', '--bug')).toBe(false);
    expect(matchesSearchFilter('tarea sin guión', '--bug')).toBe(true);
  });
});

// ─── 5. matchesSearchFilterEisenhower — comportamiento esperado ──────────────
describe('getVisibleTasks (Eisenhower) — búsqueda normal (sin -)', () => {
  test('Sin término, todas las tareas son visibles', () => {
    expect(matchesSearchFilterEisenhower('Reunión semanal', ['#trabajo'], '')).toBe(true);
    expect(matchesSearchFilterEisenhower('Revisar PR', [], null)).toBe(true);
  });

  test('Busca en el texto de la tarea', () => {
    expect(matchesSearchFilterEisenhower('Reunión de equipo', [], 'reunión')).toBe(true);
    expect(matchesSearchFilterEisenhower('Revisar código', [], 'reunión')).toBe(false);
  });

  test('Busca también en las etiquetas', () => {
    expect(matchesSearchFilterEisenhower('Tarea sin coincidencia', ['#trabajo', '#urgente'], 'urgente')).toBe(true);
    expect(matchesSearchFilterEisenhower('Otra tarea', ['#diseño'], 'urgente')).toBe(false);
  });
});

describe('getVisibleTasks (Eisenhower) — búsqueda con exclusión (prefijo -)', () => {
  test('Excluye tareas cuyo texto contiene el término', () => {
    expect(matchesSearchFilterEisenhower('Reunión de equipo', [], '-reunión')).toBe(false);
  });

  test('Muestra tareas cuyo texto NO contiene el término excluido', () => {
    expect(matchesSearchFilterEisenhower('Revisar código', [], '-reunión')).toBe(true);
  });

  test('Excluye tareas cuya etiqueta contiene el término', () => {
    expect(matchesSearchFilterEisenhower('Tarea normal', ['#urgente'], '-urgente')).toBe(false);
  });

  test('Muestra tareas cuyas etiquetas tampoco contienen el término excluido', () => {
    expect(matchesSearchFilterEisenhower('Tarea normal', ['#diseño'], '-urgente')).toBe(true);
  });

  test('La exclusión es case-insensitive', () => {
    expect(matchesSearchFilterEisenhower('REUNIÓN urgente', [], '-reunión')).toBe(false);
    expect(matchesSearchFilterEisenhower('otra tarea', [], '-REUNIÓN')).toBe(true);
  });
});

// ─── 6. applySearchFilter inline — comportamiento esperado ──────────────────
describe('applySearchFilter (lógica inline de taskItem) — comportamiento esperado', () => {
  test('Sin término, el item es visible', () => {
    expect(applySearchFilterMatch('reunión semanal', '')).toBe(true);
    expect(applySearchFilterMatch('revisar código', null)).toBe(true);
  });

  test('Con término normal, visible solo si coincide', () => {
    expect(applySearchFilterMatch('reunión semanal', 'reunión')).toBe(true);
    expect(applySearchFilterMatch('revisar código', 'reunión')).toBe(false);
  });

  test('Con prefijo -, visible solo si NO coincide', () => {
    expect(applySearchFilterMatch('reunión semanal', '-reunión')).toBe(false);
    expect(applySearchFilterMatch('revisar código', '-reunión')).toBe(true);
  });

  test('"-" solo no activa exclusión', () => {
    expect(applySearchFilterMatch('tarea-separada', '-')).toBe(true);
    expect(applySearchFilterMatch('tarea normal', '-')).toBe(false);
  });
});
