import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";

import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";

import { initializeTheme } from "./hooks/use-appearance";

import "../css/app.css";

const appName: string = import.meta.env.VITE_APP_NAME ?? "Laravel";

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: async (name) =>
    resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob("./pages/**/*.tsx")),
  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <StrictMode>
        <ToastProvider>
          <AnchoredToastProvider>
            <App {...props} />
          </AnchoredToastProvider>
        </ToastProvider>
      </StrictMode>,
    );
  },
  progress: {
    color: "#262626",
  },
});

// This will set light / dark mode on load...
initializeTheme();
