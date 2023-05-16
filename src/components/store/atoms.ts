import { atom } from "jotai";

// PDFs

export const pdfsAtom = atom([]);

export const numberOfThumbnailsAtom = atom([]);

export const totalPagesAtom = atom([]);

export const pdfFileNamesAtom = atom([]);

export const currentAtom = atom({ pdfIndex: 0, pageIndex: 0 });

// UI

export const userIsDraggingAtom = atom(false);

export const isLoadingAtom = atom(false);

export const isRotatingAtom = atom(false);