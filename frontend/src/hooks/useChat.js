import { useState, useEffect } from "react";
import useVoice from "./useVoice";
import { cleanForSpeech } from "../utils/markdownCleaner";
import { sendMessage, fetchHistory, newSession } from "../utils/api";

export function useChat({ activeSessionId, setActiveSessionId, userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);

  const {
    state: voiceState,
    startSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    startListening,
    stopListening,
  } = useVoice({
    onTranscript: (t) => setInput(prev => prev + " " + t),
  });

  useEffect(() => {
    if (activeSessionId) loadHistory();
  }, [activeSessionId]);

  const loadHistory = async () => {
    const res = await fetchHistory(activeSessionId);
    if (res) setMessages(res);
  };

  const ensureSession = async () => {
    if (!activeSessionId) {
      const res = await newSession(userName || "guest");
      setActiveSessionId(res.session_id);
      return res.session_id;
    }
    return activeSessionId;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setInput("");
    setQuickReplies([]);
    const sessionId = await ensureSession();

    setMessages(prev => [...prev, { role: "user", text }]);
    setIsTyping(true);

    const res = await sendMessage({
      session_id: sessionId,
      user_id: userName || "guest",
      text,
    });

    const reply = res.reply || "No reply available";
    setMessages(prev => [...prev, { role: "ai", text: reply }]);

    startSpeaking(cleanForSpeech(reply)); // 👈 speak voice properly
    setQuickReplies(res.suggestions || []);
    setIsTyping(false);
  };

  // We expose exactly what ChatWindow expects
  return {
    messages,
    input,
    setInput,
    handleSend,
    isTyping,
    quickReplies,

    // 🔊 Voice functions returned correctly now
    speakText: startSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    speechState: voiceState,

    startListening,
    stopListening,
  };
}
