import { Chessboard, Square } from 'react-chessboard'
// @ts-ignore
import { Chess } from 'chess.js'
import { useEffect, useState } from 'react'
import { retrieveState, sendState } from './statusSaver'

type Props = {
    lightIndex: number
    darkIndex: number
}
export default function ChessBoard({ lightIndex, darkIndex }: Props) {
    const [game, setGame] = useState<Chess>(new Chess())

    /* Update every second */
    useEffect(() => {
        const interval = setInterval(() => {
            retrieveState(`${lightIndex}-${darkIndex}`).then((fen) => {
                if (fen !== game.fen()) {
                    setGame(new Chess(fen))
                }
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [game, lightIndex, darkIndex])

    function makeMoveAndSaveState(mutatorFunction: (game: Chess) => void): void {
        setGame((currentState: Chess) => {
            const copyOfCurrentState = { ...currentState }
            mutatorFunction(copyOfCurrentState)
            sendState(`${lightIndex}-${darkIndex}`, copyOfCurrentState.fen()).then(() => {})
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
