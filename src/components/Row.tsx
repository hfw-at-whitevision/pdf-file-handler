import { useDrop } from "react-dnd";

export default function Row({ children, row }) {
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

    return <div
        ref={drop}
        className={`
            p-4 rounded-lg w-[660px] mb-4
            ${isOver && canDrop && isNotOverPlaceholderThumbnail ? 'bg-amber-300 shadow-4xl' : 'bg-white/20 shadow-2xl'}
        `}
    >
        row: {row}
        {children}
    </div>
}