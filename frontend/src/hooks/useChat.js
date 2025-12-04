import { useState, useEffect } from "react";
import axios from "axios";
import { useVoice } from "./useVoice";
import { cleanForSpeech } from "../utils/markdownCleaner";
import { sendMessage, fetchHistory, newSession } from "../utils/api"; 

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

  // Load History if session changes
  useEffect(() => {
    if (!activeSessionId) return;
    loadHistory();
  }, [activeSessionId]);

  const loadHistory = async () => {
    try {
      const res = await fetchHistory(activeSessionId);
      setMessages(res || []);
    } catch (err) {
      console.error("History load error:", err);
    }
  };

  const ensureSession = async () => {
    if (activeSessionId) return activeSessionId;
    const res = await newSession(userName || "guest");
    setActiveSessionId(res.session_id);
    return res.session_id;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setInput("");

    const sessionId = await ensureSession();
    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setQuickReplies([]);

    setIsTyping(true);

    try {
      const res = await sendMessage({
        session_id: sessionId,
        user_id: userName || "guest",
        text,
      });

      const botText = res.reply || "⚠ No reply from AI";
      const aiMsg = { role: "ai", text: botText };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(cleanForSpeech(botText));
      setQuickReplies(res.suggestions || []);
    } catch (err) {
      console.error("Message error:", err);
    }

    setIsTyping(false);
  };

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
  };
}
