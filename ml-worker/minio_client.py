import os
from minio import Minio
from dotenv import load_dotenv

load_dotenv()
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET")

client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=True,
)


def download_receipt(object_name, local_path):
    try:
        client.fget_object(MINIO_BUCKET, object_name, local_path)
        print(f"[*] Downloaded {object_name} to {local_path}")
        return True
    except Exception as e:
        print(f"[!] MinIO Download Error: {e}")
        return False
