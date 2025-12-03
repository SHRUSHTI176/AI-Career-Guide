import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_KEY:
    raise RuntimeError("❌ Missing GEMINI_API_KEY in .env")

print("🔑 Gemini API Key Loaded!")

# Gemini Client Setup
client = genai.Client(api_key=GEMINI_KEY)
MODEL_NAME = "models/gemini-2.5-flash"
print("🎯 Using Model:", MODEL_NAME)

# MongoDB Setup
if not MONGO_URI:
    raise RuntimeError("❌ Missing MONGO_URI in .env")

mongo = MongoClient(MONGO_URI)
db = mongo["career_guide"]
chats = db["sessions"]
print("💾 MongoDB Connected Successfully!")

# FastAPI Setup
app = FastAPI()

# 🌍 CORS for local + Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-career-guide-itof.vercel.app",
        "*"
    ],
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


# Fix MongoDB IDs for JSON
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


# Create New Session
@app.post("/api/v1/new-session")
async def new_session(body: SessionRequest):
    session_id = f"{body.user_id}_{uuid.uuid4().hex[:6]}"
    chats.insert_one({
        "_id": session_id,
        "user_id": body.user_id,
        "messages": []
    })
    print("🆕 New Session:", session_id)
    return {"session_id": session_id}


# Send Message + AI Reply
@app.post("/api/v1/message")
async def send_msg(body: MessageRequest):
    session = chats.find_one({"_id": body.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session Not Found ❌")

    chats.update_one(
        {"_id": body.session_id},
        {"$push": {"messages": {"role": "user", "text": body.text}}}
    )

    print("🧠 User Prompt:", body.text)

    instruction = f"""
You are Aurora Mentor — a friendly career advisor for engineering students.

Rules:
- Short helpful answers (max ~120 words)
- Break knowledge in simple parts
- Always ask a small follow-up question at the end
- Always suggest short reply buttons like:
  ["Next part ➜", "Roadmap", "Skills needed"]
- No long paragraphs

User: {body.text}
"""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[{"role": "user", "parts": [{"text": instruction}]}]
        )

        reply_text = (
            response.candidates[0].content.parts[0].text.strip()
            if response and response.candidates else "⚠ AI returned empty response"
        )

        suggestions = ["Next part ➜", "Roadmap", "Skills needed"]
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

    return {
        "session_id": body.session_id,
        "reply": reply_text,
        "suggestions": suggestions
    }


# Get Chat History
@app.get("/api/v1/history/{session_id}")
async def history(session_id: str):
    session = chats.find_one({"_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return fix_ids(session["messages"])


# Delete Session ✔️ FIX
@app.delete("/api/v1/delete/{session_id}")
async def delete_session(session_id: str):
    result = chats.delete_one({"_id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found ❌")
    return {"status": "deleted", "session_id": session_id}
