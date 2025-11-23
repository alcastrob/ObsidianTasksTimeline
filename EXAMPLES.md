# Ejemplos de Configuración del Kanban Board

## Ejemplo 1: Vista por Defecto

```markdown
---
daysView: "default"
sortBy: "stateAndPriority"
showSearch: true
showStatusDropdown: true
enableWikilinks: true
---

# Mi Kanban - Vista General

Este tablero muestra: Hoy | Mañana | Esta semana | Próxima semana

## Tareas

- [ ] Revisar código del PR #123 📅 2024-11-21 ⏫ #development
- [ ] Preparar presentación para cliente 📅 2024-11-22 🔼 #business
- [/] Implementar feature de búsqueda 📅 2024-11-23 🔼 #development
- [ ] Reunión de planning 📅 2024-11-25 #team
- [ ] Code review semanal 📅 2024-11-26 🔽 #development
- [x] Actualizar documentación ✅ 2024-11-20 #docs
```

---

## Ejemplo 2: Vista de Esta Semana

```markdown
---
daysView: "thisWeek"
sortBy: "priority"
showSearch: true
showStatusDropdown: true
enableWikilinks: true
---

# Sprint Actual - Semana del 18-22 Noviembre

Este tablero muestra: Lunes | Martes | Miércoles | Jueves | Viernes

## Desarrollo

- [ ] [[TASK-001]] Implementar autenticación OAuth 📅 2024-11-18 ⏫ #backend
- [ ] [[TASK-002]] Diseñar wireframes 📅 2024-11-19 🔼 #design
- [/] [[TASK-003]] Migrar base de datos 📅 2024-11-20 ⏫ #infra
- [ ] [[TASK-004]] Testing de integración 📅 2024-11-21 🔼 #qa
- [ ] [[TASK-005]] Deploy a staging 📅 2024-11-22 #devops

## Meetings

- [ ] Daily standup 📅 2024-11-18 #team
- [ ] Daily standup 📅 2024-11-19 #team
- [ ] Daily standup 📅 2024-11-20 #team
- [ ] Daily standup 📅 2024-11-21 #team
- [ ] Retro semanal 📅 2024-11-22 #team
```

---

## Ejemplo 3: Vista de Próxima Semana (NUEVO)

```markdown
---
daysView: "nextWeek"
sortBy: "stateAndPriority"
showSearch: true
showStatusDropdown: true
enableWikilinks: true
---

# Planificación Próxima Semana - 25-29 Noviembre

Este tablero muestra: Lunes | Martes | Miércoles | Jueves | Viernes
(No aparece la columna "Próxima semana")

## Features Planificadas

- [ ] [[FEATURE-101]] Implementar dashboard analytics 📅 2024-11-25 ⏫ #feature
- [ ] [[FEATURE-102]] Sistema de notificaciones 📅 2024-11-26 🔼 #feature
- [ ] [[FEATURE-103]] Exportación a PDF 📅 2024-11-27 🔼 #feature
- [ ] [[FEATURE-104]] Multi-idioma 📅 2024-11-28 🔽 #feature
- [ ] [[FEATURE-105]] Modo oscuro 📅 2024-11-29 🔽 #feature

## Testing

- [ ] Test E2E dashboard 📅 2024-11-25 🔼 #qa
- [ ] Test notificaciones 📅 2024-11-26 🔼 #qa
- [ ] Test exportación PDF 📅 2024-11-27 #qa
```

---

## Ejemplo 4: Gestión de Release Candidates

```markdown
---
daysView: "thisWeek"
sortBy: "stateAndPriority"
showSearch: true
showStatusDropdown: true
enableWikilinks: true
---

# RC3 - Seguimiento de Verticales

## Vertical: Activos

- [ ] [[RC3-ACT-001]] Feature X - Carga masiva 📅 2024-11-18 ⏫ #activos
- [/] [[RC3-ACT-002]] Optimización consultas 📅 2024-11-19 🔼 #activos
- [ ] [[RC3-ACT-003]] Exportación Excel 📅 2024-11-20 🔽 #activos

## Vertical: Pasivos

- [ ] [[RC3-PAS-001]] Nuevo flujo de pago 📅 2024-11-18 ⏫ #pasivos
- [ ] [[RC3-PAS-002]] Validación 3DS 📅 2024-11-19 🔼 #pasivos

## Vertical: Seguridad

- [ ] [[RC3-SEC-001]] Fix Auth timeout 📅 2024-11-18 ⏫ #seguridad #bloqueante
- [/] [[RC3-SEC-002]] Audit logs 📅 2024-11-19 🔼 #seguridad
- [ ] [[RC3-SEC-003]] Rate limiting 📅 2024-11-20 #seguridad

## Vertical: Customer

- [ ] [[RC3-CUS-001]] Mejora onboarding 📅 2024-11-18 🔼 #customer
- [ ] [[RC3-CUS-002]] Chat soporte 📅 2024-11-19 🔽 #customer

## Regresiones

- [ ] Regresión Web RC3 📅 2024-11-21 ⏫ #regression
- [ ] Regresión iOS RC3 📅 2024-11-21 ⏫ #regression
- [ ] Regresión Android RC3 📅 2024-11-21 ⏫ #regression

## Bugs Detectados

- [ ] [[BUG-234]] Crash en login (Web) 📅 2024-11-18 ⏫ #bug #bloqueante
- [ ] [[BUG-235]] UI glitch en iOS 📅 2024-11-22 🔽 #bug #asumible
- [x] [[BUG-236]] Timeout en API ✅ 2024-11-17 #bug #resuelto

## Build & Deploy

- [ ] Build RC3 📅 2024-11-20 ⏫ #devops
- [ ] Deploy RC3 a staging 📅 2024-11-21 ⏫ #devops
- [ ] Smoke tests post-deploy 📅 2024-11-21 🔼 #qa
```

---

## Ejemplo 5: Gestión Personal con Dependencias

```markdown
---
daysView: "default"
sortBy: "stateAndPriority"
showSearch: true
showStatusDropdown: true
enableWikilinks: true
---

# Proyecto Personal - Desarrollo App

## Tareas con Dependencias

- [ ] [[TASK-001]] Diseñar arquitectura 📅 2024-11-21 ⏫ #planning
- [ ] [[TASK-002]] Configurar proyecto (depende: TASK-001) 📅 2024-11-22 🔼 #setup
- [ ] [[TASK-003]] Implementar backend (depende: TASK-002) 📅 2024-11-23 🔼 #backend
- [ ] [[TASK-004]] Crear API endpoints (depende: TASK-003) 📅 2024-11-25 🔼 #backend
- [ ] [[TASK-005]] Diseñar UI (depende: TASK-001) 📅 2024-11-23 #frontend
- [ ] [[TASK-006]] Implementar frontend (depende: TASK-004, TASK-005) 📅 2024-11-26 🔼 #frontend
- [ ] [[TASK-007]] Testing integración (depende: TASK-006) 📅 2024-11-27 #qa

## Documentación

- [ ] [[DOC-001]] README del proyecto 📅 2024-11-21 🔽 #docs
- [ ] [[DOC-002]] API documentation 📅 2024-11-26 🔽 #docs
- [ ] [[DOC-003]] Guía de usuario 📅 2024-11-28 🔽 #docs
```

---

## Ejemplo 6: Mínima Configuración (Sin características extra)

```markdown
---
daysView: "thisWeek"
sortBy: "due"
showSearch: false
showStatusDropdown: false
enableWikilinks: false
---

# Simple Weekly Board

- [ ] Task 1 📅 2024-11-18
- [ ] Task 2 📅 2024-11-19
- [ ] Task 3 📅 2024-11-20
- [ ] Task 4 📅 2024-11-21
- [ ] Task 5 📅 2024-11-22
```

---

## Consejos de Uso

### Para Equipos Ágiles
- Usa `daysView: "thisWeek"` durante el sprint activo
- Usa `daysView: "nextWeek"` para planning de próximo sprint
- Mantén `sortBy: "stateAndPriority"` para foco en tareas críticas

### Para Gestores de Proyecto
- Usa `daysView: "default"` para visión macro
- Activa `showSearch: true` para reuniones diarias rápidas
- Usa wikilinks para conectar con documentación detallada

### Para Desarrolladores Individuales
- Usa `daysView: "thisWeek"` para foco día a día
- `sortBy: "due"` para deadlines estrictos
- Documenta dependencias entre tareas para planificación

### Para Gestión de Releases
- Crea un tablero por RC
- Usa tags para diferenciar verticales (#activos, #pasivos, etc)
- Marca bugs con #bloqueante o #asumible
- Mantén tareas de regresión separadas por plataforma
