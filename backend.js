const express = require('express');
const app = express();

//socket.io setup
const {createServer} = require('node:http');
const server = createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {pingInterval: 2000, pingTimeout:5000});
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

const backEndPlayers = {}

const SPEEDBACKEND = 10

io.on('connection', (socket) => {
  console.log('a user connected');
  backEndPlayers[socket.id] = {
    x: 500 * Math.random(),
    y: 500 * Math.random(),
    color: `hsl(${360 * Math.random()}, 100%, 50%)`,
    sequenceNumber: 0
  };

  io.emit('updatePlayers', backEndPlayers)

  socket.on('disconnect',(reason) => {
      console.log(reason)
      delete backEndPlayers[socket.id]
      io.emit('updatePlayers',backEndPlayers)
  })

  socket.on('keydown', ({keycode, sequenceNumber}) => {
    backEndPlayers[socket.id].sequenceNumber = sequenceNumber
    switch(keycode) {
      case 'KeyW': 
        backEndPlayers[socket.id].y -= SPEEDBACKEND
        break
      case 'KeyA': 
        backEndPlayers[socket.id].x -= SPEEDBACKEND
        break
  
      case 'KeyS': 
        backEndPlayers[socket.id].y += SPEEDBACKEND
        break
  
      case 'KeyD': 
        backEndPlayers[socket.id].x += SPEEDBACKEND
        break
    }
  })
  console.log(backEndPlayers);
  
});

setInterval(() => {
  io.emit('updatePlayers',backEndPlayers)
},15)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

console.log('Server is loaded');