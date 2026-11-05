#!/usr/bin/env python3
"""
Serveur local pour le clone de xsint.xyz.

- Sert les pages HTML sauvegardées (index.html, dashboard.html, suppression.html)
- Relaie les appels /api/*, /auth, /logout vers le vrai backend https://xsint.xyz
  (avec ta session/cookie), pour que le site clone soit réellement fonctionnel.

Usage:
    python3 serve.py
Puis ouvre http://localhost:8000/

La clé utilisée pour se connecter automatiquement se définit via la variable
d'environnement XSINT_KEY, ou en la tapant dans le formulaire de login affiché.
"""
import http.server
import os
import requests

PORT = 8000
UPSTREAM = "https://xsint.xyz"
DIR = os.path.dirname(os.path.abspath(__file__))

PAGE_MAP = {
    "/": "index.html",
    "/dashboard": "dashboard.html",
    "/suppression": "suppression.html",
}

PROXY_PREFIXES = ("/api/", "/auth", "/logout")

session = requests.Session()


class Handler(http.server.BaseHTTPRequestHandler):
    def _proxy(self, method):
        body = None
        length = self.headers.get("Content-Length")
        if length:
            body = self.rfile.read(int(length))

        headers = {"Content-Type": self.headers.get("Content-Type", "application/json")}
        resp = session.request(
            method,
            UPSTREAM + self.path,
            data=body,
            headers=headers,
            allow_redirects=False,
            timeout=30,
        )

        self.send_response(resp.status_code)
        for k, v in resp.headers.items():
            if k.lower() in ("content-encoding", "transfer-encoding", "content-length", "connection"):
                continue
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(resp.content)))
        self.end_headers()
        self.wfile.write(resp.content)

    def _serve_file(self, path):
        local_path = os.path.join(DIR, path)
        if not os.path.isfile(local_path):
            self.send_error(404, "Not Found")
            return
        with open(local_path, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path.startswith(PROXY_PREFIXES):
            self._proxy("GET")
            return
        page = PAGE_MAP.get(self.path.rstrip("/") or "/")
        if page:
            self._serve_file(page)
        else:
            self.send_error(404, "Not Found")

    def do_POST(self):
        if self.path.startswith(PROXY_PREFIXES):
            self._proxy("POST")
        else:
            self.send_error(404, "Not Found")

    def log_message(self, fmt, *args):
        print("[serve]", fmt % args)


if __name__ == "__main__":
    key = os.environ.get("XSINT_KEY")
    if key:
        r = session.post(UPSTREAM + "/auth", json={"key": key}, timeout=15)
        print("Auto-login:", r.status_code, r.text)

    print(f"Clone local servi sur http://localhost:{PORT}/")
    print("Pages: /  /dashboard  /suppression  (les appels /api, /auth, /logout sont relayés vers xsint.xyz)")
    http.server.HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
