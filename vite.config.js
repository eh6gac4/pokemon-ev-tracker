import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DUMMY_DATA = {
  party: [], allEVs: {}, allIVs: {}, allMoves: {},
  selected: null, activeParty: [], archivedParty: [],
  checkedItems: {}, captureCount: 0, captureGoals: [],
  todoList: [], macho: false, gakushuu: false, gakushuuMon: null,
  trainerBattleCounts: {}
};

function apiMockPlugin() {
  return {
    name: "api-mock",
    configureServer(server) {
      server.middlewares.use("/api/data", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        if (req.method === "GET") {
          res.end(JSON.stringify(DUMMY_DATA));
        } else {
          res.end(JSON.stringify({ ok: true }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiMockPlugin()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
});
