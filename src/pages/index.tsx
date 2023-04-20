import { type NextPage } from "next";
import Head from "next/head";

import { useEffect, useRef, useState } from "react";
import Drop from "@/components/Drop";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, degrees } from "pdf-lib";
import { blobToURL } from "@/utils/Utils";
import PagingControl from "@/components/PagingControl";
import { BigButton } from "@/components/BigButton";
import DraggableText from "@/components/DraggableText";
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
  const [originalPdf, setOriginalPdf] = useState(null);
  const [pdf, setPdfs]: [Array<string>, any] = useState(null);
  const [pageNum, setPageNum] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageDetails, setPageDetails] = useState(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const documentRef = useRef(null);

  useEffect(() => {
    setCurrentRotation(0);
  }, [pageNum]);

  const handleReset = async (e) => {
    e.preventDefault();
    setPdfs([originalPdf]);
    //                      setTotalPages(0);
    setPageNum(0);
    setCurrentRotation(0);
    //                  setPageDetails(null);
  };

  const handleRotatePage = async (inputDegrees: number = 90) => {
    setIsRotating(true);
    const pdfDoc = await PDFDocument.load(pdf, {
      ignoreEncryption: true
    });
    const pages = pdfDoc.getPages();
    const currentPage: any = pages[pageNum];
    if (currentPage) currentPage.setRotation(degrees(currentRotation + inputDegrees));
    setCurrentRotation(currentRotation + inputDegrees);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)]);
    const URL = await blobToURL(blob);
    setPdfs(URL);
    setIsRotating(false);
  };

  const handleRemovePage = async (inputPageNum: number = pageNum) => {
    setIsDeleting(true);
    const pdfDoc = await PDFDocument.load(pdf, {
      ignoreEncryption: true
    });
    pdfDoc.removePage(inputPageNum);
    let newPageNum = inputPageNum === totalPages - 1 ? inputPageNum - 1 : inputPageNum;
    newPageNum = newPageNum < 0 ? 0 : newPageNum;
    setPageNum(newPageNum);
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
    const [currentPage]: any = await pdfDoc.copyPages(pdfDoc, [pageNum]);
    pdfDoc.insertPage(newIndex, currentPage);
    await pdfDoc.save();
    pdfDoc.removePage(pageNum);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)]);
    const URL = await blobToURL(blob);
    setPdfs(URL);
    setPageNum(pageNum + 1);
  };

  let thumbnails: any[] = [];
  for (let i = 0; i < totalPages; i++) {
    thumbnails = [...thumbnails,
      <Page
        className={`rounded-md overflow-hidden max-h-[200px] cursor-pointer mr-4 ${i === pageNum ? "border-4 border-amber-300" : ""}`}
        pageNumber={i + 1}
        width={180}
        onClick={() => setPageNum(i)}
      />
    ];
  }

  return (
    <>
      <Head>
        <title>PDF File Handler</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={
        `flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]`
      }>

        <div className={
          `flex gap-12 px-4 py-16
          ${pdf ? "flex-row" : "flex-col items-center justify-center"}`
        }>

          <header className={
            `flex flex-col
            ${!pdf ? "items-center" : "max-w-sm"}
            `
          }>
            <img src="./whitevision.png" width={150} className="flex justify-center gap-2 text-lg mb-4" />
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
              <span className="text-[hsl(280,100%,70%)]">PDF</span> File Handler
            </h1>
            <h5 className="text-white font-extrabold uppercase ml-1 text-sm mt-2">product owned by Jasper B.</h5>
            <div className={
              `grid gap-4 mt-6
              ${!pdf ? "grid-cols-1" : "grid-cols-1"}
              `
            }>
              <Drop
                onLoaded={async (files: any) => {
                  const newPdf = await blobToURL(files[0]);
                  setPdfs((oldPdfs) => {
                    const result = oldPdfs ? oldPdfs.concat(newPdf) : [newPdf]
                    return result;
                  });
                  setOriginalPdf(newPdf);
                }}
                className={pdf ? "opacity-50" : "!p-16"}
              />
              {pdf
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
                    className={pdf ? "" : "opacity-40 pointer-events-none"}
                    onClick={() => {
                      downloadURI(pdf, "pdffilehandler.pdf");
                    }}
                  />
                </>
                : null}
            </div>
          </header>

          {pdf ? (
            <div style={{ color: "white" }}>
              <nav className={`${isLoading ? "disabled" : ""} flex gap-1 mb-2`}>
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
                className={`${(window.innerWidth < 1200) ? `w-[${window.innerWidth * 0.75}px]` : "w-[1000px] flex flex-col gap-2"}`}
              >

                {
                  (pdf?.length) &&
                  pdf?.map((pdfDoc, i) => <>

                    <Document
                      key={`pdfDoc-${i}`}
                      file={pdfDoc}
                      loading={<Loading />}
                      onLoadSuccess={(data) => {
                        setTotalPages(data.numPages);
                      }}
                      className="w-[800px]"
                    >
                      <Page
                        className="rounded-lg overflow-hidden"
                        pageNumber={pageNum + 1}
                        width={(window.innerWidth < 1200) ? window.innerWidth * 0.75 : 800}
                        onLoadSuccess={(data) => {
                          setPageDetails(data);
                        }}
                      />

                      thumbnails = [...thumbnails,
                      <Page
                        className={`rounded-md overflow-hidden max-h-[200px] cursor-pointer mr-4 ${i === pageNum ? "border-4 border-amber-300" : ""}`}
                        pageNumber={i + 1}
                        width={180}
                        onClick={() => setPageNum(i)}
                      />
                      ];

                      <PagingControl
                        pageNum={pageNum}
                        setPageNum={setPageNum}
                        totalPages={totalPages}
                      />
                    </Document>

                  </>)
                }
                {/*
                <section className={`w-[200px] overflow-y-auto overflow-x-hidden h-[600px] rounded-md relative`}>
                  <Document
                    file={pdf}
                    loading={undefined}
                  >
                    <div className="grid grid-cols-1 gap-2 p-r-2">
                      {thumbnails}
                    </div>
                  </Document>
                </section>
                */}
              </main>
            </div>
          ) : null}
        </div>

        <div
          className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 z-10 pointer-events-none" />
      </div>
    </>
  );
};

export default Home;