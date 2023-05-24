import { useAtom } from "jotai"
import { currentAtom, pdfsAtom } from "./store/atoms"
import { Document, Page } from "react-pdf"
import Loading from "./layout/Loading"
import { useEffect, useRef, useState } from "react"

export default function LegacyPdfPreview() {
    const [pdfs, setPdfs] = useAtom(pdfsAtom)
    const [current] = useAtom(currentAtom)
    const ref = useRef(null);
    const [width, setWidth] = useState(0);
    useEffect(() => {
        setWidth(ref?.current?.getBoundingClientRect()?.width);
    }, [])
    return <>
        <div ref={ref} className="pdf-preview-container">
            {
                pdfs?.length
                    ? <>
                        <Document
                            file={pdfs[current?.pdfIndex]}
                            loading={<Loading />}
                            className={`w-full h-screen sticky top-8`}
                        >
                            <Page
                                pageIndex={current?.pageIndex}
                                loading={<Loading />}
                                width={800}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                            />
                        </Document>
                    </>
                    : null
            }
        </div>
    </>
}