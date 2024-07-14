import React from 'react';
import { useGameContext } from '../context/GameContext';

const CurrentPlayableCard = () => {
  const { state } = useGameContext();

  // Check if topDiscardCard exists before accessing its properties
  const topCard = state.topDiscardCard; // Access topDiscardCard directly

  if (!topCard) {
    // Either return null or render a placeholder if topDiscardCard is undefined
    return null; // Or <div>No card played yet</div>
  }

  // Now you can safely access topCard.suit and topCard.rank
  const suit = topCard.suit.slice(0, -1); 
  const article = topCard.rank === '8' ? 'an' : 'a'; 

  const playableText = `Play ${article} ${topCard.rank} or ${suit}`;
  console.log(playableText);

  return (
    <div className="current-playable-card">
      <h2>{playableText}</h2>
    </div>
  );
};

export default CurrentPlayableCard;