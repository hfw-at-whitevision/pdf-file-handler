import { type NextPage } from "next";
import Head from "next/head";

import { useCallback, useEffect, useRef, useState } from "react";
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
import update from "immutability-helper";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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
    setNumberOfThumbnails(oldNumberOfThumbnails => oldNumberOfThumbnails.filter((_, index) => index !== inputPdfIndex))

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

  const handleDeletePage = async (props) => {
    const { pdfIndex, pageIndex } = props;
    setIsDeleting(true);

    // if we are deleting the last page in PDF = delete the PDF
    if (totalPages[pdfIndex] === 1) {
      setPdfs(oldPdfs => oldPdfs.filter((pdf, index) => index !== pdfIndex));
      setTotalPages(oldTotalPages => oldTotalPages.filter((totalPage, index) => index !== pdfIndex));
      setPdfFileNames(oldPdfFileNames => oldPdfFileNames.filter((pdfFileName, index) => index !== pdfIndex));
      setNumberOfThumbnails(oldValues => oldValues.filter((value, index) => index !== pdfIndex));
    }
    else {
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
      setCurrent({ pdfIndex, pageIndex });
    }

    setIsDeleting(false);
  };

  const handleMovePage = async ({ fromPdfIndex, fromPageIndex, toPdfIndex }) => {
    const toPdfDoc = await PDFDocument.create(); // pdfs[toPdfIndex], { ignoreEncryption: true }
    const fromPdfDoc = await PDFDocument.load(pdfs[fromPdfIndex], { ignoreEncryption: true });

    // copy the moved page from PDF
    const [copiedPage] = await toPdfDoc.copyPages(fromPdfDoc, [fromPageIndex]);

    // insert the copied page to target PDF
    toPdfDoc.addPage(copiedPage);

    // remove the moved page from source PDF
    fromPdfDoc.removePage(fromPageIndex);

    // save the PDF files
    const pdfBytes = await fromPdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)]);
    const URL = await blobToURL(blob);

    const pdfBytes2 = await toPdfDoc.save();
    const blob2 = new Blob([new Uint8Array(pdfBytes2)]);
    const URL2 = await blobToURL(blob2);

    setPdfs(oldValues => {
      let newValues = oldValues
      newValues[fromPdfIndex] = URL
      newValues[toPdfIndex] = URL2
      return newValues
    });
    setNumberOfThumbnails(oldNumberOfThumbnails => {
      let newNumberOfThumbnails = oldNumberOfThumbnails
      newNumberOfThumbnails[fromPdfIndex].pop();
      newNumberOfThumbnails[toPdfIndex].push(1);
      return newNumberOfThumbnails;
    });
    setTotalPages(oldTotalPages => {
      let newTotalPages = oldTotalPages
      newTotalPages[fromPdfIndex] = oldTotalPages[fromPdfIndex] - 1
      newTotalPages[toPdfIndex] = oldTotalPages[toPdfIndex] + 1
      return newTotalPages
    });
  };

  const [numberOfThumbnails, setNumberOfThumbnails]: any = useState([]);

  // react-dnd  
  const [items, setItems] = useState();

  const moveCardHandler = (dragIndex, hoverIndex) => {
    const dragItem = items?.[dragIndex];

    if (dragItem) {
      setItems((prevState) => {
        const coppiedStateArray = [...prevState];
        // remove item by "hoverIndex" and put "dragItem" instead
        const prevItem = coppiedStateArray.splice(hoverIndex, 1, dragItem);
        // remove item by "dragIndex" and put "prevItem" instead
        coppiedStateArray.splice(dragIndex, 1, prevItem[0]);
        return coppiedStateArray;
      });
    }
  };

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


          <DndProvider backend={HTML5Backend}>
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

                        <Column title={`pdf-${pdfIndex}`} pdfIndex={pdfIndex}>
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
                            {
                              numberOfThumbnails[pdfIndex]?.map((item, pageIndex) =>
                                <Thumbnail
                                  key={`thumbnail-${pdfIndex}-${pageIndex}`}
                                  name={`thumbnail-${pdfIndex}-${pageIndex}`}
                                  currentColumnName={item.column}
                                  setItems={setItems}
                                  index={pageIndex}
                                  moveCardHandler={moveCardHandler}
                                  handleMovePage={handleMovePage}
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
                                        onClick={() => handleRotatePage({ pdfIndex, pageIndex })}
                                        disabled={isRotating}
                                        transparent={false}
                                      />
                                      <BigButton
                                        title={<><BsTrash /></>}
                                        onClick={() => handleDeletePage({ pdfIndex, pageIndex })}
                                        disabled={isRotating}
                                        transparent={false}
                                      />
                                    </>
                                  }
                                />
                              )
                            }

                          </Document>
                        </Column>
                      </>)
                  }
                </main>
              </div>
            ) : null}
          </DndProvider>
        </div>

      </div>
    </>
  );
};

export default Home;

const Thumbnail = ({
  // DPF
  pdfIndex, pageIndex, onClick, actionButtons, current, handleMovePage,
  // react-dnd
  name, index, currentColumnName, moveCardHandler, setItems
}) => {
  const ref = useRef(null);
  const changeItemColumn = async (currentItem, toPdfIndex) => {
    if (pdfIndex === toPdfIndex) return;

    console.log(`Moving thumbnail ${pageIndex} from PDF ${pdfIndex} to ${toPdfIndex}`)

    await handleMovePage({
      fromPdfIndex: pdfIndex,
      fromPageIndex: pageIndex,
      toPdfIndex: toPdfIndex,
    })

    setItems(prevState => {
      return prevState?.map((e) => {
        return {
          ...e,
          column: e.name === currentItem.name ? columnName : e.column
        };
      });
    });
  };
  const [, drop] = useDrop({
    accept: "pdfThumbnail",
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveCardHandler(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag]: any = useDrag({
    type: "pdfThumbnail",
    item: { index, name, pdfIndex, pageIndex, currentColumnName, type: "pdfThumbnail" },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      const columnName = dropResult?.name;
      const pdfIndex = dropResult?.pdfIndex;

      if (dropResult) {
        // move the page to other PDF
        changeItemColumn(item, pdfIndex);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  const opacity = isDragging ? 50 : 100;
  drag(drop(ref));

  return <>
    <div
      ref={ref}
      className={`relative group flex items-center justify-center opacity-${opacity}`}
      {...onClick && { onClick: onClick }}
    >
      <Page
        key={name}
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
  </>
}

const Column = ({ children, title, pdfIndex }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "pdfThumbnail",
    drop: () => ({ name: title, pdfIndex: pdfIndex }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    }),
  });

  const getBackgroundColor = () => {
    if (isOver) {
      if (canDrop) {
        return "rgb(188,251,255)";
      } else if (!canDrop) {
        return "rgb(255,188,188)";
      }
    } else {
      return "";
    }
  };

  return (
    <div
      ref={drop}
      style={{ backgroundColor: getBackgroundColor() }}
    >
      <p>{title}</p>
      {children}
    </div>
  );
};