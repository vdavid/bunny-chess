import { Chessboard, Square } from 'react-chessboard'
// @ts-ignore
import { Chess } from 'chess.js'
import { useEffect, useState } from 'react'
import { BoardStatus, retrieveState, sendState } from './statusSaver'
import Timer from './Timer'
import { playerColors } from './players'
import colors from './materialColors'
import { getPieces } from './customPieces'

type Props = {
    lightIndex: number
    darkIndex: number
    lightPlayerName: string
    darkPlayerName: string
}

export enum Result {
    Running = 'running',
    Light = 'light',
    Dark = 'dark',
    Draw = 'draw',
}

/* Set game length here! */
const gameLengthMs = 160 * 60 * 1000

export default function ChessBoardWithTimer({ lightIndex, darkIndex, lightPlayerName, darkPlayerName }: Props) {
    const [game, setGame] = useState<Chess>(new Chess())
    const [remoteBoardStatus, setRemoteBoardStatus] = useState<BoardStatus | undefined>(undefined)
    const [lightElapsedMs, setLightElapsedMs] = useState(0)
    const [darkElapsedMs, setDarkElapsedMs] = useState(0)
    const [hasLightResigned, setHasLightResigned] = useState(false)
    const [hasDarkResigned, setHasDarkResigned] = useState(false)

    const elapsedMsSinceLastUpdate = remoteBoardStatus ? (new Date().getTime() - new Date(remoteBoardStatus.lastUpdateDateTime).getTime()) : undefined
    const isLightTurn: boolean = game.turn() === 'w'
    const gameResult = getGameResult(game, hasLightResigned, hasDarkResigned)

    useEffect(() => {
        const interval = setInterval(() => {
            if (gameResult !== Result.Running && lightElapsedMs !== 0 && darkElapsedMs !== 0) {
                clearInterval(interval)
                return
            }
            if (remoteBoardStatus && elapsedMsSinceLastUpdate) {
                setLightElapsedMs(remoteBoardStatus.lightElapsedMs + ((isLightTurn && (gameResult === Result.Running)) ? elapsedMsSinceLastUpdate : 0))
                setDarkElapsedMs(remoteBoardStatus.darkElapsedMs + ((!isLightTurn && (gameResult === Result.Running)) ? elapsedMsSinceLastUpdate : 0))
                if (lightElapsedMs > gameLengthMs) {
                    setHasLightResigned(true)
                } else if (darkElapsedMs > gameLengthMs) {
                    setHasDarkResigned(true)
                }
            }
        }, 70)
        return () => clearInterval(interval)
    }, [remoteBoardStatus, elapsedMsSinceLastUpdate, isLightTurn, lightElapsedMs, darkElapsedMs, gameResult])

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
        if (game.game_over() || hasLightResigned || hasDarkResigned) {
            return false
        }

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
        <Timer
            playerIndex={darkIndex}
            isLight={false}
            isLightTurn={isLightTurn}
            targetMs={gameLengthMs}
            elapsedMs={darkElapsedMs}
            gameResult={gameResult} />
        <Chessboard
            id={lightIndex * 100 + darkIndex}
            position={game.fen()}
            onPieceDrop={onDrop}
            customPieces={getPieces(
                colors[playerColors[lightIndex]]['100'],
                colors[playerColors[lightIndex]]['900'],
                colors[playerColors[darkIndex]]['700'],
                colors.blueGrey['900'],
                colors.blueGrey['800'],
            )}
            customLightSquareStyle={gameResult === Result.Running ? undefined : { backgroundColor: colors.grey['100'] }}
            customDarkSquareStyle={gameResult === Result.Running ? undefined : { backgroundColor: colors.grey['500'] }}
            boardWidth={200} />
        <Timer
            playerIndex={lightIndex}
            isLight={true}
            isLightTurn={isLightTurn}
            targetMs={gameLengthMs}
            elapsedMs={lightElapsedMs}
            gameResult={gameResult} />
        <div style={{ backgroundColor: colors.grey[500], textAlign: 'center' }}>{(gameResult !== Result.Running) ?
            gameResult === Result.Light
                ? `${lightPlayerName} won!`
                : (gameResult === Result.Dark ? `${darkPlayerName} won!`
                    : 'It’s a draw!')
            : 'Go go go!'}</div>
    </div>
}

function getGameResult(game: Chess, hasLightResigned: boolean, hasDarkResigned: boolean): Result {
    return (game.game_over() || hasLightResigned || hasDarkResigned)
        ? ((game.in_checkmate() && game.turn() === 'w') || hasLightResigned) ? Result.Dark
            : (((game.in_checkmate() && game.turn() === 'b') || hasDarkResigned) ? Result.Light
                : Result.Draw)
        : Result.Running
}
