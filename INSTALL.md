# Guía de Instalación y Configuración Rápida

## 📦 Instalación

### Requisitos Previos
1. **Obsidian** instalado (versión 0.15.0 o superior)
2. **Plugin Tasks** instalado y activado ([Tasks Plugin](https://github.com/obsidian-tasks-group/obsidian-tasks))

### Pasos de Instalación

#### Opción 1: Instalación Manual

1. **Crea la carpeta del plugin**
   ```
   /tu-vault/.obsidian/plugins/kanban-board/
   ```

2. **Copia los archivos**
   - `main.js` → Código principal del plugin
   - `styles.css` → Estilos del kanban
   - `manifest.json` → Metadata del plugin (necesitas crear este archivo)

3. **Crea `manifest.json`**
   ```json
   {
     "id": "kanban-board",
     "name": "Kanban Board with Tasks",
     "version": "1.0.0",
     "minAppVersion": "0.15.0",
     "description": "Kanban board integration with Tasks plugin featuring temporal views",
     "author": "Tu Nombre",
     "authorUrl": "https://github.com/tu-usuario",
     "isDesktopOnly": false
   }
   ```

4. **Activa el plugin**
   - Ve a `Configuración` → `Plugins de comunidad`
   - Busca "Kanban Board with Tasks"
   - Activa el plugin

#### Opción 2: Desarrollo Local

1. **Clona el repositorio en la carpeta de plugins**
   ```bash
   cd /tu-vault/.obsidian/plugins/
   git clone https://github.com/tu-usuario/kanban-board.git
   ```

2. **Instala dependencias**
   ```bash
   cd kanban-board
   npm install
   ```

3. **Compila el plugin**
   ```bash
   npm run build
   ```

4. **Recarga Obsidian** (Ctrl+R / Cmd+R)

## 🚀 Inicio Rápido

### 1. Crea tu Primer Kanban

Crea un nuevo archivo en Obsidian, por ejemplo `kanban-semanal.md`:

```markdown
---
daysView: "thisWeek"
sortBy: "stateAndPriority"
showSearch: true
showStatusDropdown: true
enableWikilinks: true
---

# Mi Primer Kanban

## Tareas de Ejemplo

- [ ] Tarea importante 📅 2024-11-25 ⏫
- [ ] Tarea normal 📅 2024-11-26 🔼
- [/] Tarea en progreso 📅 2024-11-27
- [x] Tarea completada ✅ 2024-11-24
```

### 2. Activa la Vista de Kanban

- Abre el archivo que acabas de crear
- El plugin detectará automáticamente el frontmatter
- El tablero se renderizará con las columnas configuradas

### 3. Prueba las Diferentes Vistas

#### Vista por Defecto
```yaml
---
daysView: "default"
---
```
Muestra: **Hoy | Mañana | Esta semana | Próxima semana**

#### Vista de Esta Semana
```yaml
---
daysView: "thisWeek"
---
```
Muestra: **Lunes | Martes | Miércoles | Jueves | Viernes**

#### Vista de Próxima Semana (NUEVA)
```yaml
---
daysView: "nextWeek"
---
```
Muestra: **Lunes | Martes | Miércoles | Jueves | Viernes** (de la próxima semana)

## ⚙️ Configuración Detallada

### Parámetros de Configuración

| Parámetro | Tipo | Valores | Descripción |
|-----------|------|---------|-------------|
| `daysView` | string | `"default"`, `"thisWeek"`, `"nextWeek"` | Define la vista temporal |
| `sortBy` | string | `"stateAndPriority"`, `"priority"`, `"due"`, `"created"` | Criterio de ordenación |
| `showSearch` | boolean | `true`, `false` | Muestra barra de búsqueda |
| `showStatusDropdown` | boolean | `true`, `false` | Muestra selector de estado |
| `enableWikilinks` | boolean | `true`, `false` | Convierte wikilinks en enlaces |

### Formato de Tareas

El plugin utiliza el formato estándar del Tasks plugin:

```markdown
- [ ] Descripción de la tarea 📅 2024-11-25 ⏫ #tag
  │    │                        │            │    └─ Tag opcional
  │    │                        │            └────── Prioridad (emoji)
  │    │                        └─────────────────── Fecha de vencimiento
  │    └──────────────────────────────────────────── Texto de la tarea
  └───────────────────────────────────────────────── Estado de la tarea
```

#### Estados de Tarea
- `[ ]` → Todo (pendiente)
- `[x]` → Done (completada)
- `[/]` → In Progress (en progreso)
- `[-]` → Cancelled (cancelada)

#### Prioridades (Emojis)
- `⏫` → Highest (más alta)
- `🔼` → High (alta)
- (ninguno) → Medium (media, por defecto)
- `🔽` → Low (baja)
- `⏬` → Lowest (más baja)

#### Fechas
- `📅 YYYY-MM-DD` → Fecha de vencimiento
- `➕ YYYY-MM-DD` → Fecha de creación
- `✅ YYYY-MM-DD` → Fecha de completado

## 🎯 Casos de Uso Comunes

### Caso 1: Equipo Scrum - Sprint Semanal

```markdown
---
daysView: "thisWeek"
sortBy: "stateAndPriority"
showSearch: true
---

# Sprint 42 - Semana del 25-29 Nov

## User Stories

- [ ] [[US-101]] Login con OAuth 📅 2024-11-25 ⏫ #backend
- [ ] [[US-102]] Dashboard principal 📅 2024-11-26 🔼 #frontend
- [/] [[US-103]] API de usuarios 📅 2024-11-27 🔼 #backend
```

### Caso 2: Planning de Próxima Semana

```markdown
---
daysView: "nextWeek"
sortBy: "priority"
showSearch: true
---

# Planning Próxima Semana

- [ ] Diseñar nueva feature 📅 2024-12-02 ⏫
- [ ] Code review pendiente 📅 2024-12-03 🔼
- [ ] Deploy a producción 📅 2024-12-05 ⏫
```

### Caso 3: Gestión de Release

```markdown
---
daysView: "default"
sortBy: "stateAndPriority"
showSearch: true
enableWikilinks: true
---

# RC3 - Seguimiento

## Desarrollos
- [ ] [[RC3-Feature-A]] 📅 2024-11-25 ⏫ #activos
- [ ] [[RC3-Feature-B]] 📅 2024-11-26 🔼 #pasivos

## Regresiones
- [ ] Regresión Web 📅 2024-11-27 ⏫
- [ ] Regresión iOS 📅 2024-11-27 ⏫
- [ ] Regresión Android 📅 2024-11-27 ⏫

## Bugs
- [ ] [[BUG-234]] Crash login 📅 2024-11-25 ⏫ #bloqueante
```

## 🔧 Solución de Problemas

### El tablero no se muestra

1. **Verifica que el plugin Tasks esté instalado y activado**
   - Ve a `Configuración` → `Plugins de comunidad`
   - Busca "Tasks" y asegúrate de que esté activado

2. **Revisa el frontmatter**
   - Asegúrate de que esté entre `---` al inicio del archivo
   - Verifica que no haya errores de sintaxis YAML

3. **Recarga Obsidian**
   - Usa `Ctrl+R` (Windows/Linux) o `Cmd+R` (Mac)

### Las tareas no aparecen en las columnas correctas

1. **Verifica el formato de fechas**
   - Debe ser `📅 YYYY-MM-DD`
   - Ejemplo: `📅 2024-11-25`

2. **Comprueba la fecha del sistema**
   - El plugin usa la fecha actual para calcular columnas

3. **Revisa los espacios**
   - Debe haber un espacio después del emoji: `📅 2024-11-25` ✅
   - Incorrecto: `📅2024-11-25` ❌

### La búsqueda no funciona

1. Verifica que `showSearch: true` esté en el frontmatter
2. Recarga la vista del archivo
3. Intenta con palabras completas (la búsqueda es sensible a palabras parciales)

### Los wikilinks no son clicables

1. Verifica que `enableWikilinks: true` esté configurado
2. Asegúrate de usar el formato correcto: `[[nombre-de-nota]]`
3. La nota enlazada debe existir en tu vault

## 📊 Mejores Prácticas

### 1. Nomenclatura Consistente

Usa prefijos para diferentes tipos de elementos:
```markdown
- [ ] [[TASK-001]] Implementar feature
- [ ] [[BUG-123]] Fix crash
- [ ] [[DOC-045]] Actualizar README
```

### 2. Usa Tags para Filtrar

```markdown
- [ ] Tarea backend 📅 2024-11-25 ⏫ #backend
- [ ] Tarea frontend 📅 2024-11-26 🔼 #frontend
- [ ] Bug crítico 📅 2024-11-25 ⏫ #bug #bloqueante
```

### 3. Documenta Dependencias

```markdown
- [ ] [[TASK-001]] Crear API
- [ ] [[TASK-002]] Crear UI (depende: TASK-001)
- [ ] [[TASK-003]] Testing (depende: TASK-001, TASK-002)
```

### 4. Revisa y Actualiza Diariamente

- Comienza el día revisando tu kanban
- Mueve tareas completadas a `[x]`
- Actualiza prioridades según necesidad
- Usa la búsqueda para encontrar tareas específicas rápidamente

### 5. Combina con Dataview (Avanzado)

Puedes usar queries de Dataview en el mismo archivo:

```markdown
## Resumen de Tareas

```dataview
TABLE WITHOUT ID
  status as "Estado",
  length(rows) as "Cantidad"
FROM #proyecto
WHERE file.name = this.file.name
GROUP BY status
```

## 🆘 Soporte y Recursos

- **Documentación completa**: Ver `README.md`
- **Ejemplos de uso**: Ver `EXAMPLES.md`
- **Reportar bugs**: [GitHub Issues](https://github.com/tu-usuario/kanban-board/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/kanban-board/discussions)
- **Comunidad Obsidian**: [Forum](https://forum.obsidian.md)

## 📝 Checklist de Primera Vez

- [ ] Tasks plugin instalado y activado
- [ ] Kanban Board plugin instalado y activado
- [ ] Archivo de prueba creado con frontmatter
- [ ] Al menos 3 tareas de ejemplo con fechas
- [ ] Vista de kanban renderizada correctamente
- [ ] Búsqueda funciona
- [ ] Cambio de estado funciona
- [ ] Wikilinks son clicables

¡Felicitaciones! Ahora estás listo para usar el Kanban Board con Tasks 🎉
