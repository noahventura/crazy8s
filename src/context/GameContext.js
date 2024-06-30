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
    console.log('Current State:', state);
    console.log('Action:', action);
  
    switch (action.type) {
      case 'START_GAME':
        const players = state.players.map(player => ({
          ...player,
          hand: state.deck.splice(0, 5),
        }));
        return {
          ...state,
          players,
          gameStarted: true,
          discardPile: [state.deck.pop()],  // Initialize discard pile with one card from the deck
        };
      case 'DRAW_CARD':
        if (state.deck.length === 0) {
          console.error('No more cards in the deck');
          return state;
        }
        const updatedPlayers = state.players.map((player, index) => {
          if (index === state.currentPlayer) {
            return {
              ...player,
              hand: [...player.hand, state.deck.pop()],
            };
          }
          return player;
        });
        return {
          ...state,
          players: updatedPlayers,
          currentPlayer: (state.currentPlayer + 1) % state.players.length,
        };
      case 'PLAY_CARD':
        const { cardIndex } = action.payload;
        const playedCard = state.players[state.currentPlayer].hand[cardIndex];
  
        if (!playedCard) {
          console.error('Invalid card index:', cardIndex);
          return state;
        }
  
        const topDiscard = state.discardPile[state.discardPile.length - 1];
        const isValidMove =
          playedCard.rank === topDiscard.rank || 
          playedCard.suit === (state.nextSuit || topDiscard.suit) ||
          playedCard.rank === '8';
  
        if (!isValidMove) {
          console.error('Invalid move:', playedCard);
          return state; // Invalid move, do nothing
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
  
        if (playedCard.rank === '8') {
          return {
            ...state,
            players: newPlayers,
            discardPile: [...state.discardPile, playedCard],
            currentPlayer: (state.currentPlayer + 1) % state.players.length,
            choosingSuit: true,
          };
        }
  
        return {
          ...state,
          players: newPlayers,
          discardPile: [...state.discardPile, playedCard],
          currentPlayer: (state.currentPlayer + 1) % state.players.length,
          nextSuit: playedCard.suit,
        };
  
      case 'CHOOSE_SUIT':
        const { suit } = action.payload;
        return {
          ...state,
          choosingSuit: false,
          nextSuit: suit,
        };
  
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
  