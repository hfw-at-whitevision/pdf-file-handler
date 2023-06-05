import { useAtom } from "jotai"
import { isDraggingFilesAtom } from "../store/atoms"
import DragDropzone from "./DragDropzone"
import { useEffect } from "react"

export default function InsetDragDropzone() {
    const [isDraggingFiles, setIsDraggingFiles] = useAtom(isDraggingFilesAtom)

    const onDragOver = () => {
        setIsDraggingFiles(true);
    }
    const onDragLeave = () => {
        setIsDraggingFiles(false);
    }

    useEffect(() => {
        window.addEventListener('dragover', onDragOver);
        window.addEventListener('dragleave', onDragLeave);

        return () => {
            window.removeEventListener('dragover', onDragOver);
            window.removeEventListener('dragleave', onDragLeave);
        }
    }, []);

    return <div className={
        `fixed left-0 top-[100px] right-0 bottom-0 bg-black/10 flex items-center justify-center backdrop-blur-md z-50
        ${isDraggingFiles ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`
    }>
        <DragDropzone className='absolute top-8 left-8 right-8 bottom-8' noClick={true} />
    </div>
}