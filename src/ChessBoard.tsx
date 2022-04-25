import { Chessboard, Square } from 'react-chessboard'
// @ts-ignore
import { Chess } from 'chess.js'
import { useState } from 'react'

type Props = {
    lightIndex: number
    darkIndex: number
}
export default function ChessBoard({ lightIndex, darkIndex }: Props) {
    const [game, setGame] = useState<Chess>(new Chess())

    function makeMoveAndSaveState(mutatorFunction: (game: Chess) => void): void {
        setGame((currentState: Chess) => {
            const copyOfCurrentState = { ...currentState }
            mutatorFunction(copyOfCurrentState)
            return copyOfCurrentState
        })
    }

    function onDrop(sourceSquare: Square, targetSquare: Square) {
        let move = null
        makeMoveAndSaveState((game: Chess) => {
            move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q', // always promote to a queen for example simplicity
            })
        })
        if (move === null) return false // illegal move
        return true
    }

    return <div>
        <Chessboard id={lightIndex * 100 + darkIndex} position={game.fen()} onPieceDrop={onDrop} boardWidth={200} />
    </div>
}
