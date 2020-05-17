import React from "react";
import {Letter} from "./letter";
import {Square} from "./square";

export class Board extends React.Component {

    renderSquare(i) {
        let currentLetterPlayed = this.getCurrentLettersPlay(i);

        if (currentLetterPlayed) {
            return (
                <Letter content={currentLetterPlayed.content} point={currentLetterPlayed.point} moveable={false} isNewLetter={true}></Letter>
            );
        } else if (this.props.squares[i]) {
            return (
                <Letter content={this.props.squares[i].content} point={this.props.squares[i].point} moveable={false} isNewLetter={false}></Letter>
            );
        } else {
            return (
                <Square position={i} type={this.props.types[i]} dropLetter={(item) => this.props.dropLetter(i, item)} canDropLetter={(item) => this.props.canDropLetter(i, item)}/>
            );
        }
    }

    getCurrentLettersPlay(i) {
        const currentLettersPlay = this.props.currentLettersPlay;
        if (currentLettersPlay.firstPosition !== null) {
            if (i >= currentLettersPlay.firstPosition && i <= currentLettersPlay.lastPosition) {
                for (let li = 0; li < currentLettersPlay.letters.length; li++) {
                    if (currentLettersPlay.letters[li].position === i) {
                        return currentLettersPlay.letters[li].letter;
                    }
                }
            }
        }

        return undefined;
    }

    render() {
        let boardRow = Array(15);
        for (let row = 0; row < 15; row++) {
            let cols = Array(3);
            for (let col = 0; col < 15; col++) {
                cols[col] = (<span key={row + '-' + col}>{this.renderSquare(col + row*15)}</span>)
            }
            boardRow[row] = <div key={row} className="board-row">{cols}</div>
        }
        return (
            <div>
                {boardRow}
            </div>
        );
    }
}
