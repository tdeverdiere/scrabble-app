import React from 'react';
import ReactDOM from 'react-dom';
import { DndProvider } from 'react-dnd'
import { useDrag } from 'react-dnd'
import { useDrop } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'

import './index.css';

let boardSize = 255;

export const ItemTypes = {
    LETTER: 'letter',
}

const CURRENT_LETTERS_PLAY_INIT = { firstPosition: null, lastPosition: null, direction: null, letters: Array(0)};

function Letter(props) {
    const [{ isDragging }, drag] = useDrag({
        item: { type: ItemTypes.LETTER, content: props.content, point: props.point },
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    return (
        <div className="square">
            <div className="square-letter" ref={drag} style={{opacity: isDragging ? 0.5 : 1}}>
                <div className="letter">{props.content}</div>
                <div className="point">{props.point}</div>
            </div>
        </div>
    );
}

function Square(props) {
    let className;
    let content;

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.LETTER,
        drop: (item) => props.dropLetter(item),
        canDrop: (item) => props.canMoveLetter(props.position, item),
        collect: mon => ({
            isOver: !!mon.isOver(),
            canDrop: !!mon.canDrop()
        }),
    });

    if (props.type === 'mct') {
        className = 'square square-empty square-mct';
        content = 'MOT TRIPLE';
    } else if (props.type === 'mcd') {
        className = 'square square-empty square-mcd';
        content = 'MOT DOUBLE';
    } else if (props.type === 'start') {
        className = 'square square-empty square-start';
        content = 'X';
    } else if (props.type === 'lct') {
        className = 'square square-empty square-lct';
        content = 'LETTRE TRIPLE';
    } else if (props.type === 'lcd') {
        className = 'square square-empty square-lcd';
        content = 'LETTRE DOUBLE';
    } else {
        className = 'square square-empty square-standard';
    }
    return (
        <div ref={drop} className={className + (isOver ? ' square-drop':'') + (canDrop ? ' square-candrop' : ' ')} >
            <div className="square-empty-content">{content}</div>
        </div>
    );

}

class Board extends React.Component {
    constructor(props) {
        super(props);
    }

    renderSquare(i) {
        let currentLetterPlayed = this.getCurrentLettersPlay(i);

        if (currentLetterPlayed) {
            return (
                <Letter content={currentLetterPlayed.content} point={currentLetterPlayed.point}></Letter>
            );
        } else if (this.props.squares[i]) {
            return (
                <Letter content={this.props.squares[i][0]} point={this.props.squares[i][1]}></Letter>
            );
        } else {
            return (
                <Square position={i} type={this.props.types[i]} dropLetter={(item) => this.props.dropLetter(i, item)} canMoveLetter={() => this.props.canMoveLetter()}/>
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

class Desk extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            letters: [['W','10'],['A','1'],['G',3],['O', 1],['N',1],['A',1],['U',1]]
        }
    }

    render() {
        let deskLetters;

        deskLetters = this.state.letters.map((value, index) => {
            return (
                <Letter key={index} content={value[0]} point={value[1]}  />
            );
        });

        return (
            <div className="letters-pick">
                <div className="desk">
                    <div className="desk-inner">
                        {deskLetters}
                    </div>
                </div>
            </div>
        )
    }
}

class Game extends React.Component {


    constructor(props) {
        super(props);
        let types =  Array(boardSize).fill('square-standard');

        // Mot compte triple
        types[0] = types[7] = types[14] ='mct';
        types[105] = types[119] = 'mct';
        types[210] = types[217] = types[224] = 'mct';


        // Mot compte double
        types[16] = types[28] = 'mcd';
        types[32] = types[42] = 'mcd';
        types[48] = types[56] = 'mcd';
        types[64] = types[70] = 'mcd';
        types[154] = types[160] = 'mcd';
        types[168] = types[176] = 'mcd';
        types[182] = types[192] = 'mcd';
        types[196] = types[208] = 'mcd';

        // Lettre compte triple
        types[20]  = types[24] = 'lct';
        types[76]  = types[80] = types[84] = types[88] = 'lct';
        types[136] = types[140] = types[144] = types[148] = 'lct';
        types[200] = types[204] = 'lct';

        // Lettre compte double
        types[3]  = types[11] = 'lcd';
        types[36] = types[38] = 'lcd';
        types[45] = types[52] = types[59] = 'lcd';
        types[92] = types[96] = types[98] = types[102] = 'lcd';
        types[108] = types[116] = 'lcd';
        types[122] = types[126] = types[128] = types[132] = 'lcd';
        types[165] = types[172] = types[179] = 'lcd';
        types[186] = types[188] = 'lcd';
        types[213]  = types[221] = 'lcd';


        // Start
        types[112] = 'start';

        let players = Array(4);
        players[0] = 'Thomas';
        players[1] = 'Catherine';
        players[2] = 'Magali';
        players[3] = 'Cécile';

        this.state = {
            history: [{
                squares: Array(boardSize).fill(null),
                lettersPlay: null,
                index: 0
            }],
            types: types,
            currentLettersPlay: CURRENT_LETTERS_PLAY_INIT,
            xIsNext: true,
            stepNumber: 0,
            movesInChronoOrder: true,
            players: players
        };
    }

    validate() {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        let lettersPlay = this.state.currentLettersPlay;
        lettersPlay.forEach((value) => {
            squares[value[0]] = value[1];
        });

        this.setState({
            history: history.concat([{
                squares: squares,
                lettersPlay: lettersPlay,
                index: history.length
            }]),
            currentLettersPlay: CURRENT_LETTERS_PLAY_INIT,
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    dropLetter(i, item) {

        let currentLettersPlay = {
            firstPosition: this.state.currentLettersPlay.firstPosition,
            lastPosition: this.state.currentLettersPlay.lastPosition,
            direction: this.state.currentLettersPlay.direction,
            letters: this.state.currentLettersPlay.letters.slice()
        }

        if (this.state.currentLettersPlay.firstPosition == null) {
            currentLettersPlay.firstPosition = i;
            currentLettersPlay.lastPosition = i;
            currentLettersPlay.direction = null;
        } else {
            if (i < this.state.currentLettersPlay.firstPosition) {
                currentLettersPlay.firstPosition = i;
            } else if (i > this.state.currentLettersPlay.lastPosition) {
                currentLettersPlay.lastPosition = i;
            }
            if (this.state.currentLettersPlay.letters.length == 1) {
                if (Math.abs(this.state.currentLettersPlay.firstPosition - i) >= 15) {
                    currentLettersPlay.direction = 'V'; // Vertical
                } else {
                    currentLettersPlay.direction = 'H'; // Horizontal
                }
            }
        }

        currentLettersPlay.letters = currentLettersPlay.letters.concat({position: i, letter: {content: item.content, point: item.point}});

        this.setState({
            currentLettersPlay: currentLettersPlay
        });
    }

    canMoveLetter(i, letter) {
        return true;
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    reverseMovesOrder() {
        this.setState({
            movesInChronoOrder: !this.state.movesInChronoOrder
        })
    }

    render() {
        const history = this.state.history.slice();
        const current = history[this.state.stepNumber];
        const types = this.state.types;
        const currentLettersPlay = this.state.currentLettersPlay;
        const winner = calculateWinner(current.squares);
        let status;
        if (winner) {
            status = winner + ' a gagné';
        } else {
            status = 'Prochain joueur ' + (this.state.xIsNext ? 'X' : 'O');
        }

        if (!this.state.movesInChronoOrder) {
            history.reverse();
        }

        const moves = history.map((step, move) => {
            let button;
            let word;

            if (step.index) {
                word = step.lettersPlay.map((value) => {
                    return value[1][0];
                });

                button = <button onClick={() => this.jumpTo(step.index)}>Revenir au tour n° <b>{step.index}</b> - ( {word} )</button>
            } else {
                button = <button onClick={() => this.jumpTo(step.index)}>Revenir au début</button>
            }
            return (
                <li key={step.index}>
                    {button}
                </li>
            )
        });

        const players = this.state.players.map((player, index) => {
            return (
                <div className="player-score" key={index}>
                    {player}
                </div>
            )
        });
        return (
            <DndProvider backend={Backend}>
                <div className="game">
                    <div className="game-board">
                        <Board
                            currentLettersPlay = {currentLettersPlay}
                            squares = {current.squares}
                            types = {types}
                            dropLetter={(i, item) => this.dropLetter(i, item)}
                            canMoveLetter={() => this.canMoveLetter()}
                        />
                    </div>
                    <div className="game-side">
                        <div className="game-info">
                            <div className="plays">
                                <ol>{moves}</ol>
                            </div>
                            <div className="players-info">
                                {players}
                            </div>
                        </div>
                        <Desk />
                    </div>
                </div>
            </DndProvider>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function getDrop(i, item) {
    console.log("Dropping : " + i + " - item :" + item[1]);
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}
