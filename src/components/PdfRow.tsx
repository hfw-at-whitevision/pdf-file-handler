import { BsCheck2Circle, BsTrash } from "react-icons/bs";
import { BiChevronDown, BiRotateRight } from "react-icons/bi";
import Thumbnail from "./Thumbnail";
import PlaceholderRow from "./layout/PlaceholderRow";
import PlaceholderThumbnail from "./layout/PlaceholderThumbnail";
import Row from "./layout/Row";
import Button from "./primitives/Button";
import { useAtom } from "jotai";
import { isLoadingAtom, isRotatingAtom, numberOfThumbnailsAtom, pdfFileNamesAtom, pdfsAtom, totalPagesAtom, userIsDraggingAtom } from "./store/atoms";
import { Document } from 'react-pdf'
import { useEffect, useRef, useState } from "react";
import React from "react";
import Loading from "./layout/Loading";

const PdfRow = ({ pdfIndex = 0, handleMovePage, handleRotatePage, handleDeletePage, handleSaveDocument, handleRotateDocument, handleDeleteDocument, stateChanged }: any, props: any) => {
    const [pdfFileNames] = useAtom(pdfFileNamesAtom);
    const [totalPages]: any = useAtom(totalPagesAtom);
    const [isLoading] = useAtom(isLoadingAtom);
    const [isRotating] = useAtom(isRotatingAtom);
    const [numberOfThumbnails]: any = useAtom(numberOfThumbnailsAtom);
    const [userIsDragging] = useAtom(userIsDraggingAtom);
    const ref = useRef(null);
    const [width, setWidth]: any = useState();
    const [open, setOpen] = useState(true);
    const [height, setHeight] = useState(0);

    const [pdfs] = useAtom(pdfsAtom);
    const [pdf, setPdf] = useState(pdfs?.[pdfIndex]);

    useEffect(() => {
        setPdf(pdfs?.[pdfIndex]);
    }, [pdfs])

    useEffect(() => {
        setWidth(ref?.current?.getBoundingClientRect()?.width);
    }, [ref?.current?.getBoundingClientRect()?.width])

    useEffect(() => {
        setHeight(ref?.current?.getBoundingClientRect()?.height);
    }, [pdf, ref?.current?.getBoundingClientRect()?.height]);

    return <>

        {pdfIndex === 0
            ? <PlaceholderRow pdfIndex={0} />
            : null
        }
        <div ref={ref}>
            <Row pdfIndex={pdfIndex}>
                <span className="text-xs mr-auto p-4 pb-0">
                    <h3 className="mr-2 inline break-all">{pdfFileNames[pdfIndex]}</h3>
                    ({totalPages?.[pdfIndex]} {totalPages?.[pdfIndex] > 1 ? ' pagina\'s' : ' pagina'})
                </span>
                <div className={`flex items-center justify-between p-4 border-b border-stone-300`}>
                    <BiChevronDown
                        className={`
                            cursor-pointer text-lg
                            ${!open ? 'rotate-180' : ''}
                        `}
                        onClick={() => setOpen(oldValue => !oldValue)}
                    />
                    <nav
                        className={
                            `${isLoading ? "disabled" : ""} flex gap-1 justify-end
                            ${width < 350 ? 'flex-col mt-4' : 'flex-row min-w-[280px]'}`
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
                            onClick={async () => await handleRotateDocument(pdfIndex)}
                            disabled={isRotating}
                        />
                        <Button
                            title={<><BsTrash /></>}
                            onClick={async () => await handleDeleteDocument(pdfIndex)}
                            disabled={isRotating}
                        />
                    </nav>
                </div>

                <Document
                    file={pdf}
                    className={
                        `relative p-4 gap-1 w-full overflow-hidden
                        ${open ? 'h-auto' : 'h-0 py-0'}
                        flex flex-row flex-wrap
                        `}
                    loading={<Loading />}
                    renderMode='none'
                >
                    {/* thumbnails of current PDF */}
                    {numberOfThumbnails?.[pdfIndex]?.map((item: any, pageIndex: number) => <>
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
        </div>

        <PlaceholderRow pdfIndex={pdfIndex + 0.5} />

    </>
}
const skipRerender = (prevProps: any, nextProps: any) => {
    return prevProps.stateChanged === nextProps.stateChanged
}
export default React.memo(PdfRow, skipRerender);
//export default PdfRow;