import React from "react";
import ReactDOM from "react-dom/client";
import { RecoilRoot } from "recoil";
import App from "./App.tsx";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: "dark",
        }}
      >
        <Notifications />
        <App />
      </MantineProvider>
    </RecoilRoot>
  </React.StrictMode>
);
