import React from 'react';
import Card from './Card';
import { useGameContext } from '../context/GameContext';

const PlayerHand = ({ setSelectingSuit }) => {
  const { state, dispatch } = useGameContext();
  const playerHand = state.players[state.currentPlayer]?.hand || [];

  const playCard = (index) => {
    const playedCard = playerHand[index];
    if (
      playedCard.rank === '8' ||
      playedCard.suit === state.currentSuit ||
      playedCard.rank === state.currentRank
    ) {
      if (playedCard.rank === '8') {
        setSelectingSuit(true);
      }
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
