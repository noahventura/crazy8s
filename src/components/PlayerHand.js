import React from 'react';
import Card from './Card';
import { useGameContext } from '../context/GameContext';

const PlayerHand = ({ playerId, setSelectingSuit }) => { // playerId received as a prop
  const { state, socket } = useGameContext();
  const playerHand = state.players[state.currentPlayer].hand || [];

  const playCard = (index) => {
    console.log("Current Player ID from game state:", state.players[state.currentPlayer]?.id);
    console.log("playerId (from PlayerHand):", playerId);
    console.log('playCard function called with index:', index);
    const playedCard = playerHand[index];

    // Only emit the PLAY_CARD event; no local state updates:
    if (state.players[state.currentPlayer]?.id === playerId) { // Use the playerId prop
      if (
        playedCard.rank === '8' ||
        playedCard.suit === state.currentSuit ||
        playedCard.rank === state.currentRank
      ) {
        if (playedCard.rank === '8') {
          setSelectingSuit(true);
        }
        console.log("Socket object before emitting PLAY_CARD:", socket);
        socket.emit('PLAY_CARD', { playerId: playerId, cardIndex: index }); 
        socket.emit('CHECK_GAME_OVER', { playerId: playerId });
      }
    } else {
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