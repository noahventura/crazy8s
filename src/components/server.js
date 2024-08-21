const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
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
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

let gameRooms = {}; // Object to store game rooms, keyed by room ID


io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    
    socket.on('CREATE_GAME_ROOM', (playerData) => {
        const roomId = uuidv4();
        gameRooms[roomId] = {
        gameState: {
        gameStarted: false,
        gameOver: false,
        currentRank: '',
        currentSuit: '',
        topDiscardCard: null,
        selectingSuit: false,
        deck: [],
        discardPile: [],
        lobby: [playerData] // Add the first player to the room's lobby
        },
        players: [], // Initialize players array for the game
    };
        socket.join(roomId);
        socket.emit('ROOM_CREATED', { roomId });
        console.log('Game room created with ID:', roomId);
        io.to(roomId).emit('GAME_STATE_UPDATE', gameRooms[roomId].gameState);
    });

    socket.on('JOIN_GAME_ROOM', ({ roomId, playerData }) => {
        console.log('JOIN_GAME_ROOM event received - Server'); 
        console.log('roomId:', roomId);
        console.log('playerData:', playerData); 
    
        if (gameRooms[roomId]) {
          playerData.socketId = socket.id;
          gameRooms[roomId].gameState.lobby.push(playerData); 
          socket.join(roomId);
          socket.to(roomId).emit('PLAYER_JOINED', playerData);
          console.log('Player joined room:', roomId);
    
          io.to(roomId).emit('GAME_STATE_UPDATE', gameRooms[roomId].gameState);
        } else {
          socket.emit('ROOM_NOT_FOUND');
        }
      });

    socket.on('START_GAME', () => {
        const roomId = Array.from(socket.rooms)[1];
        const currentRoom = gameRooms[roomId];
    
        if (!currentRoom) {
          console.error('Room not found:', roomId);
          return; 
        }
    
        let gameState = currentRoom.gameState; // Access gameState for the room
    
        console.log('START_GAME event received from client:', socket.id, 'in room', roomId);
        if (gameState.gameStarted) {
          return; 
        }
    
        // Move players from the room's lobby to players
        gameState.players = [...gameState.lobby];
        gameState.lobby = []; 

        gameState.gameStarted = true;
        gameState.deck = shuffleDeck();
        dealCards(gameState.players, gameState.deck);
        gameState.topDiscardCard = gameState.deck.pop();
        gameState.currentRank = gameState.topDiscardCard.rank;
        gameState.currentSuit = gameState.topDiscardCard.suit;

        io.to(roomId).emit('GAME_STATE_UPDATE', gameState);
      });
    

      socket.on('DRAW_CARD', () => {
        const roomId = Array.from(socket.rooms)[1];
        const currentRoom = gameRooms[roomId];
    
        if (!currentRoom) {
          console.error('Room not found:', roomId);
          return;
        }
    
        let gameState = currentRoom.gameState;
    
        console.log('DRAW_CARD event received from client:', socket.id, 'in room', roomId);
    
        if (gameState.deck.length === 0) {
          // Reshuffle discard pile (except the top card)
          const topDiscard = gameState.discardPile.pop();
          gameState.deck = shuffleDeck(gameState.discardPile);
          gameState.discardPile = [topDiscard];
        }
    
        if (gameState.deck.length > 0) {
            gameState.players[gameState.currentPlayer].hand.push(gameState.deck.pop());
            io.to(roomId).emit('GAME_STATE_UPDATE', gameState);
        }
      });


  socket.on('PLAY_CARD', (data) => {
    const roomId = Array.from(socket.rooms)[1];
    const currentRoom = gameRooms[roomId];

    if (!currentRoom) {
      console.error('Room not found:', roomId);
      return; 
    }

    let gameState = currentRoom.gameState; 
    const playerId = data.playerId;
    const cardIndex = data.cardIndex;


    console.log('PLAY_CARD event received:', playerId, cardIndex, 'in room', roomId);
    console.log('Current game state (before play):', gameState);

    const player = gameState.players.find(p => p.id === playerId);

    if (player && player.hand.length > cardIndex) {
      const playedCard = player.hand.splice(cardIndex, 1)[0];
      console.log('Played card:', playedCard);
      console.log('Player hand after splice:', player.hand);

      if (
        playedCard.rank === '8' ||
        playedCard.rank === gameState.currentRank ||
        playedCard.suit === gameState.currentSuit
      ) {
        // Valid Play
        gameState.discardPile.push(playedCard);
        gameState.topDiscardCard = playedCard;

        if (playedCard.rank === '8') {
          gameState.selectingSuit = true; // Player needs to choose a suit
        } else {
          gameState.currentRank = playedCard.rank;
          gameState.currentSuit = playedCard.suit;
          // No need to update currentPlayer in single-player
        }

        if (player.hand.length === 0) {
            console.log('Player', playerId, 'has won the game!');
            gameState.gameOver = true;
            //handle game over 
          }
          gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length; 
        console.log('Game state after update:', gameState);
        io.emit('GAME_STATE_UPDATE', gameState); 
      } else {
        // Invalid Play
        console.log('Invalid card play attempt:', playedCard);
        player.hand.push(playedCard); // Return the card to the hand
        console.log('Game state after invalid play:', gameState);
        io.emit('GAME_STATE_UPDATE', gameState); // Update clients about invalid play
      }
    } else {
      console.log('Invalid play attempt - player or cardIndex not found.');
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

  socket.on('CHECK_GAME_OVER', (data) => {
    const playerId = data.playerId;
    const player = gameState.players.find(p => p.id === playerId);
  
    if (player && player.hand.length === 0) {
      console.log('Player', playerId, 'has won the game!');
      gameState.gameOver = true; 
      // reset game
  
      io.emit('GAME_STATE_UPDATE', gameState);
    } 

  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});

server.listen(8080, () => {
  console.log('listening on *:8080');
});

function shuffleDeck(cardsToShuffle = []) { // Allow shuffling an existing array
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let deck = cardsToShuffle.length > 0 ? cardsToShuffle : []; // Use provided cards or create a new deck

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
  players[0].hand = [];
  for (let i = 0; i < handSize; i++) {
    players[0].hand.push(deck.pop());
  }
}