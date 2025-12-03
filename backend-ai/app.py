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

# Gemini Client Setup
genai.configure(api_key=GEMINI_KEY)

MODEL_NAME = "models/gemini-2.5-flash-001"  # Updated working model
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

# CORS for local + deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-career-guide-o54n.vercel.app",
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


# Fix MongoDB IDs
def fix_ids(data):
    if isinstance(data, list):
        return [fix_ids(i) for i in data]
    if isinstance(data, dict):
        return {k: fix_ids(v) for k, v in data.items()}
    if isinstance(data, ObjectId):
        return str(data)
    return data


# Root Route
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

    print("🆕 New Session Created:", session_id)
    return {"session_id": session_id}


# Chat Processing Route
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
You are Aurora Mentor — a friendly career advisor for engineering students.

Rules:
- Short helpful answers (max 120 words)
- Break knowledge into simple bullet points
- End with a small follow-up question
- Always suggest reply buttons: ["Next ➜", "Roadmap", "Skills needed"]

User: {body.text}
"""

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)

        reply_text = response.text.strip() if response.text else "⚠ AI returned an empty reply."

        suggestions = ["Next ➜", "Roadmap", "Skills needed"]
        if "?" in reply_text:
            suggestions.insert(0, "Answer ➜")

    except Exception as e:
        reply_text = f"⚠ AI Error: {str(e)}"
        suggestions = []

    ai_msg = {"role": "ai", "text": reply_text, "suggestions": suggestions}

    # Save AI message
    chats.update_one(
        {"_id": body.session_id},
        {"$push": {"messages": ai_msg}}
    )

    return {"reply": reply_text, "suggestions": suggestions}


# Get Chat History
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
