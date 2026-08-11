import os
import json
import base64
import requests
import mimetypes

CREDS_FILE = os.path.join(os.path.dirname(__file__), 'service_account.json')
CONFIG_FILE = os.path.join(os.path.dirname(__file__), 'drive_config.json')

def get_drive_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "folder_id": "",
        "web_app_url": ""
    }

def save_drive_config(config):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)

def upload_to_google_drive(file_path, filename):
    """
    Uploads a file to Google Drive using available method:
    1. Google Apps Script Web App Endpoint URL
    2. Google Drive API v3 via service_account.json
    Returns Google Drive file URL or None.
    """
    config = get_drive_config()
    
    # Method 1: Google Apps Script Web App Endpoint (Super Easy)
    if config.get("web_app_url"):
        try:
            with open(file_path, 'rb') as f:
                encoded = base64.b64encode(f.read()).decode('utf-8')
            
            guessed_type, _ = mimetypes.guess_type(filename)
            mime_type = guessed_type or ("image/jpeg" if filename.endswith(('.jpg', '.jpeg')) else "application/octet-stream")

            payload = {
                "filename": filename,
                "base64": encoded,
                "mimeType": mime_type
            }
            
            resp = requests.post(config["web_app_url"], json=payload, timeout=20)
            res_json = resp.json()
            if res_json.get("url"):
                return res_json["url"]
        except Exception as e:
            print(f"[Google Drive WebApp Sync Warning] {e}")

    # Method 2: Google Drive API v3 via service_account.json
    if os.path.exists(CREDS_FILE):
        try:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build
            from googleapiclient.http import MediaFileUpload

            SCOPES = ['https://www.googleapis.com/auth/drive.file']
            creds = service_account.Credentials.from_service_account_file(CREDS_FILE, scopes=SCOPES)
            service = build('drive', 'v3', credentials=creds)

            file_metadata = {'name': filename}
            if config.get("folder_id"):
                file_metadata['parents'] = [config["folder_id"]]

            media = MediaFileUpload(file_path, resumable=True)
            uploaded_file = service.files().create(body=file_metadata, media_body=media, fields='id, webViewLink').execute()

            # Set public link access
            service.permissions().create(
                fileId=uploaded_file.get('id'),
                body={'type': 'anyone', 'role': 'reader'}
            ).execute()

            return uploaded_file.get('webViewLink')
        except Exception as e:
            print(f"[Google Drive API v3 Warning] {e}")

    return None
