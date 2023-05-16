import { useRef, useEffect } from "react";
import { useDrop } from "react-dnd";

export default function ScrollDropTarget({ isDragging, position }) {
    const scrollBy =
        position === 'top'
            ? -20
            : 20;

    const scrollUp = () => {
        window.scrollBy(0, scrollBy);
    };

    const scrollTopDropRef = useRef(null);
    const [{ isOver }, drop] = useDrop({
        accept: "pdfThumbnail",
        drop: () => ({ type: 'scrollDropTarget' }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    drop(scrollTopDropRef);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (isOver) {
                scrollUp();
            } else {
                clearInterval(intervalId);
            }
        }, 10);

        return () => {
            clearInterval(intervalId);
        };
    }, [isOver]);

    return <div
        ref={scrollTopDropRef}
        className={
            `fixed left-0 right-0 h-[80px] z-50
        ${position === 'top' ? 'top-0' : 'bottom-0'}
        ${isDragging ? 'pointer-events-auto' : 'pointer-events-none'}`
        }
    />;
}