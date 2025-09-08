import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// ⚠️ MUHIM: new Vite dev proxy
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://212.83.191.99:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""), // /api/InPayments -> /InPayments
        configure: (proxy /*: import('http-proxy').Server*/) => {
          // Brauzerdan kelgan X-Session-Id headerini Cookie ga aylantiramiz
          proxy.on("proxyReq", (proxyReq, req: any) => {
            const sid = req.headers["x-session-id"]; // frontdan yuboriladi
            if (sid) {
              // E’TIBOR: backend Postman’da qanday Cookie kutayotgan bo‘lsa,
              // aynan O‘SHA formatda bering, masalan: "sessionId=ABC123"
              proxyReq.setHeader("Cookie", String(sid));
            }
          });
        },
      },
    },
  },
});
