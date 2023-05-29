import { useAtom } from "jotai"
import { currentAtom } from "./store/atoms"
import { Page } from "react-pdf"
import Loading from "./layout/Loading"

export default function LegacyPdfPreview({ rotation }: any) {
    const [current] = useAtom(currentAtom)

    return <>
        <div className="pdf-preview-container text-center">
            <Page
                pageIndex={current?.pageIndex}
                loading={<Loading />}
                width={1600}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                rotate={rotation}
            />
        </div>
    </>
}