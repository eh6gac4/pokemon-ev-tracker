#!/usr/bin/env python3
"""
努力値トラッカー テストスイート
標準ライブラリのみ使用: python test_server.py
"""

import http.server
import json
import os
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent))
import server


# ---------------------------------------------------------------------------
# DB ユニットテスト
# ---------------------------------------------------------------------------

class TestDatabase(unittest.TestCase):
    """init_db / load_data / save_data のユニットテスト"""

    def setUp(self):
        fd, path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        self.db_path = Path(path)

    def tearDown(self):
        self.db_path.unlink(missing_ok=True)

    def test_load_empty_db_returns_empty_dict(self):
        with patch.object(server, "DB_PATH", self.db_path):
            server.init_db()
            self.assertEqual(server.load_data(), {})

    def test_save_and_load_roundtrip(self):
        data = {
            "party": [{"name": "リザードン", "icon": "🔥", "color": "#FF6B35"}],
            "allEVs": {
                "リザードン": {"hp": 0, "atk": 252, "def": 0, "spa": 252, "spd": 0, "spe": 4}
            },
            "selected": "リザードン",
        }
        with patch.object(server, "DB_PATH", self.db_path):
            server.init_db()
            server.save_data(data)
            self.assertEqual(server.load_data(), data)

    def test_save_overwrites_existing(self):
        with patch.object(server, "DB_PATH", self.db_path):
            server.init_db()
            server.save_data({"selected": "A"})
            server.save_data({"selected": "B"})
            self.assertEqual(server.load_data()["selected"], "B")

    def test_unicode_preserved(self):
        data = {"selected": "ピカチュウ", "note": "てすと"}
        with patch.object(server, "DB_PATH", self.db_path):
            server.init_db()
            server.save_data(data)
            self.assertEqual(server.load_data(), data)

    def test_init_db_is_idempotent(self):
        """init_db() を複数回呼んでもエラーにならない"""
        with patch.object(server, "DB_PATH", self.db_path):
            server.init_db()
            server.init_db()
            self.assertEqual(server.load_data(), {})


# ---------------------------------------------------------------------------
# HTTP 統合テスト
# ---------------------------------------------------------------------------

class TestHTTPServer(unittest.TestCase):
    """HTTPエンドポイントの統合テスト（実サーバーをスレッドで起動）"""

    @classmethod
    def setUpClass(cls):
        fd, path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        cls.db_path = Path(path)

        cls._patcher = patch.object(server, "DB_PATH", cls.db_path)
        cls._patcher.start()
        server.init_db()

        cls.httpd = http.server.HTTPServer(("127.0.0.1", 0), server.Handler)
        cls.port = cls.httpd.server_address[1]
        cls._thread = threading.Thread(target=cls.httpd.serve_forever)
        cls._thread.daemon = True
        cls._thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls._patcher.stop()
        cls.db_path.unlink(missing_ok=True)

    def url(self, path):
        return f"http://127.0.0.1:{self.port}{path}"

    # --- GET /api/data ---

    def test_get_api_data_returns_200(self):
        with urllib.request.urlopen(self.url("/api/data")) as res:
            self.assertEqual(res.status, 200)

    def test_get_api_data_returns_json(self):
        with urllib.request.urlopen(self.url("/api/data")) as res:
            body = json.loads(res.read())
        self.assertIsInstance(body, dict)

    def test_get_api_data_content_type(self):
        with urllib.request.urlopen(self.url("/api/data")) as res:
            ct = res.headers.get("Content-Type", "")
        self.assertIn("application/json", ct)

    def test_get_api_data_cors_header(self):
        with urllib.request.urlopen(self.url("/api/data")) as res:
            self.assertEqual(res.headers.get("Access-Control-Allow-Origin"), "*")

    # --- POST /api/data ---

    def test_post_valid_json_returns_ok(self):
        data = {"party": [], "allEVs": {}, "selected": "テスト"}
        req = urllib.request.Request(
            self.url("/api/data"),
            data=json.dumps(data).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req) as res:
            self.assertEqual(res.status, 200)
            body = json.loads(res.read())
        self.assertTrue(body.get("ok"))

    def test_post_then_get_reflects_saved_data(self):
        data = {"party": [], "allEVs": {}, "selected": "ゲンガー"}
        req = urllib.request.Request(
            self.url("/api/data"),
            data=json.dumps(data).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req).close()
        with urllib.request.urlopen(self.url("/api/data")) as res:
            saved = json.loads(res.read())
        self.assertEqual(saved["selected"], "ゲンガー")

    def test_post_invalid_json_returns_400(self):
        req = urllib.request.Request(
            self.url("/api/data"),
            data=b"not json {{",
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req)
        self.assertEqual(ctx.exception.code, 400)

    def test_post_invalid_json_error_body(self):
        req = urllib.request.Request(
            self.url("/api/data"),
            data=b"bad",
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            urllib.request.urlopen(req)
        except urllib.error.HTTPError as e:
            body = json.loads(e.read())
            self.assertIn("error", body)

    # --- 404 ---

    def test_get_unknown_api_path_returns_404(self):
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(self.url("/api/unknown"))
        self.assertEqual(ctx.exception.code, 404)

    def test_post_unknown_path_returns_404(self):
        req = urllib.request.Request(
            self.url("/unknown"),
            data=b"{}",
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req)
        self.assertEqual(ctx.exception.code, 404)

    def test_get_nonexistent_static_file_returns_404(self):
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(self.url("/does_not_exist.js"))
        self.assertEqual(ctx.exception.code, 404)

    # --- OPTIONS ---

    def test_options_returns_204(self):
        req = urllib.request.Request(self.url("/api/data"), method="OPTIONS")
        with urllib.request.urlopen(req) as res:
            self.assertEqual(res.status, 204)

    def test_options_cors_headers(self):
        req = urllib.request.Request(self.url("/api/data"), method="OPTIONS")
        with urllib.request.urlopen(req) as res:
            self.assertEqual(res.headers.get("Access-Control-Allow-Origin"), "*")
            self.assertIn("POST", res.headers.get("Access-Control-Allow-Methods", ""))

    # --- 静的ファイル ---

    def test_get_root_returns_index_html(self):
        with urllib.request.urlopen(self.url("/")) as res:
            self.assertEqual(res.status, 200)
            self.assertIn("text/html", res.headers.get("Content-Type", ""))

    def test_get_index_html_explicit(self):
        with urllib.request.urlopen(self.url("/index.html")) as res:
            self.assertEqual(res.status, 200)


# ---------------------------------------------------------------------------
# EV ルール ロジックテスト（index.html の change() をPythonで再現）
# ---------------------------------------------------------------------------

class TestEVRules(unittest.TestCase):
    """
    フロントエンドの change() 関数と同じロジックを検証。
    第3世代ルール: 1ステータス最大252, 合計最大510。
    """

    MAX_STAT = 252
    MAX_TOTAL = 510

    def _change(self, evs: dict, key: str, delta: int) -> dict:
        """index.html の change() と同じロジック"""
        cur = evs.get(key, 0)
        cur_total = sum(evs.values())
        next_val = max(0, min(self.MAX_STAT, cur + delta))
        if cur_total - cur + next_val > self.MAX_TOTAL:
            next_val = cur + (self.MAX_TOTAL - cur_total)
        next_val = max(0, next_val)
        return {**evs, key: next_val}

    def _zero_evs(self):
        return {"hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0}

    def test_cannot_exceed_252_per_stat(self):
        evs = self._change(self._zero_evs(), "hp", 300)
        self.assertEqual(evs["hp"], self.MAX_STAT)

    def test_cannot_go_below_zero(self):
        evs = {**self._zero_evs(), "hp": 4}
        result = self._change(evs, "hp", -10)
        self.assertEqual(result["hp"], 0)

    def test_total_cannot_exceed_510(self):
        evs = {**self._zero_evs(), "hp": 252, "atk": 252}
        result = self._change(evs, "def", 100)
        self.assertLessEqual(sum(result.values()), self.MAX_TOTAL)

    def test_typical_252_252_4_spread(self):
        evs = self._zero_evs()
        evs = self._change(evs, "hp",  252)
        evs = self._change(evs, "atk", 252)
        evs = self._change(evs, "def",   4)
        self.assertEqual(evs["hp"],  252)
        self.assertEqual(evs["atk"], 252)
        self.assertEqual(evs["def"],   4)
        self.assertEqual(sum(evs.values()), 508)

    def test_cannot_add_more_when_total_is_510(self):
        evs = {**self._zero_evs(), "hp": 252, "atk": 252, "def": 4, "spa": 2}
        result = self._change(evs, "spa", 10)
        self.assertLessEqual(sum(result.values()), self.MAX_TOTAL)

    def test_decrement_by_4(self):
        evs = {**self._zero_evs(), "hp": 252}
        result = self._change(evs, "hp", -4)
        self.assertEqual(result["hp"], 248)

    def test_increment_by_4(self):
        evs = self._zero_evs()
        result = self._change(evs, "spe", 4)
        self.assertEqual(result["spe"], 4)

    def test_remaining_budget_correctly_limits_addition(self):
        # 残り6しか入らない状況で10振ろうとする
        evs = {**self._zero_evs(), "hp": 252, "atk": 252, "def": 0, "spa": 0, "spd": 0, "spe": 0}
        # total=504, remaining=6
        result = self._change(evs, "def", 10)
        self.assertEqual(result["def"], 6)
        self.assertEqual(sum(result.values()), self.MAX_TOTAL)


# ---------------------------------------------------------------------------
# 強制ギプス（倍率×2）ロジックテスト
# ---------------------------------------------------------------------------

class TestMachoBrace(unittest.TestCase):
    """強制ギプス装備時: 加算方向のみ2倍、減算はそのまま"""

    MAX_STAT = 252
    MAX_TOTAL = 510

    def _change(self, evs: dict, key: str, delta: int, macho: bool = False) -> dict:
        actual_delta = delta * 2 if (delta > 0 and macho) else delta
        cur = evs.get(key, 0)
        cur_total = sum(evs.values())
        next_val = max(0, min(self.MAX_STAT, cur + actual_delta))
        if cur_total - cur + next_val > self.MAX_TOTAL:
            next_val = cur + (self.MAX_TOTAL - cur_total)
        next_val = max(0, next_val)
        return {**evs, key: next_val}

    def _zero_evs(self):
        return {"hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0}

    def test_plus1_becomes_plus2_with_macho(self):
        evs = self._change(self._zero_evs(), "hp", 1, macho=True)
        self.assertEqual(evs["hp"], 2)

    def test_plus4_becomes_plus8_with_macho(self):
        evs = self._change(self._zero_evs(), "hp", 4, macho=True)
        self.assertEqual(evs["hp"], 8)

    def test_minus1_unchanged_with_macho(self):
        evs = {**self._zero_evs(), "hp": 10}
        result = self._change(evs, "hp", -1, macho=True)
        self.assertEqual(result["hp"], 9)

    def test_minus4_unchanged_with_macho(self):
        evs = {**self._zero_evs(), "hp": 10}
        result = self._change(evs, "hp", -4, macho=True)
        self.assertEqual(result["hp"], 6)

    def test_macho_still_caps_at_252(self):
        evs = {**self._zero_evs(), "hp": 248}
        result = self._change(evs, "hp", 4, macho=True)  # +8 → capped at 252
        self.assertEqual(result["hp"], 252)

    def test_macho_still_caps_at_510_total(self):
        evs = {**self._zero_evs(), "hp": 252, "atk": 252, "def": 4}
        result = self._change(evs, "spa", 4, macho=True)  # total=508, +8 → capped
        self.assertLessEqual(sum(result.values()), self.MAX_TOTAL)

    def test_without_macho_plus4_is_4(self):
        evs = self._change(self._zero_evs(), "hp", 4, macho=False)
        self.assertEqual(evs["hp"], 4)


# ---------------------------------------------------------------------------
# ビタミン管理ロジックテスト（第3世代: EV<100のみ使用可、1本10EV）
# ---------------------------------------------------------------------------

class TestVitamins(unittest.TestCase):

    def setUp(self):
        # シンプルな実装で再定義
        import math
        self._vl = lambda ev: math.ceil((100 - ev) / 10) if ev < 100 else 0

    def test_zero_ev_can_use_10_vitamins(self):
        self.assertEqual(self._vl(0), 10)

    def test_4ev_can_use_10_vitamins(self):
        # 4→14→24→…→94→104, 94<100なので10本使える
        self.assertEqual(self._vl(4), 10)

    def test_95ev_can_use_1_vitamin(self):
        self.assertEqual(self._vl(95), 1)

    def test_100ev_cannot_use_vitamins(self):
        self.assertEqual(self._vl(100), 0)

    def test_252ev_cannot_use_vitamins(self):
        self.assertEqual(self._vl(252), 0)

    def test_90ev_can_use_1_vitamin(self):
        self.assertEqual(self._vl(90), 1)

    def test_89ev_can_use_2_vitamins(self):
        self.assertEqual(self._vl(89), 2)


# ---------------------------------------------------------------------------
# メモ欄: DB保存テスト（party に memo フィールドが保存・復元される）
# ---------------------------------------------------------------------------

class TestMemo(unittest.TestCase):

    def setUp(self):
        fd, path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        self.db_path = Path(path)

    def tearDown(self):
        self.db_path.unlink(missing_ok=True)

    def test_memo_saved_and_loaded(self):
        data = {
            "party": [{"name": "ゲンガー", "icon": "👻", "color": "#C97AE0", "memo": "おくびょう　めがねゲンガー"}],
            "allEVs": {"ゲンガー": {"hp": 0, "atk": 0, "def": 0, "spa": 252, "spd": 4, "spe": 252}},
            "selected": "ゲンガー",
        }
        with patch.object(server, "DB_PATH", self.db_path):
            server.init_db()
            server.save_data(data)
            result = server.load_data()
        self.assertEqual(result["party"][0]["memo"], "おくびょう　めがねゲンガー")

    def test_empty_memo_preserved(self):
        data = {
            "party": [{"name": "リザードン", "icon": "🔥", "color": "#FF6B35", "memo": ""}],
            "allEVs": {"リザードン": {"hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0}},
            "selected": "リザードン",
        }
        with patch.object(server, "DB_PATH", self.db_path):
            server.init_db()
            server.save_data(data)
            result = server.load_data()
        self.assertEqual(result["party"][0]["memo"], "")

    def test_memo_updated(self):
        with patch.object(server, "DB_PATH", self.db_path):
            server.init_db()
            server.save_data({"party": [{"name": "A", "memo": "before"}], "allEVs": {}, "selected": "A"})
            server.save_data({"party": [{"name": "A", "memo": "after"}],  "allEVs": {}, "selected": "A"})
            result = server.load_data()
        self.assertEqual(result["party"][0]["memo"], "after")


if __name__ == "__main__":
    unittest.main(verbosity=2)
