import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'; 
import PlayerHand from './PlayerHand';
import Card from './Card';
import CurrentPlayableCard from './CurrentPlayableCard';
import { useGameContext } from '../context/GameContext';

const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

const GameBoard = () => { 
  const { state, dispatch, setSelectingSuit } = useGameContext();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:8080'); // Connect to your server
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server from GameBoard'); 
      setIsConnected(true);

      console.log('Socket object:',newSocket)
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Cleanup on component unmount
    return () => { 
      newSocket.disconnect();
    };
  }, []); 

  useEffect(() => {
    if (isConnected && socket) {
      socket.on('GAME_STATE_UPDATE', (newState) => {
        dispatch({ type: 'UPDATE_STATE', payload: newState });
      });
    }
  }, [isConnected, socket]);

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
      socket.emit('DRAW_CARD', { playerId: state.currentPlayer }); // Use socket.emit 
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
        <button onClick={startGame}>Start Game</button>
      ) : (
        <div>
          {state.gameOver ? (
            <h2>Game Over! Player {state.currentPlayer + 1} wins!</h2>
          ) : (
            <div>
              <div>
                <h2>Current Player: Player {state.currentPlayer + 1}</h2>
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
