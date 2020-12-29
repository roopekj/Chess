class CustomAI {

    constructor() {
        this.bvalue = 0
        this.wvalue = 0

        this.move = this.move.bind(this)
        this.search = this.search.bind(this)
        this.evaluate = this.evaluate.bind(this)
        this.endGame = false
    }

    pieceEval(type, color, index) {
        let value = pvalue[type]
        if (type === 'p') {
            (color === 'w') ? value += pawnEvalWhite[index] : value += pawnEvalBlack[index]
        } else if (type === 'r') {
            (color === 'w') ? value += rookEvalWhite[index] : value += rookEvalBlack[index]
        } else if (type === 'n') {
            (color === 'w') ? value += knightEvalWhite[index] : value += knightEvalBlack[index]
        } else if (type === 'b') {
            (color === 'w') ? value += bishopEvalWhite[index] : value += bishopEvalBlack[index]
        } else if (type === 'q') {
            (color === 'w') ? value += queenEvalWhite[index] : value += queenEvalBlack[index]
        } else if (type === 'k') {
            if (this.endGame) (color === 'w') ? value += kingEvalWhiteEnd[index] : value += kingEvalBlackEnd[index]
            else (color === 'w') ? value += kingEvalWhite[index] : value += kingEvalBlack[index]
            
        }
        return value
    }

    isEndGame() {
        if (this.endGame) return
        let queensWhite = 0
        let queensBlack = 0
        let minorWhite = 0
        let minorBlack = 0

        game.board().forEach(row => {
            row.forEach(piece => {
                if (piece) {
                    if (piece.color === 'w') {
                        if (piece.type === 'q') queensWhite += 1
                        else if (piece.type === 'r' || piece.type === 'b' || piece.type === 'n') minorWhite += 1
                    } else if (piece.color === 'b') {
                        if (piece.type === 'q') queensBlack += 1
                        else if (piece.type === 'r' || piece.type === 'b' || piece.type === 'n') minorBlack += 1
                    }
                }
            })
        })
        let whiteEndGame = queensWhite === 0 || (queensWhite === 1 && minorWhite <= 1)
        let blackEndGame = queensBlack === 0 || (queensBlack === 1 && minorBlack <= 1)
        if (whiteEndGame && blackEndGame) this.endGame = true
    }

    evaluate() {
        this.wvalue = 0
        this.bvalue = 0
        let row_index = 0
        game.board().forEach(row => {
            let column_index = 0
            row.forEach(piece => {
                if (piece) {
                    let index = 8 * row_index + column_index
                    if (piece.color === 'w') {
                        this.wvalue += this.pieceEval(piece.type, piece.color, index)
                    } else if (piece.color === 'b') {
                        this.bvalue += this.pieceEval(piece.type, piece.color, index)
                    }
                }
                column_index += 1
            })
            row_index += 1
        })
        return this.bvalue - this.wvalue
    }

    moveEval(a, b) {
        function inner(n) {
            if (n.promotion != null) return -Infinity

            let output = 0
            // TODO: Optimize this code so that it can be used in evaluation without timeouts
            /*game.move(n)
            if (game.in_check()) {
                game.undo()
                output -= 150
            }
            game.undo()*/
            if (n.capture != null) {
                output -= pvalue(game.get(n.to).type)
            }
    
            return output
        }

        return inner(a) - inner(b);
    }

    search(depth, maximize, alpha, beta) {
        if (depth <= 0) {
            return this.evaluate()
        }
        if (game.game_over()) {
            if (!maximize) return Infinity
            else return -Infinity
        }

        let sortedMoves = game.moves({ verbose: true }).sort(this.moveEval)

        if (maximize) {
            var value = -Infinity
            sortedMoves.forEach(n => {
                game.move(n)
                value = Math.max(value, this.search(depth - 1, false, alpha, beta))
                alpha = Math.max(alpha, value)
                game.undo()
                if (beta <= alpha) {
                    return value
                }
            })
            return value
        } else {
            var value = Infinity
            sortedMoves.reverse().forEach(n => {
                game.move(n)
                value = Math.min(value, this.search(depth - 1, true, alpha, beta))
                beta = Math.min(alpha, value)
                game.undo()
                if (beta <= alpha) {
                    return value
                }
                
            })
            return value
        }
    }

    reset() { }

    update() { }

    move() {
        this.isEndGame()
        var currMax = -Infinity
        var currMove = null
        let sortedMoves = game.moves({ verbose: true }).sort(this.moveEval)
        sortedMoves.forEach(n => {
            if (currMax === Infinity) {
                // This means we found mate in x, so we won't consider other moves
                return
            }
            game.move(n)
            let maxValue = this.search(2, false, -Infinity, Infinity)
            if (maxValue > currMax) {
                currMax = maxValue
                currMove = n
            }
            game.undo()
        })
        game.move(currMove)
        updateState()
    }
}