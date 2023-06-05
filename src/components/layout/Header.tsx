import { BsUpload, BsSave, BsArrowRepeat } from "react-icons/bs";
import ButtonXl from "../primitives/ButtonXl";
import Drop from "./Drop";
import ThumbnailsSizeInput from "./ThumbnailsSizeInput";
import { useAtom } from "jotai";
import { pdfsAtom } from "../store/atoms";

export default function Header({ handleSaveAllDocuments, handleReset }: any) {
    const [pdfs] = useAtom(pdfsAtom);
    const fileMenu = [
        <ButtonXl
            icon={<BsUpload className="text-base" />}
            title="Upload"
            description="Upload een bestand."
            className="relative"
        >
            {/* parent buttonxl classname
                `flex w-full flex-col gap-4 rounded-md text-stone-600 text-sm cursor-pointer
                ring-2 ring-dashed hover:ring-amber/40 p-4 ring-offset-4 ring-amber-300/50 relative`
    */}
            <Drop />
        </ButtonXl>,
        <ButtonXl
            title={"Opslaan"}
            icon={<BsSave className="text-base" />}
            description="Download als PDF."
            onClick={handleSaveAllDocuments}
            className={!pdfs?.length ? 'disabled' : ''}
        />,
        <ButtonXl
            title={"Reset"}
            icon={<BsArrowRepeat className="text-base" />}
            description="Begin opnieuw."
            onClick={handleReset}
            className={!pdfs?.length ? 'disabled' : ''}
        />
    ];
    const viewMenu = [
        <div className="p-4">
            <ThumbnailsSizeInput />
        </div>
    ];
    const helpMenu = [
        <ButtonXl>
            Handleiding
        </ButtonXl>,
        <ButtonXl>
            Sneltoetsen
        </ButtonXl>
    ];
    const menus = [
        {
            label: "Bestand",
            menu: fileMenu,
        },
        {
            label: "Weergave",
            menu: viewMenu,
        },
        {
            label: "Help",
            menu: helpMenu,
        }
    ];

    return <>
        <header className={`fixed top-0 left-0 right-0 h-[100px] flex flex-row w-full bg-white shadow-sm border-body-bg-dark z-50 px-8 py-4 items-center gap-16`}>
            <div>
                <img src="./whitevision.png" width={100} className="flex justify-center gap-2 text-lg" />
                <h3 className="font-black mt-2 tracking-widest uppercase text-[9px] text-stone-700">
                    File Handler {process.env.NEXT_PUBLIC_BUILD_VERSION ?? ''}
                </h3>
            </div>

            <section className={`grid gap-4 grid-cols-3 w-[500px]`}>
                {menus.map((menu: any, index: number) =>
                    <div className="group" key={`header-menu-${index}`}>
                        <label className="px-6 flex items-center h-16 font-bold text-lg cursor-pointer group-hover:bg-body-bg-dark">
                            {menu.label}
                        </label>
                        <nav className={
                            `opacity-0 pointer-events-none absolute w-[280px] bg-white p-2 gap-2 rounded-lg shadow-lg
                        group-hover:grid group-hover:pointer-events-auto group-hover:opacity-100`
                        }>
                            {menu.menu}
                        </nav>
                    </div>
                )}
            </section>
        </header>
    </>
}