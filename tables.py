import sqlite_utils
db = sqlite_utils.Database("myvoice.db")

schemas = {
    "songs": {
        "schema": {
            "id": int,
            "title": str,
            "artist": str,
            "duration": int,
            "yt_karoake_id": str,
            "yt_original_id": str,
            "time_created": int,
            "likes": int,
            "views": int,
            "range": str,
            "high_note": int,
            "low_note": int,
            "sample_rate": int,
        },
        "pk": "id"
    },
    "users": {
        "schema": {
            "username": str,
            "password_hash": str,
            "type": str,
        },
        "pk": "username"
    },
}

def create_tables():
    tables = db.table_names()
    for table, schema in schemas.items():
        if table not in tables:
            db[table].create(schema["schema"], pk=schema["pk"])
