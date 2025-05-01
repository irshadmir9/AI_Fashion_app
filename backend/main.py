from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    type: str
    color: str
    brand: str

items_db: List[Item] = []

@app.post("/items")
def add_item(item: Item):
    items_db.append(item)
    return {"message": "Item added", "item": item}

@app.get("/items", response_model=List[Item])
def list_items():
    return items_db

TOP_KEYWORDS = ["shirt", "tee", "blouse", "hoodie", "sweater", "t-shirt", "top"]
BOTTOM_KEYWORDS = ["pants", "jeans", "shorts", "skirt", "trousers"]
OUTER_KEYWORDS = ["jacket", "coat", "blazer"]

@app.get("/outfits")
def suggest_outfits(count: int = 3):

    def by_keywords(keywords)