import { useDrop } from "react-dnd";

export default function PlaceholderThumbnail({ pdfIndex, pageIndex, isDragging, isLoading, totalPages, margin }) {
    // hide placeholders if only 1 page in PDF
    //if (totalPages[pdfIndex] === 1) return null;

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: "pdfThumbnail",
        drop: () => {
            console.log(`toPageIndex: ${pageIndex}. toPdfIndex: ${pdfIndex}`)
            return { pdfIndex, pageIndex: Math.ceil(pageIndex), type: 'placeholderThumbnail' }
        },
        collect: (monitor) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
    });

    return <>
        <div
            ref={drop}
            className={
                `h-auto relative rounded-lg bg-gradient-to-b from-lime-50/0 via-lime-200 to lime-50/0 group
          before:content-[''] before:absolute before:w-[60px] before:h-full before:z-20 before:bg-blue-3000 before:translate-x-[-100%]
          ${isOver ? 'w-[10px]' : 'w-[0]'}
          after:content-[''] after:absolute after:left-[100%] after:w-[60px] after:h-full after:z-20 after:bg-red-3000 after:translate-x-[0]
          ${isOver ? margin : null}
          ${isDragging ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
        />
    </>
}
