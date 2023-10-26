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
const backendProjectiles = {}

const SPEEDBACKEND = 10
const RADIUS = 10
const PROJECTILE_RADIUS =5
let projectileId = 0;
io.on('connection', (socket) => {
  console.log('a user connected');
  backEndPlayers[socket.id] = {
    x: 500 * Math.random(),
    y: 500 * Math.random(),
    color: `hsl(${360 * Math.random()}, 100%, 50%)`,
    sequenceNumber: 0
  };

  io.emit('updatePlayers', backEndPlayers)
socket.on('initCanvas',({width, height, devicePixelRatio})=>{
  backEndPlayers[socket.id].canvas = {
    width,
    height
  }
  backEndPlayers[socket.id].radius = RADIUS

  if (devicePixelRatio > 1){
  backEndPlayers[socket.id].radius = 2 * RADIUS
}
})
  socket.on('shoot',({x,y,angle})=>{
    projectileId++;

    const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }

    backendProjectiles[projectileId]={
      x,
      y,
      velocity,
      playerId:socket.id
    }
    console.log(backendProjectiles)
  })
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
});
// backend ticker
setInterval(() => {
  //update projectile positions
  for(const id in backendProjectiles){
    backendProjectiles[id].x+=backendProjectiles[id].velocity.x
    backendProjectiles[id].y+=backendProjectiles[id].velocity.y
    const PROJECTILE_RADIUS =5
    if (
      backendProjectiles[id].x-PROJECTILE_RADIUS >= 
        backEndPlayers[backendProjectiles[id].playerId]?.canvas.width ||
      backendProjectiles[id].x-PROJECTILE_RADIUS <= 0 ||
      backendProjectiles[id].y-PROJECTILE_RADIUS >= 
        backEndPlayers[backendProjectiles[id].playerId]?.canvas.height ||
      backendProjectiles[id].y-PROJECTILE_RADIUS <= 0
      ) {
        delete backendProjectiles[id]
        continue;
      }
      for (const playerId in backEndPlayers){
        const backEndPlayer = backEndPlayers[playerId]

        const DISTANCE = Math.hypot(
          backendProjectiles[id].x - backEndPlayer.x, 
          backendProjectiles[id].y - backEndPlayer.y
          )
        if (DISTANCE<PROJECTILE_RADIUS+backEndPlayer.radius&&
          backendProjectiles[id].playerId !== playerId){
          delete backendProjectiles[id]
          delete backEndPlayers[playerId]
          break
        }
      }
  }
  io.emit('updateProjectiles',backendProjectiles)
  io.emit('updatePlayers',backEndPlayers)
},15)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

console.log('Server is loaded');