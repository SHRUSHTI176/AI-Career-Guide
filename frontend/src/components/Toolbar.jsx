// src/components/Toolbar.jsx
import React, { useRef } from "react";

const Toolbar = ({
  onUploadFiles,
  onExportPDF,
  speechState,
  startSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  stopSpeaking,
  startListening,
  stopListening,
}) => {
  const fileInputRef = useRef(null);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onUploadFiles) {
      onUploadFiles(files);
    }
  };

  const handleSpeakerClick = () => {
    if (!speechState.speaking) {
      startSpeaking();
    } else if (speechState.paused) {
      resumeSpeaking();
    } else {
      pauseSpeaking();
    }
  };

  return (
    <div className="toolbar">
      {/* Upload Image/PDF */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <button
        type="button"
        className="toolbar-btn"
        title="Upload image / PDF"
        onClick={handleAttachClick}
      >
        📎
      </button>

      {/* Speech-to-Text 🎙 */}
      {speechState.listening ? (
        <button
          type="button"
          className="toolbar-btn listening"
          title="Stop listening"
          onClick={stopListening}
        >
          🛑
        </button>
      ) : (
        <button
          type="button"
          className="toolbar-btn"
          title="Speak your question"
          onClick={startListening}
        >
          🎙
        </button>
      )}

      {/* Text-to-Speech 🔊 */}
      {speechState.speaking ? (
        <>
          <button
            type="button"
            className="toolbar-btn speaking"
            title="Pause / Resume AI voice"
            onClick={handleSpeakerClick}
          >
            {speechState.paused ? "▶" : "⏸"}
          </button>

          <button
            type="button"
            className="toolbar-btn speaking"
            title="Stop AI voice"
            onClick={stopSpeaking}
          >
            🔇
          </button>
        </>
      ) : (
        <button
          type="button"
          className="toolbar-btn"
          title="Listen to AI answer"
          onClick={handleSpeakerClick}
        >
          🔊
        </button>
      )}

      {/* Export chat to PDF */}
      <button
        type="button"
        className="toolbar-btn"
        title="Export chat (PDF)"
        onClick={onExportPDF}
      >
        📄
      </button>
    </div>
  );
};

export default Toolbar;
