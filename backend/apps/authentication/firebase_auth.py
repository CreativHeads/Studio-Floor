import os
import json
import firebase_admin
from firebase_admin import auth, credentials

def initialize_firebase():
    if not firebase_admin._apps:
        # Check if we have credentials in env vars
        firebase_cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH')
        firebase_cred_json = os.environ.get('FIREBASE_CREDENTIALS_JSON')
        
        try:
            if firebase_cred_json:
                cred_dict = json.loads(firebase_cred_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
            elif firebase_cred_path and os.path.exists(firebase_cred_path):
                cred = credentials.Certificate(firebase_cred_path)
                firebase_admin.initialize_app(cred)
            else:
                # If no file is provided, try default initialization (works in GCP or if GOOGLE_APPLICATION_CREDENTIALS is set)
                firebase_admin.initialize_app()
        except Exception as e:
            print(f"Firebase Admin SDK initialization warning: {e}")

def verify_firebase_token(id_token):
    initialize_firebase()
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Error verifying Firebase token: {e}")
        return None
