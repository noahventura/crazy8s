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
  selectingSuit: false,
  players: [],
};

const reducer = (state, action) => {
  switch (action.type) {

    case 'START_GAME':
      return { ...state, gameStarted: true };
    case 'DRAW_CARD': {
      if (state.deck.length === 0) {
      
        return state; // Or return a modified state
      }
    

      const currentPlayerIndex = state.currentPlayer; 
      const newPlayers = [...state.players];
      const playerHand = newPlayers[currentPlayerIndex].hand;
    
  
      const drawnCard = state.deck.pop(); 

      playerHand.push(drawnCard); 
    
      //Update the game state
      return {
        ...state,
        deck: [...state.deck], 
        players: newPlayers,
      };
    }
    case 'SET_SUIT':
      return { ...state, currentSuit: action.payload.newSuit };
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    case 'PLAY_CARD': {
      console.log('PLAY_CARD action received in reducer.');
      console.log('Action payload:', action.payload);
      console.log('State before update:', state);
      const { cardIndex } = action.payload;
      const currentPlayer = state.currentPlayer;

      // Create a new array of players to avoid mutating state directly
      const newPlayers = [...state.players];
      const playedCard = newPlayers[currentPlayer].hand.splice(cardIndex, 1)[0];
      console.log('State after update:', state);
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
  const [isConnected, setIsConnected]= useState(false);

  useEffect(() => {
    connectToServer();
    const newSocket = getSocket();
    setSocket(newSocket)

    if (newSocket) {
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true); // Update isConnected here
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false); // Update isConnected here
      });
    }
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
    isConnected,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);
