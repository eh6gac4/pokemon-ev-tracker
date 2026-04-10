#!/usr/bin/env python3
"""
努力値トラッカー - サーバー
標準ライブラリのみ使用（追加インストール不要）
"""

import gzip
import hashlib
import http.server
import json
import os
import sqlite3
import sys
from pathlib import Path

PORT = int(os.environ.get("PORT", 8080))
DB_PATH = Path(os.environ.get("DB_PATH", Path(__file__).parent / "ev_data.db"))
_dist = Path(__file__).parent / "dist"
STATIC_DIR = _dist if _dist.is_dir() else Path(__file__).parent


VALID_GAMES = {"frlg", "bdsp"}


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS game_saves (
                game  TEXT PRIMARY KEY,
                data  TEXT NOT NULL
            )
        """)
        # 旧テーブル (ev_data) から frlg へマイグレーション
        tables = {r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        if "ev_data" in tables:
            row = conn.execute("SELECT data FROM ev_data WHERE id = 1").fetchone()
            if row:
                conn.execute("""
                    INSERT INTO game_saves (game, data) VALUES ('frlg', ?)
                    ON CONFLICT(game) DO NOTHING
                """, (row[0],))
        conn.commit()


def load_data(game: str) -> dict:
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute("SELECT data FROM game_saves WHERE game = ?", (game,)).fetchone()
        return json.loads(row[0]) if row else {}


def save_data(game: str, data: dict):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            INSERT INTO game_saves (game, data) VALUES (?, ?)
            ON CONFLICT(game) DO UPDATE SET data = excluded.data
        """, (game, json.dumps(data, ensure_ascii=False)))
        conn.commit()


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"[{self.address_string()}] {fmt % args}")

    def send_json(self, code: int, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _parse_game(self) -> str:
        """クエリパラメータ ?game= からゲームモードを取得（デフォルト: frlg）"""
        qs = self.path.split("?", 1)[1] if "?" in self.path else ""
        for part in qs.split("&"):
            if part.startswith("game="):
                g = part[5:]
                return g if g in VALID_GAMES else "frlg"
        return "frlg"

    def _serve_static(self, path: str):
        raw = path.split("?")[0]
        # /bdsp と /bdsp/* はすべて index.html（SPA）を返す
        if raw == "/bdsp" or raw.startswith("/bdsp/"):
            raw = "/index.html"
        elif raw in ("/", ""):
            raw = "/index.html"
        file_path = STATIC_DIR / raw.lstrip("/")
        if not file_path.is_file():
            self.send_json(404, {"error": "not found"})
            return
        mime = {
            ".html":        "text/html; charset=utf-8",
            ".js":          "application/javascript",
            ".css":         "text/css",
            ".json":        "application/json",
            ".webmanifest": "application/manifest+json",
            ".png":         "image/png",
            ".svg":         "image/svg+xml",
            ".ico":         "image/x-icon",
            ".woff2":       "font/woff2",
            ".woff":        "font/woff",
        }.get(file_path.suffix, "application/octet-stream")
        raw_body = file_path.read_bytes()
        etag = f'"{hashlib.md5(raw_body).hexdigest()}"'
        # Vite がハッシュを付与するアセット（dist/assets/*）は長期キャッシュ可
        is_hashed_asset = file_path.parent == STATIC_DIR / "assets"
        cache_control = "public, max-age=31536000, immutable" if is_hashed_asset else "no-cache"

        # ETagが一致すれば 304 を返してボディ送信をスキップ
        if self.headers.get("If-None-Match") == etag:
            self.send_response(304)
            self.send_header("ETag", etag)
            self.send_header("Cache-Control", cache_control)
            self.end_headers()
            return

        accept_enc = self.headers.get("Accept-Encoding", "")
        if "gzip" in accept_enc and file_path.suffix in (".html", ".js", ".css", ".json"):
            body = gzip.compress(raw_body, compresslevel=6)
            encoding = "gzip"
        else:
            body = raw_body
            encoding = None
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("ETag", etag)
        self.send_header("Cache-Control", cache_control)
        if encoding:
            self.send_header("Content-Encoding", encoding)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith("/api/data"):
            game = self._parse_game()
            self.send_json(200, load_data(game))
        else:
            self._serve_static(self.path)

    def do_POST(self):
        if self.path.startswith("/api/data"):
            game = self._parse_game()
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                save_data(game, data)
                self.send_json(200, {"ok": True})
            except json.JSONDecodeError:
                self.send_json(400, {"error": "invalid JSON"})
        else:
            self.send_json(404, {"error": "not found"})


if __name__ == "__main__":
    init_db()
    server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"サーバー起動: http://localhost:{PORT}")
    print(f"LAN内からは: http://<このPCのIP>:{PORT}")
    print("停止: Ctrl+C")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n停止しました")
        sys.exit(0)
