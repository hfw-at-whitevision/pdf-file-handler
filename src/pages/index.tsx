import { type NextPage } from "next";
import Head from "next/head";

import { useEffect, useRef, useState } from "react";
import Drop from "@/components/Drop";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, degrees } from "pdf-lib";
import { blobToURL } from "@/utils/Utils";
import PagingControl from "@/components/PagingControl";
import { BigButton } from "@/components/BigButton";
import ButtonXl from "@/components/ButtonXl";
import { BsPlusLg, BsTrash, BsArrowDown, BsArrowUp } from "react-icons/bs";
import { RxReset } from "react-icons/rx";
import { GrRotateRight } from "react-icons/gr";
import Loading from "@/components/Loading";

pdfjs.GlobalWorkerOptions.workerSrc = `./pdf.worker.min.js`;

function downloadURI(uri: string, name: string) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const Home: NextPage = () => {
  const [docIndex, setDocIndex] = useState(0);
  const [originalPdf, setOriginalPdf] = useState(null);
  const [pdfs, setPdfs]: [Array<string>, any] = useState();
  const [current, setCurrent] = useState({ docIndex: 0, pageIndex: 0 });
  const [totalPages, setTotalPages] = useState([]);
  const [pageDetails, setPageDetails] = useState(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const documentRef = useRef(null);

  useEffect(() => {
    setCurrentRotation(0);
  }, [current]);

  const handleReset = async (e) => {
    e.preventDefault();
    setPdfs([originalPdf]);
    //                      setTotalPages(0);
    setCurrent(0);
    setCurrentRotation(0);
    //                  setPageDetails(null);
  };

  const handleRotatePage = async (inputDegrees: number = 90) => {
    setIsRotating(true);
    const pdfDoc = await PDFDocument.load(pdfs[current.docIndex], {
      ignoreEncryption: true
    });
    const pages = pdfDoc.getPages();
    const currentPage = pages[current.pageIndex];
    const newDegrees = (current?.rotation?.[current.docIndex]?.[current.pageIndex] ?? 0) + inputDegrees

    if (currentPage) currentPage.setRotation(degrees(newDegrees));

    setCurrent(oldValues => ({
      ...oldValues,
      rotation: {
        ...(oldValues?.rotation) && {...oldValues?.rotation},
        [current.docIndex]: {
          ...(oldValues?.rotation?.[current?.docIndex]) && {...oldValues.rotation[current?.docIndex]},
          [current.pageIndex]: (current?.rotation?.[current?.docIndex]?.[current.pageIndex] ?? 0) + inputDegrees,
        }
      }
    }))

    //setCurrentRotation(currentRotation + inputDegrees);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)]);
    const URL = await blobToURL(blob);

    alert(`Rotating page ${current.pageIndex} of pdf ${current.docIndex} to ${(current?.rotation?.[current?.docIndex]?.[current.pageIndex] ?? 0) + inputDegrees} degrees`)

    setPdfs(oldPdfs => {
      let newPdfs = oldPdfs
      newPdfs[current.docIndex] = URL
      return newPdfs
    });
    setIsRotating(false);
  };

  const handleRemovePage = async (inputPageNum: number = current.index) => {
    setIsDeleting(true);
    const pdfDoc = await PDFDocument.load(pdfs[i], {
      ignoreEncryption: true
    });
    pdfDoc.removePage(inputPageNum);
    let newPageNum = inputPageNum === totalPages - 1 ? inputPageNum - 1 : inputPageNum;
    newPageNum = newPageNum < 0 ? 0 : newPageNum;
    setCurrent(newPageNum);
    setCurrentRotation(0);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)]);
    const URL = await blobToURL(blob);
    setPdfs(URL);
    setIsDeleting(false);
  };

  const handleMovePage = async (newIndex: number = pageNum) => {
    const pdfDoc = await PDFDocument.load(pdf, {
      ignoreEncryption: true
    });
    const [current]: any = await pdfDoc.copyPages(pdfDoc, [pageNum]);
    pdfDoc.insertPage(newIndex, current);
    await pdfDoc.save();
    pdfDoc.removePage(pageNum);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)]);
    const URL = await blobToURL(blob);
    setPdfs(URL);
    setCurrent(pageNum + 1);
  };

  // ************************************************************************
  // thumbnails
  // ************************************************************************
  const [thumbnails, setThumbnails] = useState([]);
  useEffect(() => {
    if (!pdfs?.length || !totalPages.length) return;
    let pdfThumbnails = [];

    for (let currentPdf = 0; currentPdf < pdfs.length; currentPdf++) {
      // reset array for each document
      pdfThumbnails = [];

      for (let currentPage = 0; currentPage < totalPages[currentPdf]; currentPage++) {
        const theThumbnail =
          <Page
            key={`${currentPdf}-${currentPage}`}
            className={
              `rounded-md overflow-hidden w-[150px] max-h-[150px] w-fit h-fit cursor-pointer
              pdf-${currentPdf}-${currentPage}
              ${(currentPage === current.pageIndex && currentPdf === current.docIndex)
                ? "border-4 border-amber-300"
                : ""
              }
            `
            }
            pageIndex={currentPage}
            width={150}
            onClick={() => setCurrent(oldValues => ({
              ...oldValues,
              docIndex: currentPdf,
              pageIndex: currentPage,
            }))}
          />;

        pdfThumbnails = pdfThumbnails.concat(theThumbnail);
      }
    }

    setThumbnails(oldThumbnails => {
      const newThumbnails = oldThumbnails.concat([pdfThumbnails]);
      return newThumbnails;
    });
  }, [totalPages]);

  return (
    <>
      <Head>
        <title>PDF File Handler</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <pre>
        totalPages: {JSON.stringify(totalPages)}
        <br />
        thumbnails length: {thumbnails?.map(thumbnail => <span className="mr-2">{thumbnail?.length}</span>)}
        <br />
        current: {JSON.stringify(current, 2, 2)}
        <br />
        index: {JSON.stringify(docIndex, 2, 2)}
        <br />
        thumbnails: {thumbnails && JSON.stringify(thumbnails, 2, 2)}
      </pre>

      <div className={
        `flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]`
      }>

        <div className={
          `flex gap-12 px-4 py-16
          ${pdfs ? "flex-row" : "flex-col items-center justify-center"}`
        }>
          <header className={
            `flex flex-col
            ${!pdfs ? "items-center" : "max-w-xs"}
            `
          }>
            <img src="./whitevision.png" width={150} className="flex justify-center gap-2 text-lg " />
            <div className={
              `grid gap-4 mt-6
              ${!pdfs ? "grid-cols-1" : "grid-cols-1"}
              `
            }>
              <Drop
                onLoaded={async (files: any) => {
                  const newPdf = await blobToURL(files[0]);
                  setPdfs((oldPdfs) => {
                    const result = oldPdfs ? oldPdfs.concat(newPdf) : [newPdf];
                    return result;
                  });
                  setOriginalPdf(newPdf);
                  const newPdfDoc = await PDFDocument.load(newPdf)
                  setTotalPages(oldTotalPages => [...oldTotalPages, newPdfDoc.getPages().length]);
                }}
                className={pdfs ? "opacity-50" : "!p-16"}
              />
              {pdfs
                ? <>
                  <ButtonXl
                    title={"Reset"}
                    icon={<RxReset />}
                    description="Maak alle wijzigingen ongedaan en reset naar de oorspronkelijke PDF."
                    onClick={handleReset}
                  />
                  <ButtonXl
                    title="Download"
                    description="Creëer en download het PDF bestand."
                    className={pdfs ? "" : "opacity-40 pointer-events-none"}
                    onClick={() => {
                      downloadURI(pdfs, "pdffilehandler.pdf");
                    }}
                  />
                </>
                : null}
            </div>
          </header>

          {pdfs ? (
            <div style={{ color: "white" }}>
              <nav className={`${isLoading ? "disabled" : ""} flex gap-1 mb-12`}>
                <BigButton
                  title={<><BsArrowDown /> Pagina omlaag</>}
                  onClick={() => handleMovePage(pageNum + 2)}
                  disabled={isDeleting}
                />
                <BigButton
                  title={<><GrRotateRight /> Roteer 90°</>}
                  onClick={() => handleRotatePage()}
                  disabled={isRotating}
                />
                <BigButton
                  title={<><BsTrash /> Verwijder pagina</>}
                  onClick={() => handleRemovePage(pageNum)}
                  disabled={isDeleting}
                />
              </nav>

              <main
                ref={documentRef}
                className="grid gap-4"
              >

                {
                  (pdfs?.length) &&
                  pdfs?.map((pdfDoc, pdfIndex) => <>

                    {/* pdf Document */}
                    <Document
                      key={`pdfDoc-${pdfIndex}`}
                      file={pdfDoc}
                      loading={<Loading />}
                      onLoadSuccess={(data) => {
                       // setTotalPages(oldTotalPages => [...oldTotalPages, data.numPages]);
                      }}
                      className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 bg-white/20 shadow-2xl p-8 rounded-lg"
                    >

                      <div className="col-span-2 lg:col-span-3 xl:col-span-4 pb-4">
                        Document {pdfIndex}.
                        <br />Total pages: {totalPages[pdfIndex]}
                      </div>

                      {/* thumbnails of current PDF */}
                      {thumbnails[pdfIndex]?.map(thumbnail => thumbnail)}

                    </Document>

                  </>)
                }
              </main>
            </div>
          ) : null}
        </div>

      </div>
    </>
  );
};

export default Home;