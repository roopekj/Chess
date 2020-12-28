class RandomAI {
  constructor(game_, board_) {
      this.game = game_
      this.board = board_
  }

  reset() { }

  update() { }

  move() {
    var possibleMoves = game.moves()
    if (possibleMoves.length === 0) return
  
    var randomIdx = Math.floor(Math.random() * possibleMoves.length)
    game.move(possibleMoves[randomIdx])
    updateState()
  }
}