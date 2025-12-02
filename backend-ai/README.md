1. Create .env from .env.example and fill MONGO_URI and optionally GEMINI_API_KEY
2. Create and activate Python venv:
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
3. Install:
   pip install -r requirements.txt
4. Run:
   uvicorn app:app --reload --port 8000
5. Test:
   POST http://localhost:8000/api/v1/message
   Body: { "user_id": "guest1", "text": "I want to be a data scientist" }
