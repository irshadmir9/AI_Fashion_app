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

def filter_by_keywords(items: List[Item], keywords: List[str]) -> List[Item]:
    filtered: List[Item] = []
    for item in items:
        item_type = item.type.lower()
        for k in keywords:
            if k in item_type:
                filtered.append(item)
                break
    return filtered

TOP_KEYWORDS = ["shirt", "tee", "blouse", "hoodie", "sweater", "t-shirt", "top"]
BOTTOM_KEYWORDS = ["pants", "jeans", "shorts", "skirt", "trousers"]
OUTER_KEYWORDS = ["jacket", "coat", "blazer"]

@app.get("/outfits")
def suggest_outfits(count: int = 3):
    tops = filter_by_keywords(items_db, TOP_KEYWORDS)
    bottoms = filter_by_keywords(items_db, BOTTOM_KEYWORDS)
    outers = filter_by_keywords(items_db, OUTER_KEYWORDS)

    outfits = []
    max_combinations = len(tops) * len(bottoms)
    for _ in range(min(count, max_combinations)):
        t = random.choice(tops)
        b = random.choice(bottoms)
        if t.color.lower() == b.color.lower() and len(bottoms) > 1:
            b = random.choice(
                [x for x in bottoms 
                if x.color.lower() != t.color.lower()])
        outfit = [t, b]
        if outers and random.random() < 0.5:
            outfit.append(random.choice(outers))
        outfits.append(outfit)

    return {"outfits": outfits}
    
