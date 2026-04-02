# Copilot Instructions for Pokémon EV Tracker

## Overview

This is a minimal, production-ready EV (effort value) tracker for Pokémon Fire Red/Leaf Green (Gen III rules). It uses:
- **Frontend**: Single-file React 18 app via CDN + Babel Standalone (no build step, no Node.js required)
- **Backend**: Python 3.11 using only standard library (`http.server`, `sqlite3`)
- **Database**: SQLite at `./data/ev_data.db`
- **Deployment**: Docker Compose (single container, restart policy, persistent volume)

This is intentionally minimal—no external dependencies on backend or frontend build tools. The `src/`, `package.json`, and `vite.config.js` are preserved but unused (legacy from Vite experiment).

## Build, Test, and Run

### Run Tests
```bash
python3 test_server.py
```

Test coverage includes:
- Database operations (load/save roundtrip, empty DB)
- HTTP API (GET `/api/data`, POST `/api/data`, CORS, 404 handling)
- EV constraints (252 per stat, 510 total)
- Macho Brace support (doubles EV gain)
- Vitamins (capped at 10 per stat when EV < 100)
- Memo field persistence
- Extended fields (nature, dexId tracking)

Run specific test class:
```bash
python3 -m unittest test_server.TestEVRules -v
```

### Run Locally
```bash
python3 server.py
# Open http://localhost:8080
```

The server automatically initializes the DB on startup if it doesn't exist.

### Docker Deployment
```bash
# Start (builds if needed)
docker compose up -d

# Logs
docker compose logs -f

# Restart after code changes
docker compose down && docker compose up -d --build

# Stop
docker compose down
```

The `Dockerfile` copies only: `server.py`, `index.html`, `style.css`, and 3 icon files.

## Architecture

### API Contract
Two endpoints (CORS-enabled):

| Endpoint | Method | Function |
|----------|--------|----------|
| `/api/data` | GET | Load full state from DB |
| `/api/data` | POST | Save full state to DB (upsert) |

Payload shape:
```json
{
  "party": [
    { "name": "ポケモン名", "icon": "emoji", "color": "#hex", "memo": "...", "nature": "...", "dexId": 5 }
  ],
  "allEVs": {
    "ポケモン名": { "hp": 0, "atk": 252, "def": 0, "spa": 0, "spd": 0, "spe": 4 }
  },
  "selected": "ポケモン名"
}
```

### Database
Single table `ev_data` with one row (id=1, immutable):
```sql
CREATE TABLE ev_data (
  id   INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL
)
```

Data is stored as JSON (not normalized). Table enforces exactly one record via CHECK constraint.

### Frontend (React Components)
All code is in `index.html` inside `<script type="text/babel">`. Key functions:
- **`EV Panel`**: Displays 6 party members with EV spinners
- **`change()`**: Enforces EV rules (252 max/stat, 510 max total), toggles Macho Brace effect
- **`vitaminLeft(ev)`**: Computes remaining vitamins (capped at 100 EV)
- **IV Checker**: Reverse-calculates IVs from level/nature/EV/actual stat
- **Search Tab**: Query EV yields by Pokémon name and stat type
- **Auto-save**: Posts data to `/api/data` on any change

Constants defined in-script:
- `POKEMON_DATA`: 151 Kanto Pokémon base stats
- `EV_YIELD`: Yield table (same order, Gen III values)
- `NATURES`: 25 nature modifiers (up/down stat pairs)

## Conventions & Rules

### Pokémon Naming
**All Pokémon names, locations, moves, and items must use Japanese:**
- ❌ `Abra` → ✅ `ケーシィ`
- ❌ `Seafoam Islands` → ✅ `ふたごじま`
- ❌ No sound-mapped English (e.g., シーフォームアイランズ)

Constants like `POKEMON_DATA`, `EV_YIELD`, `NATURES` keep their English names (never localize these identifiers).

### EV Rules (Gen III)
- Max per stat: 252
- Max total: 510
- Macho Brace (held item): doubles EV gain from encounters
- Vitamins: 10 EV each, capped at 100 EV per stat

These are enforced in the `change()` function (frontend) and tested in `TestEVRules`.

### Code Style
- **Frontend**: Single JSX file, no imports (all via CDN)
- **Backend**: Minimal Python, no external packages, pathlib for file ops
- **Database**: One-shot JSON storage (not relational)

Comments are sparse—code should be self-documenting. Add comments only for non-obvious business logic.

### After Making Changes
1. **Test locally**:
   ```bash
   python3 test_server.py
   ```
2. **Commit and push**:
   ```bash
   git add . && git commit -m "..." && git push
   ```
3. **Deploy**:
   ```bash
   docker compose up -d --build
   ```

## Common Tasks

### Add a New Pokémon Feature
Update constants in `index.html`: `POKEMON_DATA`, `EV_YIELD` (must stay in 0-indexed order). Add tests in `test_server.py` if logic changes.

### Change Port
Edit `docker-compose.yml` `ports` section, then restart:
```bash
docker compose restart
```

### Access from LAN
Use the host's IP (e.g., `http://192.168.1.10:8080`). CORS is enabled, so no cross-origin issues.

### Database Backup
```bash
cp data/ev_data.db data/ev_data.backup.db
```

### Debug Server Locally
```bash
python3 server.py
curl http://localhost:8080/api/data | python3 -m json.tool
```

## State of Unused Files
- `src/`, `package.json`, `vite.config.js`: Remain for future Node.js migration (ignored for now)
- `ev_data.db` (root): Local test remnant, ignored by `.gitignore`
- `data/ev_data.db`: Actual production DB, in Docker volume

## MCP Servers

### Python MCP Server
For enhanced Python code analysis and insights, configure the Python MCP server in your IDE/Copilot client. This helps with:
- Static analysis of `server.py` and `test_server.py`
- Type checking and linting suggestions
- API inspection for standard library usage

In Claude Desktop or Copilot CLI, add to your MCP config:
```json
{
  "mcpServers": {
    "python": {
      "command": "python",
      "args": ["-m", "mcp.server.python"],
      "env": {
        "PYTHONPATH": "/path/to/pokemon-ev-tracker"
      }
    }
  }
}
```

This project uses only Python stdlib, so no external dependencies to worry about.

## Key Dependencies
- **Python 3.11**: `http.server`, `json`, `sqlite3`, `pathlib` (all stdlib)
- **React 18**: Loaded from CDN (no build, no npm)
- **Docker**: Compose v1.29+
