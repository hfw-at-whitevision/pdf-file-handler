import { type NextPage } from "next";
import Head from "next/head";
import { get, set, del } from 'idb-keyval';

import { useCallback, useState } from "react";
import Drop from "@/components/layout/Drop";
import { PDFDocument, degrees } from "pdf-lib";
import ButtonXl from "@/components/primitives/ButtonXl";
import { BsSave, BsArrowRepeat } from "react-icons/bs";
import Loading from "@/components/layout/Loading";
import Debug from "@/components/layout/Debug";
import ScrollDropTarget from "@/components/layout/ScrollDropTarget";
import { useAtom } from "jotai";
import { currentAtom, pagesAtom, isLoadingAtom, loadingMessageAtom, pdfFilenamesAtom, pdfsAtom, rotationsAtom, setCurrentAtom, setPdfsAtom, setStateChangedAtom, stateChangedAtom, totalPagesAtom, userIsDraggingAtom } from "@/components/store/atoms";
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
    const [pdfFilenames, setPdfFileNames]: [Array<string>, any] = useAtom(pdfFilenamesAtom);
    const [pdfs]: any = useAtom(pdfsAtom);
    const [, setPdfs] = useAtom(setPdfsAtom);
    const [current]: any = useAtom(currentAtom);
    const [, setCurrent] = useAtom(setCurrentAtom);
    const [totalPages, setTotalPages]: [any, any] = useAtom(totalPagesAtom);
    const [isLoading, setIsLoading]: [boolean, any] = useAtom(isLoadingAtom);
    const [loadingMessage]: any = useAtom(loadingMessageAtom);
    const [rotations, setRotations]: any = useAtom(rotationsAtom);
    const [pages, setPages]: any = useAtom(pagesAtom);
    const [, setStateChanged] = useAtom(setStateChangedAtom);

    const findIndex = ({ pdfIndex, pageIndex }: any) => {
        if (typeof pages?.[pdfIndex]?.[pageIndex] === 'undefined') return;
        return pages[pdfIndex].findIndex((value: any) => value === pageIndex);
    }
    const handleReset = useCallback(async () => {
        setPdfs([]);
        setTotalPages([]);
        setPdfFileNames([]);
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

    const handleDeleteDocument = useCallback((inputPdfIndex: number) => {
        setIsLoading(true);

        if (current.pdfIndex === inputPdfIndex && current.pdfIndex === pdfs?.length - 1 && current.pdfIndex > 0) {
            setCurrent({ pdfIndex: current.pdfIndex - 1, pageIndex: 0 });
        }

        setPdfs((oldPdfs: any) => oldPdfs.filter((_: any, index: number) => index !== inputPdfIndex));
        setTotalPages((oldTotalPages: any) => oldTotalPages.filter((_: any, index: number) => index !== inputPdfIndex));
        setPdfFileNames((oldPdfFileNames: any) => oldPdfFileNames.filter((_: any, index: number) => index !== inputPdfIndex));
        setPages((oldPages: any) => {
            if (oldPages?.length === 1) return [];
            let updatedPages = oldPages;
            updatedPages = updatedPages.filter((_: any, index: any) => index === inputPdfIndex);
            return updatedPages;
        });
        setRotations((oldValue: any) => {
            if (oldValue?.length === 1) return [];
            let updatedValue = oldValue;
            updatedValue = updatedValue.filter((_: any, index: any) => index === inputPdfIndex);
            return updatedValue;
        });
        setCurrent({
            pdfIndex: (inputPdfIndex === pdfs?.length - 1 && inputPdfIndex > 0)
                ? inputPdfIndex - 1
                : inputPdfIndex,
            pageIndex: 0
        });

        setIsLoading(false);
        setStateChanged((oldValue: number) => oldValue + 1);
    }, [pages]);

    const handleDeletePage = ({ pdfIndex, pageIndex, index, skipScrollIntoView }: any) => {
        if (typeof index === 'undefined') index = pages[pdfIndex].findIndex((value: any) => value === pageIndex);
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
        const nextPageIndex = pages[pdfIndex][index];
        setCurrent({
            pdfIndex,
            pageIndex: nextPageIndex,
            ...skipScrollIntoView && { skipScrollIntoView },
        });
    };
    const handleDeletePage0 = useCallback(async (pdfIndex: number, pageIndex: number) => {
        setIsLoading(true);
        const totalPages = await get('totalPages');
        const pdfs = await get('pdfs');
        const rotations = await get('rotations');
        // if we are deleting the last page in PDF = delete the PDF
        if (totalPages[pdfIndex] === 1) {
            handleDeleteDocument(pdfIndex);
            return;
        }

        console.log(`Deleting page ${pageIndex} from document ${pdfIndex}`);

        const pdfDoc = await PDFDocument.load(pdfs[pdfIndex], {
            ignoreEncryption: true, parseSpeed: 1500
        });
        pdfDoc.removePage(pageIndex);
        const URL = await pdfDoc.saveAsBase64({ dataUri: true });
        setPdfs((oldPdfs: Array<string>) => {
            let newPdfs = oldPdfs
            newPdfs[pdfIndex] = URL
            return newPdfs
        });
        setTotalPages((oldTotalPages: any) => {
            let newTotalPages: Array<number> = oldTotalPages
            newTotalPages[pdfIndex] = oldTotalPages[pdfIndex] - 1
            return newTotalPages as any
        });
        setCurrent({
            pdfIndex,
            pageIndex: (pageIndex === totalPages[pdfIndex] - 1)
                ? pageIndex - 1
                : pageIndex
        });
        let updatedRotations = rotations;
        updatedRotations[pdfIndex] = updatedRotations[pdfIndex].splice(pageIndex, 1);
        setRotations(updatedRotations);
        setIsLoading(false);
        setStateChanged((oldValue: number) => oldValue + 1);
    }, []);

    const handleRotateDocument = useCallback(async (inputPdfIndex: number) => {
        setIsLoading(true);
        console.log(`Rotating document ${inputPdfIndex}`)

        const pdfs = await get('pdfs');
        const pdfDoc = await PDFDocument.load(pdfs[inputPdfIndex], {
            ignoreEncryption: true, parseSpeed: 1500
        });
        const pages = pdfDoc.getPages();
        let pdfRotations = rotations[inputPdfIndex];

        pages.forEach((page, pageIndex) => {
            const currentPageRotation = page.getRotation().angle;
            const newDegrees = (currentPageRotation + 90 === 360)
                ? 0
                : currentPageRotation + 90;
            page.setRotation(degrees(newDegrees));
            pdfRotations[pageIndex] = newDegrees;
        });

        const URL = await pdfDoc.saveAsBase64({ dataUri: true });

        setPdfs((oldPdfs: any) => {
            let newPdfs = oldPdfs
            newPdfs[inputPdfIndex] = URL
            return newPdfs
        });
        setRotations((oldValues: any) => oldValues.splice(inputPdfIndex, 1, pdfRotations));
        setIsLoading(false);
        setStateChanged((oldValue: number) => oldValue + 1);
        console.log('finished')
    }, [rotations]);

    const handleRotatePage = async ({ pdfIndex, pageIndex, index, skipScrollIntoView }: any) => {
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
    };
    const handleRotatePage0 = useCallback(async ({ pdfIndex, pageIndex }: any) => {
        setIsLoading(true);
        const pdfs = await get('pdfs');
        const pdfDoc = await PDFDocument.load(pdfs[pdfIndex], {
            ignoreEncryption: true, parseSpeed: 1500
        });
        const pages = pdfDoc.getPages();
        const currentPage = pages[pageIndex];
        if (!currentPage) return;
        console.log(`Rotating page ${pageIndex} from document ${pdfIndex}`)

        const currentPageRotation = currentPage?.getRotation().angle ?? 0;
        const newDegrees = currentPageRotation + 90 === 360
            ? 0
            : currentPageRotation + 90;
        let newRotations = rotations;

        currentPage.setRotation(degrees(newDegrees));
        newRotations[pdfIndex][pageIndex] = newDegrees;

        const URL = await pdfDoc.saveAsBase64({ dataUri: true });
        setPdfs((oldPdfs: any) => {
            let newPdfs = oldPdfs
            newPdfs[pdfIndex] = URL
            return newPdfs
        });
        setRotations(newRotations);
        setCurrent({ pdfIndex, pageIndex, skipScrollIntoView: true });
        setIsLoading(false);
        setStateChanged((oldValue: number) => oldValue + 1);
    }, [rotations]);

    const handleMovePage = useCallback(async ({
        fromPdfIndex,
        fromPageIndex,
        toPdfIndex,
        toPageIndex,
        toPlaceholderRow = false,
        toPlaceholderThumbnail = false
    }: any) => {
        setIsLoading(true);
        const pdfs = await get('pdfs');

        if (typeof toPdfIndex === 'undefined' && typeof toPageIndex === 'undefined') return;

        if (toPlaceholderThumbnail && fromPdfIndex === toPdfIndex) {
            const pdfDoc = await PDFDocument.load(pdfs[fromPdfIndex], { ignoreEncryption: true, parseSpeed: 1500, });
            const [currentPage]: any = await pdfDoc.copyPages(pdfDoc, [fromPageIndex]);
            pdfDoc.insertPage(toPageIndex, currentPage);
            await pdfDoc.save();
            // if moving up, we need to account for the fact that the page will be removed from the original PDF
            pdfDoc.removePage(toPageIndex < fromPageIndex ? fromPageIndex + 1 : fromPageIndex);
            const URL = await pdfDoc.saveAsBase64({ dataUri: true });
            setPdfs((oldPdfs: any) => {
                let newPdfs = oldPdfs
                newPdfs[fromPdfIndex] = URL
                return newPdfs
            });
            setCurrent({
                pdfIndex: fromPdfIndex,
                pageIndex:
                    (toPageIndex < fromPageIndex)
                        ? toPageIndex
                        : toPageIndex - 1
            });

            setIsLoading(false);
            setStateChanged((oldValue: number) => oldValue + 1);

            return;
        }

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
    }, []);

    const handleSplitDocument = useCallback(async ({ pdfIndex, pageIndex }: any) => {
        if (pageIndex === 0) return;

        setIsLoading(true);

        const pdfs = await get('pdfs')
        const toPdfDoc = await PDFDocument.create()
        const fromPdfDoc = await PDFDocument.load(pdfs[pdfIndex], { ignoreEncryption: true, parseSpeed: 1500 });

        const pagesToMove = fromPdfDoc.getPageIndices().slice(pageIndex)

        // copy the moved page from PDF
        const copiedPages = await toPdfDoc.copyPages(fromPdfDoc, pagesToMove);
        pagesToMove.forEach((_, index) => toPdfDoc.addPage(copiedPages[index]));

        // remove the moved pages from source PDF
        for (let i = 0; i < pagesToMove.length; i++) {
            fromPdfDoc.removePage(totalPages[pdfIndex] - i - 1);
        }

        // save the PDF files
        const URL = await fromPdfDoc.saveAsBase64({ dataUri: true });

        const URL2 = await toPdfDoc.saveAsBase64({ dataUri: true });

        let newTotalPages: any = totalPages
        newTotalPages[pdfIndex] = totalPages[pdfIndex] - pagesToMove.length

        let newPdfs = pdfs
        newPdfs[pdfIndex] = URL

        // if source document is empty, remove it
        if (fromPdfDoc.getPageCount() === 1) {
            pdfFilenames.splice(pdfIndex, 1);
            newTotalPages.splice(pdfIndex, 1);
            newPdfs.splice(pdfIndex, 1);
        }

        // add a new document right below the current document
        pdfFilenames.splice(pdfIndex + 1, 0, 'Nieuw document')
        newTotalPages.splice(pdfIndex + 1, 0, pagesToMove.length);
        newPdfs.splice(pdfIndex + 1, 0, URL2);

        setTotalPages(newTotalPages);
        setPdfs(newPdfs)
        setCurrent({ pdfIndex: pdfIndex + 1, pageIndex: 0 });
        setIsLoading(false);
        setStateChanged((oldValue: number) => oldValue + 1);
    }, []);

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

            <main className={`flex flex-1 gap-8 p-8 w-full first-letter:${pdfs ? "flex-row" : "flex-col items-center justify-center"}`}>
                <header className={`flex flex-1 flex-col w-full max-w-[200px]`}>
                    <nav className="sticky top-8">
                        <img src="./whitevision.png" width={150} className="flex justify-center gap-2 text-lg" />
                        <h3 className="font-black mt-2 tracking-widest uppercase mb-8 text-[9px] text-stone-700">
                            File Handler {process.env.NEXT_PUBLIC_BUILD_VERSION ?? ''}
                        </h3>

                        <div className={`grid gap-4 mt-6 w-full ${!pdfs ? "grid-cols-1" : "grid-cols-1"}`}>
                            <Drop />
                            <ButtonXl
                                title={"Opslaan"}
                                icon={<BsSave className="text-base" />}
                                description="Maak alle wijzigingen ongedaan en reset naar de oorspronkelijke PDF."
                                onClick={handleSaveAllDocuments}
                                className={!pdfs?.length ? 'disabled' : ''}
                            />
                            <ButtonXl
                                title={"Reset"}
                                icon={<BsArrowRepeat className="text-base" />}
                                description="Maak alle wijzigingen ongedaan en reset naar de oorspronkelijke PDF."
                                onClick={handleReset}
                                className={!pdfs?.length ? 'disabled' : ''}
                            />
                        </div>
                    </nav>
                </header>
                <Split
                    sizes={getPersistedFileHandlerPanelSizes()}
                    minSize={[150, 0, 150]}
                    gutterSize={8}
                    gutterAlign="center"
                    className="flex flex-row w-full h-full flex-1"
                    onDragEnd={persistFileHandlerPanelSizes}
                    cursor="col-resize"
                >
                    {/* PDF row */}
                    <section className={`flex flex-col text-stone-900 items-start overflow-y-scroll gap-y-8 w-full`}>
                        {new Array(totalPages?.length).fill(1).map((_: any, pdfIndex: number) =>
                            <PdfRow
                                key={`pdf-${pdfIndex}`}
                                pdfIndex={pdfIndex}
                                pdf={pdfs[pdfIndex]}
                                filename={pdfFilenames[pdfIndex]}
                                pages={pages[pdfIndex]}
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
                    <LegacyPdfPreview rotation={rotations[current.pdfIndex]?.[findIndex({ pdfIndex: current.pdfIndex, pageIndex: current.pageIndex })]} />

                    {/* administration tiles */}
                    <AdministrationTiles />
                </Split>
            </main>

            <ScrollDropTarget position='bottom' />

            <ContextMenu
                handleDeletePage={handleDeletePage}
                handleRotatePage={handleRotatePage}
            />
        </>
    );
};
export default Home;