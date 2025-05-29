import React, { useState, useEffect } from 'react';
import './promptentry.css';

function PromptEntry() {
  const [prompt, setPrompt] = useState('');
  const [submittedPrompts, setSubmittedPrompts] = useState([]);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(countdown);
          // handle end of prompt phase
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const handleSubmit = () => {
    if (prompt.trim() && submittedPrompts.length < 3) {
      setSubmittedPrompts([...submittedPrompts, prompt.trim()]);
      setPrompt('');
    }
  };

  return (
    <div className="prompt-entry-container">
      <div className="prompt-timer">{timer}</div>
      <h2>Enter your prompts for other users to enter a Pokémon for:</h2>
      <h3>What Pokémon would…</h3>
      <textarea
        placeholder="Type your prompt here…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="prompt-textarea"
      />
      <button onClick={handleSubmit} className="submit-button">
        Submit ({submittedPrompts.length}/3)
      </button>
    </div>
  );
}

export default PromptEntry;
