import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    server: {
      proxy: {
        "/audit-api": {
          target: "http://localhost:8983",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/audit-api/, ""),
        },

        "/solr-api": {
          target: "http://localhost:8090",
          changeOrigin: true,

          rewrite: (path) => path.replace(/^\/solr-api/, "/solr"),

          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              const credentials = Buffer.from(
                `${env.SOLR_USER}:${env.SOLR_PASSWORD}`
              ).toString("base64");

              proxyReq.setHeader(
                "Authorization",
                `Basic ${credentials}`
              );
            });
          },
        },

        "/ranger-api": {
          target: "http://localhost:6080",
          changeOrigin: true,

          rewrite: (path) => path.replace(/^\/ranger-api/, ""),

          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              const credentials = Buffer.from(
                `${env.RANGER_USER}:${env.RANGER_PASSWORD}`
              ).toString("base64");

              proxyReq.setHeader(
                "Authorization",
                `Basic ${credentials}`
              );
            });
          },
        },
      },
    },
  };
});