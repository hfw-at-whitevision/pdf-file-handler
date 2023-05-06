import { type NextPage } from "next";
import Head from "next/head";
import { get, set } from 'idb-keyval';

import { useEffect, useRef, useState } from "react";
import Drop from "@/components/Drop";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, degrees } from "pdf-lib";
import { blobToURL } from "@/utils";
import { BigButton } from "@/components/BigButton";
import ButtonXl from "@/components/ButtonXl";
import { BsTrash, BsPlus, BsCheck2Circle } from "react-icons/bs";
import { RxReset } from "react-icons/rx";
import { GrRotateRight } from "react-icons/gr";
import Loading from "@/components/Loading";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Debug from "@/components/Debug";
import PlaceholderRow from "@/components/PlaceholderRow";
import PlaceholderThumbnail from "@/components/PlaceholderThumbnail";
import Row from "@/components/Row";
import ScrollDropTarget from "@/components/ScrollDropTarget";
import Thumbnail from "@/components/Thumbnail";

pdfjs.GlobalWorkerOptions.workerSrc = `./pdf.worker.min.js`;

const Home: NextPage = () => {
  const [pdfFileNames, setPdfFileNames] = useState([]);
  const [pdfs, setPdfs]: [any, any] = useState([]);
  const [current, setCurrent] = useState({ pdfIndex: 0, pageIndex: 0 });
  const [totalPages, setTotalPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [userIsDragging, setUserIsDragging] = useState(false);
  const documentRef = useRef(null);

  const [rows, setRows] = useState([]);


  const handleReset = async () => {
    setPdfs([]);
    setTotalPages([]);
    setPdfFileNames([]);
    setCurrent({ pdfIndex: 0, pageIndex: 0 });
    setNumberOfThumbnails([]);
    setRows([]);

    await set('numberOfThumbnails', numberOfThumbnails);
    await set('totalPages', totalPages);
    await set('pdfFileNames', pdfFileNames);
    await set('pdfs', pdfs);

    setStateChanged(oldValue => oldValue + 1);
  };

  const handleDeleteDocument = (inputPdfIndex: number) => {
    setIsLoading(true);
    setIsDeleting(true);

    if (current.pdfIndex === inputPdfIndex && current.pdfIndex === pdfs?.length - 1 && current.pdfIndex > 0) {
      setCurrent({ pdfIndex: current.pdfIndex - 1, pageIndex: 0 });
    }

    setPdfs((oldPdfs: any) => oldPdfs.filter((_, index) => index !== inputPdfIndex));
    setTotalPages(oldTotalPages => oldTotalPages.filter((_, index) => index !== inputPdfIndex));
    setPdfFileNames(oldPdfFileNames => oldPdfFileNames.filter((_, index) => index !== inputPdfIndex));
    setNumberOfThumbnails((oldNumberOfThumbnails: any) => oldNumberOfThumbnails.filter((_, index) => index !== inputPdfIndex))

    setCurrent({
      pdfIndex: (inputPdfIndex === pdfs?.length - 1 && inputPdfIndex > 0)
        ? inputPdfIndex - 1
        : inputPdfIndex,
      pageIndex: 0
    })

    setIsLoading(false);
    setIsDeleting(false);
    setStateChanged(oldValue => oldValue + 1);
  }

  const handleDeletePage = async ({ pdfIndex, pageIndex }: { pdfIndex: number, pageIndex: number }) => {
    setIsLoading(true);
    setIsDeleting(true);

    // if we are deleting the last page in PDF = delete the PDF
    if (totalPages[pdfIndex] === 1) {
      handleDeleteDocument(pdfIndex);
      return;
    }

    const pdfDoc = await PDFDocument.load(pdfs[pdfIndex], {
      ignoreEncryption: true, parseSpeed: 1500
    });
    pdfDoc.removePage(pageIndex);
    const URL = await pdfDoc.saveAsBase64({ dataUri: true });
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
    setCurrent({
      pdfIndex,
      pageIndex: (pageIndex === totalPages[pdfIndex] - 1)
        ? pageIndex - 1
        : pageIndex
    });

    setIsDeleting(false);
    setIsLoading(false);
    setStateChanged(oldValue => oldValue + 1);
  };

  const handleRotateDocument = async (inputPdfIndex: number) => {
    setIsLoading(true);
    console.log(`Rotating document ${inputPdfIndex}`)
    setIsRotating(true);
    const pdfDoc = await PDFDocument.load(pdfs[inputPdfIndex], {
      ignoreEncryption: true, parseSpeed: 1500
    });
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
      const currentPageRotation = page.getRotation().angle;
      const newDegrees = currentPageRotation + 90;
      page.setRotation(degrees(newDegrees));
    });

    const URL = await pdfDoc.saveAsBase64({ dataUri: true });

    setPdfs(oldPdfs => {
      let newPdfs = oldPdfs
      newPdfs[inputPdfIndex] = URL
      return newPdfs
    });
    setIsRotating(false);
    setIsLoading(false);
    setStateChanged(oldValue => oldValue + 1);
    console.log('finished')
  }

  const handleRotatePage = async ({ pdfIndex, pageIndex }) => {
    setIsLoading(true);
    setIsRotating(true);
    const pdfDoc = await PDFDocument.load(pdfs[pdfIndex], {
      ignoreEncryption: true, parseSpeed: 1500
    });
    const pages = pdfDoc.getPages();
    const currentPage = pages[pageIndex];
    const currentPageRotation = currentPage.getRotation().angle;
    const newDegrees = currentPageRotation + 90

    if (currentPage) currentPage.setRotation(degrees(newDegrees));

    const URL = await pdfDoc.saveAsBase64({ dataUri: true });

    setPdfs(oldPdfs => {
      let newPdfs = oldPdfs
      newPdfs[pdfIndex] = URL
      return newPdfs
    });
    setIsRotating(false);
    setCurrent({ pdfIndex, pageIndex });
    setIsLoading(false);
    setStateChanged(oldValue => oldValue + 1);
  };

  const handleMovePage = async ({ fromRow, fromRowIndice, toRow, toRowIndice, toPlaceholderRow = false, toPlaceholderThumbnail = false }) => {
    if (typeof toRow === 'undefined' && typeof toRowIndice === 'undefined') return;
    setIsLoading(true);

    const theThumbnail = rows[fromRow][fromRowIndice];

    setRows(oldRows => {
      const updatedRows = oldRows;
      updatedRows[fromRow].splice(fromRowIndice, 1);
      updatedRows[toRowIndice].splice(toRowIndice, 0, theThumbnail);
      return updatedRows;
    })

    setIsLoading(false);
    setStateChanged(oldValue => oldValue + 1);
  };

  const handleSplitDocument = async ({ pdfIndex, pageIndex }) => {
    if (pageIndex === 0) return;

    setIsLoading(true);

    const toPdfDoc = await PDFDocument.create()
    const fromPdfDoc = await PDFDocument.load(pdfs[pdfIndex], { ignoreEncryption: true, parseSpeed: 1500 });

    const pagesToMove = fromPdfDoc.getPageIndices().slice(pageIndex)

    // copy the moved page from PDF
    const copiedPages = await toPdfDoc.copyPages(fromPdfDoc, pagesToMove);
    pagesToMove.forEach((_, index) => toPdfDoc.addPage(copiedPages[index]));

    // remove the moved pages from source PDF
    for (let i = 0; i < pagesToMove.length; i++) {
      fromPdfDoc.removePage(totalPages[pdfIndex] - i - 1);
    }

    // save the PDF files
    const URL = await fromPdfDoc.saveAsBase64({ dataUri: true });

    const URL2 = await toPdfDoc.saveAsBase64({ dataUri: true });

    let newTotalPages = totalPages
    newTotalPages[pdfIndex] = totalPages[pdfIndex] - pagesToMove.length

    let newNumberOfThumbnails = numberOfThumbnails
    newNumberOfThumbnails[pdfIndex] = numberOfThumbnails[pdfIndex].slice(0, pageIndex);

    let newPdfs = pdfs
    newPdfs[pdfIndex] = URL

    // if source document is empty, remove it
    if (fromPdfDoc.getPageCount() === 1) {
      pdfFileNames.splice(pdfIndex, 1);
      newTotalPages.splice(pdfIndex, 1);
      newNumberOfThumbnails.splice(pdfIndex, 1);
      newPdfs.splice(pdfIndex, 1);
    }

    // add a new document right below the current document
    pdfFileNames.splice(pdfIndex + 1, 0, 'Nieuw document')
    newTotalPages.splice(pdfIndex + 1, 0, pagesToMove.length);
    newNumberOfThumbnails.splice(pdfIndex + 1, 0, new Array(pagesToMove.length).fill(1));
    newPdfs.splice(pdfIndex + 1, 0, URL2);

    setTotalPages(newTotalPages);
    setNumberOfThumbnails(newNumberOfThumbnails);
    setPdfs(newPdfs)
    setCurrent({ pdfIndex: pdfIndex + 1, pageIndex: 0 });
    setIsLoading(false);
    setStateChanged(oldValue => oldValue + 1);
  }

  // scroll thumbnail into view
  useEffect(() => {
    if (
      !pdfs?.length
      || current?.skipScrollIntoView
    ) return;

    let timer = null;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const thumbnailId = document.getElementById(`thumbnail-${current.pdfIndex}-${current.pageIndex}`);
      if (thumbnailId) thumbnailId.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);

    return () => clearTimeout(timer);
  }, [current]);


  const handleSaveDocument = async (pdfIndex) => {
    setIsLoading(true);
    const pdfDoc = await PDFDocument.load(pdfs[pdfIndex], { ignoreEncryption: true, parseSpeed: 1500 });
    const base64 = await pdfDoc.saveAsBase64({ dataUri: false });

    // save as PDF
    /*    const URL = await pdfDoc.saveAsBase64({ dataUri: true });
        const name = pdfFileNames[pdfIndex];
        var link: any = document.createElement("a");
        link.download = name;
        link.href = URL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    */

    const res = await fetch("https://devweb.docbaseweb.nl/api/files/uploadtodocbase", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        administrationCode: "1",
        pdfBase64: base64,
        fileName: pdfFileNames[pdfIndex],
        creationDate: new Date().toISOString(),
        pageCount: totalPages[pdfIndex],
      })
    });

    alert(JSON.stringify(res))

    setIsLoading(false);
    return base64
  }

  const [numberOfThumbnails, setNumberOfThumbnails]: any = useState([]);

  const renderActionButtons = (pdfIndex, pageIndex) => {
    return <>
      <BigButton
        title={<><GrRotateRight /></>}
        onClick={async () => handleRotatePage({ pdfIndex, pageIndex })}
        disabled={isRotating}
        transparent={false}
      />
      <BigButton
        title={<><BsTrash /></>}
        onClick={async () => handleDeletePage({ pdfIndex, pageIndex })}
        disabled={isRotating}
        transparent={false}
      />
    </>
  }

  const returnCurrentAndScroll = (newPdfIndex, newPageIndex) => {
    //const newThumbnailId = document.getElementById(`thumbnail-${newPdfIndex}-${newPageIndex}`);
    //if (newThumbnailId) newThumbnailId.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return ({ pdfIndex: newPdfIndex, pageIndex: newPageIndex });
  }

  // keypress listener
  useEffect(() => {
    const eventListener = async (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          if (current?.pageIndex > 0) setCurrent(oldValue => returnCurrentAndScroll(oldValue?.pdfIndex, oldValue?.pageIndex - 1));
          else if (current?.pdfIndex > 0) setCurrent(oldValue => returnCurrentAndScroll(oldValue?.pdfIndex - 1, totalPages[oldValue?.pdfIndex - 1] - 1));
          break;
        case 'ArrowRight':
          if (current?.pageIndex < totalPages[current?.pdfIndex] - 1) {
            setCurrent(oldValue => returnCurrentAndScroll(oldValue?.pdfIndex, oldValue?.pageIndex + 1));
          }
          else if (current?.pdfIndex < pdfs?.length - 1) {
            setCurrent(oldValue => returnCurrentAndScroll(oldValue?.pdfIndex + 1, 0));
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (current?.pageIndex > 3) setCurrent(oldValue => {
            const newPdfIndex = oldValue?.pdfIndex;
            const newPageIndex = oldValue?.pageIndex - 4;
            return returnCurrentAndScroll(newPdfIndex, newPageIndex);
          });
          else if (current?.pdfIndex > 0) setCurrent(oldValue => {
            const newPdfIndex = oldValue?.pdfIndex - 1;
            const newPageIndex = totalPages[oldValue?.pdfIndex - 1] - 1;
            return returnCurrentAndScroll(newPdfIndex, newPageIndex);
          });
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (current?.pageIndex < totalPages[current?.pdfIndex] - 4) setCurrent(oldValue => {
            const newPdfIndex = oldValue?.pdfIndex;
            const newPageIndex = oldValue?.pageIndex + 4;
            return returnCurrentAndScroll(newPdfIndex, newPageIndex);
          });
          else if (current?.pdfIndex < pdfs?.length - 1) setCurrent(oldValue => {
            const newPdfIndex = oldValue?.pdfIndex + 1;
            const newPageIndex = 0;
            return returnCurrentAndScroll(newPdfIndex, newPageIndex);
          });
          else if (current?.pageIndex < totalPages[current?.pdfIndex] - 1) setCurrent(oldValue => {
            const newPdfIndex = oldValue?.pdfIndex;
            const newPageIndex = totalPages[oldValue?.pdfIndex] - 1;
            return returnCurrentAndScroll(newPdfIndex, newPageIndex);
          });
          break;
        case ' ':
          event.preventDefault();
          await handleSplitDocument(current);
          break;
        case 'Delete':
          await handleDeletePage(current);
          break;
        case 'Backspace':
          await handleDeleteDocument(current?.pdfIndex);
          break;
        case 'r':
          await handleRotatePage(current);
          break;
        case 'R':
          await handleRotateDocument(current?.pdfIndex);
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', eventListener);

    return () => window.removeEventListener('keydown', eventListener);
  }, [current?.pdfIndex, current?.pageIndex, totalPages]);

  // state save
  const [stateChanged, setStateChanged] = useState(0);
  const saveState = async () => {
    await set('numberOfThumbnails', numberOfThumbnails);
    await set('totalPages', totalPages);
    await set('pdfFileNames', pdfFileNames);
    await set('pdfs', pdfs);
    await set('rows', rows);
    console.log(`PDF's saved.`)
  }
  useEffect(() => {
    if (!pdfs) return;
    saveState();
  }, [stateChanged]);
  // state fetch
  const fetchState = async () => {
    get('pdfs').then((pdfs) => {
      if (!pdfs) return;
      get('pdfFileNames').then((pdfFileNames) => {
        get('totalPages').then((totalPages) => {
          get('rows').then((rows) => {
            get('numberOfThumbnails').then((numberOfThumbnails) => {
              setPdfFileNames(pdfFileNames);
              setTotalPages(totalPages);
              setNumberOfThumbnails(numberOfThumbnails);
              setRows(rows);
              setPdfs(pdfs);
              console.log(`PDF's fetched.`)
            });
          });
        });
      });
    });
  }
  useEffect(() => {
    fetchState();
  }, []);

  const handleDropzoneLoaded = async (files) => {
    setIsLoading(true)

    for (let i = 0; i < files.length; i++) {
      let newPdf: string = await blobToURL(files[i]);
      const currentPdfIndex = pdfs?.length;

      setLoadingMessage(`Document ${i + 1} van ${files.length} wordt geladen...`)

      // check file size
      const fileSize = files[i]['size'] / 1024 / 1024;
      if (fileSize > 25) {
        alert(`${files[i]['name']} is groter dan 25MB. Gelieve het bestand te verkleinen.`)
        continue;
      }

      // MSG / EML / TIFF files: send to Serge API
      if (
        files[i]['type'] === 'application/vnd.ms-outlook'
        || files[i]['type'] === 'message/rfc822'
        || files[i]['type'] === 'image/tiff'
      ) {
        console.log(`MSG / EML file detected. Sending to Serge API.`)
        const convertedBase64Msg = newPdf.replace(`data:application/octet-stream;base64,`, '').replace(`data:image/tiff;base64,`, '')

        const res = await fetch('/api/converttopdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            msgFileBase64: convertedBase64Msg,
            fileName: files[i]['name']
          })
        })
          .then(res => res.json())
          .catch(err => console.log(err));

        const returnedPdfs = res?.pdfFiles

        // iterating over returned PDF's from API
        for (let i = 0; i < returnedPdfs?.length; i++) {
          const filename = returnedPdfs[i].fileName;
          let dataHeaders = '';
          if (filename.endsWith('.pdf')) dataHeaders = 'data:application/pdf;base64,';
          else if (filename.endsWith('.tif') || filename.endsWith('.tiff')) dataHeaders = 'data:image/tiff;base64,';
          else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) dataHeaders = 'data:image/jpeg;base64,';
          else if (filename.endsWith('.png')) dataHeaders = 'data:image/png;base64,';
          else continue;

          const newPdf = 'data:application/pdf;base64,' + returnedPdfs[i].pdfFileBase64;

          console.log(`${filename}: \n ${newPdf}`)

          setPdfs((oldPdfs) => {
            const result = oldPdfs ? oldPdfs.concat(newPdf) : [newPdf];
            return result;
          });
          const newPdfDoc = await PDFDocument.load(newPdf, { ignoreEncryption: true, parseSpeed: 1500 })
          const pages = newPdfDoc.getPageCount();
          setTotalPages(oldTotalPages => [...oldTotalPages, pages]);
          setPdfFileNames(oldFileNames => [...oldFileNames, filename]);
          console.log('Updating numberOfThumbnails')

          let pagesOfUploadedPdf = []
          for (let x = 0; x < pages; x++) {
            pagesOfUploadedPdf.push(x)
          }
          setNumberOfThumbnails(oldValue => [...oldValue, pagesOfUploadedPdf])
        }
        continue;
      }
      // JPG / PNG: process it
      else if (files[i]['type'] === 'image/jpeg' || files[i]['type'] === 'image/png') {
        const pdfDoc = await PDFDocument.create()
        const image = (files[i]['type'] === 'image/jpeg')
          ? await pdfDoc.embedJpg(newPdf)
          : await pdfDoc.embedPng(newPdf)
        const page = pdfDoc.addPage([image.width, image.height])
        const dims = image.scale(1)
        page.drawImage(image, {
          x: page.getWidth() / 2 - dims.width / 2,
          y: page.getHeight() / 2 - dims.height / 2,
          width: dims.width,
          height: dims.height,
        });
        newPdf = await pdfDoc.saveAsBase64({ dataUri: true })
      }
      // skip the file if its not an image or pdf
      else if (files[i]['type'] !== 'application/pdf' && files[i]['type'] !== 'image/jpeg' && files[i]['type'] !== 'image/png') {
        alert(`${files[i]['name']} is overgeslagen. Het bestand is geen geldige PDF of afbeelding.`)
        continue;
      }
      // JPG / PNG / PDF files: further process it
      await PDFDocument.load(newPdf, { ignoreEncryption: true, parseSpeed: 1500 })
        .then(newPdfDoc => {
          const pageCount = newPdfDoc?.getPageCount()
          setTotalPages(oldTotalPages => [pageCount, ...oldTotalPages]);
          setPdfFileNames(oldFileNames => [files[i]['name'], ...oldFileNames]);
          console.log('Updating numberOfThumbnails')

          let pagesOfUploadedPdf = []
          for (let x = 0; x < pageCount; x++) {
            pagesOfUploadedPdf.push(x)
          }
          setNumberOfThumbnails(oldValue => [pagesOfUploadedPdf, ...oldValue]);
          setPdfs((oldPdfs) => {
            const result = oldPdfs ? [newPdf].concat(oldPdfs) : [newPdf];
            return result;
          });

          const row = new Array(pageCount).fill(false).map((_, currentPageIndex) => {
            return {
              pdfIndex: currentPdfIndex,
              pageIndex: currentPageIndex,
              rotation: 0,
            }
          });

          setRows(oldRowsState => [row]?.concat(oldRowsState));
        })
        .catch(err => {
          // on error: as a last resort, send to Serge API to try repair
          try {
            const theDoc = newPdf.replace(`data:application/pdf;base64,`, '')
            console.log(`Sending document to API to attempt repair for ${files[i]['name']}.`)
            fetch('/api/converttopdf', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                msgFileBase64: theDoc,
                fileName: files[i]['name']
              })
            })
              .then(res => res.json())
              .then(async (res2) => {
                const repairedPdf = 'data:application/pdf;base64,' + res2.pdfFiles[0].pdfFileBase64;
                console.log('PDF repair attempt successful. ')

                await PDFDocument.load(repairedPdf, { ignoreEncryption: true, parseSpeed: 1500 })
                  .then(newPdfDoc => {
                    const pages = newPdfDoc?.getPageCount();
                    setTotalPages(oldTotalPages => [...oldTotalPages, pages]);
                    setPdfFileNames(oldFileNames => [...oldFileNames, files[i].name]);
                    console.log('Updating numberOfThumbnails')

                    let pagesOfUploadedPdf = []
                    for (let x = 0; x < pages; x++) {
                      pagesOfUploadedPdf.push(x)
                    }
                    setNumberOfThumbnails(oldValue => [...oldValue, pagesOfUploadedPdf]);
                    setPdfs((oldPdfs) => {
                      const result = oldPdfs ? oldPdfs.concat(newPdf) : [newPdf];
                      return result;
                    });
                  })
              })
          }
          catch {
            alert(`Fout bij het laden van ${files[i]['name']}. Het document wordt overgeslagen.`);
            console.log(err);
            console.log(newPdf)
            return;
          }
        })
    }

    setStateChanged(oldValue => oldValue + 1)
    setLoadingMessage('')
    setIsLoading(false)
  }

  return (
    <>
      <Head>
        <title>PDF File Handler</title>
      </Head>

      <Loading inset={true} loading={isLoading} message={loadingMessage} />

      <Debug
        pdfs={pdfs}
        totalPages={totalPages}
        numberOfThumbnails={numberOfThumbnails}
        current={current}
        userIsDragging={userIsDragging}
        rows={rows}
      />

      <div className={
        `flex min-h-screen ${!pdfs?.length ? 'items-center' : ''} justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]`
      }>

        <div className={
          `flex gap-8 px-4 py-16          ${pdfs ? "flex-row" : "flex-col items-center justify-center"}`
        }>
          <header className={
            `flex flex-col            ${!pdfs ? "items-center" : "max-w-xs"}            `
          }>
            <nav className="sticky top-8">
              <img src="./whitevision.png" width={150} className="flex justify-center gap-2 text-lg " />
              <div className={
                `grid gap-4 mt-6              ${!pdfs ? "grid-cols-1" : "grid-cols-1"}              `
              }>
                <Drop
                  onLoaded={handleDropzoneLoaded}
                  className={pdfs?.length ? "opacity-50" : "!p-16"}
                />
                {
                  pdfs?.length
                    ? <>
                      <ButtonXl
                        title={"Reset"}
                        icon={<RxReset />}
                        description="Maak alle wijzigingen ongedaan en reset naar de oorspronkelijke PDF."
                        onClick={async () => await handleReset()}
                      />
                    </>
                    : null
                }
              </div>
            </nav>
          </header>

          <DndProvider backend={HTML5Backend}>
            <ScrollDropTarget position='top' isDragging={userIsDragging} />

            {pdfs?.length ? (
              <main
                ref={documentRef}
                className="flex-col text-white items-start"
              >

                <PlaceholderRow pdfIndex={0} isDragging={userIsDragging} isLoading={isLoading} totalPages={totalPages} />

                {rows?.map((singleRow, rowNumber) => <>
                  <Row row={rowNumber} key={`row-${rowNumber}`}>
                    <div className="col-span-2 lg:col-span-3 xl:col-span-4 mb-4 flex items-center justify-between">
                      <span className="text-sm">
                        <h3 className="mr-2 inline">{pdfFileNames[rowNumber]}</h3>
                        ({totalPages[rowNumber]} {totalPages[rowNumber] > 1 ? ' pagina\'s' : ' pagina'})
                      </span>

                      <nav className={`${isLoading ? "disabled" : ""} flex gap-1 w-[270px] justify-end`}>
                        <BigButton
                          title={<><BsCheck2Circle /><span className="text-xs">naar administratie</span></>}
                          onClick={async () => {
                            const base64 = await handleSaveDocument(rowNumber);
                            alert(base64)
                          }}
                        />
                        <BigButton
                          title={<><GrRotateRight /></>}
                          onClick={async () => await handleRotateDocument(rowNumber)}
                          disabled={isRotating}
                        />
                        <BigButton
                          title={<><BsTrash /></>}
                          onClick={async () => await handleDeleteDocument(rowNumber)}
                          disabled={isRotating}
                        />
                      </nav>
                    </div>

                    <div className='relative'>
                      <div
                        loading={<Loading />}
                        className={
                          `grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 w-full`
                        }
                      >

                        {/* thumbnails of current PDF */}
                        {singleRow?.map((item, rowIndice) => <>
                          <div className="flex flex-row">
                            {
                              /* first placeholder thumbnail in row */
                              rowIndice % 4 === 0 &&
                              <PlaceholderThumbnail row={rowNumber} rowIndice={rowIndice - 0.5} isDragging={userIsDragging} totalPages={totalPages} isLoading={isLoading} margin='mr-2' />
                            }
                            <Thumbnail
                              pdfs={pdfs}
                              rows={rows}
                              setRows={setRows}
                              key={`thumbnail-${rowNumber}-${rowIndice}`}
                              index={rowIndice}
                              handleMovePage={handleMovePage}
                              row={rowNumber}
                              rowIndice={rowIndice}
                              pdfIndex={item?.pdfIndex}
                              pageIndex={item?.pageIndex}
                              setUserIsDragging={setUserIsDragging}
                              current={current}
                              actionButtons={renderActionButtons(rowNumber, rowIndice)}
                            />
                            <PlaceholderThumbnail row={rowNumber} rowIndice={rowIndice + 0.5} isDragging={userIsDragging} totalPages={totalPages} isLoading={isLoading} key={`thumbnail-${rowNumber}-${rowIndice + 0.5}-placeholder`} margin='ml-2' />
                          </div>
                        </>
                        )
                        }

                      </div>
                    </div>
                  </Row>

                  <PlaceholderRow row={rowNumber + 0.5} isDragging={userIsDragging} isLoading={isLoading} totalPages={totalPages} />

                </>
                )}

              </main>
            ) : null}

            <ScrollDropTarget position='bottom' isDragging={userIsDragging} />
          </DndProvider>

          {/* PDF preview */}
          {(pdfs?.length && current?.pdfIndex !== undefined && current?.pageIndex !== undefined && pdfs[current?.pdfIndex])
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
                    devicePixelRatio={20}
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