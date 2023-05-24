import { useAtom } from "jotai";
import { useEffect } from "react";
import { currentAtom, pdfsAtom, totalPagesAtom } from "../store/atoms";

const KeyPressListener = ({ handleSplitDocument, handleDeleteDocument, handleDuplicateDocument, handleDeletePage, handleRotateDocument, handleRotatePage }: any) => {
    const [current, setCurrent]: any = useAtom(currentAtom);
    const [totalPages]: any = useAtom(totalPagesAtom);
    const [pdfs] = useAtom(pdfsAtom);

    // keypress listener
    useEffect(() => {
        const eventListener = async (event: any) => {
            switch (event.key) {
                case 'ArrowLeft':
                    if (current?.pageIndex > 0) setCurrent((oldValue: any) => ({ pdfIndex: oldValue?.pdfIndex, pageIndex: oldValue?.pageIndex - 1 }));
                    else if (current?.pdfIndex > 0) setCurrent((oldValue: any) => ({ pdfIndex: oldValue?.pdfIndex - 1, pageIndex: totalPages[oldValue?.pdfIndex - 1] - 1 }));
                    break;
                case 'ArrowRight':
                    if (current?.pageIndex < totalPages[current?.pdfIndex] - 1) {
                        setCurrent((oldValue: any) => ({ pdfIndex: oldValue?.pdfIndex, pageIndex: oldValue?.pageIndex + 1 }));
                    } else if (current?.pdfIndex < pdfs?.length - 1) {
                        setCurrent((oldValue: any) => ({ pdfIndex: oldValue?.pdfIndex + 1, pageIndex: 0 }));
                    }
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    if (current?.pageIndex > 3) setCurrent((oldValue: any) => {
                        const newPdfIndex = oldValue?.pdfIndex;
                        const newPageIndex = oldValue?.pageIndex - 4;
                        return ({ pdfIndex: newPdfIndex, pageIndex: newPageIndex });
                    });
                    else if (current?.pdfIndex > 0) setCurrent((oldValue: any) => {
                        const newPdfIndex = oldValue?.pdfIndex - 1;
                        const newPageIndex = totalPages[oldValue?.pdfIndex - 1] - 1;
                        return ({ pdfIndex: newPdfIndex, pageIndex: newPageIndex });
                    });
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    if (current?.pageIndex < totalPages[current?.pdfIndex] - 4) setCurrent((oldValue: any) => {
                        const newPdfIndex = oldValue?.pdfIndex;
                        const newPageIndex = oldValue?.pageIndex + 4;
                        return ({ pdfIndex: newPdfIndex, pageIndex: newPageIndex });
                    });
                    else if (current?.pdfIndex < pdfs?.length - 1) setCurrent((oldValue: any) => {
                        const newPdfIndex = oldValue?.pdfIndex + 1;
                        const newPageIndex = 0;
                        return ({ pdfIndex: newPdfIndex, pageIndex: newPageIndex });
                    });
                    else if (current?.pageIndex < totalPages[current?.pdfIndex] - 1) setCurrent((oldValue: any) => {
                        const newPdfIndex = oldValue?.pdfIndex;
                        const newPageIndex = totalPages[oldValue?.pdfIndex] - 1;
                        return ({ pdfIndex: newPdfIndex, pageIndex: newPageIndex });
                    });
                    break;
                case ' ':
                    event.preventDefault();
                    await handleDuplicateDocument(current.pdfIndex);
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
                    await handleRotateDocument(current?.pdfIndex);
                    break;
                default:
                    break;
            }
        }

        window.addEventListener('keydown', eventListener);

        return () => window.removeEventListener('keydown', eventListener);
    }, [current?.pdfIndex, current?.pageIndex, totalPages]);

    return <></>
}
export default KeyPressListener;