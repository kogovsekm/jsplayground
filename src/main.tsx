import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TooltipProvider delayDuration={150}>
      <App />
      <Sonner />
    </TooltipProvider>
  </React.StrictMode>,
);
