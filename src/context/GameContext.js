// src/context/GameContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
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
    case 'DRAW_CARD':
      return state;
    case 'SET_SUIT':
      return { ...state, currentSuit: action.payload.newSuit };
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    connectToServer();
    const socket = getSocket();

    if (socket) {
      socket.on('GAME_STATE_UPDATE', (newState) => {
        dispatch({ type: 'UPDATE_STATE', payload: newState });
      });
    }

  }, []);

  const contextValue = {
    state,
    dispatch,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);
