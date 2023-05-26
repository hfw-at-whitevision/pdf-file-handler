import { atom } from "jotai";

// PDFs

export const pdfsAtom = atom([]);
export const totalPagesAtom = atom([]);
export const pdfFilenamesAtom = atom([]);
export const stateChangedAtom = atom(0);
export const rotationsAtom = atom([]);
export const pagesAtom = atom([]);

// UI

export const currentAtom = atom({ pdfIndex: 0, pageIndex: 0 });
export const getCurrentAtom = atom(
    (get) => get(currentAtom)
);

export const thumbnailsToRerenderAtom = atom([]);
export const userIsDraggingAtom = atom(false);
export const isRotatingAtom = atom(false);
export const isLoadingAtom = atom(false);
export const loadingMessageAtom = atom(null);