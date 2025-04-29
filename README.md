# AI_Fashion_app

**Status:** MVP in progress 🚀

## 📖 Overview
AI Fashion App helps users build a digital closet and get outfit suggestions  
based on weather, occasion, and color theory.

## 🛠️ Tech Stack
- **Mobile Frontend:** React Native (Expo + TypeScript)  
- **Backend API:** FastAPI (Python 3.10+)  
- **Database:** (e.g. PostgreSQL / SQLite)  
- **Hosting:** (TBD—e.g. Heroku / Vercel / AWS)

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS) & npm  
- Python 3.10+  
- Git

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/ai-fashion-app.git
cd ai-fashion-app

# 2. Frontend setup
cd frontend
npm install
expo start

# 3. Backend setup (in a new terminal window)
cd backend
python -m venv venv
source venv/bin/activate       # or .\venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
uvicorn main:app --reload