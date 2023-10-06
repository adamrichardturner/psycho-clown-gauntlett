// StartScene
class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
    this.load.image('startBackground', 'startBackground.png')
  }

  create() {
    this.background = this.add.image(320, 240, 'startBackground')

    this.input.keyboard.on('keydown', () => {
      this.scene.start('MainScene')
    })
  }
}

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {
    this.load.image('player', 'baby.png')
    this.load.image('clown', 'clown.png')
    this.load.image('trophy', 'trophy.png')
    this.load.image('winBackground', 'winBackground.png')
  }

  create() {
    this.lives = 3
    this.player = this.physics.add.sprite(32, 32, 'player').setScale(0.25)
    this.player.setCollideWorldBounds(true)
    this.trophy = this.physics.add.image(608, 448, 'trophy').setScale(0.25) // Now a physics object

    this.clowns = this.physics.add.group()
    for (let i = 0; i < 5; i++) {
      let x = Phaser.Math.Between(100, 540)
      let y = Phaser.Math.Between(100, 380)
      let clown = this.physics.add.sprite(x, y, 'clown').setScale(0.25)
      clown.setBounce(1)
      clown.setCollideWorldBounds(true)
      clown.speed = Phaser.Math.Between(75, 125) // Varying speed for clowns
      clown.predictive = i < 2 // First 2 clowns have predictive behavior
      clown.patrol = i >= 2 && i < 4 ? true : false // Two clowns have patrol behavior
      clown.patrolDir = Math.random() < 0.5 ? -1 : 1 // Direction of patrol (left/right or up/down)
      this.clowns.add(clown)
    }

    this.cursors = this.input.keyboard.createCursorKeys()

    this.physics.add.collider(
      this.player,
      this.clowns,
      this.hitClown,
      null,
      this
    )
    this.physics.add.overlap(
      this.player,
      this.trophy,
      this.collectTrophy,
      null,
      this
    )

    this.score = 0
    this.scoreText = this.add
      .text(570, 10, 'Score: 0', {
        fontSize: '16px',
        fill: '#FFF',
        fontWeight: 'bold',
      })
      .setOrigin(1, 0)
    this.livesText = this.add.text(10, 10, 'Lives: 3', {
      fontSize: '16px',
      fill: '#FFF',
      fontWeight: 'bold',
    }) // Display the lives

    this.positionTrophyRandomly()
  }

  positionTrophyRandomly() {
    let trophyX = Phaser.Math.Between(50, 590)
    let trophyY = Phaser.Math.Between(50, 430)
    this.trophy.setPosition(trophyX, trophyY)
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160)
    } else {
      this.player.setVelocityX(0)
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160)
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160)
    } else {
      this.player.setVelocityY(0)
    }

    // Updated clown movement logic
    this.clowns.getChildren().forEach((clown) => {
      if (clown.patrol) {
        if (clown.patrolDir == 1) {
          clown.setVelocity(0, clown.speed) // Vertical patrol
          if (clown.y > 380) {
            clown.patrolDir = -1
          }
        } else {
          clown.setVelocity(0, -clown.speed)
          if (clown.y < 100) {
            clown.patrolDir = 1
          }
        }
        return
      }

      let dx = this.player.x - clown.x
      let dy = this.player.y - clown.y

      if (clown.predictive) {
        // Predict the player's direction and adjust dx, dy to intercept
        dx += this.player.body.velocity.x / 10
        dy += this.player.body.velocity.y / 10
      }

      let dist = Math.sqrt(dx * dx + dy * dy)
      let vx = dx / dist
      let vy = dy / dist
      clown.setVelocity(vx * clown.speed, vy * clown.speed) // Use clown's speed
    })
  }

  hitClown(player, clown) {
    this.lives--
    this.livesText.setText('Lives: ' + this.lives) // Update the displayed lives

    if (this.lives <= 0) {
      this.physics.pause()
      player.setTint(0xff0000)
      this.scene.restart()
    } else {
      clown.disableBody(true, true)
      this.time.delayedCall(2000, () => {
        let x = Phaser.Math.Between(100, 540)
        let y = Phaser.Math.Between(100, 380)
        clown.enableBody(true, x, y, true, true)
      })
    }
  }

  collectTrophy(player, trophy) {
    trophy.disableBody(true, true)
    this.score++
    this.scoreText.setText('Score: ' + this.score)

    if (this.score >= 3) {
      this.physics.pause()
      this.add.image(320, 240, 'winBackground')
    } else {
      this.positionTrophyRandomly()
      trophy.enableBody(true, trophy.x, trophy.y, true, true)
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  scene: [StartScene, MainScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
}

const game = new Phaser.Game(config)
