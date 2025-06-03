import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Game from './components/Game';
import PromptEntry from './components/PromptEntry';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:roomCode/:playerId" element={<Game />} />
      <Route path="/promptentry/:roomCode/:playerId" element={<PromptEntry />} />
    </Routes>
  );
}

export default App;
