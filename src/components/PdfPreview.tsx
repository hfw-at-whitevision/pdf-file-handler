import { useAtom } from "jotai"
import { currentAtom, pdfsAtom } from "./store/atoms"
import { useEffect, useRef, useState } from "react"
import { Viewer, ViewMode } from "@react-pdf-viewer/core";
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { SpecialZoomLevel } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { disableScrollPlugin } from "./disableScrollPlugin";

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import { pageThumbnailPlugin } from "./PageThumbnailPlugin";

export default function PdfPreview() {
    const [pdfs]: any = useAtom(pdfsAtom)
    const [current] = useAtom(currentAtom)
    const ref = useRef(null);
    const [width, setWidth] = useState(0);
    const zoomPluginInstance = zoomPlugin();
    const { ZoomInButton, ZoomOutButton, ZoomPopover } = zoomPluginInstance;
    const disableScrollPluginInstance = disableScrollPlugin();

    // react-pdf-viewer thumbnail component
    const thumbnailPluginInstance = thumbnailPlugin();
    const { Cover } = thumbnailPluginInstance;
    const pageThumbnailPluginInstance = pageThumbnailPlugin({
        PageThumbnail: <Cover getPageIndex={() => current.pageIndex} width={1600} />,
    });
    const { Thumbnails } = thumbnailPluginInstance;

    // navigation
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { GoToPreviousPage, GoToNextPage } = pageNavigationPluginInstance;

    useEffect(() => {
        setWidth(ref?.current?.getBoundingClientRect()?.width);
    }, [])

    return <>
        <div ref={ref} className="pdf-preview-container relative h-full">
            {/* Navigation buttons */}
            <div className="flex w-full justify-between hidden">
                <div className="fixed top-1/2 z-10 bg-white">
                    <GoToPreviousPage />
                </div>
                <div className="fixed top-1/2 z-10 bg-white">
                    <GoToNextPage />
                </div>
            </div>
            {
                pdfs?.length
                    ? <div className="rounded-lg overflow-hidden border border-stone-200 sticky top-8">
                        <div
                            className="hidden relative bg-stone-100 flex justify-center items-center p-1 border-b text-sm"
                        >
                            <ZoomOutButton />
                            <ZoomPopover />
                            <ZoomInButton />
                        </div>

                        <Viewer
                            fileUrl={pdfs[current.pdfIndex]}
                            viewMode={ViewMode.SinglePage}
                            plugins={[zoomPluginInstance, pageThumbnailPluginInstance, thumbnailPluginInstance]}
                            defaultScale={SpecialZoomLevel.PageFit}
                            initialPage={current.pageIndex}
                        />
                    </div>
                    : null
            }
        </div>
    </>
}