const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io();

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelratio || 1

canvas.width = 1024 * devicePixelRatio
canvas.height = 576 * devicePixelRatio

c.scale(devicePixelRatio, devicePixelRatio)

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {} //frontend player
const frontEndProjectiles = {} 

// const projectiles = []
// const enemies = []
// const particles = []

// function spawnEnemies() {
//   setInterval(() => {
//     const radius = Math.random() * (30 - 4) + 4

//     let x
//     let y

//     if (Math.random() < 0.5) {
//       x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
//       y = Math.random() * canvas.height
//     } else {
//       x = Math.random() * canvas.width
//       y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
//     }

//     const color = `hsl(${Math.random() * 360}, 50%, 50%)`

//     const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)

//     const velocity = {
//       x: Math.cos(angle),
//       y: Math.sin(angle)
//     }

//     enemies.push(new Enemy(x, y, radius, color, velocity))
//   }, 1000)
// }

socket.on('updateProjectiles', (backendProjectiles) => {
  for (const id in backendProjectiles){
    const backEndProjectile = backendProjectiles[id]

    if (!frontEndProjectiles[id]){
      frontEndProjectiles[id] = new Projectile({
                x:backEndProjectile.x, 
                y:backEndProjectile.y, 
                radius:5, 
                color:frontEndPlayers[backEndProjectile.playerId]?.color, 
                velocity: backEndProjectile.velocity
            })
    } else {
      frontEndProjectiles[id].x += backendProjectiles[id].velocity.x
      frontEndProjectiles[id].y += backendProjectiles[id].velocity.y
    }
  }
  for(const frontEndProjectileId in frontEndProjectiles){
    if(!backendProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId]
    }
  }
})
socket.on('updatePlayers', (backendPlayers) => {
  for(const id in backendPlayers){
    const backendPlayer = backendPlayers[id]

    if(!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x:backendPlayer.x, 
        y:backendPlayer.y, 
        radius:10, 
        color:backendPlayer.color,
        username: backendPlayer.username})

        document.querySelector(
          '#playerLabels'
          ).innerHTML+=`<div data-id="${id}" data-score="${backendPlayer.score}"> ${backendPlayer.username}: ${backendPlayer.score}</div>`
    } else {
      document.querySelector(
        `div[data-id="${id}"]`
        ).innerHTML= `${backendPlayer.username}: ${backendPlayer.score}`
        
        document
        .querySelector(`div[data-id="${id}"]`)
        .setAttribute('data-score',backendPlayer.score)

        //sorts the players divs
        const parentDiv= document.querySelector('#playerLabels')
        const childDivs=Array.from(parentDiv.querySelectorAll('div'))

        childDivs.sort((a,b)=>{
          const scoreA =Number(a.getAttribute('data-score'))
          const scoreB =Number(b.getAttribute('data-score'))
          return scoreB - scoreA
        })
        //removes old elements
        childDivs.forEach(div=>{
          parentDiv.removeChild(div)
        })
        // adds sorted elements
        childDivs.forEach(div=>{
          parentDiv.appendChild(div)
        })


      if (id === socket.id) {
        //if a player already exists
        frontEndPlayers[id].x = backendPlayer.x
        frontEndPlayers[id].y = backendPlayer.y

        const lastBackendInputIndex = playerInputs.findIndex(input => {
          return backendPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1) {
          playerInputs.splice(0,lastBackendInputIndex)
        }

        playerInputs.forEach(input => {
          frontEndPlayers[id].x += input.dx
          frontEndPlayers[id].y += input.dy
        })
      } else {
        // for all other players

        gsap.to(frontEndPlayers[id], {
          x: backendPlayer.x,
          y: backendPlayer.y,
          duration: 0.015,
          ease: 'linear'
        })
      }
    }
  }
  // removing player
  for(const id in frontEndPlayers){
    if(!backendPlayers[id]) {
      const divToDelete= document.querySelector(`div[data-id="${id}"]`)
      divToDelete.parentNode.removeChild(divToDelete)

      if (id == socket.id)
        document.querySelector('#usernameForm').style.display = ' block'
      

      delete frontEndPlayers[id]
    }
  }
})

let animationId
// let score = 0
function animate() {
  animationId = requestAnimationFrame(animate)
  //c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.clearRect(0, 0, canvas.width, canvas.height)

  for(const id in frontEndPlayers){
    const player = frontEndPlayers[id]
    player.draw()
  }
  for(const id in frontEndProjectiles){
    const frontEndProjectile = frontEndProjectiles[id]
    frontEndProjectile.draw()
  }

  // for (let i = frontEndProjectiles.length - 1; i >= 0; i--){
  //   const frontEndProjectile = frontEndProjectiles[i]
  //   frontEndProjectile.update()
  // }

  // player.draw()

  // for (let index = particles.length - 1; index >= 0; index--) {
  //   const particle = particles[index]

  //   if (particle.alpha <= 0) {
  //     particles.splice(index, 1)
  //   } else {
  //     particle.update()
  //   }
  // }

  // for (let index = projectiles.length - 1; index >= 0; index--) {
  //   const projectile = projectiles[index]

  //   projectile.update()

  //   // remove from edges of screen
  //   if (
  //     projectile.x - projectile.radius < 0 ||
  //     projectile.x - projectile.radius > canvas.width ||
  //     projectile.y + projectile.radius < 0 ||
  //     projectile.y - projectile.radius > canvas.height
  //   ) {
  //     projectiles.splice(index, 1)
  //   }
  // }

  // for (let index = enemies.length - 1; index >= 0; index--) {
  //   const enemy = enemies[index]

  //   enemy.update()

  //   const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

  //   //end game
  //   if (dist - enemy.radius - player.radius < 1) {
  //     cancelAnimationFrame(animationId)
  //   }

  //   for (
  //     let projectilesIndex = projectiles.length - 1;
  //     projectilesIndex >= 0;
  //     projectilesIndex--
  //   ) {
  //     const projectile = projectiles[projectilesIndex]

  //     const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

  //     // when projectiles touch enemy
  //     if (dist - enemy.radius - projectile.radius < 1) {
  //       // create explosions
  //       for (let i = 0; i < enemy.radius * 2; i++) {
  //         particles.push(
  //           new Particle(
  //             projectile.x,
  //             projectile.y,
  //             Math.random() * 2,
  //             enemy.color,
  //             {
  //               x: (Math.random() - 0.5) * (Math.random() * 6),
  //               y: (Math.random() - 0.5) * (Math.random() * 6)
  //             }
  //           )
  //         )
  //       }
  //       // this is where we shrink our enemy
  //       if (enemy.radius - 10 > 5) {
  //         score += 100
  //         scoreEl.innerHTML = score
  //         gsap.to(enemy, {
  //           radius: enemy.radius - 10
  //         })
  //         projectiles.splice(projectilesIndex, 1)
  //       } else {
  //         // remove enemy if they are too small
  //         score += 150
  //         scoreEl.innerHTML = score

  //         enemies.splice(index, 1)
  //         projectiles.splice(projectilesIndex, 1)
  //       }
  //     }
  //   }
  // }
}

animate()


const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const SPEED = 10
const playerInputs = []

let sequenceNumber = 0
setInterval(() => {
  if(keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber, dx: 0 , dy: -SPEED})
    frontEndPlayers[socket.id].y -= SPEED
    socket.emit('keydown', {keycode: 'KeyW', sequenceNumber})
  }
  if(keys.a.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber, dx: -SPEED , dy: 0})
    frontEndPlayers[socket.id].x -= SPEED
    socket.emit('keydown',{keycode: 'KeyA', sequenceNumber})
  }
  if(keys.s.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber, dx:0 , dy: SPEED})
    frontEndPlayers[socket.id].y += SPEED
    socket.emit('keydown',{keycode: 'KeyS', sequenceNumber})
  }
  if(keys.d.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber, dx: SPEED , dy: 0})
    frontEndPlayers[socket.id].x += SPEED
    socket.emit('keydown',{keycode: 'KeyD', sequenceNumber})
  }
}, 15);

window.addEventListener('keydown',(event) => {

  if(!frontEndPlayers[socket.id]) return
    switch(event.code) {
      case 'KeyW': 

        keys.w.pressed = true
        break
      case 'KeyA': 
        keys.a.pressed = true
        break
  
      case 'KeyS': 
        keys.s.pressed = true
        break
  
      case 'KeyD': 
        keys.d.pressed = true
        break
    }

})

window.addEventListener('keyup',(event) => {
  if(!frontEndPlayers[socket.id]) return
    switch(event.code) {
      case 'KeyW': 
        keys.w.pressed = false
        break
      case 'KeyA': 
        keys.a.pressed = false
        break
  
      case 'KeyS': 
        keys.s.pressed = false
        break
  
      case 'KeyD': 
        keys.d.pressed = false
        break
    }
})
// spawnEnemies()

document.querySelector('#usernameForm').addEventListener('submit', (
  event) =>{
event.preventDefault()
document.querySelector('#usernameForm').style.display='none'
socket.emit('initGame',{
  width: canvas.width, 
  height: canvas.height,
  devicePixelRatio,
  username: document.querySelector('#usernameInput').value
  })
})