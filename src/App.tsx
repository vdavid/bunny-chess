import React from 'react'
import './App.css'
import ChessBoard from './ChessBoard'
import ChessBoardInIframe from './ChessBoardInIframe'

// eslint-disable-next-line
const searchParams = new URLSearchParams(location.search)
const players = (searchParams.get('players') || 'A,B,C').split(',')
//const minutes = parseInt(searchParams.get('minutes') || '30')
const lightIndex = parseInt(searchParams.get('lightIndex') || '')
const darkIndex = parseInt(searchParams.get('darkIndex') || '')
const isIframe = searchParams.get('iframe') === 'true'

function App() {
    return isIframe ? <IframeApp /> : <MainApp />
}

function IframeApp() {
    return (<div>
        <ChessBoard lightIndex={lightIndex} darkIndex={darkIndex} />
    </div>)
}

function MainApp() {
    return (<div className="App">
        <table cellPadding={5}>
            <thead>
            <tr>
                <th></th>
                <th colSpan={players.length}>Light</th>
            </tr>
            <tr>
                <th></th>
                <th></th>
                {players.map((playerName, index) => <th key={`header-${index}`}>{playerName}</th>)}
            </tr>
            </thead>
            <tbody>
            {players.map((darkPlayerName, darkIndex) =>
                <tr key={`row-${darkIndex}`}>
                    {!darkIndex && <th rowSpan={players.length}>Dark</th>}
                    <th>{darkPlayerName}</th>
                    {players.map((lightPlayerName, lightIndex) => <td key={`cell-${lightIndex}`}>
                        {darkIndex >= lightIndex ? '' : ChessBoardInIframe({lightIndex, lightPlayerName, darkIndex, darkPlayerName})}
                    </td>)}
                </tr>
            )}
            </tbody>
        </table>
    </div>)
}

export default App
