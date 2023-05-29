import { useAtom } from "jotai";
import { useEffect } from "react";
import { currentAtom, pagesAtom, pdfsAtom, totalPagesAtom } from "../store/atoms";

const thumbnailsPerRow = 4;
const defaultSteps = 1;

const KeyPressListener = ({ findRowIndex, findPageIndex, handleSplitDocument, handleDeleteDocument, handleDeletePage, handleRotateDocument, handleRotatePage }: any) => {
    const [current, setCurrent]: any = useAtom(currentAtom);
    const [totalPages]: any = useAtom(totalPagesAtom);
    const [pdfs] = useAtom(pdfsAtom);
    const [pages]: any = useAtom(pagesAtom);
    const currentIndex = findRowIndex(current);

    const getFirstPageIndex = (pdfIndex: number) => {
        return pages[pdfIndex][0];
    }
    const getLastPageIndex = (pdfIndex: number) => {
        return pages[pdfIndex][pages[pdfIndex].length - 1];
    }

    const moveLeft = (steps: number = defaultSteps) => {
        // if we are able to move left (not in first thumbnail)
        if (currentIndex >= steps) {
            setCurrent((oldValue: any) => {
                const prevPageIndex = findPageIndex({ pdfIndex: oldValue?.pdfIndex, index: currentIndex - steps });
                return ({ pdfIndex: oldValue?.pdfIndex, pageIndex: prevPageIndex });
            });
        }
        // if we are in first thumbnail -> go to next PDF if possible
        else if (current.pdfIndex < pdfs?.length - 1) {
            setCurrent((oldValue: any) => {
                const newPdfIndex = oldValue?.pdfIndex + 1;
                return ({ pdfIndex: newPdfIndex, pageIndex: getLastPageIndex(newPdfIndex) });
            });
        }
    }
    const moveRight = (steps: number = defaultSteps) => {
        // if we are able to move right
        if (currentIndex < totalPages[current?.pdfIndex] - steps) {
            setCurrent((oldValue: any) => {
                const nextPageIndex = findPageIndex({ pdfIndex: oldValue?.pdfIndex, index: currentIndex + steps });
                return ({ pdfIndex: oldValue?.pdfIndex, pageIndex: nextPageIndex });
            });
        }
        // if we are in last thumbnail -> go to previous PDF if possible
        else if (current?.pdfIndex > 0) {
            setCurrent((oldValue: any) => {
                const newPdfIndex = oldValue.pdfIndex - 1
                return ({ pdfIndex: newPdfIndex, pageIndex: getFirstPageIndex(newPdfIndex) });
            });
        }
    }

    // keypress listener
    useEffect(() => {
        const eventListener = async (event: any) => {
            switch (event.key) {
                case 'ArrowLeft':
                    moveLeft();
                    break;
                case 'ArrowRight':
                    moveRight();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    moveLeft(thumbnailsPerRow);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    moveRight(thumbnailsPerRow);
                    break;
                case ' ':
                    event.preventDefault();
                    await handleSplitDocument({ pdfIndex: current.pdfIndex, pageIndex: current.pageIndex });
                    break;
                case 'Delete':
                    await handleDeletePage({ pdfIndex: current.pdfIndex, pageIndex: current.pageIndex, skipScrollIntoView: true });
                    break;
                case 'Backspace':
                    await handleDeleteDocument(current?.pdfIndex);
                    break;
                case 'r':
                    await handleRotatePage({ pdfIndex: current.pdfIndex, pageIndex: current.pageIndex, skipScrollIntoView: true });
                    break;
                case 'R':
                    await handleRotateDocument({ pdfIndex: current?.pdfIndex });
                    break;
                default:
                    break;
            }
        }

        window.addEventListener('keydown', eventListener);

        return () => window.removeEventListener('keydown', eventListener);
    }, [current?.pdfIndex, current?.pageIndex, totalPages, pages, pages[current.pdfIndex]]);

    return <></>
}
export default KeyPressListener;