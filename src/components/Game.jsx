import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Game.css';
import PromptEntry from './PromptEntry';

function Game() {
  const { roomCode, playerId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('starting');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Redirect if invalid params
    if (!roomCode || !playerId) {
      navigate('/');
    }

    // TODO: add optional socket check to validate user in room
  }, [roomCode, playerId, navigate]);

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
      {phase === 'starting' ? (
        <div className="countdown-screen">
          <h1 className="comic-font">Game starting in...</h1>
          <div className="countdown-number comic-font">{countdown}</div>
        </div>
      ) : (
        <PromptEntry roomCode={roomCode} playerId={playerId} />
      )}
    </div>
  );
}

export default Game;
