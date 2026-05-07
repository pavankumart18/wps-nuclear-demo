#!/usr/bin/env python3
"""HTTP server for the NPCIL SM-11 Welding Assignment Demo."""
import http.server
import socketserver
import os

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, fmt, *args):
        if not any(x in (args[0] if args else '') for x in ['.css', '.js', '.ico', '.csv', '.png']):
            super().log_message(fmt, *args)

if __name__ == '__main__':
    os.chdir(BASE_DIR)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.allow_reuse_address = True
        print(f"\n{'='*52}")
        print(f"  NPCIL SM-11  Welding Assignment AI  Demo")
        print(f"{'='*52}")
        print(f"\n  http://localhost:{PORT}")
        print(f"  Press Ctrl+C to stop\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
