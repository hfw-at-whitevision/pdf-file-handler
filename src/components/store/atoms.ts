import { atom } from "jotai";

// PDFs

export const pdfsAtom = atom([]);
export const setPdfsAtom = atom(
    null,
    (get, set, inputPdfs: any) => {
        set(pdfsAtom, inputPdfs);
    }
);

export const numberOfThumbnailsAtom = atom([]);
export const totalPagesAtom = atom([]);
export const pdfFileNamesAtom = atom([]);

// UI

export const currentAtom = atom({ pdfIndex: 0, pageIndex: 0 });
export const getCurrentAtom = atom(
    (get) => get(currentAtom)
);
export const setCurrentAtom = atom(
    null,
    (get, set, update: any) => set(currentAtom, update)
);

export const thumbnailsToRerenderAtom = atom([]);
export const userIsDraggingAtom = atom(false);
export const isLoadingAtom = atom(false);
export const isRotatingAtom = atom(false);