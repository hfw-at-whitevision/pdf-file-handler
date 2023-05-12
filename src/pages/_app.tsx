import { type AppType } from "next/dist/shared/lib/utils";
import { Worker } from '@react-pdf-viewer/core';

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <>
    <Worker workerUrl="./pdf.worker.3.6.172.min.js">
      <DndProvider backend={HTML5Backend}>
        <Component {...pageProps} />
      </DndProvider>
    </Worker>
  </>
};

export default MyApp;
