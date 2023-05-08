import { useRef, useEffect, useState } from "react";
import { useDrop, useDrag } from "react-dnd";
import Loading from "./Loading";
import { Document, Page } from "react-pdf";
import { BsTrash } from "react-icons/bs";
import { GrRotateRight } from "react-icons/gr";
import { BigButton } from "./BigButton";

export default function Thumbnail({ src, rows, setRows, pdfIndex, pageIndex, row, rowIndice, onClick, actionButtons, current, handleMovePage, index, setUserIsDragging, rotation: defaultRotation }) {
    const ref = useRef(null);
    const [rotation, setRotation] = useState(defaultRotation)
    const [deleted, setDeleted] = useState(false)

    const [collected, drop] = useDrop({
        accept: "pdfThumbnail",
        hover(item: any, monitor) {
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
        item: { row, rowIndice, pdfIndex, pageIndex, type: "pdfThumbnail" },
        end: async (item, monitor) => {
            const dropResult = monitor.getDropResult();

            if (!dropResult) return;

            // move the page to placeholder thumbnail (drop on Thumbnail)
            console.log(`Moving pdf-${item.pdfIndex}-${item.pageIndex} from row ${row}-${rowIndice} to row ${dropResult.row}-${dropResult.rowIndice}`);

            const theThumbnail = rows[row][rowIndice];

            setRows(oldRows => {
                const updatedRows = oldRows;
                updatedRows[row].splice(rowIndice, 1);
                updatedRows[dropResult.row].splice(dropResult.rowIndice, 0, theThumbnail);
                return updatedRows;
            })
            return;
            await handleMovePage({
                fromRow: row,
                fromRowIndice: rowIndice,
                toRow: dropResult.row,
                toRowIndice: dropResult.rowIndice,
                toPlaceholderThumbnail: dropResult?.type === 'pdfThumbnail' ? true : false,
                toPlaceholderRow: dropResult?.type === "placeholderRow" ? true : false,
            });
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    useEffect(() => {
        setUserIsDragging(isDragging)
    }, [isDragging])

    drag(drop(ref));

    if (deleted) return null;
    return <>
        <div
            pageIndex={pageIndex}
            devicePixelRatio={20}
            width={150}
            height={150}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            renderMode="canvas"
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
            loading={<Loading />}
        >
            <div
                className={
                    `w-[150px] max-h-[150px] h-[150px] cursor-pointer relative rounded-md overflow-hidden
                    pdf-${pdfIndex}-${pageIndex} object-contain pdf-thumbnail flex flex-col items-center justify-center`
                }
            >
                <img src={src} className={`absolute inset-0 rotate-[${rotation}deg]`} />

                <div className="flex flex-col absolute inset-0 items-center justify-center z-10 bg-black/40 font-bold">
                    pdf-{pdfIndex}-{pageIndex}

                    <br />

                    rotation: {rotation}

                    <br />

                    <span className="text-xs mt-4">
                        row {row}
                        <br />
                        indice {rowIndice}
                    </span>
                </div>

            </div>
            <div className="absolute inset-0 z-10 flex justify-center items-end gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto cursor-move bg-black/75">
                <div className="grid grid-cols-2 gap-1 pb-4">

                    <BigButton
                        title={<><GrRotateRight /></>}
                        onClick={() => setRotation(oldValue => {
                            if (oldValue === 270) return 0;
                            else return oldValue + 90;
                        })}
                        transparent={false}
                    />
                    <BigButton
                        title={<><BsTrash /></>}
                        transparent={false}
                        onClick={() => setDeleted(true)}
                    />

                </div>
            </div>
        </div>
    </>
}