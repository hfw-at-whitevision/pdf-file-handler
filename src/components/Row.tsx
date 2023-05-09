import { VariableSizeGrid } from "react-window";
import { useDrop } from "react-dnd";
import { useEffect, useRef, useState } from "react";

export default function Row({ children, row, rows }) {
    const gridRef = useRef(null);
    const [height, setHeight] = useState(0);

    const [{ isOver, isNotOverPlaceholderThumbnail, canDrop }, drop] = useDrop({
        accept: "pdfThumbnail",
        drop: () => {
            if (isNotOverPlaceholderThumbnail) return { row, type: 'row' }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            isNotOverPlaceholderThumbnail: monitor.isOver({ shallow: true }),
            canDrop: monitor.canDrop(),
        }),
    });

    useEffect(() => {
        setHeight(600);
    }, [])

    return <>
        <div
            ref={drop}
            className={`
            p-4 rounded-lg w-[660px] mb-4
            ${isOver && canDrop && isNotOverPlaceholderThumbnail ? 'bg-amber-300 shadow-4xl' : 'bg-white/20 shadow-2xl'}
            `}
        >
            height: | row: {row}
            {children}
        </div>
    </>
}