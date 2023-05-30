import React from "react";
import { useDrop } from "react-dnd";

const Row = ({ className = '', children, pdfIndex }: any, props: any) => {
    const [{ isOver, isNotOverPlaceholderThumbnail, canDrop }, drop] = useDrop({
        accept: "pdfThumbnail",
        drop: (item: any) => {
            // do nothing if we are dropping the thumbnail in the same row
            if (item.pdfIndex === pdfIndex) return;
            // if we are dropping in a new row (not in a thumbnail placeholder)
            if (isNotOverPlaceholderThumbnail) return {
                pdfIndex,
                type: 'row'
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            isNotOverPlaceholderThumbnail: monitor.isOver({ shallow: true }),
            canDrop: monitor.canDrop(),
        }),
    });

    return <div
        ref={drop}
        id={`row-${pdfIndex}`}
        data-pdf-index={pdfIndex}
        className={`
            rounded-lg w-full
            ${isOver && canDrop && isNotOverPlaceholderThumbnail ? 'bg-amber-300 shadow-4xl' : 'bg-body-bg-dark'}
            border border-text-lighter
            flex flex-col space-y divide-text-light
            ${className}
        `}
    >
        {children}
    </div>
}
//export default React.memo(Row);
export default Row;