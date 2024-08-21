import React from 'react';
import Card from './Card';
import { useGameContext } from '../context/GameContext';

const PlayerHand = ({ setSelectingSuit }) => {
  const { state, socket } = useGameContext(); // No need for dispatch

   // Find player ID based on socket ID
  const playerId = state.players.find(player => player.socketId === socket.id)?.id;
  const playerHand = state.players[state.currentPlayer].hand || [];

  const playCard = (index) => {
    console.log('playCard function called with index:', index);
    const playedCard = playerHand[index];

    // Only emit the PLAY_CARD event; no local state updates:
    if (state.players[state.currentPlayer]?.id === playerId) {
      if (
        playedCard.rank === '8' ||
        playedCard.suit === state.currentSuit ||
        playedCard.rank === state.currentRank
      ) {
        if (playedCard.rank === '8') {
          setSelectingSuit(true); 
        }
        console.log("Socket object before emitting PLAY_CARD:", socket);
        socket.emit('PLAY_CARD', { playerId: playerId, cardIndex: index}); // playerId is always 1
        socket.emit('CHECK_GAME_OVER', { playerId: playerId }); 
      }
    }
    else{
      console.log('out of order')
    }
  };
  

  return (
    <div className="player-hand">
      {playerHand.map((card, index) => (
        <div key={index} onClick={() => playCard(index)}>
          <Card suit={card.suit} rank={card.rank} />
        </div>
      ))}
    </div>
  );
};

export default PlayerHand;