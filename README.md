# Tasks Timeline - Gestor Kanban para Obsidian Tasks

**Versión:** 2.1  
**Compatibilidad:** Obsidian con plugins Dataview y Tasks  
**Tamaño:** 109KB (archivo único)

---

## 📋 Descripción

Tasks Timeline es una vista Kanban avanzada para gestionar tareas en Obsidian utilizando el ecosistema del plugin Tasks. Ofrece una interfaz visual moderna con drag & drop, gestión de prioridades, estados personalizables y múltiples modos de visualización para optimizar tu flujo de trabajo.

**🎯 Todo en un solo archivo:** Diseñado para máxima portabilidad y facilidad de instalación.

---

## ✨ Características Principales

### 🎯 Gestión Visual de Tareas

- **Vista Kanban Completa**: Organiza tus tareas en columnas por fechas
- **Drag & Drop**: Arrastra tareas entre días para cambiar fechas fácilmente
- **Prioridades Visuales**: Sistema de 5 niveles de prioridad con emojis (🔺⏫🔼🔽⏬)
- **Selector de Prioridad**: Dropdown interactivo para cambiar prioridades rápidamente

### 📅 Modos de Visualización

#### Modo Full (Por defecto)
```dataviewjs
await dv.view("tasks-timeline", {filter: "Proyectos/"})
```

#### Modo Días Limitados
```dataviewjs
await dv.view("tasks-timeline", {filter: "Proyectos/", daysView: "2 days"})
```

#### Modo Próxima Semana ⭐ NEW!
```dataviewjs
await dv.view("tasks-timeline", {filter: "Proyectos/", daysView: "nextWeek"})
```

### 🎨 Columnas Especiales

- **⚠️ Retrasadas**: Tareas con fecha anterior a hoy + botón "Postponer todas"
- **Hoy**: Tareas del día actual
- **Días de la semana**: Martes, Miércoles, Jueves, Viernes
- **Próxima Semana**: Vista agregada de la siguiente semana (ocultable)
- **📋 Sin Fecha**: Tareas sin fecha de inicio (ocultable)

### 🔧 Estados de Tareas

- ⚪ No comenzadas `[ ]`
- 🔄 En curso `[/]`
- ⏸️ En espera `[w]`
- 👤 Delegadas `[d]`
- ✅ Completadas `[x]`
- ✖ Canceladas `[-]`

### 🎛️ Controles y Filtros

- 🔍 **Control de Zoom**: 50% - 150% (se guarda automáticamente)
- 🔎 **Búsqueda en Tiempo Real**: Filtrado instantáneo con debounce
- 📋 **Dropdown de Columnas**: Mostrar/ocultar columnas específicas
- 🏷️ **Dropdown de Estados**: Filtrar por estado de tarea
- 🔄 **Botón Refrescar**: Actualización manual

### 🎭 Acciones por Tarea

- ✖ Cancelar tarea
- ⚫ Selector de prioridad (dropdown)
- ☐ Checkbox completar/descompletar
- 🎯 Drag & drop entre columnas

### 🔗 Características Avanzadas

- **Wikilinks**: Soporte completo para `[[enlaces]]` clickeables
- **Ordenamiento automático**: Por prioridad dentro de cada columna
- **Persistencia**: Cambios se guardan directamente en archivos markdown
- **Diseño responsive**: Ancho completo, scroll horizontal, hover effects

---

## 📝 Formato de Tareas

### Sintaxis Básica

```markdown
- [ ] Tarea simple
- [ ] Tarea con prioridad 🔺
- [ ] Tarea para hoy 🛫 2024-11-25
- [/] Tarea en curso 🛫 2024-11-25
```

### Emojis Soportados

**Fechas:**
- 🛫 Start date (usado por Tasks Timeline) ⭐
- 📅 Due date (se preserva)
- ⏳ Scheduled date (se preserva)

**Prioridades:**
- 🔺 Muy alta | ⏫ Alta | 🔼 Media | 🔽 Baja | ⏬ Muy baja

**Recurrencia:**
- 🔁 🔁 Recurrente

---

## 🚀 Instalación

### Requisitos

1. Obsidian v1.4.0+
2. Plugin Dataview v0.5.0+
3. Plugin Tasks v4.0.0+ (opcional)

### Pasos

1. **Descarga** `tasks-timeline.js`
2. **Guarda** en tu vault: `tu-vault/scripts/tasks-timeline.js`
3. **Crea** una nota con:
   ```markdown
   ```dataviewjs
   await dv.view("scripts/tasks-timeline", {filter: "Proyectos/"})
   ```
   ```

---

## ⚙️ Configuración

### Parámetros

```javascript
{
    filter: "Proyectos/",      // Carpeta a filtrar
    daysView: "nextWeek",       // Modo: "full", "2 days", "nextWeek"
    showCompleted: false        // Mostrar/ocultar completadas
}
```

### Ejemplos de Uso

**Dashboard General:**
```dataviewjs
await dv.view("scripts/tasks-timeline", {
    filter: "",
    daysView: "full"
})
```

**Planificación Semanal:**
```dataviewjs
await dv.view("scripts/tasks-timeline", {
    filter: "Trabajo/",
    daysView: "nextWeek",
    showCompleted: false
})
```

**Vista Enfocada:**
```dataviewjs
await dv.view("scripts/tasks-timeline", {
    filter: "Proyectos/App",
    daysView: "2 days"
})
```

---

## 🔄 Flujos de Trabajo

### Daily Planning (5-10 min)
1. Revisar tareas retrasadas
2. Priorizar hoy
3. Planificar mañana

### Weekly Review (15-20 min)
1. Activar modo `nextWeek`
2. Distribuir tareas entre días
3. Ajustar prioridades
4. Limpiar "Sin Fecha"

### Sprint Planning
1. Crear tareas con fechas
2. Asignar prioridades
3. Distribuir carga
4. Marcar delegadas

---

## 🛠️ Personalización

### CSS Personalizado

Crea `.obsidian/snippets/tasks-timeline-custom.css`:

```css
/* Personalizar tareas retrasadas */
.overdue-container {
    border-color: rgba(255, 0, 0, 0.7) !important;
}

/* Resaltar alta prioridad */
.task-item:has(.task-text:contains("🔺")) {
    border-left: 4px solid #ff4444 !important;
}

/* Ajustar tamaño de fuente */
.task-text {
    font-size: 14px !important;
}
```

---

## 🐛 Solución de Problemas

### La vista no se muestra
- Verifica que Dataview está habilitado
- Revisa la ruta: `"scripts/tasks-timeline"` (sin .js)
- Abre consola (`Ctrl+Shift+I`) para ver errores

### Las tareas no aparecen
- Usa emoji 🛫 (start date) no 📅 o ⏳
- Formato fecha: `YYYY-MM-DD`
- Verifica el parámetro `filter`

### Drag & drop no funciona
- Recarga (`Ctrl+R`)
- Verifica que no estás en modo edición
- Comprueba permisos del archivo

### Problemas de rendimiento
- Usa filtros específicos: `filter: "Proyectos/App"`
- Oculta completadas: `showCompleted: false`
- Limita días: `daysView: "3 days"`

---

## 📊 Rendimiento

### Optimizaciones
- CSS embebido (carga única)
- Debounce en búsqueda (300ms)
- Render condicional
- Container persistente

### Benchmarks
- Vault pequeño (<100 tareas): ~100ms
- Vault mediano (100-500): ~300ms
- Con filter específico: ~100-200ms

---

## 🔐 Privacidad

- ✅ 100% Local
- ✅ Sin tracking
- ✅ Sin analytics
- ✅ Código abierto
- ✅ Sin dependencias externas

---

## 📄 Compatibilidad

### Testeado en:
- Obsidian v1.4.0 - v1.6.0
- Dataview v0.5.0+
- Tasks v4.0.0+
- Chrome, Firefox, Safari, Edge
- Android, iOS (limitaciones en drag & drop móvil)

---

## 📜 Changelog

### v2.1 (Actual)
- ✨ Modo `nextWeek` para planificación semanal
- ✨ Oculta dropdown "Columnas" en modo nextWeek
- 🐛 Fix: objeto file para compatibilidad
- 📝 README completo

### v2.0
- 🎨 Rediseño completo
- ✨ Búsqueda en tiempo real
- ✨ Gestión de prioridades con dropdown
- ✨ Soporte wikilinks
- ✨ Filtros avanzados
- 🔧 Mejoras de rendimiento

### v1.0
- 🎉 Versión inicial
- 📅 Vista Kanban básica
- 🎯 Drag & drop
- ✅ Estados de tareas

---

## 💖 Agradecimientos

- Comunidad de Obsidian
- Plugin Tasks por la inspiración
- Plugin Dataview por hacer esto posible
- Todos los usuarios y testers

---

## 📚 Recursos

- [Obsidian Forum](https://forum.obsidian.md/)
- [r/ObsidianMD](https://reddit.com/r/ObsidianMD)
- [Tasks Plugin](https://github.com/obsidian-tasks-group/obsidian-tasks)
- [Dataview Plugin](https://github.com/blacksmithgu/obsidian-dataview)

---

## ⚖️ Licencia

Código abierto y gratuito para uso personal y comercial.

---

## 🎯 Quick Start

1. **Descarga** `tasks-timeline.js` → Guarda en `/scripts/`
2. **Crea** nota con bloque dataviewjs
3. **Añade** tareas: `- [ ] Tarea 🛫 2024-11-25`

¡Listo! 🚀

---

**Desarrollado con ❤️ para la comunidad de Obsidian**

*Noviembre 2024 - v2.1 - 109KB - Sin dependencias*
