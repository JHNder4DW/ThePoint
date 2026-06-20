import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

const path = window.location.pathname;
const isAdmin = path.startsWith("/admin");
const isTrack = path.startsWith("/track/");

// Apply saved theme before boot so initial paint matches preference
try {
  const saved = localStorage.getItem("thepoint:theme");
  if (saved === "red") document.documentElement.classList.add("theme-red");
  else document.documentElement.classList.remove("theme-red");
} catch (e) {
  // ignore
}

async function boot() {
  const root = createRoot(document.getElementById("root")!);

  if (isAdmin) {
    const { default: AdminShell } = await import("./app/admin/AdminShell.tsx");
    root.render(<AdminShell />);
  } else if (isTrack) {
    const orderId = path.replace("/track/", "").split("/")[0];
    const { TrackingPage } = await import("./app/track/TrackingPage.tsx");
    root.render(<TrackingPage orderId={orderId} />);
  } else {
    root.render(<App />);
  }
}

boot();
