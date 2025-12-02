import { useState, useEffect } from "react";
import axios from "axios";
import { useVoice } from "./useVoice";
import { cleanForSpeech } from "../utils/markdownCleaner";

const API_BASE = "http://localhost:8000/api/v1";

export function useChat({ activeSessionId, setActiveSessionId, userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);

  const {
    state: speechState,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
  } = useVoice({
    onTranscript: (txt) => setInput((prev) => prev + " " + txt),
  });

  // ➤ Load History on session change
  useEffect(() => {
    if (!activeSessionId) return;
    loadHistory();
  }, [activeSessionId]);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history/${activeSessionId}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error("History load error:", err);
    }
  };

  // ➤ Create Session if Missing
  const ensureSession = async () => {
    if (activeSessionId) return activeSessionId;
    const res = await axios.post(`${API_BASE}/new-session`, {
      user_id: userName || "guest",
    });
    setActiveSessionId(res.data.session_id);
    return res.data.session_id;
  };

  // 🆕 SMART AI — Short chunk answers + Follow-up question
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setInput("");

    const sessionId = await ensureSession();
    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setQuickReplies([]); // clear old suggestions

    setIsTyping(true);

    try {
      const res = await axios.post(`${API_BASE}/message`, {
        session_id: sessionId,
        user_id: userName || "guest",
        text,
        options: {
          chunked: true,
          askConfirmation: true,
          maxLength: 250, // limit reply length
        },
      });

      const bot = res.data.reply;
      const botMsg = { role: "ai", text: bot };
      setMessages((prev) => [...prev, botMsg]);

      speakText(cleanForSpeech(bot));

      // ✨ Add Smart Suggestions (ChatGPT Style)
      setQuickReplies([
        "Next part ➜",
        "Show internships",
        "Weekly plan",
        "Skills to learn next",
        "Short summary"
      ]);
    } catch (err) {
      console.error("Message error:", err);
    }

    setIsTyping(false);
  };

  // ➤ Quick Replies: Auto-send
  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    handleSend();
  };

  return {
    messages,
    input,
    setInput,
    isTyping,
    handleSend,
    handleQuickPrompt,
    quickReplies,
    speechState,

    startSpeaking: () => {
      const last = [...messages].reverse().find((m) => m.role === "ai");
      if (!last) return;
      speakText(cleanForSpeech(last.text));
    },

    stopSpeaking,
    startListening,
    stopListening,

    handleExportPDF: () => alert("PDF Export Coming Soon 📄"),
    handleUploadFiles: () => alert("File Upload Coming Soon 📎"),
  };
}
