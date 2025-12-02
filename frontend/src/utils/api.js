// src/utils/api.js
const BACKEND_URL = "http://localhost:8000";

export const sendMessage = async (payload) => {
  const res = await fetch(`${BACKEND_URL}/api/v1/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Message API error");
  return res.json();
};

export const fetchHistory = async (sessionId) => {
  const res = await fetch(`${BACKEND_URL}/api/v1/history/${sessionId}`);
  if (!res.ok) throw new Error("History API error");
  return res.json();
};

export const newSession = async (userId) => {
  const res = await fetch(`${BACKEND_URL}/api/v1/new-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId || "guest" }),
  });
  if (!res.ok) throw new Error("New-session API error");
  return res.json();
};

// DELETE session from DB
export const deleteSession = async (sessionId) => {
  const res = await fetch(`${BACKEND_URL}/api/v1/delete/${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete session error");
  return res.json();
};
