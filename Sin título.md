```dataviewjs 
await dv.view("tasks-timeline", {daysView: "2 days"})
```

Estoy haciendo un panel kanban para gestionar tareas del plugin Tasks para Obsidian. Tengo el siguiente fichero que me permite clasificar las tareas por su fecha de inicio en diferentes columnas. Se pueden mover tareas entre columnas, lo que hace que se cambien sus fechas de inicio. Además, las tareas dentro de una columna se ordenan en base a su prioridad, mostrándose primero las más prioritarias.

vamos a hacer algunos cambios más. Quiero que el botón de refrescar esté arriba a la derecha del panel kanban en vez de abajo y centrado. También quiero que tenga varios modos de visualización que se controlen desde el código de la llamada en el documento .md (actualmente se carga con await dv.view("tasks-timeline")). Quiero añadir un segundo parámetro que actúe así: valor, resultado "full", que muestre todas las columnas posibles como hasta ahora, dependiendo del día "2 days", que muestre como máximo dos columnas de día (hoy y mañana). Si hoy fuera viernes, solo mostraría una. Pero en todos los casos también se mostrarían las columnas de tareas atrasadas, las de próxima semana y la de sin fecha. Por último quiero que el tamaño máximo del kanban esté condicionado a si se están mostrando las barras laterales de obsidian, ya que parte del contendido queda actualmente por debajo de ellas.


