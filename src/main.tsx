import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { UpdateBanner } from "./components/UpdateBanner.tsx";
import { GameNightProvider } from "./lib/GameNightContext.tsx";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root is missing in index.html");

createRoot(root).render(
  <StrictMode>
    <GameNightProvider url={import.meta.env.VITE_VOTES_URL || null}>
      <App />
      {import.meta.env.PROD && <UpdateBanner />}
    </GameNightProvider>
  </StrictMode>,
);
