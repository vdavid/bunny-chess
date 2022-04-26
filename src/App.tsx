import React from 'react'
import './App.css'
import ChessBoardWithTimer from './ChessBoardWithTimer'
import ChessBoardInIframe from './ChessBoardInIframe'
import { playerNames } from './players'

// eslint-disable-next-line
const searchParams = new URLSearchParams(location.search)
//const minutes = parseInt(searchParams.get('minutes') || '30')
const lightIndex = parseInt(searchParams.get('lightIndex') || '')
const darkIndex = parseInt(searchParams.get('darkIndex') || '')
const isIframe = searchParams.get('iframe') === 'true'

function App() {
    return isIframe ? <IframeApp /> : <MainApp />
}

function IframeApp() {
    return (<div>
        <ChessBoardWithTimer lightIndex={lightIndex} darkIndex={darkIndex} lightPlayerName={playerNames[lightIndex]}
                             darkPlayerName={playerNames[darkIndex]} />
    </div>)
}

function MainApp() {
    return (<div className="App">
        <table cellPadding={5}>
            <thead>
            <tr>
                <th></th>
                <th colSpan={playerNames.length}>Light</th>
            </tr>
            <tr>
                <th></th>
                <th></th>
                {playerNames.map((playerName, index) => <th key={`header-${index}`}>{playerName}</th>)}
            </tr>
            </thead>
            <tbody>
            {playerNames.map((darkPlayerName, darkIndex) =>
                <tr key={`row-${darkIndex}`}>
                    {!darkIndex && <th rowSpan={playerNames.length}>Dark</th>}
                    <th>{darkPlayerName}</th>
                    {playerNames.map((lightPlayerName, lightIndex) => <td key={`cell-${lightIndex}`}>
                        {darkIndex >= lightIndex
                            ? ((darkIndex === lightIndex && darkIndex > 0 && darkIndex < playerNames.length - 1) ?
                                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"
                                     viewBox="0 0 52.917 52.917">
                                    <path d="M24.896 3.156s-5.61 27 26.649 27" fill="none" stroke="#000"
                                          strokeWidth="1.323" strokeOpacity=".583" />
                                </svg> : '')
                            : ChessBoardInIframe({ lightIndex, lightPlayerName, darkIndex, darkPlayerName })}
                    </td>)}
                </tr>
            )}
            </tbody>
        </table>
    </div>)
}

export default App
