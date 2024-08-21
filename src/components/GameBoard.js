import React, { useState, useEffect } from 'react';
import PlayerHand from './PlayerHand';
import Card from './Card';
import CurrentPlayableCard from './CurrentPlayableCard';
import { useGameContext } from '../context/GameContext';
import { v4 as uuidv4 } from 'uuid';

const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];


const GameBoard = () => { 
  const { state, dispatch, setSelectingSuit,socket,isConnected } = useGameContext();
  const [playerName, setPlayerName] = useState('');
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [roomId, setRoomId] = useState(''); // State to store the room ID

  useEffect(() => {
  
    if (socket){
      socket.on('connect', () => {
        console.log('Connected to server from GameBoard'); 
        //setIsConnected(true);
        console.log('Socket object:',socket)
      });
  
      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        //setIsConnected(false);
      });

      socket.on('LOBBY_UPDATED', (lobbyData) => {
        setLobbyPlayers(lobbyData); 
      });
      socket.on('ROOM_CREATED', (data) => {
        const receivedRoomId = data.roomId;
       console.log('Room created with ID:', receivedRoomId);

      // ... display the receivedRoomId to the user (e.g., using an alert or by setting state) 
      });
    // Cleanup on component unmount
    return () => { 
      if (socket){
      socket.disconnect();
      }
    };

  }
}, [socket]);

  useEffect(() => {
    if (isConnected && socket) {
      socket.on('GAME_STATE_UPDATE', (newState) => {
        dispatch({ type: 'UPDATE_STATE', payload: newState });
      });
    }
  }, [isConnected, socket]);

  const handleCreateRoom = () => {
    if (isConnected && socket && playerName) {
      const playerData = { id: uuidv4(), name: playerName };
      socket.emit('CREATE_GAME_ROOM', playerData); 
    }
  };
  
  const handleJoinRoom = () => {
    if (isConnected && socket && roomId && playerName) {
      const playerData = { id:uuidv4(), name: playerName };
      socket.emit('JOIN_GAME_ROOM', { roomId, playerData });

      console.log("Attempting to join room with ID:", roomId);

    }
      else {
      // Provide user feedback if something is missing 
      alert("Please enter both your name and a room ID.");
    }
  };

  const joinLobby = () => {
    if (isConnected && socket && playerName) {
      const playerId = uuidv4();
      const playerData = { id: playerId, name: playerName };
      socket.emit('JOIN_GAME_ROOM', playerData); // Assuming 'JOIN_LOBBY' is your server event
    }
  };

  const startGame = () => {
    if (isConnected && socket) {
      console.log('Sending START_GAME event to server');
      socket.emit('START_GAME'); 
    } else {
      console.error('WebSocket is not open yet!');
    }
  };

  // *** Corrected drawCard and handleSuitSelection functions ***
  const drawCard = () => {
    console.log('Draw Card button clicked');
    if (isConnected && socket) {
      socket.emit('DRAW_CARD'); // Use socket.emit 
    } else {
      console.log('WebSocket is not open yet!');
    }
  };

  const handleSuitSelection = (suit) => {
    console.log('Suit selection button clicked:', suit);
    if (isConnected && socket) {
      socket.emit('SET_SUIT', { newSuit: suit }); // Use socket.emit
    } else {
      console.log('WebSocket is not open yet!');
    }
  };


  return (
    <div className="game-board">
      <h1>Crazy 8's</h1>

      {!state.gameStarted ? (
        <div>
          <input 
            type="text" 
            placeholder="Enter your name" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={handleCreateRoom}>Create Room</button>
          <br />
          <input 
          type="text" 
          placeholder="Enter room ID" 
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)} 
        />
        <button onClick={handleJoinRoom} disabled={!playerName}>
          Join Game
        </button>
        
          <h3>Players in Lobby:</h3>
          <ul>
            {lobbyPlayers.map((player) => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
          {/* Show "Start Game" button after joining the lobby */}
          {lobbyPlayers.length > 0 && ( // Check if there are players in the lobby
            <button onClick={startGame}>Start Game</button>
          )}
        </div>
       ) : (
         <div> 
           {state.gameOver ? (
             <h2>Game Over! Player 1 wins!</h2>
           ) : (
            <div>
              <div>
                <h2>Current Player: Player 1</h2>
                <CurrentPlayableCard />
              </div>
              {state.selectingSuit ? (
                <div>
                  <h3>Select a new suit:</h3>
                  {suits.map((suit) => (
                    <button key={suit} onClick={() => handleSuitSelection(suit)}>
                      {suit}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="player-hand">
                    <PlayerHand setSelectingSuit={setSelectingSuit}/>
                  </div>
                  <button onClick={drawCard}>Draw Card</button>
                </>
              )}
              <div className="discard-pile">
                <h2>Top of Discard Pile</h2>
                {state.topDiscardCard && (
                  <Card suit={state.topDiscardCard.suit} rank={state.topDiscardCard.rank} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameBoard;
