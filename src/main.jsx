import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import EVTracker from "./EVTracker.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <EVTracker />
  </StrictMode>
);
