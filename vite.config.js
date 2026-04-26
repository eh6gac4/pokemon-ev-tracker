import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DEFAULT_PARTY = [
  { name: "リザードン", icon: "🔥", color: "#FF6B35", memo: "", nature: "", dexId: 5 },
  { name: "ガラガラ",   icon: "💀", color: "#A0A0A0", memo: "", nature: "", dexId: 104 },
  { name: "ギャラドス", icon: "🌊", color: "#4A90D9", memo: "", nature: "", dexId: 129 },
  { name: "カビゴン",   icon: "😴", color: "#7DBE8A", memo: "", nature: "", dexId: 142 },
  { name: "サンダー",   icon: "⚡", color: "#F5D020", memo: "", nature: "", dexId: 144 },
  { name: "ルージュラ", icon: "💋", color: "#E880A0", memo: "", nature: "", dexId: 123 },
];
const zeroEVs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const maxIVs  = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
const fromEntries = (arr, fn) => Object.fromEntries(arr.map(p => [p.name, fn(p)]));

const DUMMY_DATA = {
  party:    DEFAULT_PARTY,
  allEVs:   fromEntries(DEFAULT_PARTY, () => ({ ...zeroEVs })),
  allIVs:   fromEntries(DEFAULT_PARTY, () => ({ ...maxIVs })),
  allMoves: fromEntries(DEFAULT_PARTY, () => ["", "", "", ""]),
  selected: DEFAULT_PARTY[0].name,
  activeParty: [null, null, null, null, null, null],
  archivedParty: [],
  checkedItems: {}, captureCount: 0, captureGoals: [],
  todoList: [], macho: false, gakushuu: false, gakushuuMon: null,
  trainerBattleCounts: {}, _dev: true
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
  test: {
    environment: 'jsdom',
    include: ['js/**/*.test.js'],
  },
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
