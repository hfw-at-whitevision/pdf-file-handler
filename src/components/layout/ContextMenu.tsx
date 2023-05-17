import React from "react";
import { useState, useEffect } from "react";
import { BsTrash } from "react-icons/bs";
import { GrRotateRight } from "react-icons/gr";

const ContextMenu = ({ handleDeletePage, handleRotatePage }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);

    const [pdfIndex, setPdfIndex] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);

    const contextMenuItems = [
        {
            id: 0,
            icon: BsTrash,
            title: 'Verwijder pagina',
            action: 'delete',
        },
        {
            id: 1,
            icon: GrRotateRight,
            title: 'Roteer pagina',
            action: 'rotate',
        },
    ]

    const handleRightClick = (e: any) => {
        const clickedElementId = e.target.getAttribute('id');
        if (!clickedElementId?.includes('thumbnail-')) return;

        e.preventDefault();

        const clickedPdfIndex = parseInt(e.target.getAttribute('data-pdf-index'));
        const clickedPageIndex = parseInt(e.target.getAttribute('data-page-index'));

        setPdfIndex(clickedPdfIndex);
        setPageIndex(clickedPageIndex);

        console.log(`rmb clicked: ${clickedPdfIndex}-${clickedPageIndex}`)

        setIsOpen(true);
        setTop(e.clientY);
        setLeft(e.clientX);
    };

    const handleLeftClick = async (e: any) => {
        e.preventDefault();
        setIsOpen(false);

        const clickedContextMenuItem = e.target.getAttribute('id');
        if (clickedContextMenuItem !== 'delete') return;

        const clickedPdfIndex = parseInt(e.target.getAttribute('data-pdf-index'));
        const clickedPageIndex = parseInt(e.target.getAttribute('data-page-index'));

        switch (clickedContextMenuItem) {
            case 'delete':
                console.log(`Deleting pdf-${clickedPdfIndex}-${clickedPageIndex}`);
                await handleDeletePage(clickedPdfIndex, clickedPageIndex);
                break;
            case 'rotate':
                console.log(`Rotating pdf-${clickedPdfIndex}-${clickedPageIndex}`);
                await handleRotatePage({
                    pdfIndex: clickedPdfIndex,
                    pageIndex: clickedPageIndex
                });
                break;
            default:
                break;
        }
        //setClickCounter(oldValue => oldValue + 1);
    }

    useEffect(() => {
        document.addEventListener('click', handleLeftClick);
        document.addEventListener('contextmenu', handleRightClick);

        return () => {
            document.removeEventListener('click', handleRightClick);
            document.removeEventListener('contextmenu', handleRightClick);
        };
    }, []);

    return <>
        {
            isOpen
                ? <>
                    <div
                        className={
                            `fixed z-50 bg-white text-white text-lg font-bold w-[240px] shadow-md rounded-lg border border-stone-200
                            grid grid-cols-1 divide-y divide-stone-200`
                        }
                        style={{
                            top,
                            left,
                        }}
                    >
                        {
                            contextMenuItems.map((item) =>
                                <div
                                    id={item.action}
                                    key={item.id}
                                    data-pdf-index={pdfIndex}
                                    data-page-index={pageIndex}
                                    className="flex items-center gap-2 text-stone-700 text-base font-normal py-2 px-4 hover:bg-stone-100 cursor-pointer"
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
                    </div>
                </>
                : null
        }
    </>
}
export default ContextMenu;