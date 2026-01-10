import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: "/tmp/vite-cache",
  optimizeDeps: {
    include: ["lightweight-charts"],
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://trading-saas-api:3000",
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(
              "[VITE PROXY] →",
              req.method,
              req.url,
              "=>",
              proxyReq.path
            );
          });

          proxy.on("proxyRes", (proxyRes, req) => {
            console.log(
              "[VITE PROXY] ←",
              req.method,
              req.url,
              "status:",
              proxyRes.statusCode
            );
          });

          proxy.on("error", (err, req) => {
            console.error("[VITE PROXY ERROR]", err.message);
          });
        },
      },
    },
  },
});
