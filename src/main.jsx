import React from "react";
import ReactDOM from "react-dom/client";
// Shared theme first so page stylesheets can override it
import "./styles/theme.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);