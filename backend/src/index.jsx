import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

// Import fetch wrapper to handle API URLs globally
import "./utils/fetch-wrapper";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
