import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const rooms = {}; // Structure: { roomCode: { leaderId, players: [{ id, name }] } }

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Create Room
  socket.on('create-room', ({ name, roomCode }) => {
    rooms[roomCode] = {
      leaderId: socket.id,
      players: [{ id: socket.id, name }]
    };
    socket.join(roomCode);
  
    console.log(`🆕 Room created: ${roomCode} by ${name} (${socket.id})`);
    io.to(roomCode).emit('update-players', {
      players: rooms[roomCode].players,
      leaderId: rooms[roomCode].leaderId
    });
  
    // ✅ Emit room joined confirmation
    socket.emit('room-joined', {
      roomCode,
      players: rooms[roomCode].players,
      leaderId: rooms[roomCode].leaderId
    });
  });
  
  // Join Room
  socket.on('join-room', ({ name, roomCode }) => {
    if (!rooms[roomCode]) {
      socket.emit('error-msg', 'Room does not exist.');
      return;
    }
  
    rooms[roomCode].players.push({ id: socket.id, name });
    socket.join(roomCode);
  
    console.log(`👥 ${name} joined room ${roomCode}`);
    io.to(roomCode).emit('update-players', {
      players: rooms[roomCode].players,
      leaderId: rooms[roomCode].leaderId
    });
  
    // ✅ Emit room joined confirmation
    socket.emit('room-joined', {
      roomCode,
      players: rooms[roomCode].players,
      leaderId: rooms[roomCode].leaderId
    });
  });

  // Start Game
  socket.on('start-game', () => {
    const roomCode = Object.keys(rooms).find(code =>
      rooms[code].players.some(p => p.id === socket.id)
    );
    if (roomCode) {
      io.to(roomCode).emit('game-starting');
    }
  });  

  // Leave Room
    socket.on('leave-room', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return;
    
        const wasInRoom = room.players.some(p => p.id === socket.id);
        room.players = room.players.filter(p => p.id !== socket.id);
    
        if (room.leaderId === socket.id && room.players.length > 0) {
        room.leaderId = room.players[0].id;
        console.log(`👑 Leader reassigned to ${room.leaderId} in room ${roomCode}`);
        }
    
        if (room.players.length === 0) {
        console.log(`🗑️ Room deleted: ${roomCode}`);
        delete rooms[roomCode];
        } else if (wasInRoom) {
        io.to(roomCode).emit('update-players', {
            players: room.players,
            leaderId: room.leaderId
        });
        }
    
        socket.leave(roomCode);
        console.log(`🚪 ${socket.id} left room ${roomCode}`);
    });  
  
  // Disconnect Handling
  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', socket.id);

    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      const wasInRoom = room.players.some(p => p.id === socket.id);

      // Remove player
      room.players = room.players.filter(p => p.id !== socket.id);

      if (room.leaderId === socket.id && room.players.length > 0) {
        room.leaderId = room.players[0].id;
        console.log(`👑 Leader reassigned to ${room.leaderId} in room ${roomCode}`);
      }

      if (room.players.length === 0) {
        console.log(`🗑️ Room deleted: ${roomCode}`);
        delete rooms[roomCode];
      } else if (wasInRoom) {
        io.to(roomCode).emit('update-players', {
          players: room.players,
          leaderId: room.leaderId
        });
      }
    }
  });
});

server.listen(3001, () => console.log('🚀 Server running on http://localhost:3001'));
