import pika
import json
import os
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from dotenv import load_dotenv
from minio_client import download_receipt
from ocr_processor import process_receipt

load_dotenv()
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST")
QUEUE_NAME = os.getenv("RABBITMQ_QUEUE")
REPLY_EXCHANGE = os.getenv("RABBITMQ_REPLY_EXCHANGE")
REPLY_ROUTING_KEY = os.getenv("RABBITMQ_REPLY_ROUTING_KEY")
RABBITMQ_USER = os.getenv("RABBITMQ_USER")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD")
RABBITMQ_VHOST = os.getenv("RABBITMQ_VHOST")

# Ensure temporary folder exists
os.makedirs("temp_receipts", exist_ok=True)


# DUMMY SERVER CODE
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"ML Worker is running!")


def start_dummy_server():
    HTTPServer(("0.0.0.0", 7860), HealthCheckHandler).serve_forever()


def handle_message(ch, method, properties, body):
    message = json.loads(body)
    expense_id = message.get("expenseId")
    image_url = message.get("imageUrl")

    print(f"\n[*] Received new receipt!")
    try:
        object_name = image_url.split("/expense-tracker-receipts/")[-1]
        local_file_path = f"temp_receipts/receipt_{expense_id}.jpg"
        success = download_receipt(object_name, local_file_path)

        if success:
            print("[*] Image successfully downloaded.")
            # Run OCR
            extracted_data = process_receipt(local_file_path)

            # Send data back to RabbitMQ
            result = {"expenseId": expense_id, "extractedData": extracted_data}

            ch.basic_publish(
                exchange=REPLY_EXCHANGE,
                routing_key=REPLY_ROUTING_KEY,
                body=json.dumps(result),
            )

            # Clean up the image file
            if os.path.exists(local_file_path):
                os.remove(local_file_path)
        else:
            raise Exception("Failed to download image from MinIO")

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print("Error:", e)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def main():
    # START THE DUMMY SERVER FIRST
    threading.Thread(target=start_dummy_server, daemon=True).start()
    print("[*] Dummy web server started on port 7860")

    # Connect to RabbitMQ
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        credentials=credentials,
        virtual_host=RABBITMQ_VHOST,
        heartbeat=600,
        blocked_connection_timeout=300,
    )
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    # Ensure queue exists
    channel.queue_declare(queue=QUEUE_NAME, durable=True)

    channel.basic_qos(prefetch_count=1)  # Process one message at a time
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=handle_message)

    print(f"[*] Waiting for messages. To exit press CTRL+C")
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        channel.stop_consuming()
        connection.close()


if __name__ == "__main__":
    main()
