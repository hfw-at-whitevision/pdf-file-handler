import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { thumbnailsWidthAtom, thumbnailsPerRowAtom } from "./store/atoms";

export default function ThumbnailsWidthHandler({ pdfRowsRef, splitSizes }: any) {
    const [thumbnailWidth]: any = useAtom(thumbnailsWidthAtom);
    const setThumbnailsPerRow = useSetAtom(thumbnailsPerRowAtom);

    const calculateThumbnailsWidth = () => {
        const pdfRowsWidth = pdfRowsRef.current.getBoundingClientRect().width;
        const bordersWidth = 2;
        const pdfRowPadding = 32;
        const sectionPadding = 64;
        const thumbnailsContainerWidth = pdfRowsWidth - bordersWidth - pdfRowPadding - sectionPadding;
        const thumbnailsContainerGap = 4;
        let newThumbnailsPerRow = Math.floor(thumbnailsContainerWidth / thumbnailWidth);
        const gapInBetween = (newThumbnailsPerRow - 1) * thumbnailsContainerGap;
        const checkWidth = (newThumbnailsPerRow * thumbnailWidth) + gapInBetween + bordersWidth + pdfRowPadding;
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

    return <>
    </>
}