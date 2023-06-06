import { useAtom } from "jotai";
import { useDrop } from "react-dnd";
import { BsPlus } from "react-icons/bs";
import { isDraggingInternallyAtom, isLoadingAtom } from "../store/atoms";

export default function PlaceholderRow({ pdfIndex = 0 }) {
    const [{ canDrop, isOver }, drop] = useDrop({
        accept: "pdfThumbnail",
        drop: () => ({ pdfIndex: Math.ceil(pdfIndex), type: 'placeholderRow' }),
        collect: (monitor) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
    });

    const [isDragging] = useAtom(isDraggingInternallyAtom);
    const [isLoading] = useAtom(isLoadingAtom);

    return <div
        ref={drop}
        className={`
        rounded-lg w-full items-center justify-center
        border-dashed border-lime-200 border bg-lime-100/90
        ${isDragging && canDrop // && totalPages[pdfIndex] > 1
                ? 'h-auto p-1 opacity-100 flex'
                : 'h-0 p-0 opacity-0 border-0 hidden'}
        ${isOver && canDrop// && totalPages[pdfIndex] > 1
                ? 'p-8 bg-lime-100/90 border-transparent'
                : ''}
        ${isLoading ? 'hidden' : ''}
      `}
    >
        <BsPlus className={`text-lime-200 ${!isDragging ? 'hidden' : ''} ${isOver ? '!text-black text-4xl' : 'text-xs'}`} />
    </div>
}