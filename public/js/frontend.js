const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io();

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelratio || 1
canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {} //frontend player

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

socket.on('updatePlayers', (backendPlayers) => {
  for(const id in backendPlayers){
    const backendPlayer = backendPlayers[id]

    if(!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({x:backendPlayer.x, y:backendPlayer.y, radius:10, color:backendPlayer.color})
    } else {
      //if a player already exists
      frontEndPlayers[id].x = backendPlayer.x
      frontEndPlayers[id].y = backendPlayer.y
    }
  }

  for(const id in frontEndPlayers){
    if(!backendPlayers[id]) {
      delete frontEndPlayers[id]
    }
  }

  console.log(frontEndPlayers)
})

let animationId
// let score = 0
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for(const id in frontEndPlayers){
    const player = frontEndPlayers[id]

    player.draw()
  }
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

window.addEventListener('keydown',(event) => {

  if(!frontEndPlayers[socket.id]) return
    switch(event.code) {
      case 'KeyW': 
        //frontEndPlayers[socket.id].y -=5
        socket.emit('keydown','KeyW')
        break
      case 'KeyA': 
        //frontEndPlayers[socket.id].x -=5
        socket.emit('keydown','KeyA')
        break
  
      case 'KeyS': 
        //frontEndPlayers[socket.id].y +=5
        socket.emit('keydown','KeyS')
        break
  
      case 'KeyD': 
        //frontEndPlayers[socket.id].x +=5
        socket.emit('keydown','KeyD')
        break
    }

  

  
})
// spawnEnemies()
