import React, { useState, useEffect } from "react";
import SpaceShip from "./components/SpaceShip";
import NameModal from "./components/NameModal";
import bgImg from "./assets/homebackground.jpg"; // import image
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("leaderboard")) || [];
    setLeaderboard(saved);
  }, []);

  const startGame = () => setShowNameModal(true);

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    setShowNameModal(false);
    setScreen("game");
  };

  const saveScore = (score) => {
    const newEntry = { name: playerName || "PLAYER", score };
    const updated = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setLeaderboard(updated);
    localStorage.setItem("leaderboard", JSON.stringify(updated));
  };

  return (
    <div className="App">
      {screen === "home" && (
        <div
          className="home-screen"
          style={{
            backgroundImage: `url(${bgImg})`,
            backgroundRepeat: "repeat-x",
            backgroundSize: "cover",
            animation: "slideBg 30s linear infinite"
          }}
        >
          <div className="home-banner">
            <h1 className="home-title neon-glow">🚀 Space Wars</h1>
            <p className="home-sub arcade-blink">Collect ★ — Dodge ☄</p>

            <button className="start-button arcade-blink" onClick={startGame}>
              ▶ PRESS START
            </button>

            <div className="leaderboard">
              <h2 className="leaderboard-title">🏆 TOP SCORES</h2>
              <ol>
                {leaderboard.length > 0
                  ? leaderboard.map((entry, idx) => (
                      <li key={idx}>
                        {entry.name}: {entry.score}
                      </li>
                    ))
                  : <li>No scores yet</li>}
              </ol>
            </div>
          </div>

          {showNameModal && <NameModal onSubmit={handleNameSubmit} />}
        </div>
      )}

      {screen === "game" && (
        <div className="game-wrapper">
          <button
            className="back-button"
            onClick={() => setScreen("home")}>
            ⟵ MENU
          </button>
          <SpaceShip saveScore={saveScore} />
        </div>
      )}
    </div>
  );
}
