# Cómo crear la automatización

La idea es construir este flujo:

`Obsidian → Schedule Trigger → Leer archivo → Procesar tareas → Evitar duplicados → Google Calendar`

No hace falta importar ningún workflow. Lo vas a armar con cinco nodos y vas a entender para qué sirve cada uno.

## 0. Elegí dónde ejecutar n8n

| Tu situación | ¿Funciona con un archivo local de Obsidian? | Qué hacer |
| --- | --- | --- |
| n8n local con npm | Sí | Usá la ruta absoluta del archivo. |
| n8n en Docker | Sí | Montá el vault como volumen y usá la ruta interna del contenedor. |
| n8n Cloud | No directamente | El servidor de n8n Cloud no puede ver el disco de tu computadora. Usá n8n local o adaptá el flujo para leer el archivo desde un servicio en la nube. |

### Opción rápida: n8n local

Con Node.js instalado, podés iniciar n8n sin instalarlo globalmente:

```bash
N8N_RESTRICT_FILE_ACCESS_TO="/RUTA/ABSOLUTA/A/TU/VAULT" \
GENERIC_TIMEZONE="America/Argentina/Cordoba" \
npx n8n
```

Después abrí [http://localhost:5678](http://localhost:5678).

`N8N_RESTRICT_FILE_ACCESS_TO` le permite a n8n leer ese directorio. En n8n 2.x, el acceso a archivos está restringido por defecto.

### Si usás Docker

Además de guardar los datos de n8n, montá tu vault en modo solo lectura:

```bash
docker volume create n8n_data

docker run --rm -it \
  --name n8n \
  -p 5678:5678 \
  -e TZ="America/Argentina/Cordoba" \
  -e GENERIC_TIMEZONE="America/Argentina/Cordoba" \
  -e N8N_RESTRICT_FILE_ACCESS_TO="/files/obsidian" \
  -v n8n_data:/home/node/.n8n \
  -v "/RUTA/ABSOLUTA/A/TU/VAULT:/files/obsidian:ro" \
  docker.n8n.io/n8nio/n8n
```

Dentro del nodo de lectura usarías una ruta como:

```text
/files/obsidian/Tareas/Lista de tareas.md
```

La ruta de tu Mac o PC no existe dentro del contenedor; por eso se monta como `/files/obsidian`.

## 1. Prepará el archivo de Obsidian

Podés copiar [el archivo de ejemplo](../examples/Lista%20de%20tareas.md) a tu vault. El formato mínimo es:

```md
- [ ] Nombre de la tarea 📅 2026-08-01
```

Reglas simples:

- `- [ ]` significa que la tarea está pendiente.
- `📅` separa el texto de la fecha.
- La fecha debe usar `AAAA-MM-DD`.
- Las tareas completadas (`- [x]`) o sin fecha se ignoran.

## 2. Creá el nodo Schedule Trigger

1. Creá un workflow nuevo.
2. Agregá **Schedule Trigger**.
3. Para probar, elegí una frecuencia corta, por ejemplo cada 5 minutos.
4. En **Workflow Settings**, seleccioná tu zona horaria.

Durante la configuración ejecutá el flujo manualmente. Publicalo recién cuando la prueba completa funcione.

## 3. Leé el archivo

Agregá **Read/Write Files from Disk**:

- **Operation:** `Read File(s) From Disk`
- **File(s) Selector:** ruta absoluta de `Lista de tareas.md`
- **Put Output File in Field:** `data`

Ejemplos:

```text
/Users/tuusuario/Documentos/Obsidian/Tareas/Lista de tareas.md
```

```text
/files/obsidian/Tareas/Lista de tareas.md
```

Ejecutá este nodo. Si funciona, la salida debe contener un archivo binario en el campo `data`.

## 4. Procesá las tareas con JavaScript

Agregá un nodo **Code**:

- **Language:** `JavaScript`
- **Mode:** `Run Once for All Items`

Copiá el contenido completo de [examples/code-node.js](../examples/code-node.js) y pegalo en el nodo.

El código:

- lee el Markdown;
- toma solamente tareas pendientes con fecha;
- valida las fechas;
- evita líneas repetidas dentro del mismo archivo;
- genera `title`, `start`, `end` y `dedupeKey`.

Probalo. La salida debería verse así:

```json
{
  "title": "Estudiar n8n",
  "start": "2026-08-01",
  "end": "2026-08-02",
  "dedupeKey": "2026-08-01|estudiar n8n",
  "source": "obsidian"
}
```

El día de finalización es el siguiente porque Google Calendar trata el final de un evento de día completo como un límite exclusivo.

## 5. Evitá eventos duplicados

Agregá **Remove Duplicates**:

- **Operation:** `Remove Items Processed in Previous Executions`
- **Keep Items Where:** `Value Is New`
- **Value to Dedupe On:** `dedupeKey`
- **Scope:** `Node`

Así, una tarea con el mismo título y la misma fecha no vuelve a pasar en ejecuciones futuras.

## 6. Creá el evento en Google Calendar

Agregá **Google Calendar** y conectá tu propia cuenta dentro de n8n:

- **Credential to connect with:** tu credencial de Google Calendar
- **Resource:** `Event`
- **Operation:** `Create`
- **Calendar:** el calendario que quieras usar
- **Start Time:** `{{ $json.start }}`
- **End Time:** `{{ $json.end }}`
- **All Day:** activado
- **Summary:** `{{ $json.title }}`

Como descripción opcional podés usar:

```text
Creado desde Obsidian mediante n8n.
```

Las credenciales se configuran en n8n. No se escriben en el nodo Code ni se guardan en este repositorio.

Si tu instalación te pide configurar OAuth manualmente, seguí la [guía oficial de credenciales de Google en n8n](https://docs.n8n.io/integrations/builtin/credentials/google/).

## 7. Conectá y probá todo

El orden final debe ser:

```text
Schedule Trigger
→ Read/Write Files from Disk
→ Code
→ Remove Duplicates
→ Google Calendar
```

Prueba recomendada:

1. Agregá una tarea nueva con una fecha futura.
2. Ejecutá el workflow manualmente.
3. Confirmá que aparezca una sola vez en Google Calendar.
4. Ejecutalo de nuevo sin cambiar la tarea.
5. Confirmá que no cree un duplicado.
6. Guardá y publicá el workflow.

El Schedule Trigger solo se ejecuta automáticamente cuando el workflow está publicado.

## Qué hace y qué no hace esta versión

Esta versión crea eventos nuevos y evita repetirlos. No es una sincronización bidireccional:

- Si completás una tarea en Obsidian, el evento ya creado no se elimina.
- Si cambiás el título o la fecha, se considera una tarea nueva.
- Si editás un evento en Google Calendar, el archivo de Obsidian no cambia.

Es una primera versión simple, segura y fácil de entender.

## Documentación oficial consultada

- [Schedule Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)
- [Instalar n8n con npm](https://docs.n8n.io/deploy/host-n8n/install-options/install-with-npm/)
- [Instalar n8n con Docker](https://docs.n8n.io/deploy/host-n8n/install-options/install-with-docker/)
- [Read/Write Files from Disk](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.readwritefile/)
- [Leer datos binarios desde Code](https://docs.n8n.io/build/code-in-n8n/cookbook/code-node/get-the-binary-data-buffer/)
- [Remove Duplicates](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates/)
- [Google Calendar: crear eventos](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/event-operations/)
