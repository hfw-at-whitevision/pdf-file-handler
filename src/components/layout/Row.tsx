import React from "react";
import { useDrop } from "react-dnd";

const Row = ({ children, pdfIndex }: any, props: any) => {
    const [{ isOver, isNotOverPlaceholderThumbnail, canDrop }, drop] = useDrop({
        accept: "pdfThumbnail",
        drop: () => {
            if (isNotOverPlaceholderThumbnail) return { pdfIndex: pdfIndex, type: 'row' }
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
      p-4 rounded-lg w-full mb-8
      ${isOver && canDrop && isNotOverPlaceholderThumbnail ? 'bg-amber-300 shadow-4xl' : 'bg-gray-100'}
      border border-gray-200
      `}
        {...props}
    >
        {children}
    </div>
}
export default React.memo(Row);