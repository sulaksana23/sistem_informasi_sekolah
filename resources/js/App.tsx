import "./Bootstrap";
import "../css/app.css";
import "../css/styles.css";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import React, { StrictMode, type ComponentType } from "react";
import { SettingsProvider } from "./providers/settings-provider";
import { ThemeProvider } from "./providers/theme-provider";
import { I18nProvider } from "./providers/i18n-provider";
import { TooltipsProvider } from "./providers/tooltips-provider";
import { QueryProvider } from "./providers/query-provider";
import { Toaster } from "sonner";
import { MainLayout } from "./layouts/main/MainLayout";

type PageModule = {
    default: ComponentType<any> & { layout?: (page: any) => React.JSX.Element };
};

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

// Only Inertia entry components (`pages/{feature}/pages/*.tsx`) are page candidates — loaded lazily so
// each page becomes its own chunk instead of the whole app shipping in the initial bundle.
const pages = import.meta.glob<PageModule>("./pages/**/pages/*.tsx");

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name: string): Promise<PageModule> => {
        const importPage = pages[`./pages/${name}.tsx`];

        if (!importPage) throw new Error(`Pages not found: Pages/${name}.tsx`);

        const page = await importPage();
        page.default.layout = page.default.layout || ((children) => <MainLayout>{children}</MainLayout>);

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el as HTMLElement);

        root.render(
            <StrictMode>
                <SettingsProvider>
                    <ThemeProvider>
                        <I18nProvider>
                            <TooltipsProvider>
                                <QueryProvider>
                                    <Toaster />
                                    <App {...props} />
                                </QueryProvider>
                            </TooltipsProvider>
                        </I18nProvider>
                    </ThemeProvider>
                </SettingsProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: "#00c951",
        showSpinner: true,
    },
});
