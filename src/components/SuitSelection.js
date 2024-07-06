// src/components/SuitSelection.js
import React from 'react';
import { useGameContext } from '../context/GameContext';

const SuitSelection = () => {
  const { dispatch } = useGameContext();

  const chooseSuit = (suit) => {
    dispatch({ type: 'CHOOSE_SUIT', payload: { suit } });
  };

  return (
    <div className="suit-selection">
      <h2>Choose a suit</h2>
      <button onClick={() => chooseSuit('Hearts')}>Hearts</button>
      <button onClick={() => chooseSuit('Diamonds')}>Diamonds</button>
      <button onClick={() => chooseSuit('Clubs')}>Clubs</button>
      <button onClick={() => chooseSuit('Spades')}>Spades</button>
    </div>
  );
};

export default SuitSelection;
