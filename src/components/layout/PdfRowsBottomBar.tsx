import { BsCheckAll } from "react-icons/bs";
import Button from "../primitives/Button";

export default function PdfRowsBottomBar({ pages }: any) {
    const numberOfDocuments = pages?.length;
    const numberOfPages = pages?.flat()?.length;
    return <>
        <div
            className={`
            bg-white sticky bottom-0 left-0 right-0 top-auto h-[80px] px-8
            flex items-center justify-between
            border-t border-border-color
            text-sm
            `}
        >
            <span>
                {numberOfDocuments} document{numberOfDocuments !== 1 ? "'s" : null} | {numberOfPages} pagina{numberOfPages !== 1 ? "'s" : null}
            </span>

            <Button style="secondary" disabled={!pages?.length}>
                <BsCheckAll />
                Verwerk alles
            </Button>
        </div>
    </>
}