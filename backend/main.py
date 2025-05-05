from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("db_cleaned.json", "r", encoding="utf-8") as f:
    raw_data = json.load(f)
    # "sarkilar" varsa dict içindedir; yoksa direkt liste olabilir
    data = list(raw_data["sarkilar"].values()) if isinstance(raw_data, dict) and "sarkilar" in raw_data else raw_data

@app.get("/sarkilar")
def get_sarkilar():
    return data
