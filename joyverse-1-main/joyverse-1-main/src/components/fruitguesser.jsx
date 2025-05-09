import React, { useState, useEffect, useRef, useCallback } from "react";
import useEmotionDetection from './EmotionDetection/useEmotionDetection';
import "./fruitguesser.css";

const wordPairs = {
  Apple: "🍎",
  Banana: "🍌",
  Grapes: "🍇",
  Orange: "🍊",
  Strawberry: "🍓",
  Watermelon: "🍉"
};

const words = Object.keys(wordPairs);

// Emotion-to-color mapping
const emotionColors = {
  happy: 'bg-green-200',
  sad: 'bg-blue-200',
  angry: 'bg-red-200',
  surprised: 'bg-yellow-200',
  neutral: 'bg-gray-200',
  fear: 'bg-purple-200',
  disgust: 'bg-orange-200',
};

function FruitGuesser() {
  const videoRef = useRef(null);
  const faceCanvasRef = useRef(null);
  const canvasRef = useRef(null); // For confetti
  const emotionDisplayRef = useRef(null);
  const selectSound = useRef(new Audio('/assets/letter-select.mp3'));
  selectSound.current.volume = 0.2;

  const [currentWord, setCurrentWord] = useState("");
  const [score, setScore] = useState(0);
  const [result, setResult] = useState("");
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [emotionFeedback, setEmotionFeedback] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [backgroundClass, setBackgroundClass] = useState('bg-gray-200');
  const [particles, setParticles] = useState([]);

  const handleEmotionsCollected = useCallback((emotions) => {
    console.log('FruitGuesser - Emotions collected:', emotions);
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    const mostFrequentEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );
    setBackgroundClass(emotionColors[mostFrequentEmotion] || 'bg-gray-200');
    switch (mostFrequentEmotion) {
      case 'happy':
        setEmotionFeedback("You look happy! Keep guessing!");
        break;
      case 'sad':
        setEmotionFeedback("Don't be sad! You can guess this fruit!");
        break;
      case 'angry':
        setEmotionFeedback("Take a deep breath. You've got this!");
        break;
      default:
        setEmotionFeedback("");
    }
  }, []);

  const emotionQueue = useEmotionDetection(
    videoRef,
    faceCanvasRef,
    emotionDisplayRef,
    gameStarted,
    handleEmotionsCollected,
    setCameraError
  );

  const launchConfetti = useCallback(() => {
    const newParticles = [];
    for (let i = 0; i < 200; i++) {
      newParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight - window.innerHeight,
        dx: (Math.random() - 0.5) * 5,
        dy: Math.random() * 3 + 2,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        radius: Math.random() * 5 + 2,
      });
    }
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const updateConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const newParticles = particles.filter(p => p.y < canvas.height);
      for (let p of newParticles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
      }
      setParticles(newParticles);
      if (newParticles.length > 0) requestAnimationFrame(updateConfetti);
    };
    if (particles.length > 0) updateConfetti();

    return () => window.removeEventListener('resize', handleResize);
  }, [particles]);

  useEffect(() => {
    if (gameStarted) {
      getRandomWord();
    }
  }, [gameStarted]);

  const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    setCurrentWord(words[randomIndex]);
    setResult("");
  };

  const checkGuess = (guess) => {
    selectSound.current.currentTime = 0;
    selectSound.current.volume = 0.2; // Lower volume for attempts
    selectSound.current.play();
    setAttempts(attempts + 1);

    if (guess === currentWord) {
      setScore(score + 1);
      setResult("Correct! Well done!");
      setConsecutiveErrors(0);
      selectSound.current.currentTime = 0;
      selectSound.current.volume = 0.5; // Higher volume for correct
      selectSound.current.play();
      launchConfetti();
      setTimeout(getRandomWord, 1000);
    } else {
      setResult(`Oops! That's not ${currentWord}. Try again!`);
      setConsecutiveErrors(consecutiveErrors + 1);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setAttempts(0);
    setConsecutiveErrors(0);
    setShowDemo(false);
    setShowPlayAgain(false);
    setParticles([]);
  };

  return (
    <div className={`fruit-guesser-container ${backgroundClass} min-h-screen transition-colors duration-500`}>
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

      <div className="animal-decoration animal-1"></div>
      <div className="animal-decoration animal-2"></div>

      {!gameStarted ? (
        <div className="start-screen">
          <h1>Fruit Guesser Game</h1>
          <p>Can you guess the fruit from the emoji?</p>
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
                <source src="/assets/fruit-guesser-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <>
                <button
                  className="play-demo"
                  onClick={() => setShowDemo(true)}
                  style={{ display: showPlayAgain ? 'none' : 'inline-block' }}
                >
                  Play Demo
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
            Let's Play!
          </button>
        </div>
      ) : (
        <div className="game-screen">
          <h1>Fruit Guesser Game</h1>
          <div className="game-info">
            <p>⭐ Score: {score}</p>
            <p>🎯 Attempts: {attempts}</p>
            {emotionFeedback && <p className="emotion-feedback">{emotionFeedback}</p>}
          </div>
          <div className="game-area">
            <div className="emoji-display">
              <h2>{wordPairs[currentWord]}</h2>
              <p>What fruit is this?</p>
            </div>
            <div className="buttons-container">
              {words.map((word) => (
                <button
                  key={word}
                  onClick={() => checkGuess(word)}
                  className="fruit-button"
                >
                  {word}
                </button>
              ))}
            </div>
            {result && <p className="result-message">{result}</p>}
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="confetti-canvas"></canvas>
    </div>
  );
}

export default FruitGuesser;