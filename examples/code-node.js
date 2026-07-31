/**
 * Nodo Code de n8n
 * Language: JavaScript
 * Mode: Run Once for All Items
 */

const fileBuffer = await this.helpers.getBinaryDataBuffer(0, 'data');
const markdown = fileBuffer.toString('utf8');

const pendingTaskPattern = /^\s*[-*]\s+\[ \]\s+(.+?)\s*$/;
const datePattern = /📅\s*(\d{4}-\d{2}-\d{2})/;

const seenInThisFile = new Set();
const events = [];

function getNextDay(dateText) {
  const date = new Date(`${dateText}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateText
  ) {
    return null;
  }

  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

for (const line of markdown.split(/\r?\n/)) {
  const taskMatch = line.match(pendingTaskPattern);

  if (!taskMatch) {
    continue;
  }

  const taskText = taskMatch[1];
  const dateMatch = taskText.match(datePattern);

  if (!dateMatch) {
    continue;
  }

  const start = dateMatch[1];
  const end = getNextDay(start);
  const title = taskText
    .replace(datePattern, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!title || !end) {
    continue;
  }

  const dedupeKey = `${start}|${title.toLocaleLowerCase('es')}`;

  if (seenInThisFile.has(dedupeKey)) {
    continue;
  }

  seenInThisFile.add(dedupeKey);

  events.push({
    json: {
      title,
      start,
      end,
      dedupeKey,
      source: 'obsidian',
    },
  });
}

return events;
