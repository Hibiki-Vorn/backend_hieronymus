import requests
import random
import string

BASE_URL = "http://localhost:3000"
OCR_FILE = "_test/test1.png"

def random_str(n=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=n))

# -------- 用户注册 & 登录 --------
username = f"user_{random_str()}"
password = "123456"

print("Registering user...")
resp = requests.post(f"{BASE_URL}/register", json={"name": username, "passwd": password})
print("Register:", resp.json())

print("Logging in...")
resp = requests.post(f"{BASE_URL}/login", json={"name": username, "passwd": password})
login_data = resp.json()
print("Login:", login_data)
token = login_data.get("token")
headers = {"Authorization": f"Bearer {token}"}

# -------- 发帖 --------
print("Creating a new post...")
resp = requests.post(f"{BASE_URL}/newpost", headers=headers, json={"content": "Hello World"})
post_data = resp.json()
post_id = post_data.get("post_id")
print("New Post:", post_data)

# -------- OCR 测试 --------
print("Testing OCR...")
with open(OCR_FILE, "rb") as f:
    files = {"image": f}
    resp = requests.post(f"{BASE_URL}/ocr", headers=headers, files=files)
print("OCR:", resp.json())

# -------- 评论 & 回复 --------
print("Adding a comment to the post...")
resp = requests.post(f"{BASE_URL}/commentPost", headers=headers, json={"post_id": post_id, "content": "First comment"})
comment_id = resp.json().get("post_id")
print("Comment added:", comment_id)

print("Replying to the comment...")
resp = requests.post(f"{BASE_URL}/replyComment", headers=headers, json={"comment_id": comment_id, "content": "Reply to first comment"})
reply_id = resp.json().get("post_id")
print("Reply added:", reply_id)

# -------- 点赞 & 收藏 --------
print("Liking the post...")
resp = requests.post(f"{BASE_URL}/likePost", headers=headers, json={"post_id": post_id})
print("Post like:", resp.json())

print("Favoriting the post...")
resp = requests.post(f"{BASE_URL}/favoritePost", headers=headers, json={"post_id": post_id})
print("Post favorite:", resp.json())

print("Liking the comment...")
resp = requests.post(f"{BASE_URL}/likeComment", headers=headers, json={"comment_id": comment_id})
print("Comment like:", resp.json())

print("Favoriting the comment...")
resp = requests.post(f"{BASE_URL}/favoriteComment", headers=headers, json={"comment_id": comment_id})
print("Comment favorite:", resp.json())

# -------- 批量评论 + 分页获取 --------
print("Adding 25 comments to test pagination...")
for i in range(25):
    content = f"Comment {i+1}"
    requests.post(f"{BASE_URL}/commentPost", headers=headers, json={"post_id": post_id, "content": content})

# 获取第一页（10条）
resp = requests.get(f"{BASE_URL}/getPostComment", params={"post_id": post_id, "page": 1, "pageSize": 10})
page1 = resp.json()
print(f"Page 1 (10): {len(page1)} comments")

# 获取第三页（5条）
resp = requests.get(f"{BASE_URL}/getPostComment", params={"post_id": post_id, "page": 3, "pageSize": 10})
page3 = resp.json()
print(f"Page 3 (5 expected): {len(page3)} comments")

# -------- 获取评论回复 --------
resp = requests.get(f"{BASE_URL}/getCommentReply", params={"comment_id": comment_id})
replies = resp.json()
print(f"Replies to first comment: {len(replies)}")

print("Full test finished.")
