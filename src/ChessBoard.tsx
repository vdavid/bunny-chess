import { Chessboard, Square } from 'react-chessboard'
// @ts-ignore
import { Chess } from "chess.js";
import { useState } from 'react'

export default function ChessBoard() {
    const [game, setGame] = useState(new Chess());

    function safeGameMutate(game: Chess) {
        setGame((g: Chess) => {
            const update = { ...g };
            game(update);
            return update;
        });
    }

    function onDrop(sourceSquare: Square, targetSquare: Square) {

        let move = null;
        safeGameMutate((game: Chess) => {
            move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q", // always promote to a queen for example simplicity
            });
        });
        if (move === null) return false; // illegal move
        return true;
    }

    return <div>
        <Chessboard id={1} position={game.fen()} onPieceDrop={onDrop} />
    </div>
}
