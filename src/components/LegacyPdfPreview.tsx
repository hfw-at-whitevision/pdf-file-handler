import { useAtom } from "jotai"
import { currentAtom, pdfsAtom } from "./store/atoms"
import { Document, Page } from "react-pdf"
import Loading from "./layout/Loading"
import DragDropzone from "./layout/DragDropzone"

export default function LegacyPdfPreview({ rotation }: any) {
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
                            className={`w-full h-full`}
                        >
                            <Page
                                pageIndex={current?.pageIndex}
                                loading={<Loading />}
                                width={1600}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                                rotate={rotation}
                            />
                        </Document>

                    </>
                    : <DragDropzone className="h-[calc(100vh-164px)]" />
            }
        </div>
    </>
}