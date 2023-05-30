import { useAtom } from "jotai";
import React from "react";
import { useDrop } from "react-dnd";
import { userIsDraggingAtom } from "../store/atoms";

const PlaceholderThumbnail = ({ pdfIndex, pageIndex, rowIndex, margin }: any) => {
    const [userIsDragging] = useAtom(userIsDraggingAtom);

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: "pdfThumbnail",
        drop: () => {
            console.log(`toRowIndex: ${rowIndex}. toPageIndex: ${pageIndex}. toPdfIndex: ${pdfIndex}`)
            return {
                pdfIndex,
                pageIndex: Math.ceil(pageIndex),
                rowIndex: Math.ceil(rowIndex),
                type: 'placeholderThumbnail'
            }
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
                `h-auto relative rounded-lg bg-lime-200 from-lime-50/0 via-lime-200 to lime-50/0 group
                before:content-[''] before:absolute before:w-[60px] before:h-full before:z-20 before:bg-blue-3000 before:translate-x-[-100%]
                ${isOver ? 'w-[10px]' : 'w-[0]'}
                after:content-[''] after:absolute after:left-[100%] after:w-[60px] after:h-full after:z-20 after:bg-red-3000 after:translate-x-[0]
                ${isOver ? margin : null}
                ${userIsDragging ? 'pointer-events-auto' : 'pointer-events-none'}
            `}
        />
    </>
}
export default PlaceholderThumbnail;