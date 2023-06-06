import { administrationTiles } from "@/constants"
import AdministrationTile from "./AdministrationTile"
import { useEffect, useState } from "react";

export default function AdministrationTiles({ handleSaveDocument, display = 'tiles' }: any, props: any) {
    const [tiles, setTiles]: any = useState([]);
    const fetchAdministrations = async () => {
        const apiUrl: any = process.env.NEXT_PUBLIC_ADMINISTRATIONS_URL;
        const apiKey = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImhvZmVuZyIsImVtYWlsIjoiaG8tZmVuZy53b25nQHdoaXRldmlzaW9uLm5sIiwidXNlciI6IntcIlRlbmFudElkXCI6XCI5OTk5M1wiLFwiVGVuYW50TmFtZVwiOlwiV2hpdGVWaXNpb24gQi5WLiAtIFRlc3RvbWdldmluZ1wiLFwiVXNlcklkXCI6XCJob2ZlbmdcIixcIlVzZXJmdWxsbmFtZVwiOlwiSG8tRmVuZyBXb25nXCIsXCJFbWFpbFwiOlwiaG8tZmVuZy53b25nQHdoaXRldmlzaW9uLm5sXCIsXCJVc2VyR3JvdXBzXCI6W1wiX2dyb2VwX2JvZWtjb250clwiLFwiX2dyb2VwX2Jvbm5lblwiLFwiX2dyb2VwX2NvZGVyZW5cIixcIl9ncm9lcF9tYXRjaGVuXCIsXCJfZ3JvZXBfbmlldGFra29vcmRcIixcIl9ncm9lcF9vcmRlcmJldmVzdGlnaW5nZW5cIixcIl9ncm9lcF9yZWRlbmNvZGVcIixcIl9ncm9lcF9yZWdpc3RyZXJlblwiLFwiX2dyb2VwX3NlcnZpY2VtZWxkaW5nZW5cIixcIl9ncm9lcF91aXR2YWxcIixcIl9sZWRlbl9hZHZpZXNcIixcIl9sZWRlbl9nb2Vka2V1cmRlcnNcIixcImdycC13ZWJ1c2Vyc1wiXSxcIkdyb3VwRmV0Y2hNYW51YWxcIjp0cnVlLFwiQWxsb3dEZWxldGVcIjp0cnVlLFwiQWxsb3dSZXBvcnRzXCI6dHJ1ZSxcIkFsbG93U3VwZXJ2aXNvclwiOnRydWUsXCJBbGxvd0xpbmtEb2N1bWVudHNcIjp0cnVlLFwiQWxsb3dTZXRSZXBsYWNlbWVudFwiOnRydWUsXCJMYW5ndWFnZVwiOlwiTkxcIixcIkZpbHRlclJlcG9ydHNcIjpcIlwiLFwiRmlsdGVyU3VwZXJ2aXNvclwiOlwiXCIsXCJGaWx0ZXJDb3B5Q29kaW5nXCI6XCJcIixcIlN0YW5kYWFyZExvY2F0aWVcIjpcIlwiLFwiVXNlclR5cGVcIjoyLFwiUmVwbGFjZW1lbnRGb3JcIjpbXSxcIlVzZXJGaXJzdE5hbWVcIjpcIkhvLUZlbmdcIixcIkFsbG93VHJhaW5pbmdcIjp0cnVlLFwiQWxsb3dGaWxlaGFuZGxlclwiOnRydWUsXCJFcnBcIjpcIkFGQVMgUHJvZml0XCIsXCJBbGxvd0FwcHJvdmVWaWFMaXN0XCI6dHJ1ZSxcIkFsbG93U2VuZE1haWxcIjp0cnVlfSIsImVucmljaHVybCI6Imh0dHBzOi8vOTk5OTMud29ya2Zsb3dpbmRlY2xvdWQubmwvYXBpLyIsImNsaWVudHZlcnNpb24iOiJ2MDAyIiwidXNlcmxhbmd1YWdlIjoiTkwiLCJuYmYiOjE2ODU0NDE5NDMsImV4cCI6MTY4NTQ0MzE0MywiaWF0IjoxNjg1NDQxOTQzfQ.u2p2gcgD_GkLuO8n5r9P4SmlTG7pOV88-K48aZOB4TI'
        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
            }
        })
            .then(res => res.json())
            .catch(err => err);

        if (!res.length) setTiles(administrationTiles);
        else setTiles(res);
    }
    const [selectedAdministration, setSelectedAdministration] = useState();

    useEffect(() => {
        fetchAdministrations();
    }, [])

    return <>
        <div {...props}>
            <div className={
                `${display === 'tiles'
                    ? 'bg-body-bg-dark grid-cols-[repeat(auto-fill,_minmax(max(100px,_120px),_1fr))] p-4 gap-4'
                    : 'grid-cols-1'}
                w-full rounded-lg sticky top-[132px] border border-text-lighter
                grid `
            }>
                {tiles?.map((tile: any, index: number) => {
                    switch (display) {
                        case "tiles":
                            return <AdministrationTile key={`administrationTile-${tile.code}`} tile={tile} handleSaveDocument={handleSaveDocument} />
                        case "list":
                            return <div
                                key={`administration-li-${tile.code}`}
                                className={
                                    `hover:bg-body-bg-dark p-4 cursor-pointer
                                   ${selectedAdministration === tile.code
                                        ? 'bg-amber-300'
                                        : 'bg-white'}`
                                }
                                onClick={() => setSelectedAdministration(tile.code)}
                            >
                                <strong>{tile.code}</strong>: {tile.displayName}
                            </div>
                    }
                }
                )}
            </div>
        </div>
    </>
}