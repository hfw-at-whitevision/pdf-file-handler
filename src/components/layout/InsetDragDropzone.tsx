import { useEffect, useState } from "react"
import Drop from "./Drop";
import { BsUpload } from "react-icons/bs";
import { useAtom } from "jotai";
import { isDraggingInternallyAtom } from "../store/atoms";

export default function InsetDragDropzone() {
    const [show, setShow] = useState(false);
    const [isDraggingInternally] = useAtom(isDraggingInternallyAtom);

    const handleDrag = (e: any) => {
        // if we are dragging out of the current window
        if (
            !e.x
            && !e.y
            && !e.relatedTarget
        ) {
            setShow(false);
        }
        // while we are still dragging the file over the window
        else {
            setShow(true);
        }
    }
    const handleDragEnd = (e: any) => {
        setShow(false);
    }

    useEffect(() => {
        window.addEventListener('dragleave', handleDrag);
        window.addEventListener('drop', handleDragEnd);

        return () => {
            window.removeEventListener('dragleave', handleDrag);
            window.addEventListener('drop', handleDragEnd);
        }
    }, []);

    return <>
        <div className={
            `fixed left-0 top-[100px] right-0 bottom-0 bg-black/10 flex items-center justify-center backdrop-blur-md z-50
        ${show && !isDraggingInternally ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`
        }>
            <div className={`flex items-center justify-center w-full h-full p-16`}>
                <div className={
                    `border-8 bg-amber-100/75
                cursor-pointer
                px-16 py-32 w-full h-full border-dashed rounded-3xl flex flex-col items-center justify-center duration-300 relative
                border-amber-300 overflow-hidden`
                }>

                    <section className={`flex flex-col items-center`}>
                        <BsUpload className="text-[48px] mb-8" />
                        <div>
                            <span className={`text-link font-bold inline cursor-pointer`}>
                                Upload
                            </span> of sleep een document/e-mail hierheen om te beginnen.
                        </div>
                        <span className='text-xs mt-8'>
                            Toegestaan: PDF, JPG/JPEG, PNG, TIF/TIFF & e-mail (EML/MSG)
                        </span>
                    </section>

                    <Drop noClick={true} />
                </div>
            </div>
        </div>
    </>
}