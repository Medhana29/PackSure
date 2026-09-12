from database import users_collection

def create_user(name: str, email: str, password_hash: str, role: str = "consumer"):
    result = users_collection.insert_one({
        "name": name.strip(),
        "email": email.lower().strip(),
        "password": password_hash,
        "role": role,
    })
    return str(result.inserted_id)
