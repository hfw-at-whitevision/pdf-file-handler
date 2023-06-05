import { useDrop } from "react-dnd";
import { BsCurrencyEuro } from "react-icons/bs";

export default function AdministrationTile({ tile, handleSaveDocument }: any) {
    const [{ canDrop, isOver }, drop] = useDrop({
        accept: "pdfRow",
        drop: async (item: any) => {
            console.log(item);
            const apiKey = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImhvZmVuZyIsImVtYWlsIjoiaG8tZmVuZy53b25nQHdoaXRldmlzaW9uLm5sIiwidXNlciI6IntcIlRlbmFudElkXCI6XCI5OTk5M1wiLFwiVGVuYW50TmFtZVwiOlwiV2hpdGVWaXNpb24gQi5WLiAtIFRlc3RvbWdldmluZ1wiLFwiVXNlcklkXCI6XCJob2ZlbmdcIixcIlVzZXJmdWxsbmFtZVwiOlwiSG8tRmVuZyBXb25nXCIsXCJFbWFpbFwiOlwiaG8tZmVuZy53b25nQHdoaXRldmlzaW9uLm5sXCIsXCJVc2VyR3JvdXBzXCI6W1wiX2dyb2VwX2JvZWtjb250clwiLFwiX2dyb2VwX2Jvbm5lblwiLFwiX2dyb2VwX2NvZGVyZW5cIixcIl9ncm9lcF9tYXRjaGVuXCIsXCJfZ3JvZXBfbmlldGFra29vcmRcIixcIl9ncm9lcF9vcmRlcmJldmVzdGlnaW5nZW5cIixcIl9ncm9lcF9yZWRlbmNvZGVcIixcIl9ncm9lcF9yZWdpc3RyZXJlblwiLFwiX2dyb2VwX3NlcnZpY2VtZWxkaW5nZW5cIixcIl9ncm9lcF91aXR2YWxcIixcIl9sZWRlbl9hZHZpZXNcIixcIl9sZWRlbl9nb2Vka2V1cmRlcnNcIixcImdycC13ZWJ1c2Vyc1wiXSxcIkdyb3VwRmV0Y2hNYW51YWxcIjp0cnVlLFwiQWxsb3dEZWxldGVcIjp0cnVlLFwiQWxsb3dSZXBvcnRzXCI6dHJ1ZSxcIkFsbG93U3VwZXJ2aXNvclwiOnRydWUsXCJBbGxvd0xpbmtEb2N1bWVudHNcIjp0cnVlLFwiQWxsb3dTZXRSZXBsYWNlbWVudFwiOnRydWUsXCJMYW5ndWFnZVwiOlwiTkxcIixcIkZpbHRlclJlcG9ydHNcIjpcIlwiLFwiRmlsdGVyU3VwZXJ2aXNvclwiOlwiXCIsXCJGaWx0ZXJDb3B5Q29kaW5nXCI6XCJcIixcIlN0YW5kYWFyZExvY2F0aWVcIjpcIlwiLFwiVXNlclR5cGVcIjoyLFwiUmVwbGFjZW1lbnRGb3JcIjpbXSxcIlVzZXJGaXJzdE5hbWVcIjpcIkhvLUZlbmdcIixcIkFsbG93VHJhaW5pbmdcIjp0cnVlLFwiQWxsb3dGaWxlaGFuZGxlclwiOnRydWUsXCJFcnBcIjpcIkFGQVMgUHJvZml0XCIsXCJBbGxvd0FwcHJvdmVWaWFMaXN0XCI6dHJ1ZSxcIkFsbG93U2VuZE1haWxcIjp0cnVlfSIsImVucmljaHVybCI6Imh0dHBzOi8vOTk5OTMud29ya2Zsb3dpbmRlY2xvdWQubmwvYXBpLyIsImNsaWVudHZlcnNpb24iOiJ2MDAyIiwidXNlcmxhbmd1YWdlIjoiTkwiLCJuYmYiOjE2ODU0NDYwMjgsImV4cCI6MTY4NTQ0NzIyOCwiaWF0IjoxNjg1NDQ2MDI4fQ.JTfJOrZeQLUhaN1HGpNBMMb-GVvZgR0_UaqVtha5nC0';
            const base64 = await handleSaveDocument(item.pdfIndex);
            const res = await fetch("https://devweb.docbaseweb.nl/api/files/uploadtodocbase", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey,
                },
                body: JSON.stringify({
                    administrationCode: tile.code,
                    pdfBase64: base64,
                    fileName: item.filename,
                    creationDate: new Date().toISOString(),
                    pageCount: item.pages.length,
                })
            });

            return {
                code: tile.code,
                type: 'administrationTile'
            }
        },
        collect: (monitor) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
    });

    return <>
        <div
            ref={drop}
            className={
                `w-full h-[150px] flex
                flex-col rounded-md overflow-hidden p-4 text-sm
                items-center justify-center text-center
                ${isOver
                    ? 'bg-amber-300 shadow-2xl scale-125 z-40'
                    : 'bg-body-bg-light border-text-lighter'
                }`
            }
        >
            <div className="bg-brand-secondary-dark/5 p-4 rounded-md inline-block mx-auto items-center justify-center mb-2">
                <BsCurrencyEuro />
            </div>

            <span className="mt-4">
                <h3 className="font-bold">{tile.displayName}</h3>
            </span>
        </div>
    </>
}