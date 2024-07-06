// GameBoard.js
import React from 'react';
import PlayerHand from './PlayerHand';
import Card from './Card';
import CurrentPlayableCard from './CurrentPlayableCard';
import { useGameContext } from '../context/GameContext';

const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

const GameBoard = ({ ws }) => {
  const { state, dispatch } = useGameContext();

  const startGame = () => {
    ws.send(JSON.stringify({ type: 'START_GAME' }));
  };

  const drawCard = () => {
    ws.send(JSON.stringify({ type: 'DRAW_CARD', playerId: state.currentPlayer }));
  };

  const handleSuitSelection = (suit) => {
    ws.send(JSON.stringify({ type: 'SET_SUIT', newSuit: suit }));
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
              {state.selectingSuit ? (
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
                    <PlayerHand />
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
