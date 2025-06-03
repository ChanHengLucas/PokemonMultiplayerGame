import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import './Home.css';

function Home() {
  const [name, setName] = useState('');
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);

  const [roomCode, setRoomCode] = useState('');
  const roomCodeRef = useRef('');
  const [inRoom, setInRoom] = useState(false);
  const inRoomRef = useRef(false);

  const [players, setPlayers] = useState([]);
  const [leaderId, setLeaderId] = useState(null);
  const [socketId, setSocketId] = useState('');

  const navigate = useNavigate();

  const defaultSettings = {
    promptsPerPlayer: 3,
    promptTime: 20,
    answerTime: 40,
    voteTime: 20,
    displaySpeed: 1,
    hideScores: false,
  };

  const [gameSettings, setGameSettings] = useState(defaultSettings);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleCreate = () => {
    if (inRoomRef.current) return;
    if (!isNameConfirmed) return alert('Please confirm your name first.');
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    roomCodeRef.current = code;
    setRoomCode(code);
    inRoomRef.current = true;
    setInRoom(true);
    socket.emit('create-room', { name, roomCode: code });
  };  
  
  const handleJoin = () => {
    if (inRoomRef.current) {
      alert("You're already in a room.");
      return;
    }
    if (!isNameConfirmed) return alert('Please confirm your name first.');
    if (!roomCode) return alert('Please enter a room code.');
    roomCodeRef.current = roomCode;
    inRoomRef.current = true;
    setInRoom(true);
    socket.emit('join-room', { name, roomCode });
  };
  
  const handleLeaveRoom = () => {
    socket.emit('leave-room', { roomCode: roomCodeRef.current });
    inRoomRef.current = false;
    setInRoom(false);
    setRoomCode('');
    setPlayers([]);
    setLeaderId(null);
  };  

  useEffect(() => {
    socket.on('connect', () => {
      setSocketId(socket.id);
    });
  
    // Ignore updates if not yet in a room
    socket.on('update-players', ({ players, leaderId }) => {
      if (!inRoomRef.current) return;
      setPlayers(players || []);
      setLeaderId(leaderId);
    });
  
    socket.on('room-joined', ({ roomCode, players, leaderId }) => {
      // Only once this fires, we officially accept updates
      roomCodeRef.current = roomCode;
      setRoomCode(roomCode);
      setPlayers(players || []);
      setLeaderId(leaderId);
      setInRoom(true);
    });
  
    socket.on('error-msg', (msg) => alert(msg));

    socket.on('game-starting', () => {
        const encodedRoom = encodeURIComponent(roomCodeRef.current);
        const encodedId = encodeURIComponent(socket.id);
        navigate(`/game/${encodedRoom}/${encodedId}`);
    });
    
      
    return () => {
      socket.off('connect');
      socket.off('update-players');
      socket.off('room-joined');
      socket.off('error-msg');
      socket.off('game-starting');
    };
  }, []);

  return (
    <div className="App">
      <div className="home-container">
        <div className="player-list">
          <h2>Player List</h2>
          <ul>
            {Array.isArray(players) && players.map((p, i) => (
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
              <li>Players should first enter their name, and create or join a room.</li>
              <li>Once the game starts, players can create prompts that would fit in the context of "What Pokémon would..."</li>
              <li>And then they would think of a Pokémon that would do the stated thing from other players' prompts and why.</li>
              <li>If any player has a duplicate Pokémon with other players for the same prompt, they will each lose one point.</li>
              <li>If any player doesn't enter a reason for a prompt, they will lose one point.</li>
              <li>And if any player doesn't enter anything for the prompt, they will lose three points.</li>
              <li>All above players who lost points from the current round would be automatically disqualified from the round.</li>
              <li>After all responses are collected, the game will then determine which player has the best response and provide the game's own reasoning, awarding the best response with 3 points</li>
              <li>Once each round is over, the players can decide to vote for the best response of that round, and the best response would get 3 points.</li>
              <li>After all rounds are over, the winner will be determined by the amount of points they have.</li>
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
                {!inRoom ? (
                <>
                    <button className="action-button" onClick={handleCreate}>Create Room</button>
                    <button className="action-button" onClick={handleJoin}>Join Room</button>
                </>
                ) : (
                <button className="action-button leave-room" onClick={handleLeaveRoom}>Leave Room</button>
                )}
            </div>

            <input
                type="text"
                placeholder="Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="room-input"
                disabled={inRoom}
            />

          </div>

          {socketId === leaderId && players.length >= 3 && (
            <div className="start-button-container">
                <button
                className="start-game-button"
                onClick={() => socket.emit('start-game')}
                >
                Start Game
                </button>
            </div>
            )}
            {socketId === leaderId && players.length < 3 && (
            <p className="alert-message">Need at least 3 players to start</p>
          )}

        </div>

        <div
          className="settings-icon"
          onClick={() => {
            if (socketId === leaderId) {
              setShowSettingsModal(true);
            } else {
              alert('Only the party leader can open settings.');
            }
          }}
        >
          ⚙️
        </div>

        {showSettingsModal && (
          <div className="settings-modal">
            <div className="modal-content">
              <h2>Game Settings</h2>
              <label>
                Prompts per player:
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={gameSettings.promptsPerPlayer}
                  onChange={(e) =>
                    setGameSettings({ ...gameSettings, promptsPerPlayer: parseInt(e.target.value) })
                  }
                />
              </label>
              <label>
                Prompt Timer (sec):
                <input
                  type="number"
                  min="15"
                  max="60"
                  value={gameSettings.promptTime}
                  onChange={(e) =>
                    setGameSettings({ ...gameSettings, promptTime: parseInt(e.target.value) })
                  }
                />
              </label>
              <label>
                Answer Timer (sec):
                <input
                  type="number"
                  min="30"
                  max="120"
                  value={gameSettings.answerTime}
                  onChange={(e) =>
                    setGameSettings({ ...gameSettings, answerTime: parseInt(e.target.value) })
                  }
                />
              </label>
              <label>
                Vote Timer (sec):
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={gameSettings.voteTime}
                  onChange={(e) =>
                    setGameSettings({ ...gameSettings, voteTime: parseInt(e.target.value) })
                  }
                />
              </label>
              <label>
                Text Display Speed (0.5x to 3x):
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="3"
                  value={gameSettings.displaySpeed}
                  onChange={(e) =>
                    setGameSettings({ ...gameSettings, displaySpeed: parseFloat(e.target.value) })
                  }
                />
              </label>
              <label>
                Hide Own Score: (Applies to all players in the room)
                <input
                  type="checkbox"
                  checked={gameSettings.hideScores}
                  onChange={(e) =>
                    setGameSettings({ ...gameSettings, hideScores: e.target.checked })
                  }
                />
              </label>
              <button onClick={() => setShowSettingsModal(false)}>Save Settings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;




/* To Do List:
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

- Add a button to leave the room
- Add a button to start the game
  - State that the game is starting in 5s
    - Show a countdown timer
  - Only let the party leader start the game when there are 3 or more players
  - Provide an alert under the start game button when there are not enough players

- Create the other pages for the different portions of the game
*/


/*

Things to fix:

1) css for Game --> gradient doesn't really work properly due to dimensional issues
2) css for PromptEntry --> text color should be in blue instead of orange due to conflicting colors with background
3) jsx for PromptEntry --> timer should be universal
4) css for PromptEntry --> timer overlaps with the text area, expand the area for prompt entry
5) jsx for Game --> refreshing the page should not let the user re-enter the game, send them to home instead (unless you implement a link feature that is directly based off room code and player id)

*/