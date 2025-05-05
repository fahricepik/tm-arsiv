from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

file_path = os.path.join(os.path.dirname(__file__), "db_cleaned.json")
with open(file_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# JSON içeriğini liste haline çevir
if isinstance(raw_data, dict) and "sarkilar" in raw_data:
    inner = raw_data["sarkilar"]
    if isinstance(inner, dict):
        data = list(inner.values())
    elif isinstance(inner, list):
        data = inner
    else:
        data = []
elif isinstance(raw_data, list):
    data = raw_data
else:
    data = []

@app.get("/sarkilar")
def get_sarkilar():
    return data
