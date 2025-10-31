import base64
from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import numpy as np
import cv2

app = Flask(__name__)

# 只用 use_textline_orientation，不传 use_angle_cls
ocr = PaddleOCR(use_textline_orientation=True, lang='en')

@app.route('/ocr', methods=['POST'])
def ocr_base64():
    try:
        data = request.json
        image_b64 = data.get('image_base64')
        if not image_b64:
            return jsonify({'error': 'No image data provided'}), 400

        # 解码 base64 并转成 OpenCV 图片
        image_bytes = base64.b64decode(image_b64)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 新版 PaddleOCR 用 predict()，不要 cls 参数
        result = ocr.predict(img)

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
