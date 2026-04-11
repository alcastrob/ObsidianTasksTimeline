/**
 * Tests de regresión para los enlaces de dependencia entre tareas en tasks-timeline.js
 *
 * El bug que previenen: se usaba ⛓ (U+26D3, cadenas) en lugar de ⛔ (U+26D4,
 * prohibido), que es el emoji que el plugin Tasks de Obsidian usa para "bloqueado por".
 * Como la regex no coincidía nunca, el span interactivo no se creaba y el popup
 * de la tarea enlazada nunca aparecía al pasar el cursor.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Constantes de emoji ────────────────────────────────────────────────────
// Estos valores son la fuente de verdad de los tests. Si cambian los emojis
// que usa el plugin Tasks, actualizar aquí y en tasks-timeline.js.
const EMOJI_BLOQUEA = '⛔'; // U+26D4  — "bloqueado por" / "depends on"
const EMOJI_ID      = '🆔'; // U+1F194 — identificador de tarea
const EMOJI_CADENAS = '⛓'; // U+26D3  — emoji INCORRECTO (cadenas)

// ─── Código fuente ──────────────────────────────────────────────────────────
const SOURCE_PATH = path.join(__dirname, '..', 'tasks-timeline.js');
let sourceCode = '';
try {
  sourceCode = fs.readFileSync(SOURCE_PATH, 'utf-8');
} catch {
  // Si el fichero no existe el bloque de tests de contenido fallará con
  // mensajes claros; el resto de tests siguen siendo válidos.
}

// ─── 1. Presencia del fichero ────────────────────────────────────────────────
describe('Existencia del fichero fuente', () => {
  test('tasks-timeline.js existe en el repositorio', () => {
    expect(fs.existsSync(SOURCE_PATH)).toBe(true);
  });
});

// ─── 2. Contenido del fichero fuente ────────────────────────────────────────
describe('Emojis correctos en el código fuente', () => {
  test('taskLinkRegex usa ⛔, no ⛓', () => {
    // La regex debe ser /(⛔|🆔)/ o /(🆔|⛔)/
    expect(sourceCode).toMatch(new RegExp(`\\(${EMOJI_BLOQUEA}\\|${EMOJI_ID}\\)|\\(${EMOJI_ID}\\|${EMOJI_BLOQUEA}\\)`));
    expect(sourceCode).not.toMatch(new RegExp(`\\(${EMOJI_CADENAS}\\|${EMOJI_ID}\\)|\\(${EMOJI_ID}\\|${EMOJI_CADENAS}\\)`));
  });

  test('taskLinkEmojiRegex usa ⛔, no ⛓', () => {
    expect(sourceCode).toContain(`[${EMOJI_BLOQUEA}${EMOJI_ID}]`);
    expect(sourceCode).not.toContain(`[${EMOJI_CADENAS}${EMOJI_ID}]`);
  });

  test('findTasksById compara linkType con ⛔, no con ⛓', () => {
    expect(sourceCode).toContain(`linkType === '${EMOJI_BLOQUEA}'`);
    expect(sourceCode).not.toContain(`linkType === '${EMOJI_CADENAS}'`);
  });

  test('La regex de limpieza de texto usa ⛔, no ⛓', () => {
    // Línea: .replace(/[⛔🆔]\s*[a-zA-Z0-9,]+/gu, '')
    expect(sourceCode).toContain(`[${EMOJI_BLOQUEA}${EMOJI_ID}]`);
    expect(sourceCode).not.toContain(`[${EMOJI_CADENAS}${EMOJI_ID}]`);
  });

  test('El encabezado del overlay muestra ⛔, no ⛓', () => {
    expect(sourceCode).toContain(`\`${EMOJI_BLOQUEA} Tarea`);
    expect(sourceCode).not.toContain(`\`${EMOJI_CADENAS} Tarea`);
  });

  test('searchPattern en findTasksById usa ⛔ como valor de retorno', () => {
    // La lógica debe ser: linkType === '⛔' ? '🆔' : '⛔'
    expect(sourceCode).toContain(`'${EMOJI_BLOQUEA}' ? '${EMOJI_ID}' : '${EMOJI_BLOQUEA}'`);
    expect(sourceCode).not.toContain(`'${EMOJI_CADENAS}' ? '${EMOJI_ID}' : '${EMOJI_CADENAS}'`);
  });
});

// ─── 3. Lógica de la regex (independiente del código fuente) ────────────────
describe('Regex de detección de enlaces — comportamiento esperado', () => {
  // Esta es la regex correcta. Si el código fuente la tiene mal, los tests
  // de contenido anteriores ya habrán fallado.
  const taskLinkRegex = () => new RegExp(`(${EMOJI_BLOQUEA}|${EMOJI_ID})\\s*([a-zA-Z0-9,]+)`, 'g');

  test('Detecta ⛔ seguido de un ID simple', () => {
    const match = taskLinkRegex().exec(`Tarea bloqueada ${EMOJI_BLOQUEA} abc123`);
    expect(match).not.toBeNull();
    expect(match[1]).toBe(EMOJI_BLOQUEA);
    expect(match[2]).toBe('abc123');
  });

  test('Detecta 🆔 seguido de un ID simple', () => {
    const match = taskLinkRegex().exec(`Tarea con ID ${EMOJI_ID} xyz789`);
    expect(match).not.toBeNull();
    expect(match[1]).toBe(EMOJI_ID);
    expect(match[2]).toBe('xyz789');
  });

  test('NO detecta ⛓ (emoji incorrecto)', () => {
    const match = taskLinkRegex().exec(`Tarea con emoji incorrecto ${EMOJI_CADENAS} abc123`);
    expect(match).toBeNull();
  });

  test('Detecta múltiples IDs separados por coma', () => {
    const match = taskLinkRegex().exec(`${EMOJI_BLOQUEA} id1,id2,id3`);
    expect(match).not.toBeNull();
    expect(match[2]).toBe('id1,id2,id3');
  });

  test('Detecta ⛔ y 🆔 en la misma línea de texto', () => {
    const text = `Tarea A ${EMOJI_BLOQUEA} dep01 y también ${EMOJI_ID} tarea01`;
    const regex = taskLinkRegex();
    const m1 = regex.exec(text);
    const m2 = regex.exec(text);
    expect(m1).not.toBeNull();
    expect(m2).not.toBeNull();
    expect(m1[1]).toBe(EMOJI_BLOQUEA);
    expect(m2[1]).toBe(EMOJI_ID);
  });

  test('Admite espacio entre el emoji y el ID', () => {
    const withSpace    = taskLinkRegex().exec(`${EMOJI_BLOQUEA} abc`);
    const withoutSpace = taskLinkRegex().exec(`${EMOJI_BLOQUEA}abc`);
    expect(withSpace).not.toBeNull();
    expect(withoutSpace).not.toBeNull();
  });
});

// ─── 4. Lógica de búsqueda inversa (findTasksById) ──────────────────────────
describe('Dirección de búsqueda en findTasksById', () => {
  // Replica la lógica de searchPattern sin depender del fichero fuente.
  const getSearchPattern = (linkType) =>
    linkType === EMOJI_BLOQUEA ? EMOJI_ID : EMOJI_BLOQUEA;

  test('Una tarea con ⛔ idX busca 🆔 idX en el vault (quien tiene ese ID)', () => {
    expect(getSearchPattern(EMOJI_BLOQUEA)).toBe(EMOJI_ID);
  });

  test('Una tarea con 🆔 idX busca ⛔ idX en el vault (quien la bloquea)', () => {
    expect(getSearchPattern(EMOJI_ID)).toBe(EMOJI_BLOQUEA);
  });

  test('Con ⛓ (emoji incorrecto) la búsqueda devuelve ⛔, no 🆔 — confirma que ⛓ no es un tipo válido', () => {
    // ⛓ cae en el else y devuelve EMOJI_BLOQUEA, no EMOJI_ID.
    // Este test documenta que ⛓ nunca debería llegar a esta función.
    expect(getSearchPattern(EMOJI_CADENAS)).toBe(EMOJI_BLOQUEA);
    expect(getSearchPattern(EMOJI_CADENAS)).not.toBe(EMOJI_ID);
  });
});

// ─── 5. Limpieza de texto para el popup ─────────────────────────────────────
describe('Limpieza de texto de tarea para el overlay', () => {
  // Replica la cadena de .replace() de findTasksById.
  const cleanTaskText = (line) =>
    line
      .replace(/^[\s]*[-*]\s+\[[x\- \/wd]\]/u, '')
      .replace(new RegExp(`[${EMOJI_BLOQUEA}${EMOJI_ID}]\\s*[a-zA-Z0-9,]+`, 'gu'), '')
      .replace(/[📅🗓️⏳🛫🛬✅]\s*\d{4}-\d{2}-\d{2}/gu, '')
      .replace(/[🔺⏫🔼🔽⬇]/gu, '')
      .replace(/[🔁♻️]/gu, '')
      .replace(/#[\w-]+/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

  test('Elimina ⛔ y su ID del texto mostrado en el popup', () => {
    expect(cleanTaskText(`- [ ] Diseñar pantalla ${EMOJI_BLOQUEA} abc123 #trabajo`))
      .toBe('Diseñar pantalla');
  });

  test('Elimina 🆔 y su ID del texto mostrado en el popup', () => {
    expect(cleanTaskText(`- [ ] Tarea base ${EMOJI_ID} base01 🛫 2024-01-15`))
      .toBe('Tarea base');
  });

  test('⛓ NO sería limpiado — confirma que ⛔ es el emoji correcto a usar', () => {
    // Si se usara ⛓ en el código, quedaría como texto visible en el popup.
    const result = cleanTaskText(`- [ ] Tarea ${EMOJI_CADENAS} abc123`);
    expect(result).toContain(EMOJI_CADENAS);
  });

  test('Limpia fechas, prioridades y etiquetas dejando solo el texto', () => {
    const line = `- [/] Revisar propuesta 🔺 ${EMOJI_BLOQUEA} dep01 🛫 2024-03-10 #trabajo`;
    expect(cleanTaskText(line)).toBe('Revisar propuesta');
  });

  test('Devuelve texto vacío limpio cuando solo había metadatos', () => {
    const line = `- [ ] ${EMOJI_BLOQUEA} dep01 🛫 2024-01-01 🔺 #tag`;
    // No queda texto descriptivo; cleanTaskText devuelve ''
    // y findTasksById usará 'Sin descripción' como fallback.
    expect(cleanTaskText(line)).toBe('');
  });
});
