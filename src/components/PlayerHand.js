import React from 'react';
import Card from './Card';
import { useGameContext } from '../context/GameContext';

const PlayerHand = ({ setSelectingSuit }) => {
  const { state, dispatch } = useGameContext();
  const playerHand = state.players[state.currentPlayer]?.hand || [];
  const { socket } = useGameContext();
  const playCard = (index) => {
    console.log('playCard function called with index:', index); 
    const playedCard = playerHand[index];
    console.log("playedCard:", playedCard);
  console.log("state.currentSuit:", state.currentSuit);
  console.log("state.currentRank:", state.currentRank); 
    if (
      playedCard.rank === '8' ||
      playedCard.suit === state.currentSuit ||
      playedCard.rank === state.currentRank
    ) {
      if (playedCard.rank === '8') {
        setSelectingSuit(true);
      }
      console.log("Socket object before emitting PLAY_CARD:", socket);
      socket.emit('PLAY_CARD', { playerId: state.currentPlayer, cardIndex: index });
      dispatch({
        type: 'PLAY_CARD',
        payload: { cardIndex: index },
      });
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
