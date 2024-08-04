const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

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

let gameState = {
  gameStarted: false,
  gameOver: false,
  currentRank: '',
  currentSuit: '',
  topDiscardCard: null,
  selectingSuit: false,
  players: [
    {
      id: 1,
      hand: [],
    },
  ],
  deck: [],
  discardPile: [],
  lobby:[],
};

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    socket.on('JOIN_LOBBY', (playerData) =>{
        console.log('Player joined the lobby:', playerData);
        gameState.lobby.push(playerData); 
        io.emit('LOBBY_UPDATED', gameState.lobby);
    });

    socket.on('START_GAME', () => {
        console.log('START_GAME event received from client:', socket.id);
        if(gameState.gameStarted){
            return
        }

        const requiredPlayers = 1; // min player count
        if (gameState.lobby.length < requiredPlayers) {
          console.log('Not enough players in the lobby to start the game.');
          socket.emit('NOT_ENOUGH_PLAYERS'); // Optional client notification
          return;
        }

        gameState.players = gameState.lobby; 
        gameState.lobby = []; // Clear the lobby
        
        gameState.gameStarted = true;
        gameState.deck = shuffleDeck();
        dealCards(gameState.players, gameState.deck);
        gameState.topDiscardCard = gameState.deck.pop();
        gameState.currentRank = gameState.topDiscardCard.rank;
        gameState.currentSuit = gameState.topDiscardCard.suit;
        io.emit('GAME_STATE_UPDATE', gameState);
  });

  socket.on('DRAW_CARD', () => {
    console.log('DRAW_CARD event received from client:', socket.id);

    if (gameState.deck.length === 0) {
      // Reshuffle discard pile (except the top card)
      const topDiscard = gameState.discardPile.pop();
      gameState.deck = shuffleDeck(gameState.discardPile);
      gameState.discardPile = [topDiscard];
    }

    if (gameState.deck.length > 0) {
      gameState.players[0].hand.push(gameState.deck.pop());
      io.emit('GAME_STATE_UPDATE', gameState);
    }
  });

  socket.on('PLAY_CARD', (data) => {
    const playerId = data.playerId;
    const cardIndex = data.cardIndex;
    console.log('PLAY_CARD event received:', playerId, cardIndex);
    console.log('Current game state (before play):', gameState); 

    const player = gameState.players[0]; // Always player 0 in single-player

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
    console.log('SET_SUIT event received from client:', socket.id);
    gameState.currentSuit = newSuit;
    gameState.currentRank = '';
    gameState.selectingSuit = false;
    // No need to update currentPlayer in single player
    io.emit('GAME_STATE_UPDATE', gameState);
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