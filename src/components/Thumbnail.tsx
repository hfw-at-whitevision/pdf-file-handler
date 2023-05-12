import { Viewer, ViewMode } from "@react-pdf-viewer/core";

import { pageThumbnailPlugin } from "@/components/pageThumbnailPlugin";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

import { useRef, useEffect } from "react";
import { useDrop, useDrag } from "react-dnd";
import React from "react";
import { useAtom } from "jotai";
import { pdfsAtom } from '@/components/atoms'

const Thumbnail = (
    {
        pdfIndex,
        pageIndex,
        setCurrent,
        actionButtons,
        current,
        handleMovePage,
        index,
        setUserIsDragging,
        stateChanged,
    }: {
        pdfIndex: number,
        pageIndex: number,
        setCurrent: any,
        actionButtons: any,
        current: { pdfIndex?: number, pageIndex?: number, type?: string },
        handleMovePage: any,
        index: number,
        setUserIsDragging: any,
        stateChanged: number,
    }) => {
    const ref: any = useRef(null);
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

    // react-pdf-viewer thumbnail component
    const thumbnailPluginInstance = thumbnailPlugin();
    const { Cover } = thumbnailPluginInstance;
    const pageThumbnailPluginInstance = pageThumbnailPlugin({
        PageThumbnail: <Cover getPageIndex={() => pageIndex} width={150} />,
    });

    const [pdfs, setPdfs]: [any, any] = useAtom(pdfsAtom);
    const fileUrl = pdfs[pdfIndex];

    return <>
        <div
            key={`thumbnail-${pdfIndex}-${pageIndex}`}
            id={`thumbnail-${pdfIndex}-${pageIndex}`}
            ref={ref}
            className={
                `relative group flex items-center justify-center rounded-md overflow-hidden
                box-border border-4 w-full h-[160px]
          before:absolute before:inset-0 before:bg-black before:opacity-50 hover:before:bg-transparent
          ${(pageIndex === current?.pageIndex && pdfIndex === current?.pdfIndex)
                    ? "border-amber-300 before:z-10"
                    : "before:z-[-1] border-transparent"}
          opacity-${isDragging ? '10' : '100'}`
            }
            onClick={() => setCurrent({
                pdfIndex: pdfIndex,
                pageIndex: pageIndex,
                skipScrollIntoView: true,
            })}
        >
            <div
                className={
                    `w-[150px] max-h-[150px] h-fit cursor-pointer relative rounded-md overflow-hidden
                pdf-${pdfIndex}-${pageIndex} object-contain pdf-thumbnail flex items-center justify-center`
                }
            >
                <Viewer
                    fileUrl={fileUrl}
                    viewMode={ViewMode.SinglePage}
                    plugins={[pageThumbnailPluginInstance, thumbnailPluginInstance]}
                />
            </div>

            <div
                className="absolute inset-0 z-10 flex justify-center items-end gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto cursor-move bg-black/75">
                <div className="grid grid-cols-2 gap-1 pb-4">
                    {actionButtons}
                </div>
            </div>
        </div>
    </>
}
function skipRerender(prevProps, nextProps) {
    if (
        // if this thumbnail becomes selected thumbnail
        prevProps.current.pageIndex !== nextProps.current.pageIndex
        && prevProps.pageIndex === nextProps.current.pageIndex
        ||
        // if this thumbnail was selected thumbnail, but now is not
        prevProps.current.pageIndex === prevProps.pageIndex
        && prevProps.pageIndex !== nextProps.current.pageIndex
        ||
        // if PDF has changed
        prevProps.stateChanged !== nextProps.stateChanged
    ) return false
    else return true
}
export default React.memo(Thumbnail, skipRerender);

type dropResultType = {
    pdfIndex?: number,
    pageIndex?: number,
    type?: string
} | null;