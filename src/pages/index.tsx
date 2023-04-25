import { type NextPage } from "next";
import Head from "next/head";

import { useEffect, useRef, useState } from "react";
import Drop from "@/components/Drop";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, ViewerPreferences, degrees } from "pdf-lib";
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
  const [changesCounter, setChangesCounter] = useState(0);
  const [pdfIndex, setPdfIndex] = useState(0);
  const [pdfFileNames, setPdfFileNames] = useState([]);
  const [originalPdf, setOriginalPdf] = useState(null);
  const [pdfs, setPdfs]: [Array<string>, any] = useState();
  const [current, setCurrent] = useState({ pdfIndex: 0, pageIndex: 0 });
  const [totalPages, setTotalPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const documentRef = useRef(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setPdfs([originalPdf]);
    //                      setTotalPages(0);
    //setCurrent(0);
    //                  setPageDetails(null);
  };

  const handleDeleteDocument = async (inputPdfIndex: number) => {
    setIsLoading(true);
    setIsDeleting(true);

    setPdfs(oldPdfs => oldPdfs.filter((pdf, index) => index !== inputPdfIndex));
    setTotalPages(oldTotalPages => oldTotalPages.filter((totalPage, index) => index !== inputPdfIndex));
    setPdfFileNames(oldPdfFileNames => oldPdfFileNames.filter((pdfFileName, index) => index !== inputPdfIndex));
    setChangesCounter(oldChangesCounter => oldChangesCounter + 1);

    setIsLoading(false);
    setIsDeleting(false);
  }

  const handleRotateDocument = async (inputPdfIndex: number) => {
    console.log(`Rotating document ${inputPdfIndex}`)
    setIsRotating(true);
    const pdfDoc = await PDFDocument.load(pdfs[inputPdfIndex], {
      ignoreEncryption: true
    });
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
      const currentPageRotation = page.getRotation().angle;
      const newDegrees = currentPageRotation + 90;
      page.setRotation(degrees(newDegrees));
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)]);
    const URL = await blobToURL(blob);

    setPdfs(oldPdfs => {
      let newPdfs = oldPdfs
      newPdfs[inputPdfIndex] = URL
      return newPdfs
    });
    setIsRotating(false);
  }

  const handleRotatePage = async ({ pdfIndex, pageIndex }) => {
    setIsRotating(true);
    const pdfDoc = await PDFDocument.load(pdfs[pdfIndex], {
      ignoreEncryption: true
    });
    const pages = pdfDoc.getPages();
    const currentPage = pages[pageIndex];
    const currentPageRotation = currentPage.getRotation().angle;
    const newDegrees = currentPageRotation + 90

    if (currentPage) currentPage.setRotation(degrees(newDegrees));

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)]);
    const URL = await blobToURL(blob);

    setPdfs(oldPdfs => {
      let newPdfs = oldPdfs
      newPdfs[pdfIndex] = URL
      return newPdfs
    });
    setIsRotating(false);
    setCurrent({ pdfIndex, pageIndex });
  };

  const handleDeletePage = async ({ pdfIndex, pageIndex }) => {
    setIsDeleting(true);
    const pdfDoc = await PDFDocument.load(pdfs[pdfIndex], {
      ignoreEncryption: true
    });
    pdfDoc.removePage(pageIndex);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)]);
    const URL = await blobToURL(blob);
    setPdfs(oldPdfs => {
      let newPdfs = oldPdfs
      newPdfs[pdfIndex] = URL
      return newPdfs
    });
    setTotalPages(oldTotalPages => {
      let newTotalPages = oldTotalPages
      newTotalPages[pdfIndex] = oldTotalPages[pdfIndex] - 1
      return newTotalPages
    });
    setNumberOfThumbnails(oldNumberOfThumbnails => {
      oldNumberOfThumbnails[pdfIndex].pop();
      return oldNumberOfThumbnails;
    });
    setIsDeleting(false);
    setCurrent({ pdfIndex, pageIndex });
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
  const [numberOfThumbnails, setNumberOfThumbnails]: any = useState([]);

  return (
    <>
      <Head>
        <title>PDF File Handler</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <pre>
        numberOfThumbnails: {JSON.stringify(numberOfThumbnails)}
        <br />
        pdfs.length: {JSON.stringify(pdfs?.length)}
        <br />
        totalPages: {JSON.stringify(totalPages)}
        <br />
        current: {JSON.stringify(current, 2, 2)}
        <br />
        index: {JSON.stringify(pdfIndex, 2, 2)}
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
                  const pages = newPdfDoc.getPages().length
                  setTotalPages(oldTotalPages => [...oldTotalPages, pages]);
                  setPdfFileNames(oldFileNames => [...oldFileNames, files[0].name]);
                  console.log('Updating numberOfThumbnails')

                  let pagesOfUploadedPdf = []
                  for (let i = 0; i < pages; i++) {
                    pagesOfUploadedPdf.push(i)
                  }

                  setNumberOfThumbnails(oldValue => [...oldValue, pagesOfUploadedPdf])
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
              <main
                ref={documentRef}
                className="grid gap-4"
              >

                {
                  (!pdfs?.length)
                    ? null
                    : pdfs?.map((pdfDoc, pdfIndex) => <>

                      {/* pdf Document */}
                      <Document
                        key={`pdfDoc-${pdfIndex}`}
                        file={pdfDoc}
                        loading={<Loading />}
                        onLoadSuccess={(data) => {
                          // setTotalPages(oldTotalPages => [...oldTotalPages, data.numPages]);
                        }}
                        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 bg-white/20 shadow-2xl p-4 rounded-lg w-[660px]"
                      >
                        <div className="col-span-2 lg:col-span-3 xl:col-span-4 mb-4 flex items-center justify-between">
                          <span>
                            <h3 className="font-extrabold text-lg mr-2 inline">{pdfFileNames[pdfIndex]}</h3>
                            ({totalPages[pdfIndex]} {totalPages[pdfIndex] > 1 ? ' pagina\'s' : ' pagina'})
                          </span>

                          <nav className={`${isLoading ? "disabled" : ""} flex gap-1`}>
                            <BigButton
                              title={<><GrRotateRight /></>}
                              onClick={() => handleRotateDocument(pdfIndex)}
                              disabled={isRotating}
                            />
                            <BigButton
                              title={<><BsTrash /></>}
                              onClick={() => handleDeleteDocument(pdfIndex)}
                              disabled={isRotating}
                            />
                          </nav>
                        </div>

                        {/* thumbnails of current PDF */}
                        {numberOfThumbnails[pdfIndex]?.map((_, pageIndex) =>
                          <Thumbnail
                            pageIndex={pageIndex}
                            pdfIndex={pdfIndex}
                            current={current}
                            onClick={() => {
                              setCurrent(oldValues => ({
                                ...oldValues,
                                pdfIndex: pdfIndex,
                                pageIndex: pageIndex,
                              }));
                            }}
                            actionButtons={
                              <>
                                <BigButton
                                  title={<><GrRotateRight /></>}
                                  onClick={() => handleRotatePage({ pdfIndex: pdfIndex, pageIndex: pageIndex })}
                                  disabled={isRotating}
                                  transparent={false}
                                />
                                <BigButton
                                  title={<><BsTrash /></>}
                                  onClick={() => handleDeletePage({ pdfIndex: pdfIndex, pageIndex: pageIndex })}
                                  disabled={isRotating}
                                  transparent={false}
                                />
                              </>
                            }
                          />
                        )}

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

const Thumbnail = ({ pdfIndex, pageIndex, onClick, actionButtons, current }) => (
  <div className="relative group flex items-center justify-center " {...onClick && { onClick: onClick }}>
    <Page
      key={`pdf-${pdfIndex}-page-${pageIndex}`}
      loading={<Loading />}
      className={
        `rounded-md overflow-hidden w-[150px] max-h-[150px] h-fit cursor-pointer relative
                pdf-${pdfIndex}-${pageIndex}
                ${(pageIndex === current.pageIndex && pdfIndex === current.pdfIndex)
          ? "border-4 border-amber-300"
          : ""
        }
        `
      }
      pageIndex={pageIndex}
      width={150}
      {...onClick && { onClick: onClick }}
    />
    <div className="absolute inset-0 z-10 flex justify-center items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
      {actionButtons}
    </div>
  </div>
)