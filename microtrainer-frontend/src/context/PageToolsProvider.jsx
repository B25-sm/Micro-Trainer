import { useMemo, useState } from "react";
import PageToolsContext from "./PageToolsContext";

export default function PageToolsProvider({ children }) {
  const [historyTool, setHistoryTool] = useState(null);
  const value = useMemo(() => ({ historyTool, setHistoryTool }), [historyTool]);

  return <PageToolsContext.Provider value={value}>{children}</PageToolsContext.Provider>;
}
