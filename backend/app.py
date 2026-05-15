"""
Smart Parking — AI Backend (Flask)
====================================
Loads the trained Keras model and serves a /predict endpoint.
"""

import io
import os
import numpy as np
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from PIL import Image
import tensorflow as tf

# -------------------------------------------------------------------------
# Config
# -------------------------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'parking_ai_model.keras')
IMG_SIZE = (224, 224)
CLASS_NAMES = ['Empty', 'Occupied']

# -------------------------------------------------------------------------
# App init
# -------------------------------------------------------------------------
app = Flask(__name__)

# Allow all websites to call this API for demo
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
# Routes
# -------------------------------------------------------------------------
@app.route('/', methods=['GET'])
def index():
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
        response = make_response("", 204)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return response

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