import { BsCheck2Circle, BsTrash } from "react-icons/bs";
import { BiChevronDown, BiRotateRight } from "react-icons/bi";
import Thumbnail from "./Thumbnail";
import PlaceholderRow from "./layout/PlaceholderRow";
import PlaceholderThumbnail from "./layout/PlaceholderThumbnail";
import Row from "./layout/Row";
import Button from "./primitives/Button";
import { useEffect, useRef } from "react";
import React from "react";
import { Document } from "react-pdf";
import { useDrop, useDrag } from "react-dnd";
import { isDraggingInternallyAtom, thumbnailsWidthAtom } from "./store/atoms";
import { useAtom, useSetAtom } from "jotai";
import Loading from "./layout/Loading";

const PdfRow = ({ filename, opened, setOpenedRows, inputPdf, pages, pdfIndex, rotations, handleMovePage, handleRotatePage, handleDeletePage, handleSaveDocument, handleRotateDocument, handleDeleteDocument }: any) => {
    const isLoading = false;
    const [thumbnailsWidth]: any = useAtom(thumbnailsWidthAtom);
    const setIsDraggingInternally = useSetAtom(isDraggingInternallyAtom);

    if (!pages?.length) return null;

    const [collected, drop] = useDrop({
        accept: "pdfThumbnail",
    });
    const ref: any = useRef(null);

    const [{ isDragging }, drag]: any = useDrag({
        type: "pdfRow",
        item: { pdfIndex, pdfFilename: filename, pages, type: "pdfRow" },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    const toggleClosed = () => {
        setOpenedRows((oldValues: Array<boolean>, index: number) => {
            const updatedValues = oldValues.slice();
            updatedValues.splice(pdfIndex, 1, !opened);
            return updatedValues;
        });
    }

    useEffect(() => {
        setIsDraggingInternally(isDragging);
    }, [isDragging]);

    drag(drop(ref));

    return <>
        <PlaceholderRow pdfIndex={pdfIndex + 0.5} />

        <div ref={ref} className={`flex w-full row-${pdfIndex}`}>
            <Row pdfIndex={pdfIndex} className={`group/pdfRow flex flex-col w-full row-${pdfIndex}`}>
                <div
                    data-pdf-index={pdfIndex}
                    className={`flex items-center justify-between p-4`}
                >
                    <BiChevronDown
                        className={`
                            cursor-pointer text-[64px]
                            ${opened ? 'rotate-180' : ''}
                        `}
                        onClick={toggleClosed}
                    />
                    <span
                        data-pdf-index={pdfIndex}
                        className="text-xs ml-2 mr-auto relative w-full text-text-dark cursor-pointer py-4"
                        onClick={toggleClosed}
                    >
                        <h3 className={`mr-2 inline break-all row-${pdfIndex}`}>{filename}</h3>
                        ({pages.length} {pages.length > 1 ? ' pagina\'s' : ' pagina'})
                    </span>
                    <nav
                        data-pdf-index={pdfIndex}
                        className={
                            `${isLoading ? "disabled" : ""} flex gap-1 justify-end ml-auto
                            opacity-40
                            group-hover/pdfRow:opacity-100
                            flex-row min-w-[280px]`
                        }
                    >
                        <Button
                            className='overflow-hidden'
                            title={<><BsCheck2Circle /><span className="group-hover:flex text-xs">naar administratie</span></>}
                            onClick={async () => await handleSaveDocument(pdfIndex)}
                            padding='large'
                        />
                        <Button
                            className='overflow-hidden'
                            title={<><BiRotateRight className="rotate-[180deg]" /><span className="group-hover:flex hidden text-xs">roteer alle pagina's</span></>}
                            onClick={() => handleRotateDocument({ pdfIndex })}
                            disabled={isLoading}
                        />
                        <Button
                            className='overflow-hidden'
                            title={<><BsTrash /><span className="group-hover:flex hidden text-xs">verwijder document</span></>}
                            onClick={() => handleDeleteDocument(pdfIndex)}
                            disabled={isLoading}
                        />
                    </nav>
                </div>

                <Document
                    file={inputPdf}
                    loading={<Loading loading={true} />}
                    renderMode='none'
                >
                    <div
                        data-pdf-index={pdfIndex}
                        className={
                            `p-4 gap-1 w-full overflow-hidden border-text-light opacity-100
                     ${opened ? 'h-auto border-t' : 'h-0 py-0 opacity-0'}
                     flex flex-row flex-wrap row-${pdfIndex} relative`
                        }>
                        {/* thumbnails of current PDF */}
                        {pages.map((pageIndex: number, rowIndex: number) => {
                            return <div
                                className={`flex flex-row ${opened ? 'opacity-100' : 'opacity-0 hidden'}`}
                                style={{ width: parseFloat(thumbnailsWidth) }}
                                key={`thumbnail-${pdfIndex}-${pageIndex}`}
                            >
                                {
                                    /* first placeholder thumbnail in row */
                                    rowIndex % 4 === 0
                                    && <PlaceholderThumbnail
                                        pdfIndex={pdfIndex}
                                        pageIndex={pageIndex - 0.5}
                                        rowIndex={rowIndex - 0.5}
                                        margin='mr-2'
                                    />
                                }
                                <Thumbnail
                                    index={rowIndex}
                                    rowIndex={rowIndex}
                                    pages={pages}
                                    pageIndex={pageIndex}
                                    pdfIndex={pdfIndex}
                                    rotation={rotations?.[rowIndex]}
                                    handleDeletePage={handleDeletePage}
                                    handleRotatePage={handleRotatePage}
                                    handleMovePage={handleMovePage}
                                    handleDeleteDocument={handleDeleteDocument}
                                />
                                <PlaceholderThumbnail
                                    pdfIndex={pdfIndex}
                                    pageIndex={pageIndex + 0.5}
                                    rowIndex={rowIndex + 0.5}
                                    margin='ml-2'
                                />
                            </div>
                        }
                        )}
                    </div>
                </Document>
            </Row>
        </div>

        {pdfIndex === 0
            ? <PlaceholderRow pdfIndex={0} />
            : null
        }
    </>
}
const skipRerender = (prevProps: any, nextProps: any) => {
    if (
        JSON.stringify(prevProps.pages) === JSON.stringify(nextProps.pages)
        &&
        JSON.stringify(prevProps.rotations) === JSON.stringify(nextProps.rotations)
        &&
        prevProps.opened === nextProps.opened
    ) return true;
    else return false;
}
export default PdfRow;
//export default React.memo(PdfRow, skipRerender);