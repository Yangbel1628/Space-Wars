import React, { useState } from "react";
import "../NameModal.css";

export default function NameModal({ onSubmit }) {
  const [name, setName] = useState("");

  const handleStart = () => {
    if (!name.trim()) setName("PLAYER");
    onSubmit(name.trim() || "PLAYER");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleStart();
  };

  return (
    <div className="name-modal-overlay">
      <div className="name-modal">
        <h2 className="neon-glow">👾 ENTER YOUR NAME 👾</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Your nickname..."
          className="neon-input"
          autoFocus
        />
        <button className="neon-btn arcade-blink" onClick={handleStart}>
          ▶ START GAME
        </button>
      </div>
    </div>
  );
}
