/** Bound the whole operation, including body streaming and injected transports. */
export async function deadline<T>(milliseconds: number, work: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  const expired = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(Error('Operation unavailable')); }, milliseconds);
  });
  try { return await Promise.race([work(controller.signal), expired]); }
  finally { clearTimeout(timer!); }
}
