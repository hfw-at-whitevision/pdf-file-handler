import {SetRenderRange, Viewer, ViewMode, VisiblePagesRange} from "@react-pdf-viewer/core";

import { pageThumbnailPlugin } from "@/components/pageThumbnailPlugin";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { zoomPlugin } from '@react-pdf-viewer/zoom';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import { useAtom } from "jotai";
import { pdfsAtom } from "./atoms";
import React from "react";

export default function PdfPreview({ pdfIndex, pageIndex }) {
    const setRenderRange: SetRenderRange = React.useCallback((visiblePagesRange: VisiblePagesRange) => {
        return {
            startPage: visiblePagesRange.startPage - 16,
            endPage: visiblePagesRange.endPage + 16,
        };
    }, []);

    // react-pdf-viewer thumbnail component
    const thumbnailPluginInstance = thumbnailPlugin();
    const { Cover } = thumbnailPluginInstance;
    const pageThumbnailPluginInstance = pageThumbnailPlugin({
        PageThumbnail: <Cover getPageIndex={() => pageIndex} width={800} />,
    });
    const { Thumbnails } = thumbnailPluginInstance;
    const [pdfs, setPdfs] = useAtom(pdfsAtom);
    const fileUrl = pdfs[pdfIndex];

    return <>
        <div className="sticky top-8 rounded-lg overflow-hidden">
            <Viewer
                fileUrl={fileUrl}
                viewMode={ViewMode.SinglePage}
                plugins={[pageThumbnailPluginInstance, thumbnailPluginInstance]}
                setRenderRage={setRenderRange}
            />
        </div>
    </>
}

const ZoomToolbar = () => {
    const zoomPluginInstance = zoomPlugin();
    const { ZoomInButton, ZoomOutButton, ZoomPopover } = zoomPluginInstance;
    return (
        <div
            style={{
                alignItems: 'center',
                backgroundColor: '#eeeeee',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                padding: '4px',
            }}
        >
            <ZoomOutButton />
            <ZoomPopover />
            <ZoomInButton />
        </div>
    )
}
