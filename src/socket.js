// socket.js
import io from 'socket.io-client';

let socket;

export const connectToServer = () => {
  socket = io('http://localhost:8080'); // Make sure this URL matches your server's URL
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
};

export const getSocket = () => socket;
