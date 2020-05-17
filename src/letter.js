import {useDrag, useDrop} from "react-dnd";
import React from "react";

export const ItemTypes = {
    LETTER: 'letter',
}

export function Letter(props) {
    const [{ isDragging }, drag] = useDrag({
        item: { type: ItemTypes.LETTER, id: props.id, content: props.content, point: props.point },
        canDrag: props.moveable,
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
        end: (dropResult, monitor) => {
            const { id: droppedId, originalIndex } = monitor.getItem()
            const didDrop = monitor.didDrop()
            if (!didDrop && droppedId) {
                props.moveLetter(droppedId, originalIndex)
            }
        },
    });

    const [, drop] = useDrop({
        accept: ItemTypes.LETTER,
        canDrop: () => false,
        hover({ id: draggedId }) {
            if (props.id && draggedId !== props.id) {
                const { index: overIndex } = props.findLetter(props.id)
                props.moveLetter(draggedId, overIndex)
            }
        },
    })


    return (
        <div ref={(node) => drag(drop(node))} className="square">
            <div className={(props.isNewLetter ? "square-letter-new " : "") + "square-letter"} style={{opacity: isDragging ? 0.5 : 1}}>
                <div className="letter">{props.content}</div>
                <div className="point">{props.point}</div>
            </div>
        </div>
    );
}
