import React, { useState } from 'react';
import PlayerHand from './PlayerHand';
import Card from './Card';
import CurrentPlayableCard from './CurrentPlayableCard';
import { useGameContext } from '../context/GameContext';

const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

const GameBoard = () => {
  const { state, dispatch } = useGameContext();
  const [selectingSuit, setSelectingSuit] = useState(false);

  const startGame = () => {
    dispatch({ type: 'START_GAME' });
  };

  const drawCard = () => {
    dispatch({ type: 'DRAW_CARD' });
  };

  const handleSuitSelection = (suit) => {
    dispatch({
      type: 'SET_SUIT',
      payload: { newSuit: suit },
    });
    setSelectingSuit(false);
  };

  return (
    <div className="game-board">
      <h1>Crazy 8's</h1>
      {!state.gameStarted ? (
        <button onClick={startGame}>Start Game</button>
      ) : (
        <div>
          {state.gameOver ? (
            <h2>Game Over! Player {state.currentPlayer + 1} wins!</h2>
          ) : (
            <div>
              <div>
                <h2>Current Player: Player {state.currentPlayer + 1}</h2>
                <CurrentPlayableCard />
              </div>
              {selectingSuit ? (
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
                    <PlayerHand setSelectingSuit={setSelectingSuit} />
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
