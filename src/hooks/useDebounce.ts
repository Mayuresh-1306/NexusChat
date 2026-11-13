import { useState, useEffect } from 'react';

/**
 * Custom Hook: useDebounce
 * Delays updating the debounced value until after a specified delay period.
 * Reusable across search bars, filters, and async lookup inputs.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

