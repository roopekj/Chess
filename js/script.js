let flipped = false

function onDragStart(source, piece, position, orientation) {
  if (game.game_over()) return false
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
  (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
}
}

function loadFEN() {
  var fen = $('#fen').val()

  resetState()
  game.load(fen)
  updateState()

  if (game.turn() === 'b') {
    makeMove()
  }
}

function resetState() {
  game = new Chess()
  // console.log(game.ascii())
  board.position(game.fen())
  engines.forEach(n => n.reset())
  if (flipped) makeMove()
}

function flipBoard() {
  board.flip()
  makeMove()
  flipped = !flipped
}

function updateState() {
  board.position(game.fen())
  engines.forEach(n => n.update())
}

function makeMove() {
  var selection = $('input[name=engine]:checked').val()
  if (selection === "stockfish") {
    window.setTimeout(stockfish.move, 250)
  } else if (selection === "random") {
    window.setTimeout(random.move, 250)
  } else if (selection === "custom") {
    window.setTimeout(custom.move, 250)
  }
}

function onDrop(source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  })

  if (move === null) return 'snapback'

  makeMove()
}

function onSnapEnd() {
  updateState()
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}

var board = Chessboard('myBoard', config)
var game = new Chess()

var stockfish = new StockfishAI()
var custom = new CustomAI()
var random = new RandomAI()
var engines = [random, stockfish, custom]
