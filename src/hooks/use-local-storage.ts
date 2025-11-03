import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue === null) {
        return defaultValue;
      }
      return JSON.parse(storedValue) as T;
    } catch (error) {
      console.warn(`useLocalStorage: failed to parse key "${key}"`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`useLocalStorage: failed to set key "${key}"`, error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
