import { useEffect, useState, useRef } from "react";
import spaceShipImg from "../assets/spaceShip.png";
import starImg from "../assets/star_transparent.png";
import meteorImg from "../assets/meteor.png";
import "../SpaceShip.css";

const SpaceShip = ({ saveScore }) => {
  const desktopWidth = 900;
  const desktopHeight = 600;

  const [gameWidth, setGameWidth] = useState(desktopWidth);
  const [gameHeight, setGameHeight] = useState(desktopHeight);

  const starWidth = 30;
  const meteorWidth = 80;
  const meteorHeight = 80;
  const shipWidth = 60;
  const shipHeight = 60;

  const [spaceShip, setSpaceShip] = useState(400);
  const [stars, setStars] = useState([]);
  const [meteor, setMeteor] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const keys = useRef({ left: false, right: false });
  const starsRef = useRef([]);
  const meteorsRef = useRef([]);
  const shipX = useRef(spaceShip);

  // Scale game for mobile
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight * 0.8;
      if (width < desktopWidth) {
        setGameWidth(width);
        setGameHeight(height);
      } else {
        setGameWidth(desktopWidth);
        setGameHeight(desktopHeight);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    shipX.current = spaceShip;
  }, [spaceShip]);

  // Keyboard events
  useEffect(() => {
    const keyDown = (e) => {
      if (e.key === "ArrowLeft") keys.current.left = true;
      if (e.key === "ArrowRight") keys.current.right = true;
    };
    const keyUp = (e) => {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
    };
    window.addEventListener("keydown", keyDown, { passive: false });
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  // Adjust speed based on score (progressive difficulty)
  useEffect(() => {
    if (score >= 85) setSpeedMultiplier(2.5);       // fastest but still playable
    else if (score >= 70) setSpeedMultiplier(2.2);
    else if (score >= 55) setSpeedMultiplier(1.9);
    else if (score >= 40) setSpeedMultiplier(1.6);
    else if (score >= 30) setSpeedMultiplier(1.4);  // noticeable bump here
    else if (score >= 20) setSpeedMultiplier(1.2);
    else if (score >= 15) setSpeedMultiplier(1.1);
    else setSpeedMultiplier(1);
  }, [score]);

  // Spawn stars
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      const x = Math.random() * (gameWidth - starWidth);
      const newStar = { x, y: 0, rotation: 0, rotationSpeed: Math.random() * 5 + 2 };
      starsRef.current.push(newStar);
      setStars([...starsRef.current]);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, gameWidth]);

  // Spawn meteors
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      const x = Math.random() * (gameWidth - meteorWidth);
      const newMeteor = { x, y: 0 };
      meteorsRef.current.push(newMeteor);
      setMeteor([...meteorsRef.current]);
    }, 2000);
    return () => clearInterval(interval);
  }, [gameOver, gameWidth]);

  // Main game loop
  useEffect(() => {
    let animationFrameId;

    const tick = () => {
      if (gameOver) return;

      // Move spaceship
      if (keys.current.left) shipX.current = Math.max(shipX.current - 5, 0);
      if (keys.current.right) shipX.current = Math.min(shipX.current + 5, gameWidth - shipWidth);
      setSpaceShip(shipX.current);

      // Update stars
      starsRef.current = starsRef.current.filter((star) => {
        star.y += 3 * speedMultiplier;
        star.rotation += star.rotationSpeed;
        const colliding =
          star.y + starWidth >= gameHeight - shipHeight &&
          star.y <= gameHeight &&
          star.x + starWidth >= shipX.current &&
          star.x <= shipX.current + shipWidth;
        if (colliding) {
          setScore((prev) => prev + 1);
          return false;
        }
        return star.y <= gameHeight;
      });
      setStars([...starsRef.current]);

      // Update meteors
      meteorsRef.current = meteorsRef.current.filter((m) => {
        m.y += 3 * speedMultiplier;
        const colliding =
          m.y + meteorHeight >= gameHeight - shipHeight &&
          m.y <= gameHeight &&
          m.x + meteorWidth >= shipX.current &&
          m.x <= shipX.current + shipWidth;
        if (colliding) {
          setLives((prev) => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameOver(true);
              saveScore(score); // save score when game over
            }
            return newLives;
          });
          return false;
        }
        return m.y <= gameHeight;
      });
      setMeteor([...meteorsRef.current]);

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver, gameWidth, gameHeight, score, speedMultiplier, lives, saveScore]);

  // Touch drag for mobile
  const handleTouchMove = (e) => {
    const touchX = e.touches[0].clientX;
    let newX = touchX - shipWidth / 2;
    newX = Math.max(0, Math.min(newX, gameWidth - shipWidth));
    shipX.current = newX;
    setSpaceShip(newX);
  };

  // Reset game
  const resetGame = () => {
    if (gameOver) {
      saveScore(score); // ensure last score saved
    }
    setScore(0);
    setLives(3);
    setStars([]);
    setMeteor([]);
    starsRef.current = [];
    meteorsRef.current = [];
    setSpaceShip(gameWidth / 2 - shipWidth / 2);
    setGameOver(false);
    setSpeedMultiplier(1);
  };

  return (
    <>
      <div className="game-info" style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <p>Score: {score}</p>
        <p>Lives: {lives}</p>
      </div>

      <div
        className="game-area"
        style={{ width: gameWidth, height: gameHeight, position: "relative", touchAction: "none" }}
        onTouchMove={handleTouchMove}
      >
        {stars.map((star, index) => (
          <div
            className="star"
            key={`star-${index}`}
            style={{
              left: star.x,
              top: star.y,
              position: "absolute",
              transform: `rotate(${star.rotation}deg)`,
              transformOrigin: "center",
            }}
          >
            <img src={starImg} alt="star" width={starWidth} />
          </div>
        ))}

        {meteor.map((m, index) => (
          <div className="meteor" key={`m-${index}`} style={{ left: m.x, top: m.y, position: "absolute" }}>
            <div className="meteor-fire"></div>
            <img src={meteorImg} className="meteor-img" alt="meteor" width={meteorWidth} height={meteorHeight} />
          </div>
        ))}

        <div className="spaceShip" style={{ left: spaceShip, position: "absolute", bottom: 0 }}>
          <img src={spaceShipImg} alt="SpaceShip" style={{ width: shipWidth, height: shipHeight }} />
        </div>

        {gameOver && (
          <div className="game-over-screen">
            <h1 className="game-over-title">💀 GAME OVER 💀</h1>
            <p>Score: {score}</p>
            <button className="restart-btn" onClick={resetGame}>
              Restart
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SpaceShip;
