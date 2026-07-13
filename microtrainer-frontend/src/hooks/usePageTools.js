import { useContext } from "react";
import PageToolsContext from "../context/PageToolsContext";

export default function usePageTools() {
  const context = useContext(PageToolsContext);
  if (!context) throw new Error("usePageTools must be used within PageToolsProvider");
  return context;
}
