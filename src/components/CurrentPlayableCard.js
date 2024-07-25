import React from 'react';
import { useGameContext } from '../context/GameContext';

const CurrentPlayableCard = () => {
  const { state } = useGameContext();

  
  const topCard = state.topDiscardCard; 

  if (!topCard) {
    return null; 
  }

  const suit = topCard.suit.slice(0, -1); 
  const article = topCard.rank === '8' ? 'an' : 'a'; 

  let playableText = '';
  if (state.currentRank !== '') { 
    // If there's a rank restriction
    playableText = `Play a ${state.currentRank} or ${state.currentSuit.slice(0, -1)}`; // Regular play
  } else {
    // If no rank restriction (after an "8")
    playableText = `Play any ${state.currentSuit.slice(0, -1)}`; // Any rank of the selected suit
  }

  return (
    <div className="current-playable-card">
      <h2>{playableText}</h2>
    </div>
  );
};

export default CurrentPlayableCard;