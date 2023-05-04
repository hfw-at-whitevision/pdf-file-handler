import { useRef, useEffect } from "react";
import { useDrop, useDrag } from "react-dnd";
import { Page } from "react-pdf";
import Loading from "./Loading";

export default function Thumbnail({ pdfIndex, pageIndex, onClick, actionButtons, current, handleMovePage, index, setUserIsDragging }) {
    const ref = useRef(null);
    const [collected, drop] = useDrop({
        accept: "pdfThumbnail",
        hover(item, monitor) {
            if (!ref.current) return;

            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) {
                return;
            }
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleX =
                (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientX = clientOffset.x - hoverBoundingRect.left;

            if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
                return;
            }
            if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
                return;
            }
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag]: any = useDrag({
        type: "pdfThumbnail",
        item: { index, pdfIndex, pageIndex, type: "pdfThumbnail" },
        end: async (item, monitor) => {
            const dropResult = monitor.getDropResult();
            const toPdfIndex = dropResult?.pdfIndex;
            const toPageIndex = dropResult?.pageIndex;
            const type = dropResult?.type;

            if (dropResult && type === "placeholderThumbnail") {
                await handleMovePage({
                    fromPdfIndex: pdfIndex,
                    fromPageIndex: pageIndex,
                    toPdfIndex: toPdfIndex,
                    toPageIndex: toPageIndex,
                    toPlaceholderThumbnail: true,
                })
            }
            else if (
                dropResult && pdfIndex !== toPdfIndex && type !== "scrollDropTarget"
                || dropResult && pdfIndex === toPdfIndex && type === "placeholderRow"
            ) {
                // move the page to other PDF
                await handleMovePage({
                    fromPdfIndex: pdfIndex,
                    fromPageIndex: pageIndex,
                    toPdfIndex: toPdfIndex,
                    toPlaceholderRow: type === "placeholderRow" ? true : false,
                })
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    useEffect(() => {
        setUserIsDragging(isDragging)
    }, [isDragging])

    drag(drop(ref));

    return <>
        <div
            key={`thumbnail-${pdfIndex}-${pageIndex}`}
            id={`thumbnail-${pdfIndex}-${pageIndex}`}
            ref={ref}
            className={
                `relative group flex items-center justify-center rounded-md overflow-hidden
                box-border border-4
          before:absolute before:inset-0 before:bg-black before:opacity-50 hover:before:bg-transparent
          ${(pageIndex === current?.pageIndex && pdfIndex === current?.pdfIndex)
                    ? "border-amber-300 before:z-10"
                    : "before:z-[-1] border-transparent"}
          opacity-${isDragging ? '10' : '100'}`
            }
            {...onClick && { onClick }}
        >
            <Page
                loading={<Loading />}
                className={
                    `w-[150px] max-h-[150px] h-fit cursor-pointer relative rounded-md overflow-hidden
              pdf-${pdfIndex}-${pageIndex} object-contain pdf-thumbnail flex items-center justify-center`
                }
                pageIndex={pageIndex}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                renderMode="canvas"
                width={150}
                height={150}
            />
            <div className="absolute inset-0 z-10 flex justify-center items-end gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto cursor-move bg-black/75">
                <div className="grid grid-cols-2 gap-1 pb-4">
                    {actionButtons}
                </div>
            </div>
        </div>
    </>
}