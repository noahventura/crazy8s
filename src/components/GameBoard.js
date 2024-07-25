import React, { useState, useEffect } from 'react';
import PlayerHand from './PlayerHand';
import Card from './Card';
import CurrentPlayableCard from './CurrentPlayableCard';
import { useGameContext } from '../context/GameContext';

const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

const GameBoard = () => { 
  const { state, dispatch, setSelectingSuit,socket,isConnected } = useGameContext();


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
        <button onClick={startGame}>Start Game</button>
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
