import requests
import base64
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # 脚本所在目录
file_path = os.path.join(BASE_DIR, "test.png")

with open(file_path, "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

resp = requests.post(
    "http://localhost:5000/ocr",
    json={"image_base64": img_b64}
)
print(resp.json())
