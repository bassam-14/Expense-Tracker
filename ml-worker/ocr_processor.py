import easyocr
import re
from dateutil import parser
import joblib
import numpy as np

# Initialize Model
reader = easyocr.Reader(["en"])

try:
    classifier = joblib.load("receipt_classifier.pkl")
except FileNotFoundError:
    print("Warning: Model not found. Categories will default to 'Other'.")
    classifier = None


def predict_receipt(ocr_text, threshold=0.4):
    """Predicts category using the ML model, defaulting to 'Other' if uncertain."""
    if classifier is None:
        return "Other"

    probs = classifier.predict_proba([ocr_text])[0]
    max_prob = np.max(probs)
    if max_prob < threshold:
        return "Other"

    return classifier.classes_[np.argmax(probs)]


def process_receipt(image_path):
    # Extract Text
    raw_results = reader.readtext(image_path)
    full_text = " ".join([res[1] for res in raw_results])

    merchant = raw_results[0][1] if raw_results else "Unknown"

    # Date Regex extraction
    date_pattern = r"(?i)(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,\s\-]+\d{1,2}[,\s\-]+\d{2,4}|\d{1,2}[,\s\-]+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,\s\-]+\d{2,4})"
    date_match = re.search(date_pattern, full_text)
    raw_date = date_match.group(0) if date_match else None
    date = None

    if raw_date:
        try:
            parsed_date = parser.parse(raw_date)
            date = parsed_date.strftime("%Y-%m-%d")
        except:
            date = None

    # Total
    raw_prices = re.findall(r"(\d[\d\s]*[\,\.]\s*\d{2})\b", full_text)

    cleaned_prices = []
    for raw in raw_prices:
        # Clean the OCR
        clean_str = raw.replace(" ", "")
        clean_str = clean_str.replace(",", ".")

        try:
            cleaned_prices.append(float(clean_str))
        except ValueError:
            pass

    # Take the highest valid number as the Total
    total = max(cleaned_prices) if cleaned_prices else 0.0
    category = predict_receipt(full_text)

    return {"Merchant": merchant, "Date": date, "Total": total, "Category": category}
