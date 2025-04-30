from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

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
