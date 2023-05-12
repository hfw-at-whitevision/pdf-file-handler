import { type AppType } from "next/dist/shared/lib/utils";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <>
    <DndProvider backend={HTML5Backend}>
      <Component {...pageProps} />
    </DndProvider>
  </>
};

export default MyApp;
