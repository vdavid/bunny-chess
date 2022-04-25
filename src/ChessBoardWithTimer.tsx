import { Chessboard, Square } from 'react-chessboard'
// @ts-ignore
import { Chess } from 'chess.js'
import { useEffect, useState } from 'react'
import { retrieveState, sendState } from './statusSaver'
import Timer from './Timer'

type Props = {
    lightIndex: number
    darkIndex: number
    lightPlayerName: string
    darkPlayerName: string
}

enum Color {
    Light = 'light',
    Dark = 'dark',
}

export default function ChessBoardWithTimer({ lightIndex, darkIndex, lightPlayerName, darkPlayerName }: Props) {
    const [game, setGame] = useState<Chess>(new Chess())
    const [lightElapsedMs, setLightElapsedMs] = useState(0)
    const [darkElapsedMs, setDarkElapsedMs] = useState(0)
    const [gameStartDateTime, setGameStartDateTime] = useState<number | undefined>(undefined)
    const [lastUpdateDateTime, setLastUpdateDateTime] = useState<number | undefined>(undefined)

    const elapsedMsSinceLastUpdate = new Date().getTime() - (lastUpdateDateTime || 0)
    const isLightTurn: boolean = game.turn() === 'w'
    const isGameOver: boolean = game.game_over()
    const winner: Color | undefined = game.in_checkmate() ? (game.turn() === 'w' ? Color.Dark : Color.Light) : undefined

    /* Update every second */
    useEffect(() => {
        const interval = setInterval(() => {
            retrieveState(`${lightIndex}-${darkIndex}`).then((response) => {
                /* Update startDateTime */
                if (gameStartDateTime !== response.startDateTime) {
                    setGameStartDateTime(response.startDateTime)
                }

                const remoteBoardStatus = response.boards[`${lightIndex}-${darkIndex}`]
                if (remoteBoardStatus?.fen) {
                    if (remoteBoardStatus?.fen !== game.fen()) {
                        setGame(new Chess(remoteBoardStatus.fen))
                    }
                    setLastUpdateDateTime(remoteBoardStatus.lastUpdateDateTime)
                    //const elapsedMsSinceStartDateTime = new Date().getTime() - response.startDateTime
                    const elapsedMsSinceLastUpdate = new Date().getTime() - remoteBoardStatus.lastUpdateDateTime
                    if (isLightTurn) {
                        setLightElapsedMs(remoteBoardStatus.lightElapsedMs + elapsedMsSinceLastUpdate)
                    } else {
                        setDarkElapsedMs(remoteBoardStatus.darkElapsedMs + elapsedMsSinceLastUpdate)
                    }
                }
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [game, lightIndex, darkIndex, gameStartDateTime, isLightTurn])

    function makeMoveAndSaveState(mutatorFunction: (game: Chess) => void): void {
        const nowDateTime = new Date().getTime()
        if (isLightTurn) {
            setLightElapsedMs(lightElapsedMs => lightElapsedMs + elapsedMsSinceLastUpdate)
        } else {
            setDarkElapsedMs(darkElapsedMs => darkElapsedMs + elapsedMsSinceLastUpdate)
        }
        setLastUpdateDateTime(nowDateTime)
        setGame((currentState: Chess) => {
            const copyOfCurrentState = { ...currentState }
            mutatorFunction(copyOfCurrentState)
            sendState(`${lightIndex}-${darkIndex}`, copyOfCurrentState.fen(), lightElapsedMs, darkElapsedMs, nowDateTime).then(() => {})
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
        {isGameOver &&
            <span>{winner === Color.Light ? `${lightPlayerName} won!` : (winner === Color.Dark ? `${darkPlayerName} won!` : 'It’s a draw!')}</span>
        }
    </div>
}
