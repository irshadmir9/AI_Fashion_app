# AI Fashion App

An AI-powered virtual stylist that helps you digitize your closet and suggests complete outfits, saving you time while helping you dress well.

---

## 📸 Demo
*(Here you can add a screenshot or a short screen recording GIF of your app in action)*

---

## 🚀 Features
- **AI-Powered Analysis:** Upload an image of a clothing item and let a powerful AI model analyze its properties, including type, color, formality, and more.
- **Digital Closet:** All analyzed clothing is saved to a local database, creating your own personal digital closet.
- **Smart Outfit Suggester:** Based on user-selected occasion and season, the app uses a custom algorithm to suggest complete, fashionable outfits from your closet.

---

## 🛠️ Technologies Used
- **Backend:** Python, FastAPI, Google Gemini API
- **Frontend:** HTML, CSS, JavaScript
- **Database:** SQLite

---

## ⚙️ Setup and Usage
To run this project locally:
1. Clone the repository.
2. Install the required Python packages: `pip install -r requirements.txt`
3. Create a `config.py` file with your `API_KEY`.
4. Run the server: `python -m uvicorn main:app --reload`
5. Open your browser to `http://127.0.0.1:8000`.