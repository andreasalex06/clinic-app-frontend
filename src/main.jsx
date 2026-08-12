import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { useAuthStore } from "./stores/authStore";
import "./stores/themeStore";
import "./index.css";

function AuthProvider() {
  const loadMe = useAuthStore((state) => state.loadMe);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  return <App />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider />
    </BrowserRouter>
  </StrictMode>
);
