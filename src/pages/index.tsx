import { type NextPage } from "next";
import Head from "next/head";
import { get, del } from 'idb-keyval';

import { useCallback, useState } from "react";
import Drop from "@/components/layout/Drop";
import { PDFDocument } from "pdf-lib";
import ButtonXl from "@/components/primitives/ButtonXl";
import { BsSave, BsArrowRepeat, BsUpload } from "react-icons/bs";
import Loading from "@/components/layout/Loading";
import Debug from "@/components/layout/Debug";
import ScrollDropTarget from "@/components/layout/ScrollDropTarget";
import { useAtom, useSetAtom } from "jotai";
import { currentAtom, pagesAtom, isLoadingAtom, loadingMessageAtom, pdfFilenamesAtom, pdfsAtom, rotationsAtom, stateChangedAtom, totalPagesAtom, isDraggingFilesAtom } from "@/components/store/atoms";
import Split from 'react-split'
import AdministrationTiles from "@/components/AdministrationTiles";
import ContextMenu from "@/components/layout/ContextMenu";
import PdfRow from "@/components/PdfRow";
import LegacyPdfPreview from "@/components/LegacyPdfPreview";
import React from "react";
import KeyPressListener from "@/components/layout/KeyPressListener";
import LocalStateHandler from "@/components/layout/LocalStateHandler";
import CurrentHandler from "@/components/layout/CurrentHandler";

const Home: NextPage = () => {
    const [pdfFilenames, setPdfFilenames]: [Array<string>, any] = useAtom(pdfFilenamesAtom);
    const [pdfs]: any = useAtom(pdfsAtom);
    const setPdfs: any = useSetAtom(pdfsAtom);
    const [current]: any = useAtom(currentAtom);
    const setCurrent: any = useSetAtom(currentAtom);
    const [totalPages, setTotalPages]: [any, any] = useAtom(totalPagesAtom);
    const [isLoading, setIsLoading]: [boolean, any] = useAtom(isLoadingAtom);
    const [loadingMessage]: any = useAtom(loadingMessageAtom);
    const [rotations, setRotations]: any = useAtom(rotationsAtom);
    const [pages, setPages]: any = useAtom(pagesAtom);
    const setStateChanged = useSetAtom(stateChangedAtom);
    let timer: any = null;

    const findArrayIndex = ({ pdfIndex, pageIndex }: any) => {
        if (typeof pages?.[pdfIndex]?.[pageIndex] === 'undefined') return;
        return pages[pdfIndex].findIndex((value: any) => value === pageIndex);
    }
    const findPageIndex = ({ pdfIndex, index }: any) => {
        return pages[pdfIndex][index];
    }

    const handleReset = useCallback(async () => {
        if (!confirm('Verwijder alle documenten en bewerkingen?')) return;
        setPdfs([]);
        setTotalPages([]);
        setPdfFilenames([]);
        setRotations([]);
        setCurrent({ pdfIndex: 0, pageIndex: 0 });
        setPages([]);

        await del('totalPages');
        await del('pdfFilenames');
        await del('pdfs');
        await del('rotations');
        await del('pages');

        setStateChanged((oldValue: number) => oldValue + 1);
    }, []);
    const handleSplitDocument = async ({ pdfIndex, pageIndex }: any) => {
        const pages = await get('pages');
        const startIndex = pages[pdfIndex].findIndex((value: any) => value === pageIndex);

        if (startIndex === 0) return;
        const duplicateState = (oldState: Array<any>) => {
            let updatedState = oldState;
            let originalRecord = oldState[pdfIndex];
            let duplicatedRecord = originalRecord;

            // slice the records
            if (Array.isArray(originalRecord)) {
                duplicatedRecord = originalRecord.slice(startIndex);
                originalRecord = originalRecord.slice(0, startIndex);
            }

            // insert / duplicate the record
            updatedState.splice(pdfIndex, 0, duplicatedRecord);
            updatedState[pdfIndex] = originalRecord;
            updatedState[pdfIndex + 1] = duplicatedRecord;
            return updatedState;
        }
        setPdfs((oldValue: any) => duplicateState(oldValue));
        setPdfFilenames((oldValue: any) => duplicateState(oldValue));
        setTotalPages((oldValue: any) => duplicateState(oldValue));
        setRotations((oldValue: any) => duplicateState(oldValue));
        setPages((oldValue: any) => duplicateState(oldValue));
        setStateChanged((oldState: number) => oldState + 1);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => setCurrent({
            pdfIndex: pdfIndex + 1,
            pageIndex: pageIndex,
        }), 500);
    }
    const handleDeleteDocument = async (inputPdfIndex: number) => {
        const confirmed = confirm('Dit document verwijderen? Bewerkingen zijn niet meer terug te halen.');
        if (!confirmed) return;

        setIsLoading(true);
        if (timer) clearTimeout(timer);

        setPdfs((oldPdfs: any) => oldPdfs.filter((_: any, index: number) => index !== inputPdfIndex));
        setTotalPages((oldTotalPages: any) => oldTotalPages.filter((_: any, index: number) => index !== inputPdfIndex));
        setPdfFilenames((oldPdfFileNames: any) => oldPdfFileNames.filter((_: any, index: number) => index !== inputPdfIndex));
        setPages((oldPages: any) => {
            if (oldPages?.length === 1) return [];
            let updatedPages = oldPages;
            updatedPages.splice(inputPdfIndex, 1);
            return updatedPages;
        });
        setRotations((oldValue: any) => {
            if (oldValue?.length === 1) return [];
            let updatedValue = oldValue;
            updatedValue.splice(inputPdfIndex, 1);
            return updatedValue;
        });
        timer = setTimeout(() => setCurrent({
            pdfIndex: (inputPdfIndex > 0) ? inputPdfIndex - 1 : 0,
            pageIndex: 0,
        }), 400);

        setIsLoading(false);
        setStateChanged((oldValue: number) => oldValue + 1);
    }
    const handleDeletePage = async ({ pdfIndex, pageIndex, index, skipScrollIntoView }: any) => {
        if (timer) clearTimeout(timer);
        const pages = await get('pages');
        if (typeof index === 'undefined') index = pages[pdfIndex].findIndex((value: any) => value === pageIndex);
        const nextPageIndex = pages[pdfIndex][index + 1];
        setPages((oldValue: any) => {
            let updatedArray = oldValue;
            updatedArray[pdfIndex].splice(index, 1);
            return updatedArray;
        });
        setRotations((oldValue: any) => {
            let updatedArray = oldValue;
            updatedArray[pdfIndex].splice(index, 1);
            return updatedArray;
        });
        setTotalPages((oldValue: any) => {
            let updatedArray = oldValue;
            updatedArray[pdfIndex] = updatedArray[pdfIndex] - 1;
            return updatedArray;
        });
        setStateChanged((oldState: number) => oldState + 1)
        timer = setTimeout(() => setCurrent({
            pdfIndex,
            pageIndex: nextPageIndex,
            ...skipScrollIntoView && { skipScrollIntoView },
        }), 400);
    }
    const handleRotateDocument = useCallback(async ({ pdfIndex, skipScrollIntoView }: any) => {
        let updatedRotations = await get('rotations');
        let updatedPdfRotations = updatedRotations[pdfIndex]?.map((rotation: number, index: number) => {
            const newDegrees = (rotation + 90 === 360)
                ? 0
                : rotation + 90;
            return newDegrees;
        });
        updatedRotations[pdfIndex] = updatedPdfRotations;
        setRotations(updatedRotations);
        setStateChanged((oldValue: number) => oldValue + 1);
        setCurrent((oldCurrent: any) => ({
            pdfIndex: pdfIndex,
            pageIndex: oldCurrent.pageIndex,
            ...skipScrollIntoView && { skipScrollIntoView },
        }));
    }, [rotations]);
    const handleRotatePage = async ({ pdfIndex, pageIndex, index, skipScrollIntoView }: any) => {
        const pages = await get('pages');
        const rotations = await get('rotations');
        if (typeof index === 'undefined') index = pages[pdfIndex].findIndex((value: any) => value === pageIndex);
        let newRotations = rotations;
        const currentRotation = rotations[pdfIndex][index];
        const newDegrees = currentRotation + 90 === 360
            ? 0
            : currentRotation + 90;
        newRotations[pdfIndex][index] = newDegrees;
        setRotations(newRotations);
        const nextPageIndex = pages[pdfIndex][index];
        setCurrent({
            pdfIndex,
            pageIndex: nextPageIndex,
            ...skipScrollIntoView && { skipScrollIntoView },
        });
        setStateChanged((oldState: number) => oldState + 1);
    }

    const handleMovePage = useCallback(async ({
        fromPdfIndex,
        fromPageIndex,
        fromRowIndex,
        toPdfIndex,
        toPageIndex,
        toRowIndex,
        toPlaceholderRow = false,
        toPlaceholderThumbnail = false
    }: any) => {
        if (timer) clearTimeout(timer);
        const pdfs = await get('pdfs');

        if (typeof toPdfIndex === 'undefined' && typeof toPageIndex === 'undefined') return;

        // if moving page inside the same pdfRow
        if (toPlaceholderThumbnail && fromPdfIndex === toPdfIndex) {
            const pages = await get('pages');
            const rotations = await get('rotations');
            let updatedPages = pages.slice();
            let updatedRotations = rotations.slice();
            const originalPage = pages[fromPdfIndex][fromRowIndex];
            const originalRotation = rotations[fromPdfIndex][fromRowIndex];

            console.log(`Moving from rowIndex ${fromRowIndex} to rowIndex ${toRowIndex}`);

            updatedPages[toPdfIndex].splice(fromRowIndex, 1, null);
            updatedPages[toPdfIndex].splice(toRowIndex, 0, originalPage);
            updatedPages[toPdfIndex] = updatedPages[toPdfIndex].filter((n: any) => n !== null);

            updatedRotations[toPdfIndex].splice(fromRowIndex, 1, null);
            updatedRotations[toPdfIndex].splice(toRowIndex, 0, originalRotation);
            updatedRotations[toPdfIndex] = updatedRotations[toPdfIndex].filter((n: any) => n !== null);

            setPages(updatedPages);
            setRotations(updatedRotations);

            setStateChanged((oldValue: number) => oldValue + 1);
            timer = setTimeout(() => setCurrent({
                pdfIndex: toPdfIndex,
                pageIndex: fromPageIndex,
                skipScrollIntoView: true,
            }), 150);
            return;
        }
        // if moving page to another pdfRow
        else {
            setIsLoading(true);
            console.log(`Moving page ${fromPageIndex} from pdf ${fromPdfIndex} to pdf ${toPdfIndex}`)
            // if moving down, we need to account for the fact that the page will be removed from the original PDF
            if (toPlaceholderRow && toPdfIndex > fromPdfIndex) toPdfIndex -= 1;

            const toPdfDoc = toPlaceholderRow
                ? await PDFDocument.create()
                : await PDFDocument.load(pdfs[toPdfIndex], { ignoreEncryption: true, parseSpeed: 1500 });
            const fromPdfDoc = await PDFDocument.load(pdfs[fromPdfIndex], { ignoreEncryption: true, parseSpeed: 1500 });

            // copy the moved page from PDF
            const [copiedPage] = await toPdfDoc.copyPages(fromPdfDoc, [fromPageIndex]);

            // insert the copied page to target PDF
            if (toPageIndex) toPdfDoc.insertPage(toPageIndex, copiedPage);
            else toPdfDoc.addPage(copiedPage);

            // remove the moved page from source PDF
            fromPdfDoc.removePage(fromPageIndex);

            // save the PDF files
            const URL = await fromPdfDoc.saveAsBase64({ dataUri: true });

            const URL2 = await toPdfDoc.saveAsBase64({ dataUri: true });

            let newTotalPages: any = totalPages
            newTotalPages[fromPdfIndex] = totalPages[fromPdfIndex] - 1
            newTotalPages[toPdfIndex] = toPlaceholderRow
                ? newTotalPages[toPdfIndex]
                : totalPages[toPdfIndex] + 1


            let newPdfs = pdfs
            newPdfs[fromPdfIndex] = URL
            newPdfs[toPdfIndex] = toPlaceholderRow
                ? newPdfs[toPdfIndex]
                : URL2

            // if source document is empty, remove it
            if (fromPdfDoc.getPageCount() === 1) {
                pdfFilenames.splice(fromPdfIndex, 1);
                newTotalPages.splice(fromPdfIndex, 1);
                newPdfs.splice(fromPdfIndex, 1);
            }

            // if moving to placeholder row, add a new placeholder row
            if (toPlaceholderRow) {
                pdfFilenames.splice(toPdfIndex, 0, 'Nieuw document')
                newTotalPages.splice(toPdfIndex, 0, 1);
                newPdfs.splice(toPdfIndex, 0, URL2);
            }

            setTotalPages(newTotalPages);
            setPdfs(newPdfs)
            setCurrent({ pdfIndex: toPdfIndex, pageIndex: toPageIndex ?? toPdfDoc.getPageCount() - 1 });
            setIsLoading(false);
            setStateChanged((oldValue: number) => oldValue + 1);
        }
    }, [pages]);

    const handleSaveDocument = useCallback(async (pdfIndex: number) => {
        setIsLoading(true);
        const pdfDoc = await PDFDocument.load(pdfs[pdfIndex], { ignoreEncryption: true, parseSpeed: 1500 });
        const base64 = await pdfDoc.saveAsBase64({ dataUri: false });

        const res = await fetch("https://devweb.docbaseweb.nl/api/files/uploadtodocbase", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                administrationCode: "1",
                pdfBase64: base64,
                fileName: pdfFilenames[pdfIndex],
                creationDate: new Date().toISOString(),
                pageCount: totalPages[pdfIndex],
            })
        });

        alert(JSON.stringify(res))

        setIsLoading(false);
        return base64
    }, []);

    const handleSaveAllDocuments = useCallback(async () => {
        setIsLoading(true);
        const pdfDocs = await Promise.all(pdfs.map(async (pdf: any) => await PDFDocument.load(pdf, { ignoreEncryption: true, parseSpeed: 1500 })));
        const base64s = await Promise.all(pdfDocs.map(async (pdfDoc: any) => await pdfDoc.saveAsBase64({ dataUri: false })));
        alert(JSON.stringify(base64s));
        setIsLoading(false);
    }, []);

    // ********************************************************
    // react-split
    // ********************************************************
    const [sizes, setSizes]: [any, any] = useState([35, 40, 25]);
    const [minSizes, setMinSizes] = useState([470, 480, 150]);
    const persistFileHandlerPanelSizes = useCallback((sizes: number[]) => {
        if (!sizes) return;
        const roundedSizes = sizes.map((size: number) => Math.round(size));
        setSizes(sizes);
    }, [sizes]);
    const getPersistedFileHandlerPanelSizes = () => {
        if (sizes) {
            const roundedSizes = sizes.map((size: number) => Math.round(size));
            return sizes;
        }
        else
            return undefined;
    };

    return (
        <>
            <Head>
                <title>PDF File Handler</title>
            </Head>

            <CurrentHandler />
            <LocalStateHandler />
            <KeyPressListener
                findArrayIndex={findArrayIndex}
                findPageIndex={findPageIndex}
                handleDeleteDocument={handleDeleteDocument}
                handleDeletePage={handleDeletePage}
                handleRotateDocument={handleRotateDocument}
                handleRotatePage={handleRotatePage}
                handleSplitDocument={handleSplitDocument}
            />

            <Loading inset={true} loading={isLoading} message={loadingMessage} />

            <ScrollDropTarget position='top' />

            <Debug
                sizes={sizes}
                totalPages={totalPages}
                current={current}
                rotations={rotations}
                pages={pages}
            />

            <header className={`fixed top-0 left-0 right-0 h-[100px] flex flex-row w-full bg-white shadow-sm border-body-bg-dark z-50 px-8 py-4 items-center gap-16`}>
                <div>
                    <img src="./whitevision.png" width={100} className="flex justify-center gap-2 text-lg" />
                    <h3 className="font-black mt-2 tracking-widest uppercase text-[9px] text-stone-700">
                        File Handler {process.env.NEXT_PUBLIC_BUILD_VERSION ?? ''}
                    </h3>
                </div>

                <div className={`grid gap-4 grid-cols-3 w-[600px]`}>
                    <ButtonXl
                        className={
                            `flex w-full flex-col gap-4 rounded-md text-stone-600 text-sm cursor-pointer bg-stone-100
                            ring-2 ring-dashed hover:ring-amber/40 p-4 ring-offset-4 ring-amber-300/50 relative`}
                        icon={<BsUpload className="text-base" />}
                        title="Upload"
                    >
                        <Drop />
                    </ButtonXl>
                    <ButtonXl
                        title={"Opslaan"}
                        icon={<BsSave className="text-base" />}
                        description="Download als PDF."
                        onClick={handleSaveAllDocuments}
                        className={!pdfs?.length ? 'disabled' : ''}
                    />
                    <ButtonXl
                        title={"Reset"}
                        icon={<BsArrowRepeat className="text-base" />}
                        description="Begin opnieuw."
                        onClick={handleReset}
                        className={!pdfs?.length ? 'disabled' : ''}
                    />
                </div>

                <div className="w-[200px] ml-auto text-right">
                    <label htmlFor="default-range" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                        Thumbnails grootte
                    </label>
                    <input id="default-range" type="range" value="50" step={1} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                </div>
            </header>

            <Split
                sizes={getPersistedFileHandlerPanelSizes()}
                minSize={minSizes}
                gutterSize={8}
                gutterAlign="center"
                className="flex flex-row w-full h-full gap-4 p-8 pb-0 pt-[132px]"
                onDragEnd={persistFileHandlerPanelSizes}
                cursor="col-resize"
            >
                {/* PDF row */}<section className={`flex flex-col text-stone-900 items-start overflow-y-scroll gap-y-8 w-full pb-8`}>
                    {pages.map((pdfIndices: Array<number>, pdfIndex: number) =>
                        <PdfRow
                            key={`pdf-${pdfIndex}`}
                            pdfIndex={pdfIndex}
                            pdf={pdfs[pdfIndex]}
                            filename={pdfFilenames[pdfIndex]}
                            pages={pdfIndices}
                            rotations={rotations[pdfIndex]}
                            totalPages={totalPages[pdfIndex]}
                            handleMovePage={handleMovePage}
                            handleSaveDocument={handleSaveDocument}
                            handleRotatePage={handleRotatePage}
                            handleDeletePage={handleDeletePage}
                            handleRotateDocument={handleRotateDocument}
                            handleDeleteDocument={handleDeleteDocument}
                        />
                    ).reverse()}
                </section>

                {/* PDF preview */}
                <LegacyPdfPreview rotation={rotations[current.pdfIndex]?.[findArrayIndex({ pdfIndex: current.pdfIndex, pageIndex: current.pageIndex })]} />

                {/* administration tiles */}
                <AdministrationTiles />
            </Split>

            <ScrollDropTarget position='bottom' />

            <ContextMenu
                handleDeletePage={handleDeletePage}
                handleRotatePage={handleRotatePage}
                handleSplitDocument={handleSplitDocument}
                handleRotateDocument={handleRotateDocument}
                handleDeleteDocument={handleDeleteDocument}
            />
        </>
    );
};
export default Home;