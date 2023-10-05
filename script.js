class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {
    this.load.image('player', 'baby.png')
    this.load.image('clown', 'clown.png')
    this.load.image('trophy', 'trophy.png')
  }

  create() {
    this.player = this.physics.add.sprite(32, 32, 'player').setScale(0.25) // Scale down
    this.trophy = this.add.image(608, 448, 'trophy').setScale(0.25) // Scale down

    this.clowns = this.physics.add.group()
    for (let i = 0; i < 5; i++) {
      // Increase count to 5 clowns
      let x = Phaser.Math.Between(100, 540)
      let y = Phaser.Math.Between(100, 380)
      let clown = this.physics.add.sprite(x, y, 'clown').setScale(0.25) // Scale down
      clown.setBounce(1)
      clown.setCollideWorldBounds(true)
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

    // Make the clowns chase the player
    this.clowns.getChildren().forEach((clown) => {
      let dx = this.player.x - clown.x
      let dy = this.player.y - clown.y
      let dist = Math.sqrt(dx * dx + dy * dy)

      // Normalize the velocity
      let vx = dx / dist
      let vy = dy / dist

      clown.setVelocity(vx * 100, vy * 100) // Multiply by speed, here 100
    })
  }

  hitClown(player, clown) {
    this.physics.pause()
    player.setTint(0xff0000)
    let gameOver = true
  }

  collectTrophy(player, trophy) {
    trophy.disableBody(true, true)
    alert('You won!')
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  scene: MainScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
}

const game = new Phaser.Game(config)
