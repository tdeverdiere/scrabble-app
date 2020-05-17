import {useDrop} from "react-dnd";
import {ItemTypes, Letter} from "./letter";
import React from "react";

export function Desk({deskLetters, lettersPlayed, validate, cancel, moveDeskLetter, findDeskLetter}) {
    const [, drop] = useDrop({ accept: ItemTypes.LETTER })

    let letters = deskLetters.map((value, index) => {
        return (
            <Letter key={value.id} id={value.id} content={value.letter.content} point={value.letter.point}
                    moveable={true} moveLetter={(id, atIndex) => moveDeskLetter(id, atIndex, deskLetters)} findLetter={(id) => findDeskLetter(id, deskLetters)} isNewLetter={false}/>
        );
    });

    let buttonValidate;
    let buttonReset;
    if (lettersPlayed.firstPosition) {
        let word = '';
        lettersPlayed.letters.forEach((value) => {
            word = word + value.letter.content
        });
        buttonValidate = (<div ><button onClick={() => validate()}>Validate {word}</button></div>);
        buttonReset = (<div ><button onClick={() => cancel()}>Reset</button></div>);
    }
    return (
        <div ref={drop} className="letters-pick">
            <div className="desk">
                <div className="desk-inner">
                    {letters}
                </div>
            </div>
            {buttonValidate}
            {buttonReset}
        </div>
    )
}
