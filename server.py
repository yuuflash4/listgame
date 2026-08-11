import os
import sys
import json
import time
import uuid
import socket
import mimetypes
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from drive_service import upload_to_google_drive, get_drive_config, save_drive_config

mimetypes.init()
mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('text/javascript', '.mjs')

PORT = 8999
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
DATA_FILE = os.path.join(DATA_DIR, 'custom_games.json')

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}

RATE_LIMIT_STORE = {}
RATE_LIMIT_WINDOW = 60  # seconds
MAX_REQUESTS_PER_MINUTE = 60

def check_rate_limit(ip):
    now = time.time()
    if ip not in RATE_LIMIT_STORE:
        RATE_LIMIT_STORE[ip] = []
    RATE_LIMIT_STORE[ip] = [t for t in RATE_LIMIT_STORE[ip] if now - t < RATE_LIMIT_WINDOW]
    if len(RATE_LIMIT_STORE[ip]) >= MAX_REQUESTS_PER_MINUTE:
        return False
    RATE_LIMIT_STORE[ip].append(now)
    return True

class PemilihanGameRequestHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        try:
            sys.stderr.write("%s - - [%s] %s\n" %
                             (self.address_string(),
                              self.log_date_time_string(),
                              format % args))
            sys.stderr.flush()
        except Exception:
            pass

    def guess_type(self, path):
        if path.endswith('.js') or path.endswith('.mjs'):
            return 'text/javascript'
        return super().guess_type(path)

    def end_headers(self):
        origin = self.headers.get('Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Access-Control-Allow-Origin', origin)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-App-Secret')
        super().end_headers()

    def do_HEAD(self):
        if self.path.startswith('/api/drive_config'):
            self.send_json(get_drive_config(), is_head=True)
            return
        if self.path.startswith('/api/data'):
            self.send_json([], is_head=True)
            return
        return super().do_HEAD()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status=200, is_head=False):
        res_data = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(res_data)))
        self.end_headers()
        if not is_head:
            self.wfile.write(res_data)

    def do_GET(self):
        if self.path.startswith('/api/drive_config'):
            self.send_json(get_drive_config())
            return

        if self.path.startswith('/api/data'):
            store_data = []
            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, 'r', encoding='utf-8') as f:
                        store_data = json.load(f)
                except Exception:
                    pass
            self.send_json(store_data)
            return

        # Serve static files or fallback
        clean_path = self.path.split('?')[0]
        if clean_path in ['/kalkulator', '/kalkulator/']:
            kalk_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kalkulator.html')
            if os.path.exists(kalk_file):
                try:
                    with open(kalk_file, 'rb') as f:
                        content = f.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/html; charset=utf-8')
                    self.send_header('Content-Length', str(len(content)))
                    self.end_headers()
                    self.wfile.write(content)
                    return
                except Exception as e:
                    pass

        if not clean_path.startswith('/api/') and not clean_path.startswith('/uploads/'):
            target_file = self.translate_path(clean_path)
            if not os.path.exists(target_file) or os.path.isdir(target_file):
                if not any(clean_path.endswith(ext) for ext in ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.json']):
                    index_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'index.html')
                    try:
                        with open(index_file, 'rb') as f:
                            content = f.read()
                        self.send_response(200)
                        self.send_header('Content-Type', 'text/html; charset=utf-8')
                        self.send_header('Content-Length', str(len(content)))
                        self.end_headers()
                        self.wfile.write(content)
                        return
                    except Exception as e:
                        print("SPA ERROR:", e, file=sys.stderr)

        return super().do_GET()

    def do_POST(self):
        client_ip = self.client_address[0]
        if not check_rate_limit(client_ip):
            self.send_json({"status": "error", "message": "Too Many Requests. Rate limit exceeded."}, status=429)
            return

        if self.path.startswith('/api/data'):
            try:
                length = int(self.headers.get('Content-Length', 0))
                if length > 5 * 1024 * 1024:
                    self.send_json({"status": "error", "message": "Payload size exceeds 5MB limit."}, status=413)
                    return
                body = self.rfile.read(length)
                payload = json.loads(body.decode('utf-8'))
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(payload, f, indent=2, ensure_ascii=False)
                self.send_json({"status": "success", "message": "Data custom games tersimpan di server lokal!"})
            except Exception as e:
                self.send_json({"status": "error", "message": str(e)}, status=500)
            return

        if self.path.startswith('/api/drive_config'):
            try:
                length = int(self.headers.get('Content-Length', 0))
                data = self.rfile.read(length)
                new_cfg = json.loads(data.decode('utf-8'))
                save_drive_config(new_cfg)
                self.send_json({"status": "success", "message": "Konfigurasi Google Drive berhasil disimpan!"})
            except Exception as e:
                self.send_json({"status": "error", "message": str(e)}, status=500)
            return

        if self.path.startswith('/upload_cover'):
            try:
                length = int(self.headers.get('Content-Length', 0))
                if length > MAX_UPLOAD_SIZE:
                    self.send_json({"status": "error", "message": "Ukuran file melebihi batas 10MB."}, status=413)
                    return

                post_data = self.rfile.read(length) if length > 0 else b''
                ext = '.jpg'
                file_content = post_data

                if b'filename="' in post_data:
                    try:
                        part = post_data.split(b'filename="')[1]
                        fn_str = part.split(b'"')[0].decode('utf-8', errors='ignore')
                        ext = os.path.splitext(fn_str)[1].lower() or '.jpg'
                        
                        ct_header = self.headers.get('Content-Type', '')
                        boundary = None
                        if 'boundary=' in ct_header:
                            b_str = ct_header.split('boundary=', 1)[1].split(';')[0].strip()
                            boundary = f"--{b_str}".encode('utf-8')

                        headers_and_body = post_data.split(b'\r\n\r\n', 1)[1]
                        if boundary and boundary in headers_and_body:
                            file_content = headers_and_body.rsplit(boundary, 1)[0].rstrip(b'\r\n')
                        else:
                            file_content = headers_and_body.rsplit(b'\r\n--', 1)[0]
                    except Exception:
                        ext = '.jpg'
                        file_content = post_data

                if ext not in ALLOWED_EXTENSIONS:
                    self.send_json({"status": "error", "message": f"Tipe file '{ext}' tidak diizinkan."}, status=400)
                    return

                unique_id = uuid.uuid4().hex[:12]
                filename = f"cover_{int(time.time())}_{unique_id}{ext}"
                filepath = os.path.join(UPLOAD_DIR, filename)

                with open(filepath, 'wb') as f:
                    f.write(file_content)

                local_url = f"/uploads/{filename}"
                drive_url = upload_to_google_drive(filepath, filename)

                final_url = drive_url if drive_url else local_url
                is_google = bool(drive_url)

                self.send_json({
                    "status": "success",
                    "url": final_url,
                    "filename": filename,
                    "is_google_drive": is_google,
                    "message": "Cover game terunggah ke Google Drive!" if is_google else "Cover game terunggah ke penyimpanan lokal server."
                })
            except Exception as e:
                self.send_json({"status": "error", "message": str(e)}, status=500)
            return

        self.send_json({"status": "error", "message": "Not Found"}, status=404)

class IPv6HTTPServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6

def serve_ipv4():
    try:
        server4 = ThreadingHTTPServer(('0.0.0.0', PORT), PemilihanGameRequestHandler)
        server4.serve_forever()
    except Exception as e:
        print("IPv4 Server error:", e, file=sys.stderr)

def serve_ipv6():
    try:
        server6 = IPv6HTTPServer(('::1', PORT), PemilihanGameRequestHandler)
        server6.serve_forever()
    except Exception:
        pass

if __name__ == '__main__':
    import threading
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f"Starting Grandia Game Tavern Server on http://127.0.0.1:{PORT} / http://localhost:{PORT}...")
    t6 = threading.Thread(target=serve_ipv6, daemon=True)
    t6.start()
    serve_ipv4()
