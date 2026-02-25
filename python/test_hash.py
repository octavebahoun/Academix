import hashlib
token = "testtoken"
print(hashlib.sha256(token.encode()).hexdigest())
