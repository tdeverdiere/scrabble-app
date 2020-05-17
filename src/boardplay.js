
export class BoardPlay {

    constructor(positionStart, types, currentLettersPlay, squares) {
        this._positionStart = positionStart;
        this._types = types;
        this._currentLettersPlay = currentLettersPlay;
        this._squares = squares;
    }

    get currentLettersPlay() {
        return this._currentLettersPlay;
    }

    set currentLettersPlay(value) {
        this._currentLettersPlay = value;
    }

    get squares() {
        return this._squares;
    }

    set squares(value) {
        this._squares = value;
    }

    getLineBounds(i) {
        let restOfLineStart = i % 15;
        let endOfPreviousLine = i - restOfLineStart - 1;

        let restOfLineEnd = 14 - i % 15;
        let beginOfNextLine = i + restOfLineEnd + 1;

        return {begin: endOfPreviousLine, end: beginOfNextLine};
    }

    findPreviousHorizontalFree(i) {
        let bounds = this.getLineBounds(i);
        if (i === bounds.begin + 1) {
            return {free: -1, filled: -1};
        }
        return this.findFreeSquareInLimit(i, bounds.begin, bounds.end, -1);
    }

    findNextHorizontalFree(i) {
        let bounds = this.getLineBounds(i);
        if (i === bounds.end - 1) {
            return {free: -1, filled: -1};
        }
        return this.findFreeSquareInLimit(i, bounds.begin, bounds.end, 1);
    }

    findPreviousVerticalFree(i) {
        if (i < 14) {
            return {free: -1, filled: -1};
        }
        return this.findFreeSquareInLimit(i, 0, 224, -15);
    }

    findNextVerticalFree(i) {
        if (i > 209) {
            return {free: -1, filled: -1};
        }
        return this.findFreeSquareInLimit(i, 0, 224, 15);
    }

    findFreeSquareInLimit(i, limitDown, limitUp, increment) {
        let oldPosition = i;
        let position = i + increment;
        while (position > limitDown && position < limitUp && (this._squares[position] || this.getCurrentLettersPlay(position))) {
            oldPosition = position;
            position = position + increment;
        }
        if (position > limitDown && position < limitUp) {
            return {free: position, filled: oldPosition};
        } else {
            return {free: -1, filled: -1};
        }
    }

    getCurrentLettersPlay(i) {
        if (this._currentLettersPlay.firstPosition !== null) {
            if (i >= this._currentLettersPlay.firstPosition && i <= this._currentLettersPlay.lastPosition) {
                for (let li = 0; li < this._currentLettersPlay.letters.length; li++) {
                    if (this._currentLettersPlay.letters[li].position === i) {
                        return this._currentLettersPlay.letters[li].letter;
                    }
                }
            }
        }

        return undefined;
    }

    findWordPositions(i, direction) {
        let wordPosition;
        if (direction === 'H') {
            wordPosition = {
                begin: this.findPreviousHorizontalFree(i, this._currentLettersPlay, this._squares).filled,
                end: this.findNextHorizontalFree(i, this._currentLettersPlay, this._squares).filled,
                increment: 1
            }
        } else {
            wordPosition = {
                begin: this.findPreviousVerticalFree(i, this._currentLettersPlay, this._squares).filled,
                end: this.findNextVerticalFree(i, this._currentLettersPlay, this._squares).filled,
                increment: 15
            }
        }
        if (wordPosition.end === wordPosition.begin) {
            return undefined;
        } else {
            return wordPosition;
        }
    }

    getPlayedWordsPosition() {
        let wordsPosition = [];
        if (this._currentLettersPlay.direction) {
            let otherDirection;
            if (this._currentLettersPlay.direction === 'H') {
                otherDirection = 'V';
            } else {
                otherDirection = 'H';
            }
            wordsPosition = wordsPosition.concat(this.findWordPositions(this._currentLettersPlay.firstPosition, this._currentLettersPlay.direction));
            this._currentLettersPlay.letters.forEach((value) => {
                wordsPosition = wordsPosition.concat(this.findWordPositions(value.position, otherDirection));
            });
        } else {
            wordsPosition = wordsPosition.concat(this.findWordPositions(this._currentLettersPlay.firstPosition, 'H'));
            wordsPosition = wordsPosition.concat(this.findWordPositions(this._currentLettersPlay.firstPosition, 'V'));
        }

        wordsPosition = wordsPosition.filter(wordPosition => !!wordPosition);
        return wordsPosition;
    }

    calculateNextPossiblePositions(turnIndex) {
        let possiblePositions = new Set();

        // Si c'est le premier coup
        if (turnIndex === 0) {
            if (this._currentLettersPlay.firstPosition == null) {
                possiblePositions.add(this._positionStart);
                return possiblePositions;
            }
        }

        // Si aucune lettre n'a encore été posée
        if (this._currentLettersPlay.firstPosition == null) {
            for (let index = 0; index < this._squares.length; index++) {
                if (this._squares[index]) {
                    possiblePositions.add(this.findPreviousHorizontalFree(index).free);
                    possiblePositions.add(this.findNextHorizontalFree(index).free);
                    possiblePositions.add(this.findPreviousVerticalFree(index).free);
                    possiblePositions.add(this.findNextVerticalFree(index).free);
                }
            }
            return possiblePositions;
        }

        // Si seulement 1 lettre a été posée, la direction n'est pas précisé
        if (this._currentLettersPlay.direction == null) {
            let currentPosition = this._currentLettersPlay.firstPosition;
            possiblePositions.add(this.findPreviousHorizontalFree(currentPosition).free);
            possiblePositions.add(this.findNextHorizontalFree(currentPosition).free);
            possiblePositions.add(this.findPreviousVerticalFree(currentPosition).free);
            possiblePositions.add(this.findNextVerticalFree(currentPosition).free);
        } else {
            if (this._currentLettersPlay.direction === 'V') {
                possiblePositions.add(this.findPreviousVerticalFree(this._currentLettersPlay.firstPosition).free);
                possiblePositions.add(this.findNextVerticalFree(this._currentLettersPlay.lastPosition).free);
            } else {
                possiblePositions.add(this.findPreviousHorizontalFree(this._currentLettersPlay.firstPosition).free);
                possiblePositions.add(this.findNextHorizontalFree(this._currentLettersPlay.lastPosition).free);
            }
        }

        return possiblePositions;
    }


    calculateScore() {
        let wordsPosition = this.getPlayedWordsPosition();

        let score = wordsPosition.reduce((scoreSum, wordPosition) => {
            if (!wordPosition) {
                return scoreSum;
            }
            let wordMulti = 1;
            let wordScore = 0;
            for (let position = wordPosition.begin; position <= wordPosition.end; position = position + wordPosition.increment) {
                if (this._squares[position]) {
                    wordScore = wordScore + this._squares[position].point;
                } else {
                    let letter = this.getCurrentLettersPlay(position);
                    if (this._types[position] === 'mct') {
                        wordMulti = wordMulti * 3;
                    } else if (this._types[position] === 'mcd' || this._types[position] === 'start') {
                        wordMulti = wordMulti * 2;
                    }
                    if (this._types[position] === 'lct') {
                        wordScore = wordScore + letter.point * 3;
                    } else if (this._types[position] === 'lcd') {
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
    
    updateCurrentLettersPlay(i, letter) {
        let currentLettersPlay = {
            firstPosition: this._currentLettersPlay.firstPosition,
            lastPosition: this._currentLettersPlay.lastPosition,
            direction: this._currentLettersPlay.direction,
            letters: this._currentLettersPlay.letters.slice()
        }

        if (this._currentLettersPlay.firstPosition == null) {
            currentLettersPlay.firstPosition = i;
            currentLettersPlay.lastPosition = i;
            currentLettersPlay.direction = null;
        } else {
            if (i < this._currentLettersPlay.firstPosition) {
                currentLettersPlay.firstPosition = i;
            } else if (i > this._currentLettersPlay.lastPosition) {
                currentLettersPlay.lastPosition = i;
            }
            if (this._currentLettersPlay.letters.length === 1) {
                if (Math.abs(this._currentLettersPlay.firstPosition - i) >= 15) {
                    currentLettersPlay.direction = 'V'; // Vertical
                } else {
                    currentLettersPlay.direction = 'H'; // Horizontal
                }
            }
        }

        currentLettersPlay.letters = currentLettersPlay.letters.concat({position: i, letter: {content: letter.content, point: letter.point}});
        this._currentLettersPlay = currentLettersPlay;
    }

    updateSquares() {
        this._currentLettersPlay.letters.forEach((value) => {
            this._squares[value.position] = {content: value.letter.content, point: value.letter.point};
        });
    }
}
