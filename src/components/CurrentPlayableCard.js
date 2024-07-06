import React from 'react';
import { useGameContext } from '../context/GameContext';

const CurrentPlayableCard = () => {
  const { state } = useGameContext();
  const topCard = state.discardPile[0];
  
  // Determine the correct text to display
  const suit = topCard.suit.slice(0, -1); // Remove the last character to make the suit singular
  const article = topCard.rank === '8' ? 'an' : 'a'; // Use 'an' for 8 and 'a' for other ranks

  const playableText = `Play ${article} ${topCard.rank} or ${suit}`;
  console.log(playableText)

  return (
    <div className="current-playable-card">
      <h2>{playableText}</h2>
    </div>
  );
};

export default CurrentPlayableCard;
