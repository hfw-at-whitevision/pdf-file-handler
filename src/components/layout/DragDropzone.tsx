import { useAtom } from "jotai";
import { BsUpload } from "react-icons/bs";
import { isDraggingFilesAtom } from "../store/atoms";
import Drop from "./Drop";

export default function DragDropzone({ className = null, noClick = false }: any) {
    const [isDraggingFiles] = useAtom(isDraggingFilesAtom)
    return (
        <div className={`flex items-center justify-center ${className && className}`}>
            <div className={
                `${isDraggingFiles ? 'border-8 bg-amber-100/90' : 'border-0'}
                ${noClick ? 'cursor-default' : 'cursor-pointer'}
                px-16 py-32 w-full h-full border-dashed rounded-3xl flex flex-col items-center justify-center duration-300 relative
                border-amber-300 overflow-hidden`
            }>

                <section className={`flex flex-col items-center ${isDraggingFiles ? 'scale-125' : 'scale-100'}`}>
                    <BsUpload className="text-[48px] mb-8" />
                    <div>
                        <span className={`text-link font-bold inline ${noClick ? 'cursor-default' : 'cursor-pointer'}`}>
                            Upload
                        </span> of sleep een document/e-mail hierheen om te beginnen.
                    </div>
                    <span className='text-xs mt-8'>
                        Toegestaan: PDF, JPG/JPEG, PNG, TIF/TIFF & e-mail (EML/MSG)
                    </span>
                </section>

                <Drop noClick={noClick} />
            </div>
        </div>
    );
}