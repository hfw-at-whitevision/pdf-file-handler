import { BsCheck2Circle, BsTrash } from "react-icons/bs";
import { BiChevronDown, BiRotateRight } from "react-icons/bi";
import Thumbnail from "./Thumbnail";
import PlaceholderRow from "./layout/PlaceholderRow";
import PlaceholderThumbnail from "./layout/PlaceholderThumbnail";
import Row from "./layout/Row";
import Button from "./primitives/Button";
import { useAtom } from "jotai";
import { isLoadingAtom } from "./store/atoms";
import { Document } from 'react-pdf'
import { useState } from "react";
import React from "react";

const PdfRow = ({ filename, pages, totalPages, pdfIndex, pdf, rotations, handleMovePage, handleRotatePage, handleDeletePage, handleSaveDocument, handleRotateDocument, handleDeleteDocument }: any) => {
    const [isLoading] = useAtom(isLoadingAtom);
    const [open, setOpen] = useState(true);

    if (!pages?.length) return null;
    return <>
        <div className="flex flex-col w-full">
            {pdfIndex === 0
                ? <PlaceholderRow pdfIndex={0} />
                : null
            }

            <Row pdfIndex={pdfIndex}>
                <div className={`flex items-center justify-between p-4`}>
                    <BiChevronDown
                        className={`
                            cursor-pointer text-lg hidden
                            ${open ? 'rotate-180' : ''}
                        `}
                        onClick={() => setOpen(oldValue => !oldValue)}
                    />
                    <span className="text-xs mr-auto">
                        <h3 className="mr-2 inline break-all">{filename}</h3>
                        ({totalPages} {totalPages > 1 ? ' pagina\'s' : ' pagina'})
                    </span>
                    <nav
                        className={
                            `${isLoading ? "disabled" : ""} flex gap-1 justify-end ml-auto
                            flex-row min-w-[280px]`
                        }
                    >
                        <Button
                            title={<><BsCheck2Circle /><span className="text-xs">naar administratie</span></>}
                            onClick={async () => {
                                const base64 = await handleSaveDocument(pdfIndex);
                                alert(base64)
                            }}
                            padding='large'
                        />
                        <Button
                            title={<><BiRotateRight className="rotate-[180deg]" /></>}
                            onClick={() => handleRotateDocument({ pdfIndex })}
                            disabled={isLoading}
                        />
                        <Button
                            title={<><BsTrash /></>}
                            onClick={() => handleDeleteDocument(pdfIndex)}
                            disabled={isLoading}
                        />
                    </nav>
                </div>

                <Document
                    file={pdf}
                    className={
                        `relative p-4 gap-1 w-full overflow-hidden border-text-lighter opacity-100
                        ${open ? 'h-auto border-t' : 'h-0 py-0 opacity-0'}
                        flex flex-row flex-wrap row-${pdfIndex}
                        `}
                    loading={undefined}
                    renderMode='none'
                >
                    {/* thumbnails of current PDF */}
                    {pages.map((pageIndex: number, index: number) => {
                        return <div
                            className={`flex flex-row w-[130px] ${open ? 'opacity-100' : 'opacity-0 hidden'}`}
                            key={`thumbnail-${pdfIndex}-${pageIndex}`}
                        >
                            {
                                /* first placeholder thumbnail in row */
                                pageIndex % 4 === 0
                                && <PlaceholderThumbnail
                                    pdfIndex={pdfIndex}
                                    pageIndex={pageIndex - 0.5}
                                    margin='mr-2'
                                />
                            }
                            <Thumbnail
                                index={index}
                                pages={pages}
                                pageIndex={pageIndex}
                                pdfIndex={pdfIndex}
                                rotation={rotations?.[index]}
                                handleDeletePage={handleDeletePage}
                                handleRotatePage={handleRotatePage}
                                handleMovePage={handleMovePage}
                                handleDeleteDocument={handleDeleteDocument}
                            />
                            <PlaceholderThumbnail
                                pdfIndex={pdfIndex}
                                pageIndex={pageIndex + 0.5}
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
        // total number of pages hasnt changed
        prevProps.totalPages === nextProps.totalPages
        &&
        JSON.stringify(prevProps.pages) === JSON.stringify(nextProps.pages)
        &&
        JSON.stringify(prevProps.rotations) === JSON.stringify(nextProps.rotations)
    ) return true;
    else return false;
}
//export default React.memo(PdfRow, skipRerender);
export default PdfRow;