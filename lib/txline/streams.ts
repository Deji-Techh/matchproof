export type SseMessage = {
  event?: string;
  data: string;
  id?: string;
  retry?: number;
};

function parseSseBlock(block: string): SseMessage | null {
  const message: SseMessage = { data: "" };

  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(":")) continue;
    const separator = line.indexOf(":");
    const field = separator === -1 ? line : line.slice(0, separator);
    const value = separator === -1 ? "" : line.slice(separator + 1).trimStart();

    if (field === "event") message.event = value;
    if (field === "data") message.data += `${value}\n`;
    if (field === "id") message.id = value;
    if (field === "retry") message.retry = Number(value);
  }

  message.data = message.data.trimEnd();
  return message.data || message.event ? message : null;
}

export function parseSseBuffer(buffer: string) {
  return buffer
    .split(/\n\n|\r\n\r\n/)
    .map(parseSseBlock)
    .filter((message): message is SseMessage => Boolean(message));
}

export function getReconnectDelayMs(attempt: number) {
  return Math.min(30_000, 1_000 * 2 ** Math.max(0, attempt - 1));
}
