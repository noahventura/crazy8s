import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { connectToServer, getSocket } from '../socket';

const GameContext = createContext();

const initialState = {
  gameStarted: false,
  gameOver: false,
  currentPlayer: 0,
  currentRank: '',
  currentSuit: '',
  topDiscardCard: null,
  selectingSuit: false, // This is already here, you are right!
  players: [],
};

const reducer = (state, action) => {
  switch (action.type) {

    case 'START_GAME':
      return { ...state, gameStarted: true };
    case 'DRAW_CARD': {
      // 1. Check if the deck is empty (you might need to handle this case differently)
      if (state.deck.length === 0) {
        // Handle empty deck (e.g., shuffle discard pile back into the deck)
        return state; // Or return a modified state
      }
    
      // 2. Get the current player's hand
      const currentPlayerIndex = state.currentPlayer; 
      const newPlayers = [...state.players];
      const playerHand = newPlayers[currentPlayerIndex].hand;
    
      // 3. Take a card from the deck
      const drawnCard = state.deck.pop(); 
    
      // 4. Add the drawn card to the player's hand
      playerHand.push(drawnCard); 
    
      // 5. Update the game state
      return {
        ...state,
        deck: [...state.deck], // Create a new deck array (optional but good practice)
        players: newPlayers,
      };
    }
    case 'SET_SUIT':
      return { ...state, currentSuit: action.payload.newSuit };
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    case 'PLAY_CARD': {
      const { cardIndex } = action.payload;
      const currentPlayer = state.currentPlayer;

      // Create a new array of players to avoid mutating state directly
      const newPlayers = [...state.players];
      const playedCard = newPlayers[currentPlayer].hand.splice(cardIndex, 1)[0];

      return {
        ...state,
        players: newPlayers,
        discardPile: [...state.discardPile, playedCard],
        topDiscardCard: playedCard,
        currentPlayer: (currentPlayer + 1) % state.players.length, // Update current player
        currentRank: playedCard.rank,
        currentSuit: playedCard.suit,
      };
    }
    default:
      return state;

    
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectingSuit, setSelectingSuit] = useState(initialState.selectingSuit);
  const [socket, setSocket] = useState(null); 

  useEffect(() => {
    connectToServer();
    const newSocket = getSocket();
    setSocket(newSocket)

    if (newSocket) {
      newSocket.on('GAME_STATE_UPDATE', (newState) => {
        dispatch({ type: 'UPDATE_STATE', payload: newState });
      });
    }

  }, []);

  const contextValue = {
    state,
    dispatch,
    selectingSuit,       
    setSelectingSuit, 
    socket,   
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);
