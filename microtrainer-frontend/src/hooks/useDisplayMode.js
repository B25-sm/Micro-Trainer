import { useContext } from "react";
import { DisplayModeContext } from "../context/displayModeContextValue";

export function useDisplayMode() {
  const ctx = useContext(DisplayModeContext);
  if (!ctx) {
    throw new Error("useDisplayMode must be used within DisplayModeProvider");
  }
  return ctx;
}
