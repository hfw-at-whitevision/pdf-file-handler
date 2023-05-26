import { useAtom } from "jotai"
import { isDraggingFilesAtom } from "../store/atoms"
import DragDropzone from "./DragDropzone"

export default function InsetDragDropzone() {
    const [isDraggingFiles] = useAtom(isDraggingFilesAtom)

    return <div className={
        `fixed left-0 top-[100px] right-0 bottom-0 bg-black/50 flex items-center justify-center backdrop-blur-md
                ${isDraggingFiles ? 'opacity-100 z-50' : 'opacity-0 z-[-1]'}`
    }>
        <DragDropzone className='absolute top-8 left-8 right-8 bottom-8' noClick={true} />
    </div>
}