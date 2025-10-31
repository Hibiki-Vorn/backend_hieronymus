import requests
import base64
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # 脚本所在目录
file_path = os.path.join(BASE_DIR, "oneword.png")

with open(file_path, "rb") as f:
    resp = requests.post("http://localhost:3000/ocr", files={"image": f})

print(resp.json())
