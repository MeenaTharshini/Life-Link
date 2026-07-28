import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { EmergencyProvider } from "./context/EmergencyContext";
ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <EmergencyProvider>
        <App />
    </EmergencyProvider>
</AuthProvider>
);