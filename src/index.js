import React from 'react';
import ReactDOM from 'react-dom';
import { DndProvider } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'

import { Board } from './board.js';
import { Desk } from './desk.js';
import './index.css';

let boardSize = 255;

let POSITION_START = 112;
let INITIAL_DESK_LETTERS =  [
    {id: 1, letter: {content: 'W', point: 10}},
    {id: 2, letter: {content: 'A', point: 1}},
    {id: 3, letter: {content: 'G', point: 3}},
    {id: 4, letter: {content: 'O', point: 1}},
    {id: 5, letter: {content: 'N', point: 1}},
    {id: 6, letter: {content: 'A', point: 1}},
    {id: 7, letter: {content: 'U', point: 1}}
];

const CURRENT_LETTERS_PLAY_INIT = { firstPosition: null, lastPosition: null, direction: null, letters: Array(0)};

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
        types[POSITION_START] = 'start';

        let players = Array(4);
        players[0] = {id: '0', name: 'Thomas'};
        players[1] = {id: '1', name: 'Catherine'};
        players[2] = {id: '2', name: 'Magali'};
        players[3] = {id: '3', name: 'Cécile'};

        let nextPossiblePositions = new Set();
        nextPossiblePositions.add(POSITION_START);

        this.state = {
            history: [{
                squares: Array(boardSize).fill(null),
                lettersPlay: null,
                index: 0,
                scores: Array(players.length)
            }],
            types: types,
            currentLettersPlay: CURRENT_LETTERS_PLAY_INIT,
            nextPossiblePositions: nextPossiblePositions,
            xIsNext: true,
            stepNumber: 0,
            movesInChronoOrder: true,
            players: players,
            currentPlayerId: '0',
            deskLetters: INITIAL_DESK_LETTERS
        };
    }

    validate() {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        let lettersPlay = this.state.currentLettersPlay;
        let score = this.calculateScore(lettersPlay, squares);

        lettersPlay.letters.forEach((value) => {
            squares[value.position] = {content: value.letter.content, point: value.letter.point};
        });


        this.setState({
            history: history.concat([{
                squares: squares,
                lettersPlay: lettersPlay,
                index: history.length,
                score: score,
                playerId: this.state.currentPlayerId
            }]),
            currentLettersPlay: CURRENT_LETTERS_PLAY_INIT,
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });

        this.updateNextPossiblePositions(history.length, CURRENT_LETTERS_PLAY_INIT, squares);
    }

    getPlayedWordsPosition(lettersPlay, squares) {
        let wordsPosition = [];
        if (lettersPlay.direction) {
            let otherDirection;
            if (lettersPlay.direction === 'H') {
                otherDirection = 'V';
            } else {
                otherDirection = 'H';
            }
            wordsPosition = wordsPosition.concat(this.findWordPositions(lettersPlay.firstPosition, lettersPlay.direction, lettersPlay, squares));
            lettersPlay.letters.forEach((value) => {
                wordsPosition = wordsPosition.concat(this.findWordPositions(value.position, otherDirection, lettersPlay, squares));
            });
        } else {
            wordsPosition = wordsPosition.concat(this.findWordPositions(lettersPlay.firstPosition, 'H', lettersPlay, squares));
            wordsPosition = wordsPosition.concat(this.findWordPositions(lettersPlay.firstPosition, 'V', lettersPlay, squares));
        }

        wordsPosition = wordsPosition.filter(wordPosition => !!wordPosition);
        return wordsPosition;
    }

    calculateScore(lettersPlay, squares) {
        let wordsPosition = this.getPlayedWordsPosition(lettersPlay, squares);

        let score = wordsPosition.reduce((scoreSum, wordPosition) => {
            if (!wordPosition) {
                return scoreSum;
            }
            let wordMulti = 1;
            let wordScore = 0;
            for (let position = wordPosition.begin; position <= wordPosition.end; position = position + wordPosition.increment) {
                if (squares[position]) {
                    wordScore = wordScore + squares[position].point;
                } else {
                    let letter = this.getCurrentLettersPlay(position, lettersPlay);
                    if (this.state.types[position] === 'mct') {
                        wordMulti = wordMulti * 3;
                    } else if (this.state.types[position] === 'mcd' || this.state.types[position] === 'start') {
                        wordMulti = wordMulti * 2;
                    }
                    if (this.state.types[position] === 'lct') {
                        wordScore = wordScore + letter.point * 3;
                    } else if (this.state.types[position] === 'lcd') {
                        wordScore = wordScore + letter.point * 2;
                    } else {
                        wordScore = wordScore + letter.point;
                    }
                }
            }
            return scoreSum + wordScore * wordMulti;
        }, 0);

        return score;
    }

    findWordPositions(i, direction, lettersPlay, squares) {
        let wordPosition;
        if (direction === 'H') {
            wordPosition = {
                begin: this.findPreviousHorizontalFree(i, lettersPlay, squares).filled,
                end: this.findNextHorizontalFree(i, lettersPlay, squares).filled,
                increment: 1
            }
        } else {
            wordPosition = {
                begin: this.findPreviousVerticalFree(i, lettersPlay, squares).filled,
                end: this.findNextVerticalFree(i, lettersPlay, squares).filled,
                increment: 15
            }
        }
        if (wordPosition.end === wordPosition.begin) {
            return undefined;
        } else {
            return wordPosition;
        }
    }

    cancel() {
        const current = this.state.history[this.state.stepNumber];
        const squares = current.squares;

        let deskLetters = this.state.deskLetters.concat(this.state.currentLettersPlay.letters);
        this.setState({
            currentLettersPlay: CURRENT_LETTERS_PLAY_INIT,
            deskLetters: deskLetters
        });
        this.updateNextPossiblePositions(this.state.stepNumber, CURRENT_LETTERS_PLAY_INIT, squares);
    }

    dropLetter(i, item) {
        if (!this.state.nextPossiblePositions.has(i)) {
            return;
        }
        const current = this.state.history[this.state.stepNumber];
        const squares = current.squares;

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
            if (this.state.currentLettersPlay.letters.length === 1) {
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

        this.updateNextPossiblePositions(this.state.stepNumber, this.state.currentLettersPlay, squares);

        const deskLetters = this.state.deskLetters.slice();
        const { letter, index } = this.findDeskLetter(item.id, deskLetters);
        deskLetters.splice(index, 1);
        this.setState({
            deskLetters: deskLetters
        });

    }

    updateNextPossiblePositions(turnIndex, currentLettersPlay, squares) {
        let nextPossiblePositions = this.calculateNextPossiblePositions(turnIndex, currentLettersPlay, squares);
        this.setState({
            nextPossiblePositions: nextPossiblePositions
        });
    }

    calculateNextPossiblePositions(turnIndex, currentLettersPlay, squares) {
        let possiblePositions = new Set();

        // Si c'est le premier coup
        if (turnIndex === 0) {
            if (currentLettersPlay.firstPosition == null) {
                possiblePositions.add(POSITION_START);
                return possiblePositions;
            }
        }

        // Si aucune lettre n'a encore été posée
        if (currentLettersPlay.firstPosition == null) {
            for (let index = 0; index < squares.length; index++) {
                if (squares[index]) {
                    possiblePositions.add(this.findPreviousHorizontalFree(index, currentLettersPlay, squares).free);
                    possiblePositions.add(this.findNextHorizontalFree(index, currentLettersPlay, squares).free);
                    possiblePositions.add(this.findPreviousVerticalFree(index, currentLettersPlay, squares).free);
                    possiblePositions.add(this.findNextVerticalFree(index, currentLettersPlay, squares).free);
                }
            }
            return possiblePositions;
        }

        // Si seulement 1 lettre a été posée, la direction n'est pas précisé
        if (currentLettersPlay.direction == null) {
            let currentPosition = currentLettersPlay.firstPosition;
            possiblePositions.add(this.findPreviousHorizontalFree(currentPosition, currentLettersPlay, squares).free);
            possiblePositions.add(this.findNextHorizontalFree(currentPosition, currentLettersPlay, squares).free);
            possiblePositions.add(this.findPreviousVerticalFree(currentPosition, currentLettersPlay, squares).free);
            possiblePositions.add(this.findNextVerticalFree(currentPosition, currentLettersPlay, squares).free);
        } else {
            if (currentLettersPlay.direction === 'V') {
                possiblePositions.add(this.findPreviousVerticalFree(currentLettersPlay.firstPosition, currentLettersPlay, squares).free);
                possiblePositions.add(this.findNextVerticalFree(currentLettersPlay.lastPosition, currentLettersPlay, squares).free);
            } else {
                possiblePositions.add(this.findPreviousHorizontalFree(currentLettersPlay.firstPosition, currentLettersPlay, squares).free);
                possiblePositions.add(this.findNextHorizontalFree(currentLettersPlay.lastPosition, currentLettersPlay, squares).free);
            }
        }

        return possiblePositions;
    }

    canDropLetter(i, item) {
        const nextPossiblePositions = this.state.nextPossiblePositions;

        return nextPossiblePositions.has(i);
    }

    getLineBounds(i) {
        let restOfLineStart = i % 15;
        let endOfPreviousLine = i - restOfLineStart - 1;

        let restOfLineEnd = 14 - i % 15;
        let beginOfNextLine = i + restOfLineEnd + 1;

        return {begin: endOfPreviousLine, end: beginOfNextLine};
    }

    findPreviousHorizontalFree(i, currentLettersPlay, squares) {
        let bounds = this.getLineBounds(i);
        if (i === bounds.begin + 1) {
            return {free: -1, filled: -1};
        }
        return this.findFreeSquareInLimit(i, bounds.begin, bounds.end, -1, currentLettersPlay, squares);
    }

    findNextHorizontalFree(i, currentLettersPlay, squares) {
        let bounds = this.getLineBounds(i);
        if (i === bounds.end - 1) {
            return {free: -1, filled: -1};
        }
        return this.findFreeSquareInLimit(i, bounds.begin, bounds.end, 1, currentLettersPlay, squares);
    }

    findPreviousVerticalFree(i, currentLettersPlay, squares) {
        if (i < 14) {
            return {free: -1, filled: -1};
        }
        return this.findFreeSquareInLimit(i, 0, 224, -15, currentLettersPlay, squares);
    }

    findNextVerticalFree(i, currentLettersPlay, squares) {
        if (i > 209) {
            return {free: -1, filled: -1};
        }
        return this.findFreeSquareInLimit(i, 0, 224, 15, currentLettersPlay, squares);
    }

    findFreeSquareInLimit(i, limitDown, limitUp, increment, currentLettersPlay, squares) {
        let oldPosition = i;
        let position = i + increment;
        while (position > limitDown && position < limitUp && (squares[position] || this.getCurrentLettersPlay(position, currentLettersPlay))) {
            oldPosition = position;
            position = position + increment;
        }
        if (position > limitDown && position < limitUp) {
            return {free: position, filled: oldPosition};
        } else {
            return {free: -1, filled: -1};
        }
    }

    getCurrentLettersPlay(i, lettersPlay) {
        if (lettersPlay.firstPosition !== null) {
            if (i >= lettersPlay.firstPosition && i <= lettersPlay.lastPosition) {
                for (let li = 0; li < lettersPlay.letters.length; li++) {
                    if (lettersPlay.letters[li].position === i) {
                        return lettersPlay.letters[li].letter;
                    }
                }
            }
        }

        return undefined;
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
        this.updateNextPossiblePositions(step, CURRENT_LETTERS_PLAY_INIT, this.state.history[step].squares)
    }

    moveDeskLetter(id, atIndex, deskLetters) {
        const { letter, index } = this.findDeskLetter(id, deskLetters);
        let replacedLetter = deskLetters.splice(atIndex, 1, letter);
        deskLetters.splice(index, 1, replacedLetter[0]);

        this.setState({
            deskLetters: deskLetters
        });
    }

    findDeskLetter(id, deskLetters) {
        const letter = deskLetters.filter((l) => l.id === id)[0];

        return {
            letter,
            index: deskLetters.indexOf(letter),
        }
    }

    render() {
        const allhistory = this.state.history.slice(0, this.state.history.length);
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[this.state.stepNumber];
        const types = this.state.types;
        const currentLettersPlay = this.state.currentLettersPlay;
        const deskLetters = this.state.deskLetters.slice();

        if (!this.state.movesInChronoOrder) {
            history.reverse();
        }

        const moves = allhistory.map((step, move) => {
            let button;
            let word;

            if (step.index && step.lettersPlay) {
                word = step.lettersPlay.letters.map((value) => {
                    return value.letter.content;
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

        const players = this.state.players.map((player) => {
            let total = 0;
            let scores = [];
            history.forEach((turn) => { if (turn.playerId === player.id) {
                total = total + turn.score;
                scores = scores.concat(turn.score);
            }});
            return (
                <div className="player-score" key={player.id}>
                    <div>{player.name} : {total}</div>
                    <div className="score">
                    {
                        scores.map((score) => {
                            return (
                                <div>{score}</div>
                            )
                        })
                    }
                    </div>
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
                            canDropLetter={(i, item) => this.canDropLetter(i, item)}
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
                        <Desk deskLetters={deskLetters} moveDeskLetter={(id, atIndex, deskLetters) => this.moveDeskLetter(id, atIndex, deskLetters)} findDeskLetter={(id, deskLetters) => this.findDeskLetter(id, deskLetters)} lettersPlayed={this.state.currentLettersPlay} validate={() => this.validate()} cancel={() => this.cancel()}/>
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
