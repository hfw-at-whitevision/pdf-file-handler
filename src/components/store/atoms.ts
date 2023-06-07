import { atom } from "jotai";

// PDFs
export const pdfsAtom = atom([]);
export const pdfFilenamesAtom = atom([]);
export const stateChangedAtom = atom(0);
export const rotationsAtom = atom([]);
export const pagesAtom = atom([]);

// UI
export const currentAtom = atom({ pdfIndex: 0, pageIndex: 0 });
export const getCurrentAtom = atom(
    (get) => get(currentAtom)
);

export const isRotatingAtom = atom(false);
export const isLoadingAtom = atom(false);
export const loadingMessageAtom = atom('');

export const isDraggingInternallyAtom = atom(false);
export const isDraggingExternallyAtom = atom(false);

export const thumbnailsWidthAtom = atom(process.env.NEXT_PUBLIC_DEFAULT_THUMBNAIL_WIDTH);
export const thumbnailsPerRowAtom = atom(4);

export const openedRowsAtom = atom([]);
export const splitSizesAtom = atom([35, 40, 25]);