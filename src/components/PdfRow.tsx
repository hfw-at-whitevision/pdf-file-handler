import { BsCheck2Circle, BsTrash } from "react-icons/bs";
import { GrRotateRight } from "react-icons/gr";
import Thumbnail from "./Thumbnail";
import PlaceholderRow from "./layout/PlaceholderRow";
import PlaceholderThumbnail from "./layout/PlaceholderThumbnail";
import Row from "./layout/Row";
import Button from "./primitives/Button";
import { useAtom } from "jotai";
import { currentAtom, isLoadingAtom, isRotatingAtom, numberOfThumbnailsAtom, pdfFileNamesAtom, pdfsAtom, totalPagesAtom, userIsDraggingAtom } from "./store/atoms";
import { Document } from 'react-pdf'
import { useCallback, useEffect, useRef, useState } from "react";

export default function PdfRow({ pdfIndex = 0, handleMovePage, handleRotatePage, handleDeletePage, handleSaveDocument, handleRotateDocument, handleDeleteDocument }: any, props: any) {
    const [pdfFileNames] = useAtom(pdfFileNamesAtom);
    const [totalPages]: any = useAtom(totalPagesAtom);
    const [isLoading] = useAtom(isLoadingAtom);
    const [isRotating] = useAtom(isRotatingAtom);
    const [pdfs]: any = useAtom(pdfsAtom);
    const [numberOfThumbnails]: any = useAtom(numberOfThumbnailsAtom);
    const [userIsDragging] = useAtom(userIsDraggingAtom);
    const [current, setCurrentAtom] = useAtom(currentAtom);
    const setCurrent = useCallback((object: any) => setCurrentAtom(object), [])
    const ref = useRef(null);

    const [width, setWidth]: any = useState();
    useEffect(() => {
        setWidth(ref?.current?.getBoundingClientRect()?.width);
    }, [ref?.current?.getBoundingClientRect()?.width])

    return <>

        {pdfIndex === 0
            ? <PlaceholderRow pdfIndex={0} />
            : null
        }

        <div ref={ref}>
            <Row pdfIndex={pdfIndex}>
                <div
                    className={`mb-4 flex items-center justify-between
                    ${width < 350 ? 'flex-col' : 'flex-row'}`}
                >
                    <span className="text-sm">
                        <h3 className="mr-2 inline break-all">{pdfFileNames[pdfIndex]}</h3>
                        ({totalPages[pdfIndex]} {totalPages[pdfIndex] > 1 ? ' pagina\'s' : ' pagina'})
                    </span>

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
                            title={<><GrRotateRight /></>}
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

                <div className='relative'>
                    <Document
                        file={pdfs[pdfIndex]}
                        className={
                            `grid gap-2 w-full
                            ${width > 600
                                ? 'grid-cols-4'
                                : width > 350
                                    ? 'grid-cols-3'
                                    : width > 200
                                        ? 'grid-cols-2'
                                        : 'grid-cols-1'
                            }       
                            `}
                    >
                        {/* thumbnails of current PDF */}
                        {numberOfThumbnails[pdfIndex]?.map((item: any, pageIndex: number) => <>
                            <div className="flex flex-row flex-1">
                                {
                                    /* first placeholder thumbnail in row */
                                    pageIndex % 4 === 0 &&
                                    <PlaceholderThumbnail pdfIndex={pdfIndex}
                                        pageIndex={pageIndex - 0.5}
                                        isDragging={userIsDragging}
                                        totalPages={totalPages}
                                        isLoading={isLoading} margin='mr-2' />
                                }
                                <Thumbnail
                                    key={`thumbnail-${pdfIndex}-${pageIndex}`}
                                    index={pageIndex}
                                    pageIndex={pageIndex}
                                    pdfIndex={pdfIndex}
                                    handleDeletePage={handleDeletePage}
                                    handleRotatePage={handleRotatePage}
                                    handleMovePage={handleMovePage}
                                    current={current}
                                    setCurrent={setCurrent}
                                />
                                <PlaceholderThumbnail pdfIndex={pdfIndex}
                                    pageIndex={pageIndex + 0.5}
                                    isDragging={userIsDragging}
                                    totalPages={totalPages}
                                    isLoading={isLoading}
                                    key={`thumbnail-${pdfIndex}-${pageIndex + 0.5}-placeholder`}
                                    margin='ml-2' />
                            </div>
                        </>
                        )
                        }

                    </Document>
                </div>
            </Row>
        </div>

        <PlaceholderRow pdfIndex={pdfIndex + 0.5} />

    </>
}