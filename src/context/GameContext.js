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

// src/context/GameContext.js

const gameReducer = (state, action) => {
    switch (action.type) {
      case 'START_GAME':
        const players = state.players.map(player => ({
          ...player,
          hand: state.deck.splice(0, 5),
        }));
        console.log('Game started, players initialized:', players);
        return {
          ...state,
          players,
          gameStarted: true,
          discardPile: [state.deck.pop()],  // Initialize discard pile with one card from the deck
        };
      case 'DRAW_CARD':
        const updatedPlayers = state.players.map((player, index) => {
          if (index === state.currentPlayer) {
            return {
              ...player,
              hand: [...player.hand, state.deck.pop()],
            };
          }
          return player;
        });
        console.log('Card drawn, players updated:', updatedPlayers);
        return {
          ...state,
          players: updatedPlayers,
          currentPlayer: (state.currentPlayer + 1) % state.players.length,
        };
      case 'PLAY_CARD':
        const { cardIndex } = action.payload;
        const playedCard = state.players[state.currentPlayer].hand[cardIndex];
  
        // Check if the discard pile is empty
        if (state.discardPile.length > 0) {
          const topDiscard = state.discardPile[state.discardPile.length - 1];
          const isValidMove =
            playedCard.rank === topDiscard.rank || playedCard.suit === topDiscard.suit;
  
          if (!isValidMove) {
            console.log('Invalid move:', playedCard, 'Top of discard pile:', topDiscard);
            return state; // Invalid move, do nothing
          }
        }
  
        const newPlayers = state.players.map((player, index) => {
          if (index === state.currentPlayer) {
            const newHand = [...player.hand];
            newHand.splice(cardIndex, 1);
            return {
              ...player,
              hand: newHand,
            };
          }
          return player;
        });
  
        console.log('Card played:', playedCard);
        return {
          ...state,
          players: newPlayers,
          discardPile: [...state.discardPile, playedCard],
          currentPlayer: (state.currentPlayer + 1) % state.players.length,
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
  
