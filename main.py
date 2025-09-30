from config import API_KEY
import google.generativeai as genai
import PIL.Image
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import sqlite3
import json

# --- DATABASE SETUP ---
DATABASE_NAME = "closet.db"

def setup_database():
    # Connect to the database (this will create the file if it doesn't exist)
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    # Create a table to store clothes if it doesn't exist yet
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clothes (
        id INTEGER PRIMARY KEY,
        description TEXT NOT NULL,
        type TEXT,
        main_color TEXT,
        category TEXT,
        pattern TEXT,
        occasion TEXT,
        season TEXT,
        formality TEXT
    )
    """)
    
    # Save the changes and close the connection
    conn.commit()
    conn.close()

def is_neutral(color: str):
    """Checks if a color is in the list of neutral colors."""
    neutrals = ['white', 'cream', 'black', 'gray', 'grey', 'beige', 'denim']
    # The 'in' operator returns a boolean, so we can return it directly
    return color.lower() in neutrals

# Run the setup function right when the app starts
setup_database()
# --- END DATABASE SETUP ---

genai.configure(api_key=API_KEY)

app = FastAPI()

# --- NEW CODE: Mount the static directory ---
app.mount("/static", StaticFiles(directory="static"), name="static")


# --- NEW CODE: Endpoint to serve the HTML file ---
@app.get("/", response_class=HTMLResponse)
async def serve_html():
    with open("static/index.html", encoding="utf-8") as f:
        return HTMLResponse(content=f.read(), status_code=200)


@app.post("/analyze-image/")
async def analyze_image(file: UploadFile = File(...)):
    img = PIL.Image.open(file.file)
    
    # A more specific prompt asking for a JSON response
    prompt = """
    Analyze the primary clothing item in this image. Respond with ONLY a valid JSON object.
    The JSON object must have eight keys: "type", "main_color", "description", "category", "pattern", "formality", "season", and "occasion".

    - "type": A specific word like "t-shirt", "jeans", "sweater".
    - "main_color": The dominant color.
    - "description": The full, detailed text description.
    - "category": Classify as "top", "bottom", or "outerwear".
    - "pattern": Describe the pattern, like "solid", "striped", "plaid", or "graphic".
    - "formality": Choose one: "casual", "business casual", "formal".
    - "season": Choose one: "Spring", "Summer", "Fall", "Winter".
    - "occasion": Choose one: "everyday", "work", "weekend", "evening", "gym".
    """
    
    model = genai.GenerativeModel('gemini-pro-latest')
    response = model.generate_content([prompt, img])

    print("Raw AI Response:", response.text)
    
    # --- NEW DATABASE CODE ---
    try:
        # --- NEW CODE: Clean the AI's response ---
        # Find the start and end of the JSON object within the text
        start_index = response.text.find('{')
        end_index = response.text.rfind('}') + 1

        # Extract just the JSON part
        clean_json_text = response.text[start_index:end_index]

        # Parse the CLEANED JSON text
        clothing_data = json.loads(clean_json_text)

        # --- The rest of the code is the same ---
        # Connect to the database
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()

        # Insert the new clothing item into the table
        cursor.execute(
            "INSERT INTO clothes (description, type, main_color, category, pattern, occasion, season, formality) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                clothing_data['description'],
                clothing_data['type'],
                clothing_data['main_color'],
                clothing_data['category'],
                clothing_data['pattern'],
                clothing_data['occasion'],
                clothing_data['season'],
                clothing_data['formality']
            )
        )

        conn.commit()
        conn.close()

        # Send the description back to the frontend like before
        return {"description": clothing_data['description']}

    except Exception as e:
        print(f"An error occurred: {e}")
        # Also print the problematic text for future debugging
        print(f"Problematic AI Response: {response.text}")
        return {"description": "Sorry, there was an error processing the image."}
    
@app.get("/suggest-outfit/")
async def suggest_outfit(occasion: str, season: str):
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row 
    cursor = conn.cursor()
    
    # --- Fetch all tops ---
    cursor.execute("SELECT * FROM clothes WHERE category = 'top' AND occasion = ? AND season = ?", (occasion, season))
    tops = cursor.fetchall()
    
    # --- Fetch all bottoms ---
    cursor.execute("SELECT * FROM clothes WHERE category = 'bottom' AND occasion = ? AND season = ?", (occasion, season))
    bottoms = cursor.fetchall()
    
    conn.close()
    
    # --- OUTFIT LOGIC GOES HERE ---
    # Score every possible combination
    possible_outfits = []
    for top in tops:
        for bottom in bottoms:
            score = 0
            # Rule 1: Formality must match
            if top['formality'] == bottom['formality']:
                score += 1
            # Rule 2: Colors must be compatible
            if is_neutral(top['main_color']) or is_neutral(bottom['main_color']):
                score += 1
            
            possible_outfits.append({"top": dict(top), "bottom": dict(bottom), "score": score})
    
    # Filter for the best outfits, as you suggested
    two_star_outfits = [outfit for outfit in possible_outfits if outfit['score'] == 2]
    one_star_outfits = [outfit for outfit in possible_outfits if outfit['score'] == 1]

    if len(two_star_outfits) > 0:
        return {"best_outfits": two_star_outfits[:5]} # Return up to 5 best outfits
    elif len(one_star_outfits) > 0:
        return {"good_outfits": one_star_outfits[:5]} # Return up to 5 good outfits
    else:
        return {"message": "No suitable outfits found for this occasion and season."}
