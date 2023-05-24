import { useRef, useEffect } from "react";
import { useDrop, useDrag } from "react-dnd";
import { Page } from "react-pdf";
import React from "react";
import { useAtom } from "jotai";
import { isRotatingAtom, setCurrentAtom, userIsDraggingAtom } from "./store/atoms";
import { BsTrash } from "react-icons/bs";
import { GrRotateRight } from "react-icons/gr";
import Button from "./primitives/Button";
import Loading from "./layout/Loading";

const Thumbnail = (
    {
        pdfIndex,
        pageIndex,
        rotation,
        handleDeletePage,
        handleRotatePage,
        handleMovePage,
        index,
    }: any
) => {
    const [, setCurrent] = useAtom(setCurrentAtom);
    const [, setUserIsDragging] = useAtom(userIsDraggingAtom);
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
        item: { index, pdfIndex, pageIndex, type: "pdfThumbnail" },
        end: async (item, monitor) => {
            const dropResult: dropResultType = monitor.getDropResult();
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
            } else if (
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
                `relative group flex items-center justify-center rounded-lg overflow-hidden
                box-border border-4 pdf-thumbnail-container
                before:absolute before:inset-0 before:bg-black before:opacity-50 hover:before:bg-transparent
                before:z-[-1] border-stone-200/40
                opacity-${isDragging ? '10' : '100'}`
            }
            onClick={() => setCurrent({
                pdfIndex: pdfIndex,
                pageIndex: pageIndex,
                skipScrollIntoView: true,
            })}
            data-pdf-index={pdfIndex}
            data-page-index={pageIndex}
        >
            <Page
                className={
                    `w-full cursor-pointer relative rounded-md overflow-hidden
              pdf-${pdfIndex}-${pageIndex} object-contain pdf-thumbnail flex items-center justify-center`
                }
                pageIndex={pageIndex}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                renderMode="canvas"
                width={100}
                loading={<Loading />}
                canvasBackground='white'
                rotate={rotation}
            />
            <div
                id={`thumbnail-${pdfIndex}-${pageIndex}-inset`}
                data-pdf-index={pdfIndex}
                data-page-index={pageIndex}
                className="absolute inset-0 z-10 flex justify-center items-end gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto cursor-move bg-black/20"
            >
                <div className="grid grid-cols-2 gap-1 pb-2" id={`thumbnail-${pdfIndex}-${pageIndex}-buttons`}>
                    <Button
                        title={<><GrRotateRight /></>}
                        onClick={() => handleRotatePage({ pdfIndex, pageIndex: index })}
                        disabled={isRotating}
                        transparent={false}
                        id={`thumbnail-${pdfIndex}-${pageIndex}-rotate`}
                    />
                    <Button
                        title={<><BsTrash /></>}
                        onClick={() => handleDeletePage(pdfIndex, index)}
                        transparent={false}
                        id={`thumbnail-${pdfIndex}-${pageIndex}-delete`}
                    />
                </div>
            </div>
        </div>
    </>
}
function skipRerender(prevProps: any, nextProps: any) {
    if (
        prevProps.rotation === nextProps.rotation
        &&
        prevProps.index === nextProps.pageIndex
    ) return true;
    else return false;
}
//export default React.memo(Thumbnail, skipRerender);
export default Thumbnail;

export type dropResultType = {
    pdfIndex?: number,
    pageIndex?: number,
    type?: string
} | null;