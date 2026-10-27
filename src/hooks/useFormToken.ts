import { useEffect, useState } from 'react';

export function useFormToken() {
  const [token, setToken] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    let wait: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    async function load() {
      try {
        const response = await fetch('/api/form-token', {
          cache: 'no-store', signal: controller.signal,
        });
        if (!response.ok) throw new Error('Token unavailable');
        const data = await response.json();
        if (typeof data.t !== 'string' || !data.t) throw new Error('Missing token');
        if (!active) return;
        setToken(data.t);
        wait = setTimeout(() => { if (active) setReady(true); }, 3000);
      } catch {
        if (active) setReady(true);
      } finally {
        clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
      clearTimeout(wait);
    };
  }, []);
  return { token, ready };
}

