import React from 'react'
import './App.css'
import ChessBoard from './ChessBoard'

const players = 'Dávid,Andris,Ádám,László,Gábor,Zoltán,József,Péter'.split(',')

function App() {
    return (
        <div className="App">
            <table cellPadding={5}>
                <thead>
                <tr>
                    <th></th>
                    <th colSpan={players.length}>White</th>
                </tr>
                <tr>
                    <th></th>
                    <th></th>
                    {players.map((playerName, index) => <th key={`header-${index}`}>{playerName}</th>)}
                </tr>
                </thead>
                <tbody>
                {players.map((blackPlayerName, blackIndex) =>
                    <tr key={`row-${blackIndex}`}>
                        {!blackIndex && <th rowSpan={players.length}>Black</th>}
                        <th>{blackPlayerName}</th>
                        {players.map((whitePlayerName, whiteIndex) => <td key={`cell-${whiteIndex}`}>
                            {blackIndex >= whiteIndex ? '' : <>chessboard for {whitePlayerName} and {blackPlayerName}: <ChessBoard /></>}
                            </td>)}
                    </tr>
                )}
                </tbody>
            </table>

        </div>
    )
}

// const players = process.env.PLAYERS?.split(',') || []
// console.log(players);
// console.log('xxx')
//const minutes = process.env.minutes || 5

export default App
