import React from 'react';
import './App.css';
import ChessBoard from './ChessBoard'

console.log(process.env);

function App() {
  return (
    <div className="App">
        <ChessBoard />
    </div>
  );
}

export default App;
