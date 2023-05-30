import { useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { userIsDraggingAtom } from "../store/atoms";
import { useAtom } from "jotai";

export default function ScrollDropTarget({ position }: any) {
    const [userIsDragging, setUserIsDragging] = useAtom(userIsDraggingAtom);

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
            `fixed left-0 right-0 h-[80px] z-[60]
        ${position === 'top' ? 'top-0' : 'bottom-0'}
        ${userIsDragging ? 'pointer-events-auto' : 'pointer-events-none'}`
        }
    />;
}