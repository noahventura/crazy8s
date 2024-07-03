import React, { createContext, useReducer, useContext } from 'react';

const GameContext = createContext();

const initialState = {
  players: [{ hand: [] }],  // Assuming a single player for simplicity
  deck: generateDeck(),
  discardPile: [generateDeck().pop()],
  currentPlayer: 0,
  gameStarted: false,
  gameOver: false,
  currentSuit: null,
  currentRank: null,
  topDiscardCard: null, // Add this line
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
        const players = state.players.map(player => ({
          ...player,
          hand: state.deck.splice(0, 5),
        }));
        const firstCard = state.discardPile[0];
        return {
          ...state,
          players,
          gameStarted: true,
          currentSuit: firstCard.suit,
          currentRank: firstCard.rank,
          topDiscardCard: firstCard,
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
        return {
          ...state,
          players: updatedPlayers,
        };
      case 'PLAY_CARD':
        const { cardIndex } = action.payload;
        const newPlayers = state.players.map((player, index) => {
          if (index === state.currentPlayer) {
            const newHand = [...player.hand];
            const playedCard = newHand.splice(cardIndex, 1)[0];
            return {
              ...player,
              hand: newHand,
            };
          }
          return player;
        });
  
        const playedCard = state.players[state.currentPlayer].hand[cardIndex];
        const gameOver = newPlayers[state.currentPlayer].hand.length === 0;
  
        return {
          ...state,
          players: newPlayers,
          discardPile: [...state.discardPile, playedCard],
          currentSuit: playedCard.rank === '8' ? state.currentSuit : playedCard.suit,
          currentRank: playedCard.rank,
          currentPlayer: gameOver ? state.currentPlayer : (state.currentPlayer + 1) % state.players.length,
          topDiscardCard: playedCard,
          gameOver: gameOver, // Update the game over state
        };
      case 'SET_SUIT':
        return {
          ...state,
          currentSuit: action.payload.newSuit,
          currentPlayer: (state.currentPlayer + 1) % state.players.length,
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
