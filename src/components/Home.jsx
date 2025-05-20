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
              <li>Enter your name</li>
              <li>Create or join a game</li>
              <li>Play and have fun!</li>
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
