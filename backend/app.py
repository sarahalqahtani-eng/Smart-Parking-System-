"""
Smart Parking — AI Backend + Website Server (Flask)
===================================================
Serves the website pages and the /predict AI endpoint from the same Render link.
"""

import io
import os
import numpy as np
from flask import Flask, request, jsonify, make_response, send_from_directory
from flask_cors import CORS
from PIL import Image
import tensorflow as tf

# -------------------------------------------------------------------------
# Paths / Config
# -------------------------------------------------------------------------
BACKEND_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

MODEL_PATH = os.path.join(BACKEND_DIR, 'parking_ai_model.keras')
IMG_SIZE = (224, 224)
CLASS_NAMES = ['Empty', 'Occupied']

# -------------------------------------------------------------------------
# App init
# -------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response("", 204)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return response

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

print(f'Loading model from {MODEL_PATH} ...')
model = tf.keras.models.load_model(MODEL_PATH)
print(f'Model loaded. Input shape: {model.input_shape}')


# -------------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------------
def preprocess(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)
    return arr


# -------------------------------------------------------------------------
# Website Routes
# -------------------------------------------------------------------------
@app.route('/', methods=['GET'])
def home_page():
    return send_from_directory(PROJECT_ROOT, 'index.html')


@app.route('/index.html', methods=['GET'])
def index_html():
    return send_from_directory(PROJECT_ROOT, 'index.html')


@app.route('/reservation.html', methods=['GET'])
def reservation_page():
    return send_from_directory(PROJECT_ROOT, 'reservation.html')


@app.route('/ai-analyzer.html', methods=['GET'])
def ai_analyzer_page():
    return send_from_directory(PROJECT_ROOT, 'ai-analyzer.html')


@app.route('/css/<path:filename>', methods=['GET'])
def css_files(filename):
    return send_from_directory(os.path.join(PROJECT_ROOT, 'css'), filename)


@app.route('/js/<path:filename>', methods=['GET'])
def js_files(filename):
    return send_from_directory(os.path.join(PROJECT_ROOT, 'js'), filename)


@app.route('/assets/<path:filename>', methods=['GET'])
def asset_files(filename):
    return send_from_directory(os.path.join(PROJECT_ROOT, 'assets'), filename)


# -------------------------------------------------------------------------
# API Routes
# -------------------------------------------------------------------------
@app.route('/api', methods=['GET'])
def api_info():
    return jsonify({
        'name': 'Smart Parking AI Backend',
        'model': MODEL_PATH,
        'classes': CLASS_NAMES,
        'endpoints': {'POST /predict': 'Upload an image as form-data field "image"'},
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == "OPTIONS":
        return make_response("", 204)

    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded. Send as form-data field "image".'}), 400

    file = request.files['image']

    try:
        image_bytes = file.read()
        x = preprocess(image_bytes)
    except Exception as e:
        return jsonify({'error': f'Could not read image: {e}'}), 400

    pred = model.predict(x, verbose=0)
    score = float(pred[0][0])

    if score >= 0.5:
        label = 'Occupied'
        confidence = score
    else:
        label = 'Empty'
        confidence = 1.0 - score

    return jsonify({
        'result': label,
        'confidence': confidence,
        'raw_score': score,
    })


# -------------------------------------------------------------------------
# Entry
# -------------------------------------------------------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)