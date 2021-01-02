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
                        else if (piece.type === 'r' || piece.type === 'b' || piece.type === 'n') minorWhite += 1
                    } else if (piece.color === 'b') {
                        if (piece.type === 'q') queensBlack += 1
                        else if (piece.type === 'r' || piece.type === 'b' || piece.type === 'n') minorBlack += 1
                    }
                }
            })
        })
        let whiteEndGame = queensWhite === 0 || (queensWhite === 1 && minorWhite <= 1)
        let blackEndGame = queensBlack === 0 || (queensBlack === 1 && minorBlack <= 1)
        if (whiteEndGame && blackEndGame) this.endGame = true
    }

    evaluate() {
        let board = game.board()
        let wvalue = 0
        let bvalue = 0

        let square_index = 0
        for (let row_index = 0; row_index < 8; row_index++) {
            for (let column_index = 0; column_index < 8; column_index++) {
                let piece = board[row_index][column_index]
                if (piece) {
                    if (piece.color === 'w') {
                        wvalue += this.pieceEval(piece.type, piece.color, square_index)
                    } else if (piece.color === 'b') {
                        bvalue += this.pieceEval(piece.type, piece.color, square_index)
                    }
                }
                square_index += 1
            }
        }
        return bvalue - wvalue
    }

    moveEval(a, b) {
        function inner(n) {
            if (n.promotion != null) return Infinity

            let output = 0

            /*
            game.move(n)
            if (game.in_check()) {
                output -= 150
            }
            game.undo()
            */
            
            if (n.captured != null) {
                output += pvalue[n.piece]
            }

            return output
        }

        return inner(b) - inner(a);
    }

    search(depth, maximize, alpha, beta) {
        if (depth <= 0) {
            return this.evaluate()
        }
        let possibleMoves = game.moves({ verbose: true })
        if (possibleMoves.length === 0) {
            if (!maximize) return Infinity
            else return -Infinity
        }

        let sortedMoves = possibleMoves.sort(this.moveEval)

        if (maximize) {
            let value = -Infinity
            for (var i = 0; i < sortedMoves.length; i++) {
                game.move(sortedMoves[i])
                value = Math.max(value, this.search(depth - 1, !maximize, alpha, beta))
                alpha = Math.max(alpha, value)
                game.undo()
                if (beta <= alpha) {
                    return value
                }
            }
            return value
        } else {
            let value = Infinity
            for (var i = sortedMoves.length - 1; i >= 0; i--) {
                game.move(sortedMoves[i])
                value = Math.min(value, this.search(depth - 1, !maximize, alpha, beta))
                beta = Math.min(beta, value)
                game.undo()
                if (beta <= alpha) {
                    return value
                }
            }
            return value
        }
    }

    reset() { }

    update() { }

    move() {
        this.isEndGame()
        var currMax = -Infinity
        var currMove = null
        let possibleMoves = game.moves({ verbose: true })
        let sortedMoves = possibleMoves.sort(this.moveEval)
        for (var i = 0; i < sortedMoves.length; i++) {
            game.move(sortedMoves[i])
            let maxValue = this.search(2, false, -Infinity, Infinity)
            if (maxValue === Infinity) {
                // This line leads to a mate in x, so we don't need to consider the others
                updateState()
                return
            }
            if (maxValue > currMax) {
                currMax = maxValue
                currMove = sortedMoves[i]
            }
            game.undo()
        }
        game.move(currMove)
        updateState()
    }
}