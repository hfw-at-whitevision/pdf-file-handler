import { useAtom } from "jotai"
import { currentAtom, pdfsAtom } from "./store/atoms"
import { Document, Page } from "react-pdf"
import Loading from "./layout/Loading"
import { useEffect, useRef, useState } from "react"

export default function PdfPreview() {
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
                            className={`w-full sticky top-8`}
                        >
                            <Page
                                pageIndex={current?.pageIndex}
                                loading={<Loading />}
                                width={800}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                                className={`rounded-lg shadow-lg overflow-hidden w-full`}
                            />
                        </Document>
                    </>
                    : null
            }
        </div>
    </>
}