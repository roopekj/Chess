var board = null
var game = new Chess()
var stockfish = STOCKFISH();
stockfish.postMessage("uci");
stockfish.postMessage("setoption name Analysis Contempt value Black")

stockfish.onmessage = function(event) {
  var d = event.data ? event.data : event
  if (d.startsWith("bestmove")) {
    var choice = d.split(" ")[1]
    var f = choice.substring(0, 2)
    var t = choice.substring(2, 4)
    game.move({from: f, to: t})
    board.position(game.fen())
    stockfish.postMessage("position fen " + game.fen());
  }
};

function onDragStart (source, piece, position, orientation) {
  if (game.game_over()) return false
  if (piece.search(/^b/) !== -1) return false
}

function loadFEN() {
  var fen = $('#fen').val()
  alert("FEN IS " + fen)
  game.load(fen)
  board.position(game.fen())
  stockfish.postMessage("uninewgame")
  stockfish.postMessage("position fen " + game.fen())
  if (game.turn() === 'b') {
    makeMove()
  }
}

function makeRandomMove () {
  var possibleMoves = game.moves()

  if (possibleMoves.length === 0) return

  var randomIdx = Math.floor(Math.random() * possibleMoves.length)
  game.move(possibleMoves[randomIdx])
  board.position(game.fen())
}

function resetBoard() {
  game = new Chess()
  board.position(game.fen())
  stockfish.postMessage("ucinewgame");
  stockfish.postMessage("position startpos");
  stockfish.postMessage("d")
}

function makeStockfishMove() {
  stockfish.postMessage("go movetime 1000");
}

function makeMove() {
  var selection = $('input[name=engine]:checked').val()
  if (selection === "stockfish") {
    window.setTimeout(makeStockfishMove, 250)
  } else if (selection === "random") {
    window.setTimeout(makeRandomMove, 250)
  }
}

function onDrop (source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  })

  if (move === null) return 'snapback'

  stockfish.postMessage("position fen " + game.fen());
  stockfish.postMessage("d")
  
  makeMove()
}

function onSnapEnd () {
  board.position(game.fen())

}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config)
