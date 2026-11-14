import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app";
import { carryOver } from "./lib/carry-over";

import "./styles.css";

const root = document.querySelector("#root");

// Saved games come over from the old address before any game reads them.
const start = async () => {
  await carryOver();

  if (root) {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
};

void start();
