import { useAtom } from "jotai"
import { currentAtom, pdfsAtom } from "./store/atoms"
import { Document, Page } from "react-pdf"
import Loading from "./layout/Loading"

export default function LegacyPdfPreview({ rotations }: any) {
    const [pdfs] = useAtom(pdfsAtom)
    const [current] = useAtom(currentAtom)
    return <>
        <div className="pdf-preview-container text-center">
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
                                width={1600}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                                rotate={rotations[current?.pageIndex]}
                            />
                        </Document>
                    </>
                    : <div className="h-full flex items-center justify-center text-sm">
                        Upload een document om deze te verwerken.
                    </div>
            }
        </div>
    </>
}