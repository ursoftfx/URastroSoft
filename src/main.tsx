import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for offline support (PWA)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    import("virtual:pwa-register").then(({ registerSW }) => {
      registerSW({ immediate: true });
    }).catch(() => {});
  });
}
