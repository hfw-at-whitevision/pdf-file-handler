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
import { BsTrash, BsPlus, BsCheck2Circle } from "react-icons/bs";
import { RxReset } from "react-icons/rx";
import { GrRotateRight } from "react-icons/gr";
import Loading from "@/components/Loading";
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
  const [userIsDragging, setUserIsDragging] = useState(false);
  const documentRef = useRef(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setPdfs([originalPdf]);
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
    setIsLoading(true);
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
    setIsLoading(false);
  }

  const handleRotatePage = async ({ pdfIndex, pageIndex }) => {
    setIsLoading(true);
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
    setIsLoading(false);
  };

  const handleDeletePage = async (props) => {
    setIsLoading(true);
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
    setIsLoading(false);
  };

  const handleMovePage = async ({ fromPdfIndex, fromPageIndex, toPdfIndex, toPageIndex, toPlaceholderRow = false, toPlaceholderThumbnail = false }) => {
    setIsLoading(true);

    if (typeof toPdfIndex === 'undefined' && typeof toPageIndex === 'undefined') return;

    if (toPlaceholderThumbnail && fromPdfIndex === toPdfIndex) {
      const pdfDoc = await PDFDocument.load(pdfs[fromPdfIndex], { ignoreEncryption: true, });
      const [currentPage]: any = await pdfDoc.copyPages(pdfDoc, [fromPageIndex]);
      pdfDoc.insertPage(toPageIndex, currentPage);
      await pdfDoc.save();
      // if moving up, we need to account for the fact that the page will be removed from the original PDF
      pdfDoc.removePage(toPageIndex < fromPageIndex ? fromPageIndex + 1 : fromPageIndex);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)]);
      const URL = await blobToURL(blob);
      setPdfs(oldPdfs => {
        let newPdfs = oldPdfs
        newPdfs[fromPdfIndex] = URL
        return newPdfs
      });
      setCurrent({ pdfIndex: fromPdfIndex, pageIndex: toPageIndex < fromPageIndex ? toPageIndex : toPageIndex - 1 });

      setIsLoading(false);
      return;
    }

    // if moving down, we need to account for the fact that the page will be removed from the original PDF
    if (toPlaceholderRow && toPdfIndex > fromPdfIndex) toPdfIndex -= 1;

    console.log(`Moving page ${fromPageIndex} from pdf ${fromPdfIndex} to pdf ${toPdfIndex}`)

    const toPdfDoc = toPlaceholderRow
      ? await PDFDocument.create()
      : await PDFDocument.load(pdfs[toPdfIndex], { ignoreEncryption: true });
    const fromPdfDoc = await PDFDocument.load(pdfs[fromPdfIndex], { ignoreEncryption: true });

    // copy the moved page from PDF
    const [copiedPage] = await toPdfDoc.copyPages(fromPdfDoc, [fromPageIndex]);

    // insert the copied page to target PDF
    if (toPageIndex) toPdfDoc.insertPage(toPageIndex, copiedPage);
    else toPdfDoc.addPage(copiedPage);

    // remove the moved page from source PDF
    fromPdfDoc.removePage(fromPageIndex);

    // save the PDF files
    const pdfBytes = await fromPdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)]);
    const URL = await blobToURL(blob);

    const pdfBytes2 = await toPdfDoc.save();
    const blob2 = new Blob([new Uint8Array(pdfBytes2)]);
    const URL2 = await blobToURL(blob2);

    let newTotalPages = totalPages
    newTotalPages[fromPdfIndex] = totalPages[fromPdfIndex] - 1
    newTotalPages[toPdfIndex] = toPlaceholderRow
      ? newTotalPages[toPdfIndex]
      : totalPages[toPdfIndex] + 1

    let newNumberOfThumbnails = numberOfThumbnails
    newNumberOfThumbnails[fromPdfIndex].pop();
    if (!toPlaceholderRow) newNumberOfThumbnails[toPdfIndex].push(1);

    let newPdfs = pdfs
    newPdfs[fromPdfIndex] = URL
    newPdfs[toPdfIndex] = toPlaceholderRow
      ? newPdfs[toPdfIndex]
      : URL2

    // if source document is empty, remove it
    if (fromPdfDoc.getPages().length === 1) {
      pdfFileNames.splice(fromPdfIndex, 1);
      newTotalPages.splice(fromPdfIndex, 1);
      newNumberOfThumbnails.splice(fromPdfIndex, 1);
      newPdfs.splice(fromPdfIndex, 1);
    }

    // if moving to placeholder row, add a new placeholder row
    if (toPlaceholderRow) {
      pdfFileNames.splice(toPdfIndex, 0, 'Nieuw document')
      newTotalPages.splice(toPdfIndex, 0, 1);
      newNumberOfThumbnails.splice(toPdfIndex, 0, [1]);
      newPdfs.splice(toPdfIndex, 0, URL2);
    }

    setTotalPages(newTotalPages);
    setNumberOfThumbnails(newNumberOfThumbnails);
    setPdfs(newPdfs)
    setCurrent({ pdfIndex: toPdfIndex, pageIndex: toPageIndex ?? toPdfDoc.getPages().length - 1 });
    setIsLoading(false);
  };

  const [numberOfThumbnails, setNumberOfThumbnails]: any = useState([]);

  const renderActionButtons = (pdfIndex, pageIndex) => {
    return <>
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

  // keypress listener
  useEffect(() => {
    const eventListener = event => {
      switch (event.key) {
        case 'ArrowLeft':
          setCurrent({ ...current, pageIndex: current.pageIndex - 1 });
          break;
        case 'ArrowRight':
          setCurrent(oldValue => ({ pdfIndex: oldValue?.pdfIndex, pageIndex: current.pageIndex + 1 }));
          break;
        case 'ArrowUp':
          if (current.pdfIndex > 0) setCurrent({ ...current, pdfIndex: current.pdfIndex - 1 });
          break;
        case 'ArrowDown':
          if (current.pdfIndex < pdfs.length - 1) setCurrent({ ...current, pdfIndex: current.pdfIndex + 1 });
          break;
        case 'Delete':
          handleDeletePage(current);
          break;
        case 'Backspace':
          handleDeletePage(current);
          break;
        case 'r':
          handleRotatePage(current);
          break;
        case 'R':
          handleRotatePage(current);
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', eventListener);
  }, []);

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
        `flex min-h-screen ${!pdfs?.length ? 'items-center' : ''} justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]`
      }>

        <div className={
          `flex gap-8 px-4 py-16
          ${pdfs ? "flex-row" : "flex-col items-center justify-center"}`
        }>
          <header className={
            `flex flex-col
            ${!pdfs ? "items-center" : "max-w-xs"}
            `
          }>
            <nav className="sticky top-8">
              <img src="./whitevision.png" width={150} className="flex justify-center gap-2 text-lg " />
              <div className={
                `grid gap-4 mt-6
              ${!pdfs ? "grid-cols-1" : "grid-cols-1"}
              `
              }>
                <Drop
                  onLoaded={async (files: any) => {
                    setIsLoading(true)
                    for (let i = 0; i < files.length; i++) {
                      const newPdf = await blobToURL(files[i]);
                      setPdfs((oldPdfs) => {
                        const result = oldPdfs ? oldPdfs.concat(newPdf) : [newPdf];
                        return result;
                      });
                      const newPdfDoc = await PDFDocument.load(newPdf)
                      const pages = newPdfDoc.getPages().length
                      setTotalPages(oldTotalPages => [...oldTotalPages, pages]);
                      setPdfFileNames(oldFileNames => [...oldFileNames, files[i].name]);
                      console.log('Updating numberOfThumbnails')

                      let pagesOfUploadedPdf = []
                      for (let x = 0; x < pages; x++) {
                        pagesOfUploadedPdf.push(x)
                      }

                      setNumberOfThumbnails(oldValue => [...oldValue, pagesOfUploadedPdf])
                    }
                    setIsLoading(false)
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
            </nav>
          </header>

          <DndProvider backend={HTML5Backend}>
            <ScrollDropTarget position='top' isDragging={userIsDragging} />

            {pdfs ? (
              <main
                ref={documentRef}
                className="flex-col text-white items-start"
              >

                <PlaceholderRow pdfIndex={0} isDragging={userIsDragging} isLoading={isLoading} totalPages={totalPages} />

                {pdfs?.map((pdfDoc, pdfIndex) => <>
                  <Row pdfIndex={pdfIndex} key={`pdf-${pdfIndex}`}>
                    <div className="col-span-2 lg:col-span-3 xl:col-span-4 mb-4 flex items-center justify-between">
                      <span className="text-sm">
                        <h3 className="mr-2 inline">{pdfFileNames[pdfIndex]}</h3>
                        ({totalPages[pdfIndex]} {totalPages[pdfIndex] > 1 ? ' pagina\'s' : ' pagina'})
                      </span>

                      <nav className={`${isLoading ? "disabled" : ""} flex gap-1 w-[270px] justify-end`}>
                        <BigButton
                          title={<><BsCheck2Circle /><span className="text-xs">naar administratie</span></>}
                          onClick={() => handleRotateDocument(pdfIndex)}
                        />
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

                    <div className='relative'>
                      <Document
                        file={pdfDoc}
                        loading={<Loading />}
                        className={
                          `grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 w-full`
                        }
                      >
                        {/* thumbnails of current PDF */}
                        {numberOfThumbnails[pdfIndex]?.map((item, pageIndex) => <>
                          <div className="flex flex-row">
                            {
                              pageIndex === 0 &&
                              /* first placeholder thumbnail */
                              <PlaceholderThumbnail pdfIndex={pdfIndex} pageIndex={0} isDragging={userIsDragging} totalPages={totalPages} isLoading={isLoading} margin='mr-2' />
                            }
                            <Thumbnail
                              key={`thumbnail-${pdfIndex}-${pageIndex}`}
                              index={pageIndex}
                              handleMovePage={handleMovePage}
                              pageIndex={pageIndex}
                              pdfIndex={pdfIndex}
                              setUserIsDragging={setUserIsDragging}
                              current={current}
                              onClick={() => setCurrent(oldValues => ({
                                ...oldValues,
                                pdfIndex: pdfIndex,
                                pageIndex: pageIndex,
                              }))}
                              actionButtons={renderActionButtons(pdfIndex, pageIndex)}
                            />
                            <PlaceholderThumbnail pdfIndex={pdfIndex} pageIndex={pageIndex + 0.5} isDragging={userIsDragging} totalPages={totalPages} isLoading={isLoading} key={`thumbnail-${pdfIndex}-${pageIndex + 0.5}-placeholder`} margin='ml-2' />
                          </div>
                        </>
                        )
                        }
                      </Document>
                    </div>
                  </Row>

                  <PlaceholderRow pdfIndex={pdfIndex + 0.5} isDragging={userIsDragging} isLoading={isLoading} totalPages={totalPages} />
                </>
                )
                }
              </main>
            ) : null}

            <ScrollDropTarget position='bottom' isDragging={userIsDragging} />
          </DndProvider>

          {/* PDF preview */}
          {(pdfs?.length)
            && <div>
              <Document
                file={pdfs[current?.pdfIndex]}
                loading={<Loading />}
                className='w-[800px] sticky top-8'
              >
                {!isLoading &&
                  <Page
                    pageIndex={current?.pageIndex}
                    loading={<Loading />}
                    width={800}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    className={`rounded-lg shadow-lg overflow-hidden`}
                  />
                }
              </Document>
            </div>
          }
        </div>

      </div>
    </>
  );
};
export default Home;










const Thumbnail = ({ pdfIndex, pageIndex, onClick, actionButtons, current, handleMovePage, index, setUserIsDragging }) => {
  const ref = useRef(null);
  const [collected, drop] = useDrop({
    accept: "pdfThumbnail",
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag]: any = useDrag({
    type: "pdfThumbnail",
    item: { index, pdfIndex, pageIndex, type: "pdfThumbnail" },
    end: async (item, monitor) => {
      const dropResult = monitor.getDropResult();
      const toPdfIndex = dropResult?.pdfIndex;
      const toPageIndex = dropResult?.pageIndex;
      const type = dropResult?.type;

      if (dropResult && type === "placeholderThumbnail") {
        await handleMovePage({
          fromPdfIndex: pdfIndex,
          fromPageIndex: pageIndex,
          toPdfIndex: toPdfIndex,
          toPageIndex: toPageIndex,
          toPlaceholderThumbnail: true,
        })
      }
      else if (
        dropResult && pdfIndex !== toPdfIndex && type !== "scrollDropTarget"
        || dropResult && pdfIndex === toPdfIndex && type === "placeholderRow"
      ) {
        // move the page to other PDF
        await handleMovePage({
          fromPdfIndex: pdfIndex,
          fromPageIndex: pageIndex,
          toPdfIndex: toPdfIndex,
          toPlaceholderRow: type === "placeholderRow" ? true : false,
        })
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  useEffect(() => {
    setUserIsDragging(isDragging)
  }, [isDragging])

  drag(drop(ref));

  return <>
    <div
      key={`thumbnail-${pdfIndex}-${pageIndex}`}
      ref={ref}
      className={
        `relative group flex items-center justify-center rounded-md overflow-hidden
        ${(pageIndex === current.pageIndex && pdfIndex === current.pdfIndex)
          ? "border-4 border-amber-300"
          : ""}
        opacity-${isDragging ? '40' : '100'}`
      }
      {...onClick && { onClick: onClick }}
    >
      <Page
        scale={1}
        loading={<Loading />}
        className={
          `w-[150px] max-h-[150px] h-fit cursor-pointer relative rounded-md overflow-hidden
            pdf-${pdfIndex}-${pageIndex}`
        }
        pageIndex={pageIndex}
        width={150}
        {...onClick && { onClick }}
      />
      <div className="absolute inset-0 z-10 flex justify-center items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto cursor-move bg-black/75">
        <div className="grid grid-cols-2 gap-1">
          {actionButtons}
        </div>
      </div>
    </div>
  </>
}










const Row = ({ children, pdfIndex }) => {
  const [{ isOver, isNotOverPlaceholderThumbnail, canDrop }, drop] = useDrop({
    accept: "pdfThumbnail",
    drop: () => {
      if (isNotOverPlaceholderThumbnail) return { pdfIndex: pdfIndex, type: 'row' }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isNotOverPlaceholderThumbnail: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  return <div
    ref={drop}
    className={`
    p-4 rounded-lg w-[660px] mb-4
    ${isOver && canDrop && isNotOverPlaceholderThumbnail ? 'bg-amber-300 shadow-4xl' : 'bg-white/20 shadow-2xl'}
    `}
  >
    {children}
  </div>
};










const PlaceholderRow = ({ pdfIndex, isDragging, isLoading, totalPages }) => {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: "pdfThumbnail",
    drop: () => ({ pdfIndex: Math.ceil(pdfIndex), type: 'placeholderRow' }),
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  });

  return <div
    ref={drop}
    className={`
      shadow-2xl rounded-lg w-[660px] flex items-center justify-center
      border-dashed border-lime-200 border
      ${isDragging && canDrop // && totalPages[pdfIndex] > 1
        ? 'h-auto p-1 opacity-100 mb-4'
        : 'h-0 p-0 opacity-0 border-0 mb-0'}
      ${isOver && canDrop// && totalPages[pdfIndex] > 1
        ? 'p-8 bg-lime-100/90 border-transparent'
        : ''}
      ${isLoading ? 'hidden' : ''}
    `}
  >
    <BsPlus className={`text-lime-200 ${!isDragging ? 'hidden' : ''} ${isOver ? '!text-black text-4xl' : 'text-xs'}`} />
  </div>
};










function PlaceholderThumbnail({ pdfIndex, pageIndex, isDragging, isLoading, totalPages, margin }) {
  // hide placeholders if only 1 page in PDF
  if (totalPages[pdfIndex] === 1) return null;

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: "pdfThumbnail",
    drop: () => {
      console.log(`toPageIndex: ${pageIndex}. toPdfIndex: ${pdfIndex}`)
      return { pdfIndex, pageIndex: Math.ceil(pageIndex), type: 'placeholderThumbnail' }
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  });

  return <>
    <div
      ref={drop}
      className={
        `h-auto relative rounded-md bg-amber-300 group
        w-[0]
        before:content-[''] before:absolute before:w-[40px] before:h-full before:z-10 before:bg-red-30000000 before:translate-x-[-40px]
        ${isOver ? '!w-[100px]' : ''}
        after:content-[''] after:absolute after:w-[40px] after:h-full after:z-10 after:bg-red-3000000 after:translate-x-[40px]
        ${isOver ? margin : null}
      `}
    />
  </>
}

/*
${isDragging ? 'bg-lime-300 w-[2px]' : 'w-10'}
        ${isOver ? '!w-[75px]' : ''}
        ${isDragging ? margin : 'm-0'}
        */








function ScrollDropTarget({ isDragging, position }) {
  const scrollBy =
    position === 'top'
      ? -20
      : 20;

  const scrollUp = () => {
    window.scrollBy(0, scrollBy);
  };

  const scrollTopDropRef = useRef(null);
  const [{ isOver }, drop] = useDrop({
    accept: "pdfThumbnail",
    drop: () => ({ type: 'scrollDropTarget' }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(scrollTopDropRef);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isOver) {
        scrollUp();
      } else {
        clearInterval(intervalId);
      }
    }, 10);

    return () => {
      clearInterval(intervalId);
    };
  }, [isOver]);

  return <div
    ref={scrollTopDropRef}
    className={
      `fixed left-0 right-0 h-[80px] z-50
      ${position === 'top' ? 'top-0' : 'bottom-0'}
      ${isDragging ? 'pointer-events-auto' : 'pointer-events-none'}`
    }
  />;
}