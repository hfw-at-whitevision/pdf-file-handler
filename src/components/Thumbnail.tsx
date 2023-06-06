import { useRef, useEffect } from "react";
import { useDrop, useDrag } from "react-dnd";
import { Page } from "react-pdf";
import React from "react";
import { useAtom, useSetAtom } from "jotai";
import { currentAtom, isRotatingAtom, thumbnailsWidthAtom, isDraggingInternallyAtom } from "./store/atoms";
import { BsTrash } from "react-icons/bs";
import { GrRotateRight } from "react-icons/gr";
import Button from "./primitives/Button";
import Loading from "./layout/Loading";

const Thumbnail = (
    {
        pdfIndex,
        pageIndex,
        rowIndex,
        rotation,
        handleDeletePage,
        handleRotatePage,
        handleMovePage,
        index,
        width
    }: any
) => {
    const setCurrent: any = useSetAtom(currentAtom);
    const setIsDraggingInternally: any = useSetAtom(isDraggingInternallyAtom);
    const [isRotating] = useAtom(isRotatingAtom);
    const [collected, drop] = useDrop({
        accept: "pdfThumbnail",
        hover(item: any, monitor) {
            if (!ref.current) return;

            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) {
                return;
            }
            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleX =
                (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
            const clientOffset: any = monitor.getClientOffset();
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
    const ref: any = useRef(null);

    const [{ isDragging }, drag]: any = useDrag({
        type: "pdfThumbnail",
        item: { index, pdfIndex, pageIndex, rowIndex, type: "pdfThumbnail" },
        end: async (item, monitor) => {
            const dropResult: dropResultType = monitor.getDropResult();
            const toPdfIndex = dropResult?.pdfIndex;
            const toPageIndex = dropResult?.pageIndex;
            const type = dropResult?.type;

            // dropping in a placeholder thumbnail
            if (dropResult && type === "placeholderThumbnail") {
                await handleMovePage({
                    fromPdfIndex: pdfIndex,
                    fromPageIndex: pageIndex,
                    fromRowIndex: rowIndex,
                    toPdfIndex,
                    toPageIndex,
                    toRowIndex: dropResult?.rowIndex,
                    toPlaceholderThumbnail: true,
                })
            }
            // dropping in an existing row
            else if (
                dropResult && pdfIndex !== toPdfIndex && type !== 'scrollDropTarget' && type !== 'placeholderRow'
            ) {
                await handleMovePage({
                    fromPdfIndex: pdfIndex,
                    fromPageIndex: pageIndex,
                    fromRowIndex: rowIndex,
                    toPdfIndex: toPdfIndex,
                    toRowIndex: 'last',
                })
            }
            // dropping in a placeholder row (new row)
            else if (
                dropResult && pdfIndex !== toPdfIndex && type !== "scrollDropTarget"
                || dropResult && pdfIndex === toPdfIndex && type === "placeholderRow"
            ) {
                await handleMovePage({
                    fromPdfIndex: pdfIndex,
                    fromPageIndex: pageIndex,
                    fromRowIndex: rowIndex,
                    toPdfIndex: toPdfIndex,
                    toRowIndex: 0,
                    toPlaceholderRow: type === "placeholderRow",
                })
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    useEffect(() => {
        setIsDraggingInternally(isDragging)
        console.log(`isDragging internally: ${isDragging}`)
    }, [isDragging]);

    const [thumbnailsWidth]: any = useAtom(thumbnailsWidthAtom);

    drag(drop(ref));

    return <>
        <div
            id={`thumbnail-${pdfIndex}-${pageIndex}`}
            ref={ref}
            className={
                `relative group flex items-center justify-center rounded-lg overflow-hidden
                box-border border-4 pdf-thumbnail-container
                before:absolute before:inset-0 before:bg-black before:opacity-50 hover:before:bg-transparent
                before:z-[-1] border-transparent shadow-md
                opacity-${isDragging ? '10' : '100'}`
            }
            data-pdf-index={pdfIndex}
            data-page-index={pageIndex}
            data-index={index}
        >
            {/* thumbnail */}
            <Page
                className={
                    `w-full cursor-pointer relative rounded-md overflow-hidden
                    pdf-${pdfIndex}-${pageIndex} object-contain pdf-thumbnail flex items-center justify-center`
                }
                pageIndex={pageIndex}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                renderMode="canvas"
                width={width}
                loading={<Loading loading={true} />}
                canvasBackground='white'
                rotate={rotation}
            />
            {/* inset */}
            <div
                id={`thumbnail-${pdfIndex}-${pageIndex}-inset`}
                data-pdf-index={pdfIndex}
                data-page-index={pageIndex}
                className={
                    `absolute inset-0 z-10 flex justify-center items-end gap-1 opacity-0 pointer-events-none
                    group-hover:opacity-100 group-hover:pointer-events-auto
                    cursor-move bg-black/25 duration-700`
                }
                onClick={() => setCurrent({
                    pdfIndex: pdfIndex,
                    pageIndex: pageIndex,
                    skipScrollIntoView: true,
                })}
            />
            {/* buttons */}
            <div
                className={
                    `absolute translate-y-full opacity-0 z-10 bottom-2 grid gap-1
                    group-hover:translate-y-0 group-hover:opacity-100
                    ${thumbnailsWidth > 100 ? 'grid-cols-2' : ''}`
                }
                id={`thumbnail-${pdfIndex}-${pageIndex}-buttons`}
            >
                <Button
                    title={<><GrRotateRight /></>}
                    onClick={() => handleRotatePage({ pdfIndex, index, pageIndex, skipScrollIntoView: true })}
                    disabled={isRotating}
                    transparent={false}
                    id={`thumbnail-${pdfIndex}-${pageIndex}-rotate`}
                />
                <Button
                    title={<><BsTrash /></>}
                    onClick={() => handleDeletePage({ pdfIndex, index, pageIndex, skipScrollIntoView: true })}
                    transparent={false}
                    id={`thumbnail-${pdfIndex}-${pageIndex}-delete`}
                />
            </div>
        </div>
    </>
}
function skipRerender(prevProps: any, nextProps: any) {
    if (
        prevProps.rotation === nextProps.rotation
        &&
        prevProps.pageIndex === nextProps.pageIndex
        &&
        prevProps.width === nextProps.width
    ) return true;
    else return false;
}
//export default React.memo(Thumbnail, skipRerender);
export default Thumbnail;

export type dropResultType = {
    pdfIndex?: number,
    pageIndex?: number,
    rowIndex?: number,
    type?: string
} | null;