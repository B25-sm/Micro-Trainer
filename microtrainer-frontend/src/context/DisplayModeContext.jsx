import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  DARK_KEY,
  READ_KEY,
  applyDocumentClasses,
  readBool,
} from "../utils/displayModeStorage";
import { DisplayModeContext } from "./displayModeContextValue";

export function DisplayModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => readBool(DARK_KEY));
  const [readMode, setReadMode] = useState(() => readBool(READ_KEY));

  useLayoutEffect(() => {
    applyDocumentClasses(darkMode, readMode);
  }, [darkMode, readMode]);

  useEffect(() => {
    try {
      localStorage.setItem(DARK_KEY, String(darkMode));
      localStorage.setItem(READ_KEY, String(readMode));
    } catch {
      /* ignore */
    }
  }, [darkMode, readMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((v) => !v), []);
  const toggleReadMode = useCallback(() => setReadMode((v) => !v), []);

  const value = useMemo(
    () => ({
      darkMode,
      readMode,
      setDarkMode,
      setReadMode,
      toggleDarkMode,
      toggleReadMode,
    }),
    [darkMode, readMode, toggleDarkMode, toggleReadMode]
  );

  return (
    <DisplayModeContext.Provider value={value}>
      {children}
    </DisplayModeContext.Provider>
  );
}
