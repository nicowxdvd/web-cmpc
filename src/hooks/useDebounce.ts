import { useEffect, useState } from 'react';

export function useDebounce<T>(valor: T, demora = 400) {
  const [debounced, setDebounced] = useState(valor);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(valor), demora);
    return () => clearTimeout(id);
  }, [valor, demora]);

  return debounced;
}