import React, { useEffect, useState } from 'react';
import GameBoard from './components/GameBoard';
import { GameProvider } from './context/GameContext';
import { connectToServer, getSocket } from './socket';

function App() {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // Add connection status state

  useEffect(() => {
    connectToServer();
    const socket = getSocket();
    setWs(socket);

    if (socket) {
      socket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true); // Update connection status
      });

      // ... (other event listeners)

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false); // Update connection status
      });
    }
  }, []);

  return (
    <GameProvider>
      <div className="App">
        {isConnected ? ( // Conditionally render GameBoard
          <GameBoard />
        ) : (
          <p>Connecting to server...</p>
        )}
      </div>
    </GameProvider>
  );
}

export default App;