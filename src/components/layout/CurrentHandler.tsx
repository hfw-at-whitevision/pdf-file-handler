import { useAtom } from "jotai";
import { useEffect } from "react";
import { currentAtom } from "../store/atoms";

const CurrentHandler = () => {
    const [current]: any = useAtom(currentAtom);
    // highlight current thumbnail
    const highlightCurrentThumbnail = () => {
        const currentThumbnail: any = document.getElementById(`thumbnail-${current.pdfIndex}-${current.pageIndex}`);
        if (!currentThumbnail) return;
        currentThumbnail.classList.add('!border-amber-300', '!before:z-10');
        const otherThumbnails = document.querySelectorAll('[id*="thumbnail-"]:not([id*="thumbnail-' + current.pdfIndex + '-' + current.pageIndex + '"])');
        otherThumbnails.forEach((thumbnail: any) => {
            thumbnail.classList.remove('!border-amber-300', '!before:z-10');
        });
    }
    useEffect(() => {
        let timer1 = null;
        const currentThumbnail: any = document.getElementById(`thumbnail-${current.pdfIndex}-${current.pageIndex}`);
        if (currentThumbnail) highlightCurrentThumbnail();
        else {
            timer1 = null;
            timer1 = setTimeout(() => {
                highlightCurrentThumbnail();
            }, 400);
        }
    }, [current]);
    // scroll thumbnail into view
    useEffect(() => {
        if (current?.skipScrollIntoView) return;
        let timer: any = null;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            const thumbnailId = document.getElementById(`thumbnail-${current.pdfIndex}-${current.pageIndex}`);
            if (thumbnailId) thumbnailId.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);

        return () => clearTimeout(timer);
    }, [current]);

    return <></>
}
export default CurrentHandler;