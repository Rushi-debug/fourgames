import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useEmotionDetection from './EmotionDetection/useEmotionDetection';
import "./MemoryGame.css";

const gameId = "3";
const colors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A6",
  "#F3FF33",
  "#33FFF6",
  "#A6FF33",
  "#33A6FF",
];

const emotionColors = {
  happy: 'bg-green-200',
  sad: 'bg-blue-200',
  angry: 'bg-red-200',
  surprised: 'bg-yellow-200',
  neutral: 'bg-gray-200',
  fear: 'bg-purple-200',
  disgust: 'bg-orange-200',
};

function MemoryGame({ onFinish, childName, sessionId }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const faceCanvasRef = useRef(null);
  const emotionDisplayRef = useRef(null);
  const selectSound = useRef(new Audio('/assets/letter-select.mp3'));
  const correctSound = useRef(new Audio('/assets/correct-word.mp3'));
  selectSound.current.volume = 0.2;
  correctSound.current.volume = 0.5;

  const [grid, setGrid] = useState(Array(16).fill(null));
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [attemptsLeft, setAttemptsLeft] = useState(15);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [revealed, setRevealed] = useState(true);
  const [gameWon, setGameWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [alert, setAlert] = useState({ show: false, variant: "", message: "" });
  const [gameStarted, setGameStarted] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [backgroundClass, setBackgroundClass] = useState('bg-gray-200');

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleEmotionsCollected = (emotions) => {
    console.log('MemoryGame - Emotions collected:', emotions);
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    const mostFrequentEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );
    setBackgroundClass(emotionColors[mostFrequentEmotion] || 'bg-gray-200');
  };

  const emotionQueue = useEmotionDetection(
    videoRef,
    faceCanvasRef,
    emotionDisplayRef,
    gameStarted,
    handleEmotionsCollected,
    setCameraError
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (gameStarted) {
      initializeGrid();
      // Reveal grid colors for 5 seconds
      const revealTimeout = setTimeout(() => {
        setRevealed(false);
      }, 5000);
      return () => clearTimeout(revealTimeout);
    }
  }, [gameStarted]);

  function initializeGrid() {
    let tempGrid = Array(16).fill(null);
    let pairs = [...colors, ...colors];
    pairs = pairs.sort(() => Math.random() - 0.5);

    pairs.forEach((color, index) => {
      tempGrid[index] = color;
    });

    setGrid(tempGrid);
  }

  function handleBoxClick(index) {
    if (
      gameStarted &&
      !gameWon &&
      selectedBoxes.length < 2 &&
      !selectedBoxes.includes(index) &&
      !matchedPairs.includes(grid[index])
    ) {
      selectSound.current.currentTime = 0;
      selectSound.current.play();
      const newSelected = [...selectedBoxes, index];
      setSelectedBoxes(newSelected);

      // Delay the match check to allow the color to be revealed
      if (newSelected.length === 2) {
        setTimeout(() => checkMatch(newSelected), 300);
      }
    }
  }

  function checkMatch(newSelected) {
    const [first, second] = newSelected;

    if (grid[first] === grid[second]) {
      correctSound.current.currentTime = 0;
      correctSound.current.play();
      setMatchedPairs([...matchedPairs, grid[first]]);
      setSelectedBoxes([]);
    } else {
      setTimeout(() => setSelectedBoxes([]), 1000);
    }

    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);

    if (matchedPairs.length + 1 === 8) {
      handleGameEnd(true, newAttemptsLeft);
    } else if (newAttemptsLeft === 0) {
      handleGameEnd(false, newAttemptsLeft);
    }
  }

  function handleGameEnd(success, movesRemaining) {
    setGameWon(true);
    setShowConfetti(true);
    const finalScore = calculateScore(movesRemaining);

    setAlert({
      show: true,
      variant: success ? "success" : "danger",
      message: success
        ? "Congratulations! You've matched all pairs!"
        : "Game Over! Try again!",
    });

    if (onFinish) onFinish(finalScore);

    setTimeout(() => {
      setShowConfetti(false);
      navigate("/");
    }, 5000);
  }

  function calculateScore(movesRemaining) {
    if (movesRemaining >= 5) return 10;
    if (movesRemaining >= 4) return 8;
    if (movesRemaining >= 3) return 6;
    if (movesRemaining >= 1) return 4;
    return 2;
  }

  const startGame = () => {
    setGameStarted(true);
    setShowDemo(false);
    setShowPlayAgain(false);
  };

  return (
    <div className={`memory-game-container ${backgroundClass}`}>
      <div className="facemesh-container" style={{ display: gameStarted ? 'block' : 'none' }}>
        {cameraError && (
          <div className="camera-error">
            {cameraError}
            <button onClick={() => {
              setCameraError(null);
              window.location.reload();
            }}>Retry</button>
          </div>
        )}
        <video
          ref={videoRef}
          style={{
            transform: 'scaleX(-1)',
            width: '320px',
            height: 'auto',
            backgroundColor: '#000',
            display: cameraError ? 'none' : gameStarted ? 'block' : 'none',
          }}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={faceCanvasRef}
          width="320"
          height="240"
          style={{ display: 'none' }}
        />
        <div ref={emotionDisplayRef} className="emotion-display"></div>
      </div>

      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} />}

      {!gameStarted ? (
        <div className="start-screen">
          <h1>Memory Game</h1>
          <p>Test your memory by matching color pairs!</p>
          <div className="video-container">
            {showDemo ? (
              <video
                className="demo-video"
                autoPlay
                onEnded={() => {
                  setShowDemo(false);
                  setShowPlayAgain(true);
                }}
              >
                <source src="/assets/memory-game-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <>
                <button
                  className="play-demo"
                  onClick={() => setShowDemo(true)}
                  style={{ display: showPlayAgain ? 'none' : 'inline-block' }}
                >
                  Watch Demo
                </button>
                <button
                  className="play-again"
                  onClick={() => setShowDemo(true)}
                  style={{ display: showPlayAgain ? 'inline-block' : 'none' }}
                >
                  Play Again
                </button>
              </>
            )}
          </div>
          <button onClick={startGame} className="start-button">
            Start Game
          </button>
        </div>
      ) : (
        <div className="game-content">
          <h1>Memory Game</h1>
          <div className="game-info">
            <h2>Score: {calculateScore(attemptsLeft)}</h2>
            <h2>Attempts Left: {attemptsLeft}</h2>
          </div>

          {alert.show && (
            <div className={`alert-message ${alert.variant}`}>
              {alert.message}
            </div>
          )}

          <div className="grid-container">
            {grid.map((color, index) => (
              <div
                key={index}
                className={`box ${
                  revealed || selectedBoxes.includes(index) || matchedPairs.includes(color)
                    ? "revealed"
                    : ""
                }`}
                style={{
                  backgroundColor:
                    revealed || selectedBoxes.includes(index) || matchedPairs.includes(color)
                      ? color
                      : '#d1d5db',
                }}
                onClick={() => handleBoxClick(index)}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoryGame;