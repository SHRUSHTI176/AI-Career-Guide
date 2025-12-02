import React, { useState } from "react";
import { useSessions } from "../hooks/useSessions";
import SettingsPanel from "./SettingsPanel";
import { FaEllipsisV, FaFolderPlus, FaTrashAlt, FaThumbtack, FaEdit } from "react-icons/fa";

const Sidebar = ({
  theme,
  activeSessionId,
  setActiveSessionId,
  userName,
  setUserName,
  aiName,
  setAiName,
}) => {
  const {
    sessions,
    pinnedSessions,
    folders,
    createNewChat,
    moveToFolder,
    togglePin,
    renameSession,
    deleteSession,
    createFolder,
  } = useSessions(userName);

  const [showMenu, setShowMenu] = useState(null);

  const handleNewChat = async () => {
    const sess = await createNewChat();
    if (sess?.session_id) setActiveSessionId(sess.session_id);
  };

  const handleAddFolder = () => {
    const name = prompt("Folder name:");
    if (name) createFolder(name);
  };

  return (
    <aside className={`sidebar ${theme}`}>
      {/* Profile Section */}
      <div className="user-profile-box">
        <img
          src={localStorage.getItem("userAvatar") || "/default-user.png"}
          alt="User Avatar"
          className="user-sidebar-avatar"
          onClick={() => document.getElementById("avatarInput").click()}
        />

        <input
          id="avatarInput"
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              localStorage.setItem("userAvatar", reader.result);
              window.location.reload();
            };
            reader.readAsDataURL(file);
          }}
        />

        <div>
          <div className="sidebar-username">{userName}</div>
          <button
            className="sidebar-btn-small"
            onClick={() => {
              const name = prompt("Enter name:", userName);
              if (name) setUserName(name);
            }}
          >
            Edit Name
          </button>
        </div>
      </div>

      <hr className="sidebar-divider" />

      {/* Plus Button Menu */}
      <div className="new-chat-menu">
        <button className="new-chat-btn" onClick={handleNewChat}>
          + New Chat
        </button>

        <button className="add-folder-btn" onClick={handleAddFolder}>
          <FaFolderPlus /> Folder
        </button>
      </div>

      <SettingsPanel
        userName={userName}
        setUserName={setUserName}
        aiName={aiName}
        setAiName={setAiName}
      />

      {/* Pinned */}
      <SidebarSection title="📌 Pinned Chats">
        {pinnedSessions.length === 0 ? (
          <p className="muted-text">Nothing pinned yet</p>
        ) : (
          pinnedSessions.map((s) => (
            <SessionRow
              key={s.session_id}
              session={s}
              isActive={s.session_id === activeSessionId}
              setActiveSessionId={setActiveSessionId}
              togglePin={togglePin}
              renameSession={renameSession}
              deleteSession={deleteSession}
              moveToFolder={moveToFolder}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
            />
          ))
        )}
      </SidebarSection>

      {/* Folders */}
      <SidebarSection title="📂 Folders">
        {folders.map((f, i) => (
          <span key={i} className="folder-chip">
            📁 {f.name}
          </span>
        ))}
      </SidebarSection>

      {/* All Sessions */}
      <SidebarSection title="🗂 All Chats">
        {sessions.length === 0 ? (
          <p className="muted-text">No chats yet</p>
        ) : (
          sessions.map((s) => (
            <SessionRow
              key={s.session_id}
              session={s}
              isActive={s.session_id === activeSessionId}
              setActiveSessionId={setActiveSessionId}
              togglePin={togglePin}
              renameSession={renameSession}
              deleteSession={deleteSession}
              moveToFolder={moveToFolder}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
            />
          ))
        )}
      </SidebarSection>
    </aside>
  );
};

const SidebarSection = ({ title, children }) => (
  <div className="sidebar-section">
    <h4>{title}</h4>
    {children}
  </div>
);

const SessionRow = ({
  session,
  isActive,
  setActiveSessionId,
  togglePin,
  renameSession,
  deleteSession,
  moveToFolder,
  showMenu,
  setShowMenu,
}) => {
  const openMenu = (e) => {
    e.stopPropagation();
    setShowMenu(showMenu === session.session_id ? null : session.session_id);
  };

  const confirmDelete = () => {
    if (window.confirm("Permanently delete chat?")) {
      deleteSession(session.session_id);
    }
  };

  return (
    <div
      className={`session-row ${isActive ? "active" : ""}`}
      onClick={() => setActiveSessionId(session.session_id)}
    >
      <span className="session-title">{session.title}</span>

      <div className="session-action-container" onClick={(e) => e.stopPropagation()}>
        <button className="menu-dots-btn" onClick={openMenu}>
          <FaEllipsisV />
        </button>

        {showMenu === session.session_id && (
          <div className="dropdown-menu">
            <button onClick={() => togglePin(session.session_id)}>
              <FaThumbtack /> {session.pinned ? "Unpin" : "Pin"}
            </button>

            <button
              onClick={() => {
                const name = prompt("Rename chat:", session.title);
                if (name) renameSession(session.session_id, name);
              }}
            >
              <FaEdit /> Rename
            </button>

            <button onClick={confirmDelete} className="delete-option">
              <FaTrashAlt /> Delete
            </button>

            <button
              onClick={() => {
                const folder = prompt("Move to which folder?");
                if (folder) moveToFolder(session.session_id, folder);
              }}
            >
              📁 Move to Folder
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
