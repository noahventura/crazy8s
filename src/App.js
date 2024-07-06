// App.js
import React, { useEffect, useState } from 'react';
import GameBoard from './components/GameBoard';
import { GameProvider } from './context/GameContext';
import { connectToServer, getSocket } from './socket';

function App() {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    connectToServer();
    const socket = getSocket();
    setWs(socket);

    if (socket) {
      socket.on('message', (message) => {
        const data = JSON.parse(message.data);
        if (data.type === 'INIT' || data.type === 'GAME_STATE') {
          // Update game state
        }
      });
    }
  }, []);

  return (
    <GameProvider>
      <div className="App">
        <GameBoard ws={ws} />
      </div>
    </GameProvider>
  );
}

export default App;
