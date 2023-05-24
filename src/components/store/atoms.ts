import { atom } from "jotai";

// PDFs

export const pdfsAtom = atom([]);
export const setPdfsAtom = atom(
    null,
    (get, set, inputPdfs: any) => {
        set(pdfsAtom, inputPdfs);
    }
);

export const totalPagesAtom = atom([]);
export const setTotalPagesAtom = atom(
    null,
    (get, set, input: any) => {
        set(totalPagesAtom, input);
    }
);
export const pdfFilenamesAtom = atom([]);
export const setPdfFilenamesAtom = atom(
    null,
    (get, set, input: any) => {
        set(pdfFilenamesAtom, input);
    }
);
export const stateChangedAtom = atom(0);
export const setStateChangedAtom = atom(
    null,
    (get, set, input: any) => {
        set(stateChangedAtom, input);
    }
);

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
export const isRotatingAtom = atom(false);
export const isLoadingAtom = atom(false);
export const setIsLoadingAtom = atom(
    null,
    (get, set, update: any) => set(isLoadingAtom, update)
);
export const loadingMessageAtom = atom(null);
export const setLoadingMessageAtom = atom(
    null,
    (get, set, update: any) => set(loadingMessageAtom, update)
);