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

const rooms = {}; // { ROOM_CODE: [ { id, name } ] }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-room', ({ name, roomCode }) => {
    rooms[roomCode] = [{ id: socket.id, name }];
    socket.join(roomCode);
    io.to(roomCode).emit('update-players', rooms[roomCode]);
  });

  socket.on('join-room', ({ name, roomCode }) => {
    if (!rooms[roomCode]) {
      socket.emit('error-msg', 'Room does not exist.');
      return;
    }
    rooms[roomCode].push({ id: socket.id, name });
    socket.join(roomCode);
    io.to(roomCode).emit('update-players', rooms[roomCode]);
  });

  socket.on('disconnect', () => {
    for (const roomCode in rooms) {
      rooms[roomCode] = rooms[roomCode].filter(player => player.id !== socket.id);
      io.to(roomCode).emit('update-players', rooms[roomCode]);
    }
  });
});

// Socket.IO setup here

server.listen(3001, () => console.log('Server running on port 3001'));
