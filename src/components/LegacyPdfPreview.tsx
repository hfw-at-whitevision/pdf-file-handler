import { useAtom } from "jotai"
import { currentAtom, pdfsAtom } from "./store/atoms"
import { Page } from "react-pdf"
import Loading from "./layout/Loading"
import DragDropzone from "./layout/DragDropzone"
import { Document } from "react-pdf"

export default function LegacyPdfPreview({ rotation }: any) {
    const [current] = useAtom(currentAtom)
    const [pdfs] = useAtom(pdfsAtom);

    return <>
        <section className="pdf-preview-container relative">
            {pdfs?.length
                ? <Document
                    file={pdfs[0]}
                    loading={<Loading />}
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
                : <DragDropzone className="h-[calc(100vh-164px)]" />
            }
        </section>
    </>
}