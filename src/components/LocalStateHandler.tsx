import { set, get } from "idb-keyval";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { stateChangedAtom, pdfFilenamesAtom, pdfsAtom, rotationsAtom, pagesAtom, openedRowsAtom, splitSizesAtom } from "./store/atoms";

const LocalStateHandler = () => {
    // state save
    const [stateChanged] = useAtom(stateChangedAtom);
    const [pdfFilenames, setPdfFilenames] = useAtom(pdfFilenamesAtom);
    const [rotations, setRotations] = useAtom(rotationsAtom);
    const [pages, setPages] = useAtom(pagesAtom);
    const [pdfs, setPdfs] = useAtom(pdfsAtom);
    const [openedRows, setOpenedRows] = useAtom(openedRowsAtom);
    const [splitSizes, setSplitSizes] = useAtom(splitSizesAtom);
    const saveState = async () => {
        await set('pdfFilenames', pdfFilenames);
        await set('pdfs', pdfs);
        await set('rotations', rotations);
        await set('pages', pages);
        await set('openedRows', openedRows);
        await set('splitSizes', splitSizes);
        console.log(`State saved.`)
    }
    useEffect(() => {
        if (!pdfs || !stateChanged) return;
        saveState();
    }, [stateChanged]);
    // state fetch
    const fetchState = async () => {
        const pdfs = await get('pdfs');
        if (!pdfs?.length) return;

        const pdfFilenames = await get('pdfFilenames');
        const rotations = await get('rotations');
        const pages = await get('pages');
        const openedRows = await get('openedRows');
        const splitSizes = await get('splitSizes');
        setPdfFilenames(pdfFilenames);
        setPages(pages);
        setRotations(rotations);
        setPdfs(pdfs);
        setOpenedRows(openedRows);
        if (splitSizes) setSplitSizes(splitSizes);
        console.log(`State fetched.`)
    }
    useEffect(() => {
        fetchState();
    }, []);
    return <></>
}
export default LocalStateHandler;