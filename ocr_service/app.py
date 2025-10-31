import base64
from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import numpy as np
import cv2

app = Flask(__name__)

# 只用 use_textline_orientation，不传 use_angle_cls
ocr = PaddleOCR(use_textline_orientation=True, lang='en')

import numpy as np

def to_serializable(obj):
    import numpy as np
    import PIL

    # numpy 数组或标量
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, (np.int32, np.int64)):
        return int(obj)

    # PIL 或字体对象
    elif isinstance(obj, (PIL.Image.Image, PIL.ImageFont.ImageFont)):
        return f"<{obj.__class__.__name__}>"

    # 列表或字典递归处理
    elif isinstance(obj, list):
        return [to_serializable(i) for i in obj]
    elif isinstance(obj, dict):
        result = {}
        for k, v in obj.items():
            try:
                result[k] = to_serializable(v)
            except Exception:
                result[k] = f"<Unserializable {type(v).__name__}>"
        return result

    # 其他常见类型直接返回
    elif isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj

    # 对于任何无法识别的对象类型
    else:
        return f"<Unserializable {type(obj).__name__}>"


'''
@app.route('/ocr', methods=['POST'])
def ocr_base64():
    try:
        data = request.json
        image_b64 = data.get('image_base64')
        if not image_b64:
            return jsonify({'error': 'No image data provided'}), 400

        image_bytes = base64.b64decode(image_b64)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        result = ocr.predict(img)

        # ✅ 获取纯文本并拼成字符串
        texts = result[0].get('rec_texts', [])
        text_str = " ".join(texts).strip()

        return jsonify({'text': text_str})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
'''

@app.route('/ocr', methods=['POST'])
def ocr_file():
    try:
        image_bytes = request.data
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        result = ocr.predict(img)
        texts = result[0].get('rec_texts', [])
        text_str = " ".join(texts).strip()
        return jsonify({'text': text_str})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
