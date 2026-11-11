import { defineConfig, loadEnv } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [
            laravel({
                input: ["resources/js/App.tsx"],
                refresh: true,
            }),
            tailwindcss(),
            react(),
        ],
        resolve: {
            alias: {
                "@": "/resources/js",
            },
        },
        build: {
            sourcemap: false,
        },
        server: {
            host: "0.0.0.0",
            port: Number(env.VITE_PORT) || 5173,
            // "origin" menentukan host:port yang ditulis laravel-vite-plugin ke
            // <script src="..."> (bukan cuma HMR) — tanpa ini, asset URL selalu
            // "localhost" meski diakses dari host lain (mis. IP LAN), bikin
            // origin halaman vs origin script beda dan diblokir CORS.
            origin: `http://${env.VITE_HOST || "localhost"}:${Number(env.VITE_PORT) || 5173}`,
            strictPort: false,
            cors: true,
            watch: {
                ignored: ["**/storage/framework/views/**"],
                usePolling: true,
            },
            hmr: {
                host: env.VITE_HOST || "localhost",
                clientPort: Number(env.VITE_PORT) || 5173,
            },
        },
    };
});
