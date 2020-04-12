import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

let boardSize = 255;

function Square(props) {
    let className;
    let content;
    let point;
    if (props.letter) {
        className = 'square square-letter';
        content = props.letter[0];
        point = props.letter[1];
        return (
            <div className={className}>
                <div className="letter">{content}</div><div className="point">{point}</div>
            </div>
        );
    } else {
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
            <button className={className} onClick={props.onClick}>
                {content}
            </button>
        );
    }

}

class Board extends React.Component {

    renderSquare(i) {
        return (
            <Square type={this.props.types[i]} letter={this.props.squares[i]} onClick={() => this.props.onClick(i)} />
        );
    }

    render() {
        let boardRow = Array(15);
        for (let row = 0; row < 15; row++) {
            let cols = Array(3);
            for (let col = 0; col < 15; col++) {
                cols[col] = (<span>{this.renderSquare(col + row*15)}</span>)
            }
            boardRow[row] = <div className="board-row">{cols}</div>
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

        deskLetters = this.state.letters.map(value => {
            return (
                <Square type='letter' letter={value}  />
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
            xIsNext: true,
            stepNumber: 0,
            movesInChronoOrder: true,
            players: players
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        let lettersPlay = [[i,['W','10']],[i+1,['A','1']],[i+2,['G',3]],[i+3,['O', 1]],[i+4,['N',1]]];
        lettersPlay.forEach((value) => {
            squares[value[0]] = value[1];
        });

        this.setState({
            history: history.concat([{
                squares: squares,
                lettersPlay: lettersPlay,
                index: history.length
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
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
                <div className="player-score">
                    {player}
                </div>
            )
        });
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares = {current.squares}
                        types = {types}
                        onClick={(i) => this.handleClick(i)}
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
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

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

function calculatePosition(i) {
    let positions = Array(9);
    let index = 0;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            positions[index] = {row: row + 1, col: col + 1};
            index++;
        }
    }

    return positions[i];
}