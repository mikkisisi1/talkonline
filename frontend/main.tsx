import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Preload avatar images immediately so they appear instantly in the header
import ivanAvatar from '@/assets/ivan-avatar.jpg';
import kseniaAvatar from '@/assets/ksenia-avatar.jpg';
import olegAvatar from '@/assets/oleg-avatar.jpg';
[ivanAvatar, kseniaAvatar, olegAvatar].forEach(src => {
  const img = new Image();
  img.src = src;
});

// Capture PWA install events early (even before Settings is opened)
declare global {
  interface Window {
    __talkmeDeferredInstallPrompt?: Event;
    __talkmeAppInstalled?: boolean;
  }
}

window.addEventListener('beforeinstallprompt', (e: Event) => {
  // Prevent browser from showing its own mini-infobar; we will trigger it from Settings.
  e.preventDefault();
  window.__talkmeDeferredInstallPrompt = e;
});

window.addEventListener('appinstalled', () => {
  window.__talkmeAppInstalled = true;
  window.__talkmeDeferredInstallPrompt = undefined;
  try {
    localStorage.setItem('talkme_pwa_installed', '1');
  } catch {
    // ignore
  }
});

// Register Service Worker for PWA installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
