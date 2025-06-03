import React, { useState } from 'react';
import './promptentry.css';

function PromptEntry({ timeLeft = 60, roomCode, playerId }) {
  const [prompt, setPrompt] = useState('');
  const [submittedPrompts, setSubmittedPrompts] = useState([]);

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (trimmed && submittedPrompts.length < 3) {
      setSubmittedPrompts([...submittedPrompts, trimmed]);
      setPrompt('');

      // Future: emit via socket.io
      // socket.emit('submit-prompt', { roomCode, playerId, prompt: trimmed });
    }
  };

  return (
    <div className="prompt-entry-container">
      <div className="prompt-timer">{timeLeft}</div>
      <h2 className="prompt-header">Enter your prompts for other users to enter a Pokémon for:</h2>
      <h3 className="prompt-subheader">What Pokémon would…</h3>
      <textarea
        placeholder="Type your prompt here…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="prompt-textarea"
        maxLength={200}
      />
      <button
        onClick={handleSubmit}
        className="submit-button"
        disabled={submittedPrompts.length >= 3}
      >
        Submit ({submittedPrompts.length}/3)
      </button>
    </div>
  );
}

export default PromptEntry;

// Universal timer is not going downwards
// After timer finishes, navigate to next page
// Implement next page
// Transition screen not working properly (Game.css issue)
