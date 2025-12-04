import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId

import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_KEY:
    raise RuntimeError("❌ Missing GEMINI_API_KEY in environment!")

print("🔑 Gemini API Key Loaded!")

# Gemini Setup
genai.configure(api_key=GEMINI_KEY)
MODEL_NAME = "gemini-2.5-flash"
model = genai.GenerativeModel(MODEL_NAME)
print("🎯 Using Model:", MODEL_NAME)

# MongoDB Setup
if not MONGO_URI:
    raise RuntimeError("❌ Missing MONGO_URI in environment!")

mongo = MongoClient(MONGO_URI)
db = mongo["career_guide"]
chats = db["sessions"]
print("💾 MongoDB Connected Successfully!")

# FastAPI Setup
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class SessionRequest(BaseModel):
    user_id: str

class MessageRequest(BaseModel):
    session_id: str
    user_id: str
    text: str

# Fix ObjectId in JSON
def fix_ids(data):
    if isinstance(data, list):
        return [fix_ids(i) for i in data]
    if isinstance(data, dict):
        return {k: fix_ids(v) for k, v in data.items()}
    if isinstance(data, ObjectId):
        return str(data)
    return data

@app.get("/")
async def home():
    return {"status": "ok", "message": "AI Career Guide Backend Running 🚀"}

# Create New Chat Session
@app.post("/api/v1/new-session")
async def new_session(body: SessionRequest):
    session_id = f"{body.user_id}_{uuid.uuid4().hex[:6]}"
    chats.insert_one({
        "_id": session_id,
        "user_id": body.user_id,
        "messages": []
    })
    print("🆕 Session:", session_id)
    return {"session_id": session_id}

# Send Message to AI
@app.post("/api/v1/message")
async def send_msg(body: MessageRequest):

    session = chats.find_one({"_id": body.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session Not Found ❌")

    # Save user message
    chats.update_one(
        {"_id": body.session_id},
        {"$push": {"messages": {"role": "user", "text": body.text}}}
    )

    print("🧠 User:", body.text)

    prompt = f"""
You are Aurora Mentor — a friendly career guide AI for engineering students.
Respond in clear points:
- Max 120 words
- Bullet points only
- End with a follow-up question

User: {body.text}
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.5,
                "top_p": 0.9,
                "response_mime_type": "text/plain"
            }
        )

        reply_text = response.text.strip()

        suggestions = ["Next ➜", "Roadmap", "Skills needed"]
        if "?" in reply_text:
            suggestions.insert(0, "Answer ➜")

    except Exception as e:
        reply_text = f"⚠ AI Error: {str(e)}"
        suggestions = []

    ai_msg = {"role": "ai", "text": reply_text, "suggestions": suggestions}
    chats.update_one(
        {"_id": body.session_id},
        {"$push": {"messages": ai_msg}}
    )

    return {"reply": reply_text, "suggestions": suggestions}

# Fetch History
@app.get("/api/v1/history/{session_id}")
async def history(session_id: str):
    session = chats.find_one({"_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session Not Found ❌")
    return fix_ids(session["messages"])


# Delete Chat Session
@app.delete("/api/v1/delete/{session_id}")
async def delete_session(session_id: str):
    result = chats.delete_one({"_id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session Not Found ❌")
    return {"status": "deleted", "session_id": session_id}


# 🔊 TTS API — Speak Aurora Mentor replies
@app.post("/api/v1/speak")
async def speak(body: dict):
    text = body.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")

    try:
        response = model.generate_content(
            text,
            generation_config={
                "response_mime_type": "audio/wav"
            }
        )

        audio_data = response.audio
        file_path = "tts.wav"
        with open(file_path, "wb") as f:
            f.write(audio_data)

        return {"url": "/audio/tts.wav"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Serve Audio File
from fastapi.staticfiles import StaticFiles
app.mount("/audio", StaticFiles(directory="."), name="audio")
