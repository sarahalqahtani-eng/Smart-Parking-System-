"""
Smart Parking — AI Backend (Flask)
====================================
Loads the trained Keras model and serves a /predict endpoint.
Run locally on the same machine as the browser:

    pip install -r requirements.txt
    python app.py

Then open the website. In the website's settings, set:
    AI Backend URL: http://localhost:5000
"""

import io
import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import tensorflow as tf

# -------------------------------------------------------------------------
# Config
# -------------------------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'parking_ai_model.keras')
IMG_SIZE = (224, 224)

# Class mapping — keras `image_dataset_from_directory` sorts alphabetically:
#   'Empty'    -> 0
#   'Occupied' -> 1
# Model outputs a single sigmoid value:
#   < 0.5  => Empty
#   >= 0.5 => Occupied
CLASS_NAMES = ['Empty', 'Occupied']

# -------------------------------------------------------------------------
# App init
# -------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)  # Allow the website (running on any origin) to call this API

print(f'Loading model from {MODEL_PATH} ...')
model = tf.keras.models.load_model(MODEL_PATH)
print(f'Model loaded. Input shape: {model.input_shape}')


# -------------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------------
def preprocess(image_bytes: bytes) -> np.ndarray:
    """Convert raw image bytes -> (1, 224, 224, 3) float32 tensor.
    The model has a Rescaling layer inside, so we pass values in [0, 255]."""
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32)  # (224, 224, 3) in [0, 255]
    arr = np.expand_dims(arr, axis=0)       # (1, 224, 224, 3)
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


@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded. Send as form-data field "image".'}), 400

    file = request.files['image']
    try:
        image_bytes = file.read()
        x = preprocess(image_bytes)
    except Exception as e:
        return jsonify({'error': f'Could not read image: {e}'}), 400

    # Inference
    pred = model.predict(x, verbose=0)
    # Sigmoid output, shape (1, 1)
    score = float(pred[0][0])

    # 0..1 -> class
    if score >= 0.5:
        label = 'Occupied'
        confidence = score
    else:
        label = 'Empty'
        confidence = 1.0 - score

    return jsonify({
        'result': label,           # 'Empty' or 'Occupied'
        'confidence': confidence,  # 0.0 .. 1.0
        'raw_score': score,        # For debugging
    })


# -------------------------------------------------------------------------
# Entry
# -------------------------------------------------------------------------
if __name__ == '__main__':
    # host=0.0.0.0 so it's reachable from other devices on the network.
    # debug=False so Tensorflow loading doesn't reload twice.
    app.run(host='0.0.0.0', port=5000, debug=False)
