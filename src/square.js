import {useDrop} from "react-dnd";
import {ItemTypes} from "./letter";
import React from "react";

export function Square(props) {
    let className;
    let content;

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.LETTER,
        drop: (item) => props.dropLetter(item),
        canDrop: (item) => props.canDropLetter(item),
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
        <div ref={drop} className={className + (isOver ? ' square-drop':'') + (canDrop && !isOver ? ' square-candrop' : ' ')} >
            <div className="square-empty-content">{content}</div>
        </div>
    );

}