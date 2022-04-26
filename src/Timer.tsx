import { Result } from './ChessBoardWithTimer'
import { playerColors, playerNames } from './players'
import colors from './materialColors'

type Props = {
    playerIndex: number
    isLight: boolean
    targetMs: number
    elapsedMs: number
    gameResult: Result
}
export default function Timer({ playerIndex, isLight, targetMs, elapsedMs }: Props) {
    const remaining = Math.max(Math.min(targetMs - elapsedMs, targetMs), 0)
    const minutes = Math.floor(remaining / (1000 * 60)).toString().padStart(2, '0')
    const seconds = Math.floor(remaining % (1000 * 60) / 1000).toString().padStart(2, '0')
    const milliseconds = (remaining % 1000).toString().padStart(3, '0')
    return <div style={{ textAlign: 'center', backgroundColor: colors[playerColors[playerIndex]][500] }}
                className={isLight ? 'light' : 'dark'}>{playerNames[playerIndex]}: <big>{minutes}</big>:{seconds}<small>.{milliseconds}</small>
    </div>
}
