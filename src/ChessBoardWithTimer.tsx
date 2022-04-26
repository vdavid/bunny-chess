import { Chessboard, Square } from 'react-chessboard'
// @ts-ignore
import { Chess } from 'chess.js'
import { useEffect, useState } from 'react'
import { BoardStatus, retrieveState, sendState } from './statusSaver'
import Timer from './Timer'

type Props = {
    lightIndex: number
    darkIndex: number
    lightPlayerName: string
    darkPlayerName: string
}

enum Result {
    Running = 'running',
    Light = 'light',
    Dark = 'dark',
    Draw = 'draw',
}

export default function ChessBoardWithTimer({ lightIndex, darkIndex, lightPlayerName, darkPlayerName }: Props) {
    const [game, setGame] = useState<Chess>(new Chess())
    const [remoteBoardStatus, setRemoteBoardStatus] = useState<BoardStatus | undefined>(undefined)
    const [lightElapsedMs, setLightElapsedMs] = useState(0)
    const [darkElapsedMs, setDarkElapsedMs] = useState(0)

    const elapsedMsSinceLastUpdate = remoteBoardStatus ? (new Date().getTime() - new Date(remoteBoardStatus.lastUpdateDateTime).getTime()) : undefined
    const isLightTurn: boolean = game.turn() === 'w'
    const gameResult: Result = game.game_over()
        ? (game.in_checkmate() ? (game.turn() === 'w' ? Result.Dark : Result.Light) : Result.Draw)
        : Result.Running

    useEffect(() => {
        const interval = setInterval(() => {
            if (remoteBoardStatus && elapsedMsSinceLastUpdate) {
                setLightElapsedMs(remoteBoardStatus.lightElapsedMs + (isLightTurn ? elapsedMsSinceLastUpdate : 0))
                setDarkElapsedMs(remoteBoardStatus.darkElapsedMs + (!isLightTurn ? elapsedMsSinceLastUpdate : 0))
            }
        }, 70)
        return () => clearInterval(interval)
    }, [remoteBoardStatus, elapsedMsSinceLastUpdate, isLightTurn])

    /* Update every second */
    useEffect(() => {
        const interval = setInterval(() => {
            retrieveState(`${lightIndex}-${darkIndex}`).then((boardStatus: BoardStatus) => {
                if (boardStatus?.fen) {
                    setRemoteBoardStatus(boardStatus)
                    if (boardStatus.fen !== game.fen()) {
                        setGame(new Chess(boardStatus.fen))
                    }
                }
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [game, lightIndex, darkIndex, isLightTurn])

    function makeMoveAndSaveState(mutatorFunction: (game: Chess) => void): void {
        setGame((currentState: Chess) => {
            const copyOfCurrentState = { ...currentState }
            mutatorFunction(copyOfCurrentState)
            sendState(`${lightIndex}-${darkIndex}`, copyOfCurrentState.fen(), lightElapsedMs, darkElapsedMs, new Date().toISOString()).then((boardStatus) => {
                setRemoteBoardStatus(boardStatus)
            })
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
        <Timer player={darkPlayerName} isLight={false} targetMs={20 * 60 * 1000} elapsedMs={darkElapsedMs} />
        <Chessboard id={lightIndex * 100 + darkIndex} position={game.fen()} onPieceDrop={onDrop} boardWidth={200} />
        <Timer player={lightPlayerName} isLight={true} targetMs={20 * 60 * 1000} elapsedMs={lightElapsedMs} />
        {(gameResult !== Result.Running) &&
            <span>{gameResult === Result.Light ? `${lightPlayerName} won!` : (gameResult === Result.Dark ? `${darkPlayerName} won!` : 'It’s a draw!')}</span>
        }
    </div>
}
