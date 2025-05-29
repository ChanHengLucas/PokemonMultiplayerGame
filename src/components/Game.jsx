import React, { useState, useEffect } from 'react';
import './Game.css';
import PromptEntry from './PromptEntry';

function Game() {
  const [phase, setPhase] = useState('starting'); // starting -> prompting
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (phase === 'starting') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(timer);
            setPhase('prompting');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [phase]);

  return (
    <div className="game-container">
      {phase === 'starting' && (
        <div className="countdown-screen">
          <h1 className="comic-font">Game starting in...</h1>
          <div className="countdown-number comic-font">{countdown}</div>
        </div>
      )}

      {phase === 'prompting' && <PromptEntry />}
    </div>
  );
}

export default Game;
