// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { GameProvider } from './context/GameContext';

ReactDOM.render(

    <GameProvider>
      <App />
    </GameProvider>,
  document.getElementById('root')
);
