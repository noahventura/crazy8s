// socket.js
import { io } from 'socket.io-client';

let socket;

const connectToServer = () => {
  socket = io('http://localhost:8080'); // Adjust URL as per your server setup

  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
};

const getSocket = () => socket;

export { connectToServer, getSocket };
