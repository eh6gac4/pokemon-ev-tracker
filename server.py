#!/usr/bin/env python3
"""
努力値トラッカー - サーバー
標準ライブラリのみ使用（追加インストール不要）
"""

import http.server
import json
import os
import sqlite3
import sys
from pathlib import Path

PORT = int(os.environ.get("PORT", 8080))
DB_PATH = Path(os.environ.get("DB_PATH", Path(__file__).parent / "ev_data.db"))
STATIC_DIR = Path(__file__).parent


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS ev_data (
                id    INTEGER PRIMARY KEY CHECK (id = 1),
                data  TEXT NOT NULL
            )
        """)
        conn.commit()


def load_data():
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute("SELECT data FROM ev_data WHERE id = 1").fetchone()
        return json.loads(row[0]) if row else {}


def save_data(data: dict):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            INSERT INTO ev_data (id, data) VALUES (1, ?)
            ON CONFLICT(id) DO UPDATE SET data = excluded.data
        """, (json.dumps(data, ensure_ascii=False),))
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

    def do_GET(self):
        if self.path == "/api/data":
            self.send_json(200, load_data())
        else:
            # 静的ファイルを返す
            path = self.path.split("?")[0]
            if path == "/" or path == "":
                path = "/index.html"
            file_path = STATIC_DIR / path.lstrip("/")
            if file_path.is_file():
                mime = {
                    ".html": "text/html; charset=utf-8",
                    ".js":   "application/javascript",
                    ".css":  "text/css",
                    ".json": "application/json",
                }.get(file_path.suffix, "application/octet-stream")
                body = file_path.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-cache")
                self.end_headers()
                self.wfile.write(body)
            else:
                self.send_json(404, {"error": "not found"})

    def do_POST(self):
        if self.path == "/api/data":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                save_data(data)
                self.send_json(200, {"ok": True})
            except json.JSONDecodeError:
                self.send_json(400, {"error": "invalid JSON"})
        else:
            self.send_json(404, {"error": "not found"})


if __name__ == "__main__":
    init_db()
    server = http.server.HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"サーバー起動: http://localhost:{PORT}")
    print(f"LAN内からは: http://<このPCのIP>:{PORT}")
    print("停止: Ctrl+C")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n停止しました")
        sys.exit(0)
