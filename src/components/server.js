const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));

const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('Socket.IO server is running');
});

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST']
  }
});

// GameRoom Class
class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.gameState = {
      gameStarted: false,
      gameOver: false,
      currentRank: '',
      currentSuit: '',
      topDiscardCard: null,
      selectingSuit: false,
      deck: [],
      discardPile: [],
      lobby: [],
      players: [],
      currentPlayer: 0
    };
  }

  addPlayer(playerData) {
    this.gameState.lobby.push(playerData);
    console.log('bing!')
  }

  startGame() {
    this.gameState.players = [...this.gameState.lobby];
    console.log(this.gameState.players)
    this.gameState.lobby = [];
    this.gameState.gameStarted = true;
    this.gameState.deck = shuffleDeck();
    dealCards(this.gameState.players, this.gameState.deck);
    this.gameState.topDiscardCard = this.gameState.deck.pop();
    this.gameState.currentRank = this.gameState.topDiscardCard.rank;
    this.gameState.currentSuit = this.gameState.topDiscardCard.suit;
    this.gameState.currentPlayer = Math.floor(Math.random() * this.gameState.players.length);
  }

  drawCard() {
    if (this.gameState.deck.length === 0) {
      const topDiscard = this.gameState.discardPile.pop();
      this.gameState.deck = shuffleDeck(this.gameState.discardPile);
      this.gameState.discardPile = [topDiscard];
    }
    if (this.gameState.deck.length > 0) {
      this.gameState.players[this.gameState.currentPlayer].hand.push(this.gameState.deck.pop());
    }
  }

  playCard(playerId, cardIndex) {
    const player = this.gameState.players.find(p => p.id === playerId);
    if (player && player.hand.length > cardIndex) {
      const playedCard = player.hand.splice(cardIndex, 1)[0];
      if (this.isValidPlay(playedCard)) {
        this.gameState.discardPile.push(playedCard);
        this.gameState.topDiscardCard = playedCard;
        this.updateCurrentPlayer();
        return true; // Valid play
      } else {
        player.hand.push(playedCard); // Return the card to the hand
      }
    }
    return false; // Invalid play attempt
  }

  isValidPlay(playedCard) {
    return (
      playedCard.rank === '8' ||
      playedCard.rank === this.gameState.currentRank ||
      playedCard.suit === this.gameState.currentSuit
    );
  }

  updateCurrentPlayer() {
    this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
  }
}

let gameRooms = {}; // Object to store game rooms, keyed by room ID

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('CREATE_GAME_ROOM', (playerData) => {
    playerData.socketId = socket.id; // Assign socket ID to player data
    const roomId = uuidv4();
    const gameRoom = new GameRoom(roomId);
    gameRoom.addPlayer(playerData);
    console.log('bong!')
    gameRooms[roomId] = gameRoom;

    socket.join(roomId);
    socket.emit('ROOM_CREATED', { roomId });
    console.log('Game room created with ID:', roomId);
    io.to(roomId).emit('GAME_STATE_UPDATE', gameRoom.gameState);
});


socket.on('JOIN_GAME_ROOM', ({ roomId, playerData }) => {
  if (gameRooms[roomId]) {
    playerData.socketId = socket.id;
    const playerId = playerData.id;
    
    gameRooms[roomId].addPlayer(playerData);
    socket.join(roomId);
    socket.to(roomId).emit('PLAYER_JOINED', playerData);
    
    console.log('Player joined room:', roomId);
    
    // Update all clients with the new game state
    io.to(roomId).emit('GAME_STATE_UPDATE', gameRooms[roomId].gameState);
  } else {
    socket.emit('ROOM_NOT_FOUND');
  }
});


  socket.on('START_GAME', () => {
    const roomId = Array.from(socket.rooms)[1];
    const currentRoom = gameRooms[roomId];

    if (!currentRoom || currentRoom.gameState.gameStarted) {
      console.error('Room not found or game already started:', roomId);
      return;
    }

    currentRoom.startGame();
    io.to(roomId).emit('GAME_STATE_UPDATE', currentRoom.gameState);
  });

  socket.on('DRAW_CARD', () => {
    const roomId = Array.from(socket.rooms)[1];
    const currentRoom = gameRooms[roomId];

    if (!currentRoom) {
      console.error('Room not found:', roomId);
      return;
    }

    currentRoom.drawCard();
    io.to(roomId).emit('GAME_STATE_UPDATE', currentRoom.gameState);
  });

  socket.on('PLAY_CARD', (data) => {
    const roomId = Array.from(socket.rooms)[1];
    const currentRoom = gameRooms[roomId];

    if (!currentRoom) {
      console.error('Room not found:', roomId);
      return;
    }

    const validPlay = currentRoom.playCard(data.playerId, data.cardIndex);
    if (validPlay) {
      io.to(roomId).emit('GAME_STATE_UPDATE', currentRoom.gameState);
    } else {
      console.log('Invalid play attempt');
    }
  });

  socket.on('SET_SUIT', ({ newSuit }) => {
    const roomId = Array.from(socket.rooms)[1];
    const currentRoom = gameRooms[roomId];

    if (!currentRoom) {
      console.error('Room not found:', roomId);
      return;
    }

    let gameState = currentRoom.gameState; 
    console.log('SET_SUIT event received from client:', socket.id, 'in room', roomId);
    gameState.currentSuit = newSuit;
    gameState.currentRank = '';
    gameState.selectingSuit = false;

    io.to(roomId).emit('GAME_STATE_UPDATE', gameState);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});

server.listen(8080, () => {
  console.log('listening on *:8080');
});

function shuffleDeck(cardsToShuffle = []) {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let deck = cardsToShuffle.length > 0 ? cardsToShuffle : [];

  if (deck.length === 0) {
    // Create a new deck if cardsToShuffle is empty
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ suit, rank });
      }
    }
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function dealCards(players, deck) {
  const handSize = 7;
  for (let player of players) {
    player.hand = [];
    for (let i = 0; i < handSize; i++) {
      player.hand.push(deck.pop());
    }
  }
}
