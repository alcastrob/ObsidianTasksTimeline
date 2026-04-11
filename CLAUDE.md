# CLAUDE.md — ObsidianTasksTimeline

## Descripción del proyecto

Dos scripts de vista Dataview de un solo fichero para gestionar tareas del plugin Tasks de Obsidian:

| Fichero | Clase | Propósito |
|---------|-------|-----------|
| `tasks-timeline.js` | `TasksTimeline` | Panel Kanban organizado por fecha con arrastrar y soltar |
| `eisenhower-matrix.js` | `EisenhowerMatrix` | Matriz 2×2 urgencia/importancia con arrastrar y soltar |

Ambos scripts se ejecutan dentro de Obsidian mediante la API `dv.view()` del plugin Dataview. No hay paso de compilación, ni package.json, ni dependencias externas más allá del propio Obsidian.

## Normas de modificación del código

**IMPORTANTE — leer antes de tocar cualquier fichero:**

- **Limitar cada cambio estrictamente a lo pedido.** No refactorizar, no simplificar, no reorganizar código adyacente aunque parezca redundante o superfluo.
- **No eliminar código que aparente estar duplicado o sin usar.** Es muy probable que haya sido añadido intencionalmente para cubrir una funcionalidad específica pedida en el pasado. Antes de borrar cualquier bloque, preguntar al usuario.
- **No aprovechar el contexto de un cambio para "mejorar" otras partes del fichero.** Cada modificación debe tener el menor radio de impacto posible.
- **Modificar el fichero README.md con los cambios que te solicite y cambiar el número de versión**.
- **Crear tests unitarios para cada nueva funcionalidad** y ejecutar `npx jest` antes de hacer commit. Todos los tests (los nuevos y los existentes) deben pasar. No hacer commit de un cambio funcional sin su suite de tests correspondiente.

## Normas de despliegue en git

- **Los cambios, simepre en la rama /dev**. Todos los commits de cambios locales deben hacerse sobre la rama dev, nunca sobre main.
- **Los comentarios de los commits, en español**. Todos los cambios que se hagan en el código deben quedar reflejados en la descripción del commit a git. No incluir ninguna frase estilo "Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>" o con cualquier referenca a Claude o Anthropic.

## Arquitectura

### Puntos de entrada

```javascript
// tasks-timeline.js — invocado desde un bloque Dataview
new TasksTimeline(dv.container, app, dv, config);

// eisenhower-matrix.js
const matrix = new EisenhowerMatrix(dv, config);
await matrix.render();
```

El usuario los llama desde un bloque de código Dataview en una nota de Obsidian:
```javascript
await dv.view("scripts/tasks-timeline", { config: { filter: "Proyectos/" } });
```

### Modelo de datos de las tareas

Las tareas viven en ficheros markdown planos y siguen el formato del plugin Tasks:

```
- [x] Texto de tarea 🛫 2024-11-25 🔺 #etiqueta1 #etiqueta2
```

- Estado del checkbox: `[ ]` pendiente, `[/]` en curso, `[w]` en espera, `[d]` delegada, `[x]` hecha, `[-]` cancelada
- Emoji de prioridad: `🔺` crítica, `⏫` alta, `🔼` media, `🔽` baja, `⏬` mínima
- Campos de fecha: `🛫` inicio, `📅` vencimiento, `⏳` programada, `✅` completada
- Recurrencia: `🔁`

### Persistencia en el vault

Todos los cambios sobre tareas se escriben directamente en el vault mediante:

```javascript
modifyTaskLine(filePath, lineNumber, modifierFn)
```

Flujo: leer fichero → dividir en líneas → extraer metadatos de la línea objetivo → aplicar función modificadora → reconstruir línea → escribir fichero. **Nunca se deben perder metadatos** — `extractTaskMetadata()` + `reconstructTaskLine()` siempre hacen round-trip limpio.

### Patrón de renderizado de la UI

Ambas clases siguen el mismo pipeline:

1. Crear un `div` persistente fuera del bloque Dataview y ocultar el contenedor original
2. Inyectar CSS embebido (con etiqueta de versión para limpiar versiones antiguas al recargar)
3. Renderizar cabecera: control de zoom, buscador, botón de refresco, desplegables de filtro
4. Renderizar contenido principal: columnas por día (timeline) o cuadrícula de cuadrantes (matriz)
5. Adjuntar manejadores de arrastrar y soltar

### Estrategia CSS

El CSS está embebido como cadena de texto dentro de cada fichero JS. La etiqueta de versión (p. ej., `tasks-timeline-css-v25`) se comprueba al cargar — las versiones antiguas se eliminan del DOM. Se usan variables CSS de Obsidian para compatibilidad con temas. **Al cambiar estilos, incrementar el número de versión de la etiqueta.**

### Gestión de estado

- **Filtros/búsqueda**: almacenados en `this.filters` de la instancia de clase (solo en memoria, se reinician al recargar)
- **Zoom**: persistido en `localStorage` (`tasks-timeline-zoom`, `eisenhower-zoom`)
- **Datos de tareas**: viven en los ficheros del vault, fuente de verdad autoritativa

## Detalles de implementación clave

### Extracción y reconstrucción de metadatos

`extractTaskMetadata(line)` parsea una línea markdown en bruto en un objeto estructurado:
```javascript
{
  indent, listMarker, checkboxState,
  priority,           // cadena emoji o ""
  dates: { start, due, scheduled, done },
  recurrence,
  rawText             // texto tras eliminar todos los metadatos
}
```

`reconstructTaskLine(metadata, text)` reconstruye la línea preservando todos los campos. Cualquier cambio sobre datos de tarea debe pasar por este par — nunca hacer manipulación directa de cadenas sobre líneas de tarea.

### Comportamiento del arrastrar y soltar

**Timeline**: soltar una tarjeta sobre una columna de día llama a `updateTaskDate()` para reescribir la fecha `🛫`.

**Matriz**: soltar una tarjeta sobre un cuadrante reescribe el emoji de prioridad y/o la etiqueta `#urgent` / `#noturgent` para que coincida con la clasificación del cuadrante:
- C1 (Urgente + Importante) → emoji de prioridad alta + `#urgent`
- C2 (Importante, no urgente) → emoji de prioridad alta + `#noturgent`
- C3 (Urgente, no importante) → emoji de prioridad baja + `#urgent`
- C4 (Ni urgente ni importante) → emoji de prioridad baja + `#noturgent`

### Clasificación de tareas en la matriz

Emoji de prioridad `🔺` o `🔼` → Importante. Etiqueta `#urgent` o ausencia de `#noturgent` → Urgente. Las tareas sin clasificar van al quinto cubo "Sin clasificar".

### Zoom

`transform: scale()` aplicado al contenedor principal con `transformOrigin: 'top left'`. El wrapper exterior se redimensiona para compensar y mantener el scroll correcto.

### Búsqueda

Debounce de 300 ms. Busca en el texto de la tarea y en la lista de etiquetas (sin distinción de mayúsculas).

### Renderizado de texto enriquecido

El texto de las tareas admite `**negrita**`, `*cursiva*`, `[[wikilinks]]` y URLs. Se renderiza mediante innerHTML tras sanear — tener esto en cuenta al añadir nuevo código de renderizado.

## Opciones de configuración

Ambos scripts aceptan un objeto `input` / `config` desde el bloque Dataview:

| Clave | Usado por | Descripción |
|-------|-----------|-------------|
| `filter` | ambos | Prefijo de ruta de carpeta para filtrar ficheros de tareas |
| `daysView` | timeline | `"full"`, `"2 days"` o `"nextWeek"` |
| `showCompleted` | ambos | Incluir tareas hechas/canceladas |
| `sortBy` | matriz | `"priority"` o `"start"` |
| `groupBy` | matriz | `"none"`, `"priority"` o `"start"` |

## Convenciones de desarrollo

- **Fichero único, sin compilación**: todo debe permanecer dentro del fichero `.js` correspondiente. Sin transpiladores ni bundlers.
- **Incrementar la etiqueta de versión CSS** siempre que cambien los estilos embebidos.
- **Usar `modifyTaskLine` + `extractTaskMetadata` + `reconstructTaskLine`** para cualquier escritura en ficheros del vault — nunca parchear líneas de tarea con manipulaciones de cadena ad-hoc.
- **Sin librerías externas**: solo la API de Obsidian, la API de Dataview y APIs nativas del navegador.
- **UI en español**: todas las etiquetas de usuario, nombres de columna, tooltips de botones y mensajes de error están en español.
- **Variables CSS de Obsidian**: usar `var(--color-*)`, `var(--text-*)`, etc. para que los temas claro y oscuro funcionen sin código adicional.

## Dependencias (solo en tiempo de ejecución)

- Obsidian ≥ 1.4.0
- Plugin Dataview ≥ 0.5.0
- Plugin Tasks ≥ 4.0.0 (recomendado — necesario para el formato de tareas)

## Pruebas

No hay suite de pruebas automatizadas. Las pruebas son manuales cargando los scripts en Obsidian. Al hacer cambios:

1. Recargar Obsidian (o la nota concreta) tras editar el script.
2. Verificar que las tareas existentes hacen round-trip correctamente a través de `extractTaskMetadata` / `reconstructTaskLine` (comprobar que no se pierde ni se duplica ningún metadato).
3. Probar arrastrar y soltar en ambos scripts.
4. Probar con los temas claro y oscuro de Obsidian.

