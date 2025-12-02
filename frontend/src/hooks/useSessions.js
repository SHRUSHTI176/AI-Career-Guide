import { useEffect, useState } from "react";
import { newSession as apiNewSession } from "../utils/api";

const LS_KEY = "ai-career-sessions";

const DEFAULT_FOLDERS = [
  { id: "Roadmaps & Planning", name: "Roadmaps & Planning", icon: "🧭" },
  { id: "Resume / LinkedIn / Portfolio", name: "Resume / LinkedIn / Portfolio", icon: "💼" },
  { id: "Skill Training & Courses", name: "Skill Training & Courses", icon: "📚" },
  { id: "Productivity & Study Strategy", name: "Productivity & Study Strategy", icon: "⚡" },
  { id: "Interviews & Communication", name: "Interviews & Communication", icon: "🎙" },
  { id: "Projects & Real-World Experience", name: "Projects & Real-World Experience", icon: "🛠" },
  { id: "Motivation & Mindset Growth", name: "Motivation & Mindset Growth", icon: "🌱" },
  { id: "Job Search & Applications", name: "Job Search & Applications", icon: "📨" },
];

export const useSessions = (userName) => {
  const [sessions, setSessions] = useState([]);
  const [folders] = useState(DEFAULT_FOLDERS);

  // Load from localStorage at startup
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch (err) {
        console.error("Session load error:", err);
      }
    }
  }, []);

  const persist = (updated) => {
    setSessions(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  };

  // Create new session
  const createNewChat = async () => {
    try {
      const sess = await apiNewSession(userName || "guest");
      const newData = {
        session_id: sess.session_id,
        title: "New Career Chat",
        folder: "Roadmaps & Planning",
        pinned: false,
        updated_at: Date.now(),
      };
      const updated = [newData, ...sessions];
      persist(updated);
      return sess;
    } catch (err) {
      console.error("Create session error:", err);
      alert("Failed to create chat!");
      return null;
    }
  };

  const togglePin = (id) => {
    const updated = sessions.map((s) =>
      s.session_id === id ? { ...s, pinned: !s.pinned } : s
    );
    persist(updated);
  };

  const renameSession = (id, title) => {
    const updated = sessions.map((s) =>
      s.session_id === id ? { ...s, title } : s
    );
    persist(updated);
  };

  const moveToFolder = (id, folder) => {
    const updated = sessions.map((s) =>
      s.session_id === id ? { ...s, folder } : s
    );
    persist(updated);
  };

  // 🚨 DELETE SESSION ADDED
  const deleteSession = (id) => {
    const updated = sessions.filter((s) => s.session_id !== id);
    persist(updated);
    localStorage.removeItem(`chat-messages-${id}`);
  };

  const pinnedSessions = sessions.filter((s) => s.pinned);

  return {
    sessions,
    pinnedSessions,
    folders,
    createNewChat,
    togglePin,
    renameSession,
    moveToFolder,
    deleteSession, // <-- NEW
  };
};
