import React from 'react';
import Card from './Card';
import { useGameContext } from '../context/GameContext';

const PlayerHand = ({ setSelectingSuit }) => {
  const { state, socket } = useGameContext(); // No need for dispatch
  const playerHand = state.players[0]?.hand || []; // Always player 0

  const playCard = (index) => {
    console.log('playCard function called with index:', index);
    const playedCard = playerHand[index];

    // Only emit the PLAY_CARD event; no local state updates:
    if (
      playedCard.rank === '8' ||
      playedCard.suit === state.currentSuit ||
      playedCard.rank === state.currentRank
    ) {
      if (playedCard.rank === '8') {
        setSelectingSuit(true); 
      }
      console.log("Socket object before emitting PLAY_CARD:", socket);
      socket.emit('PLAY_CARD', { playerId: 1, cardIndex: index }); // playerId is always 1
      socket.emit('CHECK_GAME_OVER', { playerId: 1 }); 
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