export async function consumeEvents(
  response: Response,
  onEvent: (event: Record<string, unknown>) => void,
) {
  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => ({ error: "Request failed. Please retry." }));
    throw new Error(data.error || "Request failed.");
  }
  if (!response.body) throw new Error("No event stream returned.");
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let at;
      while ((at = buffer.indexOf("\n\n")) >= 0) {
        const block = buffer.slice(0, at);
        buffer = buffer.slice(at + 2);
        for (const line of block.split("\n"))
          if (line.startsWith("data: ")) {
            const e = JSON.parse(line.slice(6));
            if (e.type === "error") throw new Error(e.text);
            onEvent(e);
          }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
