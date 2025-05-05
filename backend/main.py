from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme için açık bırakıldı
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("db_cleaned.json", "r", encoding="utf-8") as f:
    data = json.load(f)
    if isinstance(data, dict) and "sarkilar" in data:
        data = list(data["sarkilar"].values())

@app.get("/sarkilar")
def get_sarkilar():
    return data
