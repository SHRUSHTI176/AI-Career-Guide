// src/utils/api.js

// Backend URLs
const LOCAL_BACKEND = "http://localhost:8000";
const SERVER_BACKEND = "https://ai-career-guide-backend-v2.onrender.com"; // Your deployed backend

// Auto-select backend: local or deployed
const BACKEND_URL =
  window.location.hostname === "localhost" ? LOCAL_BACKEND : SERVER_BACKEND;

// Send message to backend
export const sendMessage = async (payload) => {
  const res = await fetch(`${BACKEND_URL}/api/v1/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Message API error");
  return res.json();
};

// Fetch chat history
export const fetchHistory = async (sessionId) => {
  const res = await fetch(`${BACKEND_URL}/api/v1/history/${sessionId}`);
  if (!res.ok) throw new Error("History API error");
  return res.json();
};

// Create a new chat session
export const newSession = async (userId) => {
  const res = await fetch(`${BACKEND_URL}/api/v1/new-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId || "guest" }),
  });
  if (!res.ok) throw new Error("New-session API error");
  return res.json();
};

// Delete session
export const deleteSession = async (sessionId) => {
  const res = await fetch(`${BACKEND_URL}/api/v1/delete/${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete session error");
  return res.json();
};
