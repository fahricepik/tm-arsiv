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
    if isinstance(raw_data, dict) and "sarkilar" in raw_data and isinstance(raw_data["sarkilar"], dict):
        data = list(raw_data["sarkilar"].values())
    else:
        data = raw_data

@app.get("/sarkilar")
def get_sarkilar():
    return data
