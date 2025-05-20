// src/socket.js
import { io } from 'socket.io-client';

// This should point to the backend (usually 3001), not Vite's frontend port 5173
const socket = io('http://localhost:3001'); 

export default socket;
