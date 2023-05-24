import React from "react";
import { useDrop } from "react-dnd";

const Row = (props: any) => {
    const [{ isOver, isNotOverPlaceholderThumbnail, canDrop }, drop] = useDrop({
        accept: "pdfThumbnail",
        drop: () => {
            if (isNotOverPlaceholderThumbnail) return { pdfIndex: props?.pdfIndex, type: 'row' }
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
      rounded-lg w-full
      ${isOver && canDrop && isNotOverPlaceholderThumbnail ? 'bg-amber-300 shadow-4xl' : 'bg-stone-100'}
      border border-stone-200
      flex flex-col space-y divide-stone-300
      `}
        {...props}
    >
        {props?.children}
    </div>
}
export default React.memo(Row);