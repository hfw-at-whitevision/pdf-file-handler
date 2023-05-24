import { BsCheck2Circle, BsTrash } from "react-icons/bs";
import { BiChevronDown, BiRotateRight } from "react-icons/bi";
import Thumbnail from "./Thumbnail";
import PlaceholderRow from "./layout/PlaceholderRow";
import PlaceholderThumbnail from "./layout/PlaceholderThumbnail";
import Row from "./layout/Row";
import Button from "./primitives/Button";
import { useAtom } from "jotai";
import { isLoadingAtom, isRotatingAtom, pdfFilenamesAtom, pdfsAtom, totalPagesAtom } from "./store/atoms";
import { Document } from 'react-pdf'
import { useEffect, useState } from "react";
import React from "react";
import Loading from "./layout/Loading";

const PdfRow = ({ pdfIndex, handleMovePage, handleRotatePage, handleDeletePage, handleSaveDocument, handleRotateDocument, handleDeleteDocument }: any) => {
    const [pdfFileNames] = useAtom(pdfFilenamesAtom);
    const [totalPages]: any = useAtom(totalPagesAtom);
    const [isLoading] = useAtom(isLoadingAtom);
    const [isRotating] = useAtom(isRotatingAtom);
    const [open, setOpen] = useState(true);

    const [pdfs] = useAtom(pdfsAtom);
    const [pdf, setPdf] = useState(pdfs?.[pdfIndex]);

    useEffect(() => {
        setPdf(pdfs?.[pdfIndex]);
    }, [pdfs?.[pdfIndex]])

    return <>
        <div className="flex flex-col w-full">

            {pdfIndex === 0
                ? <PlaceholderRow pdfIndex={0} />
                : null
            }

            <Row pdfIndex={pdfIndex}>
                <span className="text-xs mr-auto p-4 pb-0">
                    <h3 className="mr-2 inline break-all">{pdfFileNames[pdfIndex]}</h3>
                    ({totalPages?.[pdfIndex]} {totalPages?.[pdfIndex] > 1 ? ' pagina\'s' : ' pagina'})
                </span>
                <div className={`flex items-center justify-between p-4`}>
                    <BiChevronDown
                        className={`
                            cursor-pointer text-lg
                            ${open ? 'rotate-180' : ''}
                        `}
                        onClick={() => setOpen(oldValue => !oldValue)}
                    />
                    <nav
                        className={
                            `${isLoading ? "disabled" : ""} flex gap-1 justify-end
                            flex-row min-w-[280px]`
                        }
                    >
                        <Button
                            title={<><BsCheck2Circle /><span className="text-xs">naar administratie</span></>}
                            onClick={async () => {
                                const base64 = await handleSaveDocument(pdfIndex);
                                alert(base64)
                            }}
                        />
                        <Button
                            title={<><BiRotateRight className="rotate-[180deg]" /></>}
                            onClick={() => handleRotateDocument(pdfIndex)}
                            disabled={isRotating}
                        />
                        <Button
                            title={<><BsTrash /></>}
                            onClick={() => handleDeleteDocument(pdfIndex)}
                            disabled={isRotating}
                        />
                    </nav>
                </div>

                <Document
                    file={pdf}
                    className={
                        `relative p-4 gap-1 w-full overflow-hidden border-stone-300 opacity-100
                        ${open ? 'h-auto border-t' : 'h-0 py-0 opacity-0'}
                        flex flex-row flex-wrap
                        `}
                    loading={<Loading />}
                    renderMode='none'
                >
                    {/* thumbnails of current PDF */}
                    {new Array(totalPages?.[pdfIndex]).fill(1)?.map((item: any, pageIndex: number) => <>
                        <div
                            className={`flex flex-row ${open ? 'opacity-100' : 'opacity-0 hidden'}`}
                            key={`thumbnail-${pdfIndex}-${pageIndex}`}
                        >
                            {
                                /* first placeholder thumbnail in row */
                                pageIndex % 4 === 0 &&
                                <PlaceholderThumbnail pdfIndex={pdfIndex}
                                    pageIndex={pageIndex - 0.5}
                                    margin='mr-2' />
                            }
                            <Thumbnail
                                index={pageIndex}
                                pageIndex={pageIndex}
                                pdfIndex={pdfIndex}
                                handleDeletePage={handleDeletePage}
                                handleRotatePage={handleRotatePage}
                                handleMovePage={handleMovePage}
                                handleDeleteDocument={handleDeleteDocument}
                            />
                            <PlaceholderThumbnail pdfIndex={pdfIndex}
                                pageIndex={pageIndex + 0.5}
                                key={`thumbnail-${pdfIndex}-${pageIndex + 0.5}-placeholder`}
                                margin='ml-2' />
                        </div>
                    </>
                    )}
                </Document>
            </Row>

            <PlaceholderRow pdfIndex={pdfIndex + 0.5} />

        </div>
    </>
}
const skipRerender = (prevProps: any, nextProps: any) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
}
export default React.memo(PdfRow, skipRerender);
//export default PdfRow;