// App.js
import React, { useEffect, useState } from 'react';
import GameBoard from './components/GameBoard';
import { GameProvider } from './context/GameContext';

function App() {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = window.api.connectToServer();
    setWs(socket);

    socket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'INIT' || data.type === 'GAME_STATE') {
        // Update game state
      }
    };
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
