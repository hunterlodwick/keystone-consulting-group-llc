/** Only an explicit successful spam verdict suppresses browser delivery. */
export async function spamCheck(fields: Record<string, unknown>): Promise<boolean> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch('/api/spam-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(fields),
          signal: controller.signal,
        });
        if (!response.ok) return true;
        const result = await response.json();
        return !(result?.success === true && result.deliver === false);
      })(),
      new Promise<boolean>((resolve) => {
        timeout = setTimeout(() => {
          resolve(true);
          controller.abort();
        }, 3000);
      }),
    ]);
  } catch {
    return true;
  } finally {
    clearTimeout(timeout);
  }
}
