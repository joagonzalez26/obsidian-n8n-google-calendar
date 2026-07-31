# Problemas frecuentes

## n8n dice que no encuentra el archivo

- Usá una ruta absoluta, no una ruta relativa.
- Recordá que la ruta pertenece a la máquina donde corre n8n.
- Si usás Docker, utilizá la ruta interna del volumen, por ejemplo `/files/obsidian/Tareas/Lista de tareas.md`.
- Revisá que el nombre, las mayúsculas, los espacios y la extensión `.md` coincidan.

## Aparece `Access denied` o `File access not allowed`

En n8n 2.x, el acceso al sistema de archivos está restringido por defecto. Iniciá n8n permitiendo el directorio del vault con `N8N_RESTRICT_FILE_ACCESS_TO`.

Si usás Docker, montá el vault y permití la ruta interna:

```text
N8N_RESTRICT_FILE_ACCESS_TO=/files/obsidian
```

## Uso n8n Cloud y no encuentra mi vault

Es normal: n8n Cloud se ejecuta en otro servidor y no puede leer un archivo guardado solamente en tu computadora. Para mantener este flujo tal como está, usá n8n local o Docker. Otra opción es adaptar la entrada a Google Drive u otro almacenamiento accesible por n8n Cloud.

## El nodo Code devuelve cero elementos

Comprobá que la línea tenga exactamente:

```md
- [ ] Nombre de la tarea 📅 2026-08-01
```

El código ignora tareas completadas, fechas inexistentes, líneas sin `📅` y fechas que no usen `AAAA-MM-DD`.

## El horario del Schedule Trigger es incorrecto

Abrí el workflow, entrá a **Settings** y revisá **Timezone**. Si el workflow ya estaba publicado, guardá el cambio, despublicalo y volvé a publicarlo para aplicar el nuevo horario.

## Google Calendar devuelve `401`, `403` o pide autorización

Volvé a conectar la credencial de Google Calendar en n8n y comprobá que elegiste una cuenta con permiso para escribir en ese calendario. Nunca pegues tokens, client secrets ni contraseñas en el nodo Code.

## Se creó un evento duplicado

Revisá que **Remove Duplicates** use:

- `Remove Items Processed in Previous Executions`
- `Value Is New`
- `dedupeKey`

También puede ocurrir si cambiaste el título o la fecha, si borraste el historial de deduplicación o si usaste otro nodo Remove Duplicates.

## Calendar falló después de pasar Remove Duplicates

Primero comprobá si el evento llegó a crearse. Después corregí la credencial o el dato que falló y reintentá desde la ejecución fallida. No borres el historial de deduplicación sin revisar el calendario, porque podrías crear eventos repetidos.

## Quiero volver a crear todas las tareas

El nodo **Remove Duplicates** permite limpiar su historial, pero hacelo únicamente después de revisar o vaciar los eventos de prueba. En la próxima ejecución, todas las tareas válidas volverán a considerarse nuevas.

## Completé la tarea y el evento sigue en Calendar

Es el comportamiento esperado. Esta versión crea eventos, pero no actualiza ni elimina eventos ya existentes.
