import { BsCheck2Circle, BsTrash } from "react-icons/bs";
import { BiChevronDown, BiRotateRight } from "react-icons/bi";
import Thumbnail from "./Thumbnail";
import PlaceholderRow from "./layout/PlaceholderRow";
import PlaceholderThumbnail from "./layout/PlaceholderThumbnail";
import Row from "./layout/Row";
import Button from "./primitives/Button";
import { useState } from "react";
import React from "react";
import { Document } from "react-pdf";

const PdfRow = ({ filename, inputPdf, pages, pdfIndex, rotations, handleMovePage, handleRotatePage, handleDeletePage, handleSaveDocument, handleRotateDocument, handleDeleteDocument }: any) => {
    const [open, setOpen] = useState(true);
    const isLoading = false;

    if (!pages?.length) return null;
    return <>
        <div className="flex flex-col w-full">
            {pdfIndex === 0
                ? <PlaceholderRow pdfIndex={0} />
                : null
            }

            <Row pdfIndex={pdfIndex} className='group/pdfRow'>
                <div className={`flex items-center justify-between p-4`}>
                    <BiChevronDown
                        className={`
                            cursor-pointer text-lg hidden
                            ${open ? 'rotate-180' : ''}
                        `}
                        onClick={() => setOpen(oldValue => !oldValue)}
                    />
                    <span className="text-xs mr-auto relative w-full text-text-dark">
                        <h3 className="mr-2 inline break-all">{filename}</h3>
                        ({pages.length} {pages.length > 1 ? ' pagina\'s' : ' pagina'})

                        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-body-bg-dark" />
                    </span>
                    <nav
                        className={
                            `${isLoading ? "disabled" : ""} flex gap-1 justify-end ml-auto
                            opacity-40
                            group-hover/pdfRow:opacity-100
                            flex-row min-w-[280px]`
                        }
                    >
                        <Button
                            className='group overflow-hidden'
                            title={<><BsCheck2Circle /><span className="group-hover:flex hidden text-xs">naar administratie</span></>}
                            onClick={async () => await handleSaveDocument(pdfIndex)}
                            padding='large'
                        />
                        <Button
                            className='group overflow-hidden'
                            title={<><BiRotateRight className="rotate-[180deg]" /><span className="group-hover:flex hidden text-xs">roteer alle pagina's</span></>}
                            onClick={() => handleRotateDocument({ pdfIndex })}
                            disabled={isLoading}
                        />
                        <Button
                            className='group overflow-hidden'
                            title={<><BsTrash /><span className="group-hover:flex hidden text-xs">verwijder document</span></>}
                            onClick={() => handleDeleteDocument(pdfIndex)}
                            disabled={isLoading}
                        />
                    </nav>
                </div>

                <Document
                    file={inputPdf}
                    loading={undefined}
                    renderMode='none'
                    className={
                        `relative p-4 gap-1 w-full overflow-hidden border-text-lighter opacity-100
                        ${open ? 'h-auto border-t' : 'h-0 py-0 opacity-0'}
                        flex flex-row flex-wrap row-${pdfIndex}
                        `}
                >
                    {/* thumbnails of current PDF */}
                    {pages.map((pageIndex: number, rowIndex: number) => {
                        return <div
                            className={`flex flex-row w-[130px] ${open ? 'opacity-100' : 'opacity-0 hidden'}`}
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
                </Document>
            </Row>

            <PlaceholderRow pdfIndex={pdfIndex + 0.5} />

        </div>
    </>
}
const skipRerender = (prevProps: any, nextProps: any) => {
    if (
        JSON.stringify(prevProps.pages) === JSON.stringify(nextProps.pages)
        &&
        JSON.stringify(prevProps.rotations) === JSON.stringify(nextProps.rotations)
    ) return true;
    else return false;
}
//export default React.memo(PdfRow, skipRerender);
export default PdfRow;