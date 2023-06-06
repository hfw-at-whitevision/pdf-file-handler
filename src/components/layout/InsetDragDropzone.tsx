import { useEffect, useState } from "react"
import Drop from "./Drop";
import { BsUpload } from "react-icons/bs";

export default function InsetDragDropzone() {
    const [show, setShow] = useState(false);

    const handleDrag = (e: any) => {
        // if we are dragging out of the current window
        if (
            !e.x
            && !e.y
            && !e.relatedTarget
        ) setShow(false);
        else setShow(true);
        console.log(e)
    }

    useEffect(() => {
        window.addEventListener('dragleave', handleDrag);

        return () => {
            window.removeEventListener('dragleave', handleDrag);
        }
    }, []);

    return <>
        <div className={
            `fixed left-0 top-[100px] right-0 bottom-0 bg-black/10 flex items-center justify-center backdrop-blur-md z-50
        ${show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`
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