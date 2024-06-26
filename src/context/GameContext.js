// src/context/GameContext.js
import React, { createContext, useReducer, useContext } from 'react';

const GameContext = createContext();

const initialState = {
  players: [{ hand: [] }],  // Assuming a single player for simplicity
  deck: generateDeck(),
  discardPile: [],
  currentPlayer: 0,
  gameStarted: false,
  gameOver: false,
};

function generateDeck() {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const ranks = [
    '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'
  ];
  const deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'START_GAME':
      // Deal 5 cards to each player
      const players = state.players.map(player => ({
        ...player,
        hand: state.deck.splice(0, 5),
      }));
      return {
        ...state,
        players,
        gameStarted: true,
      };
    // Add more cases for other game actions
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  return useContext(GameContext);
};
