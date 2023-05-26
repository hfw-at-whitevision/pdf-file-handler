import React from "react";
import { useState, useEffect } from "react";
import { BsCheck2All, BsLayoutSplit, BsTrash } from "react-icons/bs";
import { GrRotateRight } from "react-icons/gr";

const ContextMenu = ({ handleDeletePage, handleRotateDocument, handleRotatePage, handleSplitDocument, handleDeleteDocument }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);
    const allowedClicks = ['thumbnail', 'row']

    const [pdfIndex, setPdfIndex] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);

    const handleRightClick = (e: any) => {
        const clickedElementId = e.target.getAttribute('id');
        if (!clickedElementId || !allowedClicks.some(v => clickedElementId?.includes(v))) return;

        e.preventDefault();

        const clickedPdfIndex = parseInt(e.target.getAttribute('data-pdf-index'));
        const clickedPageIndex = parseInt(e.target.getAttribute('data-page-index'));

        setPdfIndex(clickedPdfIndex);
        setPageIndex(clickedPageIndex);

        setIsOpen(true);
        setTop(e.clientY);
        setLeft(e.clientX);
    };

    const handleLeftClick = async (e: any) => {
        setIsOpen(false);
        const clickedContextMenuItem = e.target.getAttribute('id');
        const allActions = contextMenuItems.map((item: any) => item.action);
        if (!allActions.includes(clickedContextMenuItem)) return;

        const clickedPdfIndex = parseInt(e.target.getAttribute('data-pdf-index'));
        const clickedPageIndex = parseInt(e.target.getAttribute('data-page-index'));

        switch (clickedContextMenuItem) {
            case 'split':
                console.log(`Splitting pdf-${clickedPdfIndex} from pageIndex ${clickedPageIndex}`);
                await handleSplitDocument({ pdfIndex: clickedPdfIndex, pageIndex: clickedPageIndex });
                break;
            case 'delete':
                console.log(`Deleting pdf-${clickedPdfIndex}-${clickedPageIndex}`);
                await handleDeletePage({ pdfIndex: clickedPdfIndex, pageIndex: clickedPageIndex, skipScrollIntoView: true });
                break;
            case 'rotate':
                console.log(`Rotating pdf-${clickedPdfIndex}-${clickedPageIndex}`);
                await handleRotatePage({
                    pdfIndex: clickedPdfIndex,
                    pageIndex: clickedPageIndex,
                    skipScrollIntoView: true,
                });
                break;
            case 'rotateDocument':
                await handleRotateDocument({ pdfIndex: clickedPdfIndex });
                break;
            case 'deleteDocument':
                await handleDeleteDocument(clickedPdfIndex);
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        document.addEventListener('click', async (e) => await handleLeftClick(e));
        document.addEventListener('contextmenu', handleRightClick);

        return () => {
            document.removeEventListener('click', async (e) => await handleLeftClick(e));
            document.removeEventListener('contextmenu', handleRightClick);
        };
    }, []);

    if (!isOpen) return null;
    return (<div
        className={
            `fixed z-50 bg-white text-white text-lg font-bold w-[300px] shadow-md rounded-md border border-stone-200
                grid grid-cols-1 divide-y divide-stone-200`
        }
        style={{ top, left }}
    >
        {
            contextMenuItems.map((item, i) =>
                <div
                    id={item.action}
                    key={`context-menu-item-${i}`}
                    data-pdf-index={pdfIndex}
                    data-page-index={pageIndex}
                    className="flex items-center gap-4 text-text-dark text-base font-normal py-4 px-6 hover:bg-body-bg-dark cursor-pointer"
                >
                    {
                        item?.icon
                            ? <item.icon />
                            : null
                    }

                    {item.title}
                </div>
            )
        }
    </div>)
}
export default ContextMenu;

const contextMenuItems = [
    {
        icon: BsLayoutSplit,
        title: 'Splits document vanaf deze pagina',
        action: 'split',
        for: ['thumbnail', 'row'],
    },
    {
        icon: GrRotateRight,
        title: 'Roteer pagina',
        action: 'rotate',
        for: ['thumbnail', 'row'],
    },
    {
        icon: BsTrash,
        title: 'Verwijder pagina',
        action: 'delete',
        for: ['thumbnail', 'row'],
    },
    {
        icon: GrRotateRight,
        title: 'Roteer geheel document',
        action: 'rotateDocument',
        for: ['thumbnail', 'row'],
    },
    {
        icon: BsTrash,
        title: 'Verwijder geheel document',
        action: 'deleteDocument',
        for: ['thumbnail', 'row'],
    },
    {
        icon: BsCheck2All,
        title: 'Stuur document naar administratie',
        action: 'processDocument',
        for: ['thumbnail', 'row'],
    },
]