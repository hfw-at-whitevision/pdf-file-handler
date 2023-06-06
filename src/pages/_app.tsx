import { type AppType } from "next/dist/shared/lib/utils";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { pdfjs } from "react-pdf";

import "~/styles/globals.scss";
pdfjs.GlobalWorkerOptions.workerSrc = `./pdf.worker.js`;

const MyApp: AppType = ({ Component, pageProps }) => {
  return <>
    <DndProvider backend={HTML5Backend}>
      <Component {...pageProps} />
    </DndProvider>
  </>
};

export default MyApp;
