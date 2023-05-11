import Head from "next/head";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BsCheck2Circle, BsTrash } from "react-icons/bs";
import { GrRotateRight } from "react-icons/gr";
import { RxReset } from "react-icons/rx";
import { Page } from "react-pdf";
import { Button } from "../Button";
import ButtonXl from "../ButtonXl";
import Debug from "./Debug";
import Drop from "../Drop";
import Loading from "./Loading";
import ScrollDropTarget from "../ScrollDropTarget";
import PlaceholderRow from "../PlaceholderRow";
import { Document } from 'react-pdf'
import PlaceholderThumbnail from "../PlaceholderThumbnail";
import Row from "../Row";
import Thumbnail from "../Thumbnail";
import { get, set } from 'idb-keyval';
import { useRef } from "react";

export default function Layout(
    {
        children,
        pdfs, totalPages, numberOfThumbnails, current, pdfFileNames,
        isLoading, handleDropzoneLoaded,
        setPdfs, setTotalPages, setPdfFileNames, setCurrent, setNumberOfThumbnails, setStateChanged,
        handleReset, handleMovePage, handleRotatePage, handleDeletePage, handleAddPage, handleAddPdf,
        userIsDragging,
    }
) {
    const documentRef = useRef(null);
    return <>
        <Head><title>PDF File Handler</title></Head>

        <Loading inset={true} loading={isLoading} />

        <Debug
            pdfs={pdfs}
            totalPages={totalPages}
            numberOfThumbnails={numberOfThumbnails}
            current={current}
        />

        <div className={
            `flex min-h-screen ${!pdfs?.length ? 'items-center' : ''} justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]`
        }>

            <div className={
                `${pdfs ? "flex-row" : "flex-col items-center justify-center"} flex gap-8 px-4 py-16`
            }>
                <header className={
                    `flex flex-col ${!pdfs ? "items-center" : "max-w-xs"}`
                }>
                    <nav className="sticky top-8">
                        <img src="./whitevision.png" width={150} className="flex justify-center gap-2 text-lg " />
                        <div className={
                            `grid gap-4 mt-6 ${!pdfs ? "grid-cols-1" : "grid-cols-1"}`
                        }>
                            <Drop
                                onLoaded={handleDropzoneLoaded}
                                className={pdfs?.length ? "opacity-50" : "!p-16"}
                            />
                            {
                                pdfs?.length
                                    ? <>
                                        <ButtonXl
                                            title={"Reset"}
                                            icon={<RxReset />}
                                            description="Maak alle wijzigingen ongedaan en reset naar de oorspronkelijke PDF."
                                            onClick={async () => await handleReset()}
                                        />
                                    </>
                                    : null
                            }
                        </div>
                    </nav>
                </header>

                <DndProvider backend={HTML5Backend}>
                    <ScrollDropTarget position='top' isDragging={userIsDragging} />

                    {pdfs?.length ? (
                        <main
                            ref={documentRef}
                            className="flex-col text-white items-start"
                        >

                            <PlaceholderRow pdfIndex={0} isDragging={userIsDragging} isLoading={isLoading} totalPages={totalPages} />

                            {pdfs?.map((pdfDoc, pdfIndex) => <>
                                <Row pdfIndex={pdfIndex} key={`pdf-${pdfIndex}`}>
                                    <div className="col-span-2 lg:col-span-3 xl:col-span-4 mb-4 flex items-center justify-between">
                                        <span className="text-sm">
                                            <h3 className="mr-2 inline">{pdfFileNames[pdfIndex]}</h3>
                                            ({totalPages[pdfIndex]} {totalPages[pdfIndex] > 1 ? ' pagina\'s' : ' pagina'})
                                        </span>

                                        <nav className={`${isLoading ? "disabled" : ""} flex gap-1 w-[270px] justify-end`}>
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
                                            file={pdfDoc}
                                            loading={<Loading />}
                                            className={
                                                `grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 w-full`
                                            }
                                        >
                                            {/* thumbnails of current PDF */}
                                            {numberOfThumbnails[pdfIndex]?.map((item, pageIndex) => <>
                                                <div className="flex flex-row">
                                                    {
                                                        /* first placeholder thumbnail in row */
                                                        pageIndex % 4 === 0 &&
                                                        <PlaceholderThumbnail pdfIndex={pdfIndex} pageIndex={pageIndex - 0.5} isDragging={userIsDragging} totalPages={totalPages} isLoading={isLoading} margin='mr-2' />
                                                    }
                                                    <Thumbnail
                                                        key={`thumbnail-${pdfIndex}-${pageIndex}`}
                                                        index={pageIndex}
                                                        handleMovePage={handleMovePage}
                                                        pageIndex={pageIndex}
                                                        pdfIndex={pdfIndex}
                                                        setUserIsDragging={setUserIsDragging}
                                                        current={current}
                                                        onClick={() => setCurrent(oldValues => ({
                                                            ...oldValues,
                                                            pdfIndex: pdfIndex,
                                                            pageIndex: pageIndex,
                                                        }))}
                                                        actionButtons={renderActionButtons(pdfIndex, pageIndex)}
                                                    />
                                                    <PlaceholderThumbnail pdfIndex={pdfIndex} pageIndex={pageIndex + 0.5} isDragging={userIsDragging} totalPages={totalPages} isLoading={isLoading} key={`thumbnail-${pdfIndex}-${pageIndex + 0.5}-placeholder`} margin='ml-2' />
                                                </div>
                                            </>
                                            )
                                            }
                                        </Document>
                                    </div>
                                </Row>

                                <PlaceholderRow pdfIndex={pdfIndex + 0.5} isDragging={userIsDragging} isLoading={isLoading} totalPages={totalPages} />
                            </>
                            )
                            }
                        </main>
                    ) : null}

                    <ScrollDropTarget position='bottom' isDragging={userIsDragging} />
                </DndProvider>

                {/* PDF preview */}
                {(pdfs?.length && current?.pdfIndex !== undefined && current?.pageIndex !== undefined && pdfs[current?.pdfIndex])
                    && <div>
                        <Document
                            file={pdfs[current?.pdfIndex]}
                            loading={<Loading />}
                            className='w-[800px] sticky top-8'
                        >
                            {!isLoading &&
                                <Page
                                    pageIndex={current?.pageIndex}
                                    loading={<Loading />}
                                    width={800}
                                    renderAnnotationLayer={false}
                                    renderTextLayer={false}
                                    className={`rounded-lg shadow-lg overflow-hidden`}
                                />
                            }
                        </Document>
                    </div>
                }
            </div>

        </div>
    </>
}

const renderActionButtons = (pdfIndex, pageIndex) => {
    return <>
        <Button
            title={<><GrRotateRight /></>}
            onClick={async () => handleRotatePage({ pdfIndex, pageIndex })}
            disabled={isRotating}
            transparent={false}
        />
        <Button
            title={<><BsTrash /></>}
            onClick={async () => handleDeletePage({ pdfIndex, pageIndex })}
            disabled={isRotating}
            transparent={false}
        />
    </>
}