class CustomAI {

    constructor() {
        this.bvalue = 0
        this.wvalue = 0

        this.move = this.move.bind(this)
        this.evaluate = this.evaluate.bind(this)
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
            (color === 'w') ? value += kingEvalWhite[index] : value += kingEvalBlack[index]
        }
        return value
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

    search(depth, maximize) {
        if (depth <= 0 || game.game_over()) {
            return this.evaluate()
        }

        if (maximize) {
            var value = -Infinity
            game.moves().forEach(n => {
                game.move(n)
                // console.log("Looking at: " + n + " for black")
                value = Math.max(value, this.search(depth - 1, false))
                game.undo()
            })
            return value
        } else {
            var value = Infinity
            game.moves().forEach(n => {  
                game.move(n)
                // console.log("Looking at: " + n + " for white")
                value = Math.min(value, this.search(depth - 1, true))
                game.undo()
            })
            return value
        }
    }

    reset() { }

    update() { }

    move() {
        var currMax = -Infinity
        var currMove = null
        game.moves().forEach(n => {
            game.move(n)
            let maxValue = this.search(1, false)
            console.log(n + " -> " + maxValue)
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