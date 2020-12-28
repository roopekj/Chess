class StockfishAI {

  constructor(game_, board_) {
    this.game = game_
    this.board = board_

    this.move = this.move.bind(this)

    this.ai = STOCKFISH()
    this.ai.postMessage("uci")
    this.ai.postMessage("ucinewgame")
    this.ai.postMessage("setoption name Analysis Contempt value Black")

    this.ai.onmessage = function (event) {
      var d = event.data ? event.data : event
      if (d.startsWith("bestmove")) {
        var choice = d.split(" ")[1]
        var f = choice.substring(0, 2)
        var t = choice.substring(2, 4)
        game.move({ from: f, to: t })
        updateState()
      }
    }
  }

  reset() {
    this.ai.postMessage("ucinewgame")
    this.ai.postMessage("position startpos");
  }

  update() {
    this.ai.postMessage("position fen " + game.fen());
  }

  move() {
    this.ai.postMessage("go movetime 1000");
  }
}