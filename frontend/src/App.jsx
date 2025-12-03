import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/chatwindow";
import { useSessions } from "./hooks/useSessions";

import "./styles/global.css";
import "./styles/App.css";
import "./styles/Sidebar.css";
import "./styles/chat.css";

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [showHome, setShowHome] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [aiName, setAiName] = useState("Aurora Mentor");
  const [userName, setUserName] = useState("guest1");

  // 👉 Load all session data + saveMessages from hook
  const {
    sessions,
    pinnedSessions,
    folders,
    createNewChat,
    togglePin,
    renameSession,
    moveToFolder,
    saveMessages,
  } = useSessions(userName);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleStartChat = async () => {
    setShowHome(false);
    // auto create first chat session if none exists
    if (!activeSessionId) {
      const session = await createNewChat();
      if (session?.session_id) {
        setActiveSessionId(session.session_id);
      }
    }
  };

  return (
    <div className={`app-root ${theme}`}>
      {/* ===== HEADER ===== */}
      <header className="app-header">
        <div className="brand-area">
          <div className="brand-orb" />
          <div>
            <div className="brand-title">
              <span>AI</span> Career Guide
            </div>
            <div className="brand-subtitle">
              Personalized career mentorship powered by Gen-AI 🚀
            </div>
          </div>
        </div>

        <div className="header-right">
          <span className="theme-label">
            {theme === "dark" ? "DARK MODE" : "LIGHT MODE"}
          </span>
          <button
            className={`theme-toggle ${theme}`}
            onClick={handleToggleTheme}
          >
            <span className="theme-toggle-knob" />
          </button>
        </div>
      </header>

      {/* ===== HOME OR CHAT VIEW ===== */}
      {showHome ? (
        <main className="home-layout">
          <div className="home-content">
            <h2 className="home-title">
              Design your <span>future</span> with AI
            </h2>

            <p className="home-subtitle">
              Turn your skills into a successful tech career 🚀
            </p>

            <ul className="home-points">
              <li>Role-wise roadmap + skills improvement plan</li>
              <li>Guidance for internships, projects & interviews</li>
              <li>Resume + LinkedIn + Portfolio enhancement</li>
              <li>Study planning & productivity boost</li>
            </ul>

            <button className="hero-btn" onClick={handleStartChat}>
              Start Mentoring Session →
            </button>
          </div>
        </main>
      ) : (
        <main className="chat-container">
          <div className="sidebar-wrapper">
            <Sidebar
              theme={theme}
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
              userName={userName}
              setUserName={setUserName}
              aiName={aiName}
              setAiName={setAiName}
              sessions={sessions}
              pinnedSessions={pinnedSessions}
              folders={folders}
              createNewChat={createNewChat}
              togglePin={togglePin}
              renameSession={renameSession}
              moveToFolder={moveToFolder}
            />
          </div>

          <div className="chat-wrapper">
            <ChatWindow
              theme={theme}
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
              aiName={aiName}
              userName={userName}
              sessions={sessions}
              saveMessages={saveMessages}
            />
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
