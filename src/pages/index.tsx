import { type NextPage } from "next";
import Head from "next/head";
import { get, del } from 'idb-keyval';

import { useCallback, useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import Loading from "@/components/layout/Loading";
import Debug from "@/components/layout/Debug";
import ScrollDropTarget from "@/components/layout/ScrollDropTarget";
import { useAtom, useSetAtom } from "jotai";
import { currentAtom, pagesAtom, isLoadingAtom, loadingMessageAtom, pdfFilenamesAtom, pdfsAtom, rotationsAtom, stateChangedAtom, openedRowsAtom, thumbnailsWidthAtom, thumbnailsPerRowAtom, splitSizesAtom } from "@/components/store/atoms";
import Split from 'react-split'
import AdministrationTiles from "@/components/AdministrationTiles";
import ContextMenu from "@/components/layout/ContextMenu";
import PdfRow from "@/components/PdfRow";
import LegacyPdfPreview from "@/components/LegacyPdfPreview";
import React from "react";
import KeyPressListener from "@/components/layout/KeyPressListener";
import LocalStateHandler from "@/components/layout/LocalStateHandler";
import CurrentHandler from "@/components/layout/CurrentHandler";
import Header from "@/components/layout/Header";
import InsetDragDropzone from "@/components/layout/InsetDragDropzone";

const Home: NextPage = () => {
    let timer: any = null;
    const [pdfFilenames, setPdfFilenames]: [Array<string>, any] = useAtom(pdfFilenamesAtom);
    const [pdfs]: any = useAtom(pdfsAtom);
    const setPdfs: any = useSetAtom(pdfsAtom);
    const [current]: any = useAtom(currentAtom);
    const setCurrent: any = useSetAtom(currentAtom);
    const [isLoading, setIsLoading]: [boolean, any] = useAtom(isLoadingAtom);
    const [loadingMessage]: any = useAtom(loadingMessageAtom);
    const [rotations, setRotations]: any = useAtom(rotationsAtom);
    const [pages, setPages]: any = useAtom(pagesAtom);
    const setStateChanged = useSetAtom(stateChangedAtom);
    const [openedRows, setOpenedRows]: any = useAtom(openedRowsAtom);
    const [newRowCounter, setNewRowCounter] = useState(1);

    const findRowIndex = ({ pdfIndex, pageIndex, inputPages = pages }: any) => {
        if (typeof inputPages?.[pdfIndex]?.[pageIndex] === 'undefined') return;
        return inputPages[pdfIndex].findIndex((value: any) => value === pageIndex);
    }
    const findPageIndex = ({ pdfIndex, index }: any) => {
        return pages[pdfIndex][index];
    }

    const handleReset = useCallback(async () => {
        if (!confirm('Verwijder alle documenten en bewerkingen?')) return;
        setPdfs([]);
        setPdfFilenames([]);
        setRotations([]);
        setCurrent({ pdfIndex: 0, pageIndex: 0 });
        setPages([]);
        setOpenedRows([]);

        await del('totalPages');
        await del('pdfFilenames');
        await del('pdfs');
        await del('rotations');
        await del('openedRows');
        await del('pages');

        setStateChanged((oldValue: number) => oldValue + 1);
    }, []);
    const handleSplitDocument = async ({ pdfIndex, pageIndex, skipScrollIntoView }: any) => {
        const pages = await get('pages');
        const rowIndex = pages[pdfIndex].findIndex((value: any) => value === pageIndex);

        if (rowIndex === 0) return;
        const duplicateState = (oldState: Array<any>) => {
            let updatedState = oldState;
            let originalRecord = oldState[pdfIndex];
            let duplicatedRecord = originalRecord;

            // slice the records
            if (Array.isArray(originalRecord)) {
                duplicatedRecord = originalRecord.slice(rowIndex);
                originalRecord = originalRecord.slice(0, rowIndex);
            }

            // insert / duplicate the record
            updatedState.splice(pdfIndex, 0, duplicatedRecord);
            updatedState[pdfIndex] = originalRecord;
            updatedState[pdfIndex + 1] = duplicatedRecord;
            return updatedState;
        }
        setPdfFilenames((oldValue: any) => duplicateState(oldValue));
        setRotations((oldValue: any) => duplicateState(oldValue));
        setPages((oldValue: any) => duplicateState(oldValue));
        setOpenedRows((oldValues: any) => {
            let updatedValues = oldValues.slice();
            updatedValues.splice(pdfIndex + 1, 0, true);
            return updatedValues;
        })
        setStateChanged((oldState: number) => oldState + 1);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => setCurrent({
            pdfIndex: pdfIndex + 1,
            pageIndex: pageIndex,
            ...(typeof skipScrollIntoView !== 'undefined') && { skipScrollIntoView },
        }), 250);
    }
    const handleDeleteDocument = async (inputPdfIndex: number) => {
        const confirmed = confirm('Dit document verwijderen? Bewerkingen zijn niet meer terug te halen.');
        if (!confirmed) return;

        setIsLoading(true);
        if (timer) clearTimeout(timer);

        // replace deleted page by an empty page in the PDF
        /*const pdfs = await get('pdfs');
                const pdfDoc = await PDFDocument.load(pdfs[0], { ignoreEncryption: true, parseSpeed: 1500 });
                const pages = await get('pages');
                for (let i = 0; i < pages[inputPdfIndex].length; i++) {
                    const currentPageIndex = pages[inputPdfIndex][i];
                    await pdfDoc.removePage(currentPageIndex);
                    await pdfDoc.insertPage(currentPageIndex, [1, 1]);
                };
                const updatedPdf = await pdfDoc.saveAsBase64({ dataUri: true });
                setPdfs([updatedPdf]);*/

        setPdfFilenames((oldValues: any) => oldValues.filter((_: any, index: number) => index !== inputPdfIndex));
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
        setOpenedRows((oldValues: Array<boolean>) => {
            let updatedValues = oldValues.slice();
            updatedValues = updatedValues.filter((value: boolean, index: number) => index !== inputPdfIndex);
            return updatedValues;
        });
        timer = setTimeout(() => setCurrent({
            pdfIndex: (inputPdfIndex > 0) ? inputPdfIndex - 1 : 0,
            pageIndex: 0,
        }), 400);

        // clear [pdfs] if this is the last document
        const pages = await get('pages');
        if (pages.length === 1) setPdfs([]);

        setIsLoading(false);
        setStateChanged((oldValue: number) => oldValue + 1);
    }
    const handleDeletePage = useCallback(async ({ pdfIndex, pageIndex, index, skipScrollIntoView }: any) => {
        if (timer) clearTimeout(timer);
        const pages = await get('pages');
        if (typeof index === 'undefined') index = pages[pdfIndex].findIndex((value: any) => value === pageIndex);
        const nextPageIndex = pages[pdfIndex][index + 1];

        // replace deleted page by an empty page in the PDF
        /*
        const pdfs = await get('pdfs');
        const pdfDoc = await PDFDocument.load(pdfs[0], { ignoreEncryption: true, parseSpeed: 1500 });
        pdfDoc.removePage(pageIndex);
        pdfDoc.insertPage(pageIndex);
        const newPdf = await pdfDoc.saveAsBase64({ dataUri: true });
        setPdfs([newPdf]);
    */
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
        setStateChanged((oldState: number) => oldState + 1);
        timer = setTimeout(() => setCurrent({
            pdfIndex,
            pageIndex: nextPageIndex,
            ...skipScrollIntoView && { skipScrollIntoView },
        }), 400);
    }, [current.pdfIndex, current.pageIndex, pages, pdfs, rotations]);
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
        if (typeof toPdfIndex === 'undefined' && typeof toPageIndex === 'undefined') return;

        const pages = await get('pages');
        const rotations = await get('rotations');
        let updatedPages = pages.slice();
        let updatedRotations = rotations.slice();
        const originalPage = pages[fromPdfIndex][fromRowIndex];
        const originalRotation = rotations[fromPdfIndex][fromRowIndex];
        let skipScrollIntoView = true;

        console.log(`Moving from rowIndex ${fromRowIndex} to rowIndex ${toRowIndex}`);

        // insert a new pdf-row if we are moving to a placeholder row
        if (toPlaceholderRow) {
            updatedPages.splice(toPdfIndex, 0, []);
            updatedRotations.splice(toPdfIndex, 0, []);
            setOpenedRows((oldValue: Array<boolean>) => {
                let updatedValue = oldValue.slice();
                updatedValue.splice(toPdfIndex, 0, true);
                return updatedValue;
            });
            setPdfFilenames((oldValues: Array<string>) => {
                let newValues = oldValues.slice();
                newValues.splice(toPdfIndex, 0, `Nieuw document ${newRowCounter}.pdf`);
                return newValues;
            });
            setNewRowCounter((oldValue: number) => oldValue + 1);
        }

        // rowIndex last
        if (toRowIndex === 'last') {
            toRowIndex = pages[toPdfIndex].length;
            skipScrollIntoView = false;
        }

        updatedPages[fromPdfIndex].splice(fromRowIndex, 1, null);
        updatedPages[toPdfIndex].splice(toRowIndex, 0, originalPage);
        updatedPages[fromPdfIndex] = updatedPages[fromPdfIndex].filter((n: any) => n !== null);

        updatedRotations[fromPdfIndex].splice(fromRowIndex, 1, null);
        updatedRotations[toPdfIndex].splice(toRowIndex, 0, originalRotation);
        updatedRotations[fromPdfIndex] = updatedRotations[fromPdfIndex].filter((n: any) => n !== null);

        let newCurrentPdfIndex = toPdfIndex;

        // if donor document is empty, remove it
        if (!updatedPages[fromPdfIndex].length) {
            updatedPages.splice(fromPdfIndex, 1);
            updatedRotations.splice(fromPdfIndex, 1);
            newCurrentPdfIndex = (fromPdfIndex > toPdfIndex)
                ? toPdfIndex
                : fromPdfIndex;
        }

        timer = setTimeout(() => setCurrent({
            pdfIndex: newCurrentPdfIndex,
            pageIndex: fromPageIndex,
            skipScrollIntoView,
        }), 150);
        setPages(updatedPages);
        setRotations(updatedRotations);
        setStateChanged((oldValue: number) => oldValue + 1);
    }, [pages]);

    const handleSaveDocument = useCallback(async (pdfIndex: number = 0) => {
        setIsLoading(true);
        const pages = await get('pages');
        const pdfs = await get('pdfs');
        const completePdfDoc = await PDFDocument.load(pdfs[0], { ignoreEncryption: true, parseSpeed: 1500 });
        const pdfDoc = await PDFDocument.create();
        const copiedPages = await pdfDoc.copyPages(completePdfDoc, pages[pdfIndex]);
        copiedPages.forEach((page) => pdfDoc.addPage(page));
        const base64 = await pdfDoc.saveAsBase64({ dataUri: false });
        setIsLoading(false);
        return base64;
    }, [pages]);

    const handleSaveAllDocuments = async () => {
        setIsLoading(true);
        const pdf = pdfs[0];
        const newTab = window.open();
        newTab?.document.write(
            "<iframe width='100%' height='100%' src='" + pdf + "'></iframe>"
        )
        setIsLoading(false);
    }

    // ********************************************************
    // react-split
    // ********************************************************
    const [splitSizes, setSplitSizes] = useAtom(splitSizesAtom);
    const [minSizes] = useState([470, 480, 150]);
    const persistFileHandlerPanelSizes = useCallback((newSplitSizes: Array<number>) => {
        if (!newSplitSizes) return;
        const roundedSizes = newSplitSizes.map((size: number) => Math.round(size));
        setSplitSizes(newSplitSizes);
    }, [splitSizes]);
    const getPersistedFileHandlerPanelSizes = () => {
        if (splitSizes) {
            const roundedSizes = splitSizes.map((size: number) => Math.round(size));
            return splitSizes;
        }
        else return undefined;
    };
    const pdfRowsRef: any = useRef(null);
    const [thumbnailWidth]: any = useAtom(thumbnailsWidthAtom);
    const setThumbnailsPerRow = useSetAtom(thumbnailsPerRowAtom);

    const calculateThumbnailsWidth = () => {
        const pdfRowsWidth = pdfRowsRef.current.getBoundingClientRect().width;
        const bordersWidth = 2;
        const px = 32;
        const thumbnailsContainerWidth = pdfRowsWidth - bordersWidth - px;
        const thumbnailsContainerGap = 4;
        let newThumbnailsPerRow = Math.floor(thumbnailsContainerWidth / thumbnailWidth);
        const gapInBetween = (newThumbnailsPerRow - 1) * thumbnailsContainerGap;
        const checkWidth = (newThumbnailsPerRow * thumbnailWidth) + gapInBetween + bordersWidth + px;
        if (checkWidth > pdfRowsWidth) newThumbnailsPerRow = newThumbnailsPerRow - 1;

        console.log(`Updated thumbnailsPerRow: ${newThumbnailsPerRow}`);

        setThumbnailsPerRow(newThumbnailsPerRow);
    }

    useEffect(() => {
        calculateThumbnailsWidth();
    }, [splitSizes, pdfRowsRef?.current?.getBoundingClientRect()?.width, thumbnailWidth])
    useEffect(() => {
        window.addEventListener('resize', calculateThumbnailsWidth);

        return () => {
            window.removeEventListener('resize', calculateThumbnailsWidth);
        }
    }, [])

    return (
        <>
            <Head>
                <title>PDF File Handler</title>
            </Head>

            <Loading inset={true} loading={isLoading} message={loadingMessage} />

            <ScrollDropTarget position='top' />

            <Debug
                splitSizes={splitSizes}
                current={current}
                rotations={rotations}
                pages={pages}
                pdfFilenames={pdfFilenames}
                openedRows={openedRows}
            />

            <Header
                handleSaveAllDocuments={handleSaveAllDocuments}
                handleReset={handleReset}
            />

            <Split
                sizes={getPersistedFileHandlerPanelSizes()}
                minSize={minSizes}
                gutterSize={8}
                gutterAlign="center"
                className="flex flex-row w-full h-full gap-4 p-8 pb-0 pt-[132px]"
                onDragEnd={persistFileHandlerPanelSizes}
                cursor="col-resize"
            >
                {/* PDF rows */}
                <section ref={pdfRowsRef} className={`flex flex-col text-stone-900 items-start gap-y-8 w-full pb-40`}>
                    {pages.map((_: any, pdfIndex: number) =>
                        <PdfRow
                            key={`pdf-${pdfIndex}`}
                            pdfIndex={pdfIndex}
                            filename={pdfFilenames[pdfIndex]}
                            pages={pages[pdfIndex]}
                            rotations={rotations[pdfIndex]}
                            handleMovePage={handleMovePage}
                            handleSaveDocument={handleSaveDocument}
                            handleRotatePage={handleRotatePage}
                            handleDeletePage={handleDeletePage}
                            handleRotateDocument={handleRotateDocument}
                            handleDeleteDocument={handleDeleteDocument}
                            opened={openedRows?.[pdfIndex]}
                            setOpenedRows={setOpenedRows}
                            inputPdf={pdfs[0]}
                        />
                    ).reverse()}
                </section>

                {/* PDF preview */}
                <LegacyPdfPreview
                    rotation={rotations[current.pdfIndex]?.[pages[current.pdfIndex].findIndex((value: any) => value === current.pageIndex)]}
                />

                {/* administration tiles */}
                <AdministrationTiles handleSaveDocument={handleSaveDocument} />
            </Split>

            <ScrollDropTarget position='bottom' />

            <InsetDragDropzone />
            <ContextMenu
                handleDeletePage={handleDeletePage}
                handleRotatePage={handleRotatePage}
                handleSplitDocument={handleSplitDocument}
                handleRotateDocument={handleRotateDocument}
                handleDeleteDocument={handleDeleteDocument}
            />
            <CurrentHandler />
            <LocalStateHandler />
            <KeyPressListener
                findRowIndex={findRowIndex}
                findPageIndex={findPageIndex}
                handleDeleteDocument={handleDeleteDocument}
                handleDeletePage={handleDeletePage}
                handleRotateDocument={handleRotateDocument}
                handleRotatePage={handleRotatePage}
                handleSplitDocument={handleSplitDocument}
            />
        </>
    );
};
export default Home;