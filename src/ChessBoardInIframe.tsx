import React, {useRef} from 'react'

type Props = {
    lightIndex: number
    darkIndex: number
    lightPlayerName: string
    darkPlayerName: string
}
export default function ChessBoardInIframe({ lightIndex, darkIndex, lightPlayerName, darkPlayerName }: Props) {
    // Auto-height from here: https://stackoverflow.com/questions/67218249/automatically-adjust-height-of-iframe-using-react-hooks
    const ref = useRef<HTMLIFrameElement>(null)
    const [height, setHeight] = React.useState('0px')
    const onLoad = () => {
        setHeight(ref.current?.contentWindow?.document.body.scrollHeight + 'px')
    }
    return <>
        <iframe ref={ref}
                onLoad={onLoad}
                height={height}
                scrolling="no"
                style={{ border: 'none' }} width={200}
                src={'/?' + new URLSearchParams([['iframe', 'true'], ['lightIndex', lightIndex.toString()], ['darkIndex', darkIndex.toString()]]).toString()}
                title={`chessboard for ${lightPlayerName} and ${darkPlayerName}`}
        /></>
}
