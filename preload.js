const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel, data) => {
    // whitelist channels to prevent vulnerabilities
    let validChannels = ['START_GAME', 'DRAW_CARD', 'PLAY_CARD', 'SET_SUIT', 'JOIN_LOBBY']; // Add any other channels you need
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receiveMessage: (channel, func) => {
    let validChannels = ['GAME_STATE_UPDATE', 'LOBBY_UPDATED', 'NOT_ENOUGH_PLAYERS', 'GAME_ALREADY_STARTED']; // Add any other channels
    if (validChannels.includes(channel)) {
      //strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});