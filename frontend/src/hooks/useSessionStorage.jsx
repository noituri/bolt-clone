import { useState } from "react";

export default function useSessionStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const v = sessionStorage.getItem(key);
      if (v) {
        return JSON.parse(v);
      } else {
        sessionStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch {
      return defaultValue;
    }
  });

  const setValueAndSession = (v) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(v));
    } catch (err) {
      console.error(err);
    }

    setValue(v);
  };

  return [value, setValueAndSession];
}
