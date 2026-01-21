import ReactDOMServer from "react-dom/server";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";

import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";

const appName: string = import.meta.env.VITE_APP_NAME ?? "Laravel";

createServer(async (page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) =>
      resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob("./pages/**/*.tsx")),
    setup: ({ App, props }) => (
      <ToastProvider>
        <AnchoredToastProvider>
          <App {...props} />
        </AnchoredToastProvider>
      </ToastProvider>
    ),
  }),
);
