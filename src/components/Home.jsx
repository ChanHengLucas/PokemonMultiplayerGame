import React, { useState, useEffect } from 'react';
import socket from '../socket';
import './Home.css';

function Home() {
  const [name, setName] = useState('');
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);

  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);

  const handleCreate = () => {
    if (!isNameConfirmed) return alert('Please confirm your name first.');
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setRoomCode(code);
    socket.emit('create-room', { name, roomCode: code });
  };

  const handleJoin = () => {
    if (!isNameConfirmed) return alert('Please confirm your name first.');
    if (!roomCode) return alert('Please enter a room code.');
    socket.emit('join-room', { name, roomCode });
  };

  useEffect(() => {
    socket.on('update-players', (data) => {
      setPlayers(data);
    });

    socket.on('error-msg', (msg) => alert(msg));

    return () => {
      socket.off('update-players');
      socket.off('error-msg');
    };
  }, []);

  return (
    <div className="App">
      <div className="home-container">
        <div className="player-list">
          <h2>Player List</h2>
          <ul>
            {players.map((p, i) => (
              <li key={i}>Player {i + 1}: {p.name}</li>
            ))}
            <li className="add-player">+</li>
          </ul>
        </div>

        <div className="main-section">
          <h1 className="title">PokéPrompts</h1>

          <div className="instructions-box">
            <p className="instructions-title">Instructions:</p>
            <ol className="instruction-list">
              <li>Players should first enter their name, and create or join a room</li>
              <li>Once the game starts, players can create prompts that would fit in the context of "What Pokémon would..."</li>
              <li>And then they would think of a Pokémon that would do the stated thing from other players' prompts and why</li>
              <li>If any player has a duplicate Pokémon with other players for the same prompt, they will each lose one point</li>
              <li>If any player doesn't enter a reason for a prompt, they will lose one point</li>
              <li>And if any player doesn't enter anything for the prompt, they will lose three points</li>
              <li>All above players who lost points from the current round would be automatically disqualified from the round</li>
              <li>After all responses are collected, the game will then determine which player has the best response and provide the game's own reasoning, awarding the best response with 3 points</li>
              <li>Once each round is over, the players can decide to vote for the best response of that round, and the best response would get 3 points</li>
              <li>After all rounds are over, the winner will be determined by the amount of points they have</li>
            </ol>
            <p className="instructions-end">Have fun!</p>
          </div>

          <div className="form-section">
            <div className="name-confirm-section">
              <label htmlFor="name-input">Enter your name:</label>
              {!isNameConfirmed ? (
                <>
                  <input
                    id="name-input"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="name-input"
                  />
                  <button
                    className="confirm-button"
                    onClick={() => {
                      if (!name) return alert('Please enter a name.');
                      setIsNameConfirmed(true);
                    }}
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <>
                  <p className="confirmed-name">Name: {name}</p>
                  <button
                    className="edit-button"
                    onClick={() => setIsNameConfirmed(false)}
                  >
                    Edit Name
                  </button>
                </>
              )}
            </div>

            <div className="button-row">
              <button className="action-button" onClick={handleCreate}>Create Room</button>
              <button className="action-button" onClick={handleJoin}>Join Room</button>
            </div>

            <input
              type="text"
              placeholder="Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="room-input"
            />
          </div>
        </div>

        <div className="settings-icon">⚙️</div> 
      </div>
    </div>
  );
}

export default Home;

/* To Do List:
- Make the instruction table wider
- Assign room leader to the player that creates the room
- If the room leader leaves, assign the next player in line as the new room leader
- Don't permit offensive names (that include slurs)
- Add a settings button that opens a modal with game settings
  - Game settings will include: 
    - Prompts per player (Default = 3, min = 2, max = 50, only allow integers)
    - Timer for entering each prompt (Default = 20s, min = 15s, max = 60s)
    - Timer for entering each answer (Default = 40s, min = 30s, max = 120s)
    - Timer for player voting (Default = 20s, min = 10s, max = 60s)
    - Text display speed (Allow numbers from 0.5x to 3x)
    - Hide all players’ own scores (Default = false, use toggle button)
  - Add a button to save settings
  - The modal should be scrollable
  - The game settings should apply to all games hosted in that room after the settings are saved

- Implement a scroll bar on the main page / fix the UI
- Add a button to leave the room
- Add a button to start the game
  - State that the game is starting in 5s
    - Show a countdown timer
  - Only let the party leader start the game when there are 3 or more players
  - Provide an alert under the start game button when there are not enough players

- Create the other pages for the different portions of the game
*/
