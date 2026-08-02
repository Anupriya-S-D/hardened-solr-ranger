import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
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
              `${process.env.SOLR_USER}:${process.env.SOLR_PASSWORD}`
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
              `${process.env.RANGER_USER}:${process.env.RANGER_PASSWORD}`
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
});