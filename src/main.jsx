import React from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import "./styles.css";
const url = import.meta.env.VITE_CONVEX_URL;
createRoot(document.getElementById("root")).render(
  url ? (
    <ConvexProvider client={new ConvexReactClient(url)}>
      <App />
    </ConvexProvider>
  ) : (
    <main className="setup">
      <h1>Fish N Tingz staff portal</h1>
      <p>
        Set VITE_CONVEX_URL to connect this portal to your Fish N Tingz
        production backend.
      </p>
    </main>
  ),
);
