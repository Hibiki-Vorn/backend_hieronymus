import requests
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
file_path1 = os.path.join(BASE_DIR, "test1.png")
file_path2 = os.path.join(BASE_DIR, "test2.png")

with open(file_path1, "rb") as f:
    resp1 = requests.post("http://localhost:3000/ocr", files={"image": f})

with open(file_path2, "rb") as f:
    resp2 = requests.post("http://localhost:3000/ocr", files={"image": f})

print(resp1.json())
print(resp2.json())

