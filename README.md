# Tasks Timeline para Obsidian

Un componente visual tipo Kanban/Timeline para gestionar tareas en Obsidian con funcionalidad drag & drop que actualiza automáticamente las fechas en tus archivos markdown.

## ✨ Características

- 📅 **Vista Timeline inteligente** con columnas organizadas por fechas
- 🎯 **Drag & Drop** para mover tareas entre días
- ✏️ **Actualización automática** de fechas en archivos .md
- ⚠️ **Detección de tareas retrasadas** con indicador visual
- 📋 **Columna para tareas sin fecha**
- 🎨 **Diseño responsive** que ocupa todo el ancho de la pantalla
- 🔄 **Compatible con el plugin Tasks** de Obsidian
- ⚡ **Un solo archivo** - sin dependencias externas

## 📊 Estructura de Columnas

El timeline organiza automáticamente tus tareas en las siguientes columnas:

1. **⚠️ Retrasadas** - Tareas con fecha anterior a hoy (fondo rojo)
2. **Hoy** - Tareas programadas para hoy
3. **Días laborables** - Martes, Miércoles, Jueves, Viernes (según el día actual)
4. **Próxima Semana** - Lunes de la siguiente semana
5. **📋 Sin Fecha** - Tareas sin fecha asignada (fondo gris)

Las columnas se adaptan dinámicamente según el día de la semana:
- **Lunes**: muestra Martes, Miércoles, Jueves, Viernes
- **Miércoles**: muestra solo Jueves y Viernes
- **Viernes**: no muestra días adicionales hasta la próxima semana

## 🚀 Instalación

### Requisitos previos

- [Obsidian](https://obsidian.md/) v0.15.0 o superior
- Plugin [Dataview](https://github.com/blacksmithgu/obsidian-dataview) instalado y activado

### Pasos de instalación

1. Descarga el archivo `tasks-timeline.js`
2. Colócalo en cualquier carpeta de tu vault (recomendado: `dv-views/`)
3. ¡Listo! Ya puedes usar el timeline

## 📝 Uso

### Uso básico

En cualquier nota de tu vault, añade un bloque de código dataviewjs:

```dataviewjs
await dv.view("tasks-timeline")
```

*Nota: Ajusta la ruta según dónde hayas colocado el archivo. Si está en la carpeta raíz, usa `await dv.view("tasks-timeline")`*

### Con opciones

```dataviewjs
await dv.view("tasks-timeline", {
    filter: "Proyectos/",       // Filtrar por carpeta
    showCompleted: false         // Ocultar tareas completadas
})
```

## 🎯 Formato de Tareas

El componente detecta tareas con el siguiente formato:

```markdown
- [ ] Tarea pendiente 📅 2024-11-05
- [x] Tarea completada 📅 2024-11-04
- [-] Tarea cancelada 📅 2024-11-03
```

### Emojis de fecha soportados

Compatible con los emojis estándar del plugin Tasks:

- 📅 Due date (fecha de vencimiento)
- 🗓️ Scheduled date (fecha programada)
- ⏳ Start date (fecha de inicio)
- 🛫 Start date alternativo

## ⚙️ Opciones de Configuración

| Parámetro | Tipo | Defecto | Descripción |
|-----------|------|---------|-------------|
| `filter` | string | `""` | Filtrar tareas por ruta de carpeta |
| `showCompleted` | boolean | `true` | Mostrar/ocultar tareas completadas |

### Ejemplos de uso

**Dashboard personal:**
```dataviewjs
await dv.view("tasks-timeline")
```

**Solo tareas de un proyecto:**
```dataviewjs
await dv.view("tasks-timeline", {
    filter: "Proyectos/Alpha/"
})
```

**Vista sin tareas completadas:**
```dataviewjs
await dv.view("tasks-timeline", {
    showCompleted: false
})
```

## 🎨 Personalización

El componente respeta los colores de tu tema de Obsidian usando variables CSS nativas:

- `--background-primary`
- `--background-secondary`
- `--text-accent`
- `--interactive-accent`

Para personalizar aún más, puedes editar el CSS embebido en el archivo `tasks-timeline.js` (líneas 15-280).

## 🔧 Funcionalidades

### Drag & Drop
- Arrastra cualquier tarea entre columnas
- La fecha se actualiza automáticamente en el archivo original
- Limpia fechas duplicadas y caracteres extraños

### Completar Tareas
- Click en el checkbox para marcar como completada
- Se actualiza en tiempo real en el archivo .md
- Estilo visual diferenciado para tareas completadas

### Navegación
- Click en el nombre del archivo para abrirlo directamente
- Botón 🔄 Refrescar para actualizar la vista

### Filtrado Inteligente
- Solo muestra tareas activas (`- [ ]`)
- Excluye completadas (`- [x]`) y canceladas (`- [-]`)
- Detecta automáticamente tareas retrasadas

## 🐛 Solución de Problemas

### Las tareas no aparecen

Verifica que:
- Las tareas tengan el formato correcto: `- [ ]` + emoji de fecha + `YYYY-MM-DD`
- La fecha sea exacta y esté en formato ISO (YYYY-MM-DD)
- El plugin Dataview esté activado

### El timeline no ocupa todo el ancho

El componente está diseñado para ocupar todo el ancho disponible. Si no lo hace:
1. Recarga Obsidian (Ctrl/Cmd + R)
2. Verifica que no haya conflictos con otros plugins de CSS
3. Abre la consola (Ctrl/Cmd + Shift + I) y busca errores

### Error al mover tareas

Si aparecen caracteres raros al mover tareas:
- Asegúrate de tener la última versión del código
- El componente limpia automáticamente todas las fechas antes de añadir la nueva

## 🤝 Contribuir

Las contribuciones son bienvenidas! Si encuentras un bug o tienes una sugerencia:

1. Abre un [Issue](../../issues)
2. Haz un Fork del proyecto
3. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
4. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. Push a la rama (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

## 📋 Roadmap

Ideas para futuras mejoras:

- [ ] Vista semanal/mensual
- [ ] Filtros por tags
- [ ] Indicadores de prioridad visuales
- [ ] Estadísticas y gráficos
- [ ] Soporte para tareas recurrentes
- [ ] Integración nativa con plugin Tasks
- [ ] Temas de color personalizables
- [ ] Exportar vista como imagen

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [Obsidian](https://obsidian.md/) - La mejor aplicación de notas
- [Dataview](https://github.com/blacksmithgu/obsidian-dataview) - Plugin esencial para consultas
- [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) - Plugin de gestión de tareas
- [Obsidian Tasks Timeline](https://github.com/702573N/Obsidian-Tasks-Timeline) - Inspiración inicial

## 📧 Contacto

Si tienes preguntas o sugerencias, abre un [Issue](../../issues) en GitHub.

---

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub!