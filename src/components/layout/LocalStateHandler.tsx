import { set, get } from "idb-keyval";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { stateChangedAtom, pdfFilenamesAtom, pdfsAtom, rotationsAtom, pagesAtom } from "../store/atoms";

const LocalStateHandler = () => {
    // state save
    const [stateChanged] = useAtom(stateChangedAtom);
    const [pdfFilenames, setPdfFilenames] = useAtom(pdfFilenamesAtom);
    const [rotations, setRotations] = useAtom(rotationsAtom);
    const [pages, setPages] = useAtom(pagesAtom);
    const [pdfs, setPdfs] = useAtom(pdfsAtom);
    const saveState = async () => {
        await set('pdfFilenames', pdfFilenames);
        await set('pdfs', pdfs);
        await set('rotations', rotations);
        await set('pages', pages);
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

        get('pdfFilenames').then((pdfFilenames) => {
            get('rotations').then((rotations) => {
                get('pages').then((pages) => {
                    setPdfFilenames(pdfFilenames);
                    setPages(pages);
                    setRotations(rotations);
                    setPdfs(pdfs);
                    console.log(`State fetched.`)
                });
            });
        });
    }
    useEffect(() => {
        fetchState();
    }, []);
    return <></>
}
export default LocalStateHandler;