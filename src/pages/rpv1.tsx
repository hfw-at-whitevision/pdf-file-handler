import * as React from 'react';
import { Viewer } from '@react-pdf-viewer/core';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/thumbnail/lib/styles/index.css';

interface ThumbnailExampleProps {
    fileUrl: string;
}

const ThumbnailExample: React.FC<ThumbnailExampleProps> = ({ fileUrl }) => {
    const thumbnailPluginInstance = thumbnailPlugin();
    const { Thumbnails, Cover } = thumbnailPluginInstance;
    let fillArray = new Array(100).fill(1);

    return (
        <div
            className="rpv-core__viewer"
            style={{
                border: '1px solid rgba(0, 0, 0, 0.3)',
                display: 'flex',
                height: '100%',
            }}
        >
            <div
                style={{
                    borderRight: '1px solid rgba(0, 0, 0, 0.3)',
                    width: '30%',
                }}
                className='flex flex-col overflow-y-scroll'
            >
                {/* <Thumbnails /> */}
                {
                    fillArray.map((item, index) => (
                        <div className='flex'>
                            {index}
                            <Cover getPageIndex={() => index} width={150} />
                        </div>
                    ))
                }
            </div>
            <div style={{ flex: 1 }}>
                <Viewer fileUrl='./green.pdf' plugins={[thumbnailPluginInstance]} />
            </div>
        </div>
    );
};

export default ThumbnailExample;
