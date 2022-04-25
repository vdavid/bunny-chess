type Props = {
    player: string
    isLight: boolean
    targetMs: number
    elapsedMs: number
}
export default function Timer({player, isLight, targetMs, elapsedMs}: Props) {
    const remaining = targetMs - elapsedMs;
    const minutes = Math.floor(remaining / (1000 * 60)).toString().padStart(2, '0')
    const seconds = Math.floor(remaining % (1000 * 60) / 1000).toString().padStart(2, '0')
    const milliseconds = (remaining % 1000).toString().padStart(3, '0')
    return <div className={isLight ? 'light' : 'dark'}>{player}: {minutes}:{seconds}.{milliseconds}</div>
}
