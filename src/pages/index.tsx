import { type NextPage } from "next";
import Head from "next/head";
import { get, set } from 'idb-keyval';

import { useEffect, useRef, useState } from "react";
import Drop from "@/components/Drop";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, degrees } from "pdf-lib";
import { blobToURL } from "@/utils/Utils";
import { BigButton } from "@/components/BigButton";
import ButtonXl from "@/components/ButtonXl";
import { BsTrash, BsPlus, BsCheck2Circle } from "react-icons/bs";
import { RxReset } from "react-icons/rx";
import { GrRotateRight } from "react-icons/gr";
import Loading from "@/components/Loading";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

pdfjs.GlobalWorkerOptions.workerSrc = `./pdf.worker.min.js`;

const Home: NextPage = () => {
  const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImhvZmVuZyIsImVtYWlsIjoiaG8tZmVuZy53b25nQHdoaXRldmlzaW9uLm5sIiwidXNlciI6IntcIlRlbmFudElkXCI6XCI5OTk5M1wiLFwiVGVuYW50TmFtZVwiOlwiV2hpdGVWaXNpb24gQi5WLiAtIFRlc3RvbWdldmluZ1wiLFwiVXNlcklkXCI6XCJob2ZlbmdcIixcIlVzZXJmdWxsbmFtZVwiOlwiSG8tRmVuZyBXb25nXCIsXCJFbWFpbFwiOlwiaG8tZmVuZy53b25nQHdoaXRldmlzaW9uLm5sXCIsXCJVc2VyR3JvdXBzXCI6W1wiX2dyb2VwX2JvZWtjb250clwiLFwiX2dyb2VwX2Jvbm5lblwiLFwiX2dyb2VwX2NvZGVyZW5cIixcIl9ncm9lcF9tYXRjaGVuXCIsXCJfZ3JvZXBfbmlldGFra29vcmRcIixcIl9ncm9lcF9vcmRlcmJldmVzdGlnaW5nZW5cIixcIl9ncm9lcF9yZWRlbmNvZGVcIixcIl9ncm9lcF9yZWdpc3RyZXJlblwiLFwiX2dyb2VwX3NlcnZpY2VtZWxkaW5nZW5cIixcIl9ncm9lcF91aXR2YWxcIixcIl9sZWRlbl9hZHZpZXNcIixcIl9sZWRlbl9nb2Vka2V1cmRlcnNcIixcImdycC13ZWJ1c2Vyc1wiXSxcIkdyb3VwRmV0Y2hNYW51YWxcIjp0cnVlLFwiQWxsb3dEZWxldGVcIjp0cnVlLFwiQWxsb3dSZXBvcnRzXCI6dHJ1ZSxcIkFsbG93U3VwZXJ2aXNvclwiOnRydWUsXCJBbGxvd0xpbmtEb2N1bWVudHNcIjp0cnVlLFwiQWxsb3dTZXRSZXBsYWNlbWVudFwiOnRydWUsXCJMYW5ndWFnZVwiOlwiTkxcIixcIkZpbHRlclJlcG9ydHNcIjpcIlwiLFwiRmlsdGVyU3VwZXJ2aXNvclwiOlwiXCIsXCJGaWx0ZXJDb3B5Q29kaW5nXCI6XCJcIixcIlN0YW5kYWFyZExvY2F0aWVcIjpcIlwiLFwiVXNlclR5cGVcIjoyLFwiUmVwbGFjZW1lbnRGb3JcIjpbXSxcIlVzZXJGaXJzdE5hbWVcIjpcIkhvLUZlbmdcIixcIkFsbG93VHJhaW5pbmdcIjp0cnVlLFwiQWxsb3dGaWxlaGFuZGxlclwiOnRydWUsXCJFcnBcIjpcIkFGQVMgUHJvZml0XCIsXCJBbGxvd0FwcHJvdmVWaWFMaXN0XCI6dHJ1ZSxcIkFsbG93U2VuZE1haWxcIjp0cnVlfSIsImVucmljaHVybCI6Imh0dHBzOi8vOTk5OTMud29ya2Zsb3dpbmRlY2xvdWQubmwvYXBpLyIsImNsaWVudHZlcnNpb24iOiIiLCJ1c2VybGFuZ3VhZ2UiOiJOTCIsIm5iZiI6MTY4MzEwNzg5OCwiZXhwIjoxNjgzMTA5MDk4LCJpYXQiOjE2ODMxMDc4OTh9.Imi1X7TUhHakuOL2fBjvb8K8HeZwgfTnLgxZc39M6bQ'
  const [pdfFileNames, setPdfFileNames] = useState([]);
  const [pdfs, setPdfs]: [Array<string>, any] = useState();
  const [current, setCurrent] = useState({ pdfIndex: 0, pageIndex: 0 });
  const [totalPages, setTotalPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [userIsDragging, setUserIsDragging] = useState(false);
  const documentRef = useRef(null);

  const handleReset = async () => {
    setPdfs([]);
    setTotalPages([]);
    setPdfFileNames([]);
    setCurrent({ pdfIndex: 0, pageIndex: 0 });
    setNumberOfThumbnails([]);

    await set('numberOfThumbnails', numberOfThumbnails);
    await set('totalPages', totalPages);
    await set('pdfFileNames', pdfFileNames);
    await set('pdfs', pdfs);

    setStateChanged(oldValue => oldValue + 1);
  };

  const handleDeleteDocument = (inputPdfIndex: number) => {
    setIsLoading(true);
    setIsDeleting(true);

    if (current.pdfIndex === inputPdfIndex && current.pdfIndex === pdfs.length - 1 && current.pdfIndex > 0) {
      setCurrent({ pdfIndex: current.pdfIndex - 1, pageIndex: 0 });
    }

    setPdfs(oldPdfs => oldPdfs.filter((_, index) => index !== inputPdfIndex));
    setTotalPages(oldTotalPages => oldTotalPages.filter((_, index) => index !== inputPdfIndex));
    setPdfFileNames(oldPdfFileNames => oldPdfFileNames.filter((_, index) => index !== inputPdfIndex));
    setNumberOfThumbnails(oldNumberOfThumbnails => oldNumberOfThumbnails.filter((_, index) => index !== inputPdfIndex))

    setIsLoading(false);
    setIsDeleting(false);
    setStateChanged(oldValue => oldValue + 1);
  }

  const handleDeletePage = async ({ pdfIndex, pageIndex }) => {
    setIsLoading(true);
    setIsDeleting(true);

    // if we are deleting the last page in PDF = delete the PDF
    if (totalPages[pdfIndex] === 1) {
      handleDeleteDocument(pdfIndex);
      return;
    }

    const pdfDoc = await PDFDocument.load(pdfs[pdfIndex], {
      ignoreEncryption: true
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
      ignoreEncryption: true
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
      ignoreEncryption: true
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
      const URL = await pdfDoc.saveAsBase64({ dataUri: true });
      setPdfs(oldPdfs => {
        let newPdfs = oldPdfs
        newPdfs[fromPdfIndex] = URL
        return newPdfs
      });
      setCurrent({
        pdfIndex: fromPdfIndex,
        pageIndex:
          (toPageIndex < fromPageIndex)
            ? toPageIndex
            : toPageIndex - 1
      });

      setIsLoading(false);
      setStateChanged(oldValue => oldValue + 1);

      return;
    }


    console.log(`Moving page ${fromPageIndex} from pdf ${fromPdfIndex} to pdf ${toPdfIndex}`)
    // if moving down, we need to account for the fact that the page will be removed from the original PDF
    if (toPlaceholderRow && toPdfIndex > fromPdfIndex) toPdfIndex -= 1;

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
    const URL = await fromPdfDoc.saveAsBase64({ dataUri: true });

    const URL2 = await toPdfDoc.saveAsBase64({ dataUri: true });

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
    setStateChanged(oldValue => oldValue + 1);
  };

  const handleSplitDocument = async ({ pdfIndex, pageIndex }) => {
    if (pageIndex === 0) return;

    setIsLoading(true);

    const toPdfDoc = await PDFDocument.create()
    const fromPdfDoc = await PDFDocument.load(pdfs[pdfIndex], { ignoreEncryption: true });

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
    if (fromPdfDoc.getPages().length === 1) {
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
    if (!pdfs?.length) return;

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
    const pdfDoc = await PDFDocument.load(pdfs[pdfIndex], { ignoreEncryption: true });
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
        'Authorization': token
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
    console.log(`PDF's saved.`)
  }
  useEffect(() => {
    if (!pdfs?.length) return;
    saveState();
  }, [stateChanged]);
  // state fetch
  const fetchState = async () => {
    get('pdfs').then((pdfs) => {
      if (!pdfs) return;
      get('pdfFileNames').then((pdfFileNames) => {
        get('totalPages').then((totalPages) => {
          get('numberOfThumbnails').then((numberOfThumbnails) => {
            setPdfFileNames(pdfFileNames);
            setTotalPages(totalPages);
            setNumberOfThumbnails(numberOfThumbnails);
            setPdfs(pdfs);
            console.log(`PDF's fetched.`)
          });
        });
      });
    });
  }
  useEffect(() => {
    fetchState();
  }, []);

  const pdfsSize = pdfs?.length
    ? Buffer.from(JSON.stringify(pdfs)).length / 1000
    : 0

  return (
    <>
      <Head>
        <title>PDF File Handler</title>
      </Head>

      <Loading inset={true} loading={isLoading} />

      <pre>
        pdfs.length: {JSON.stringify(pdfs?.length)}
        <br />
        numberOfThumbnails: {JSON.stringify(numberOfThumbnails.map(pdf => pdf?.length))}
        <br />
        totalPages: {JSON.stringify(totalPages)}
        <br />
        current: {JSON.stringify(current, 2, 2)}
        <br />
        size: {pdfsSize} KB
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
                      // MSG / EML files: send to Serge API
                      if (
                        files[i]['type'] === 'application/vnd.ms-outlook'
                        || files[i]['type'] === 'message/rfc822'
                        || files[i]['type'] === 'image/tiff'
                      ) {
                        alert('stuur naar serge')
                        let file = await files[i].arrayBuffer();
                        const base64Msg = Buffer.from(file).toString('base64');

                        const base64Msg2 = await blobToURL(files[i]);

                        console.log(base64Msg2)

                        const res = await fetch('https://devweb.docbaseweb.nl/api/files/converttopdf', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token
                          },
                          body: JSON.stringify({
                            msgFileBase64: base64Msg2,
                            filename: files[i]['name']
                          })
                        });

                        console.log(JSON.stringify(res))
                      }

                      console.log(files[i]['type'] + ' ' + files[i]['name']);
                      // convert TIFF files to png
                      /*                      if (files[i]['type'] === 'image/tiff') {
                                              const tiff = await files[i].arrayBuffer();
                                              const base64Tiff = Buffer.from(tiff).toString('base64');
                      
                                              console.log(base64Tiff);
                                          }
                      */
                      // skip the file if its not an image or pdf
                      if (files[i]['type'] !== 'application/pdf' && files[i]['type'] !== 'image/jpeg' && files[i]['type'] !== 'image/png') {
                        alert(`${files[i]['name']} is overgeslagen. Het bestand is geen geldige PDF of afbeelding.`)
                        continue;
                      }

                      // if its an image, convert it to pdf
                      let newPdf: any = await blobToURL(files[i]);
                      if (files[i]['type'] === 'image/jpeg' || files[i]['type'] === 'image/png') {
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

                    setStateChanged(oldValue => oldValue + 1)
                    setIsLoading(false)
                  }}
                  className={pdfs?.length ? "opacity-50" : "!p-16"}
                />
                {pdfs?.length
                  ? <>
                    <ButtonXl
                      title={"Reset"}
                      icon={<RxReset />}
                      description="Maak alle wijzigingen ongedaan en reset naar de oorspronkelijke PDF."
                      onClick={async () => await handleReset()}
                    />
                  </>
                  : null}
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
                          onClick={async () => {
                            const base64 = await handleSaveDocument(pdfIndex);
                            alert(base64)
                          }}
                        />
                        <BigButton
                          title={<><GrRotateRight /></>}
                          onClick={async () => await handleRotateDocument(pdfIndex)}
                          disabled={isRotating}
                        />
                        <BigButton
                          title={<><BsTrash /></>}
                          onClick={async () => await handleDeleteDocument(pdfIndex)}
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
                              /* first placeholder thumbnail in row */
                              pageIndex % 4 === 0 &&
                              <PlaceholderThumbnail pdfIndex={pdfIndex} pageIndex={pageIndex - 0.5} isDragging={userIsDragging} totalPages={totalPages} isLoading={isLoading} margin='mr-2' />
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
      id={`thumbnail-${pdfIndex}-${pageIndex}`}
      ref={ref}
      className={
        `relative group flex items-center justify-center rounded-md overflow-hidden
        before:absolute before:inset-0 before:bg-black before:opacity-50 hover:before:bg-transparent
        ${(pageIndex === current?.pageIndex && pdfIndex === current?.pdfIndex)
          ? "border-4 border-amber-300 before:z-10"
          : "before:z-[-1]"}
        opacity-${isDragging ? '10' : '100'}`
      }
      {...onClick && { onClick }}
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
  //if (totalPages[pdfIndex] === 1) return null;

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
        `h-auto relative rounded-lg bg-gradient-to-b from-lime-50/0 via-lime-200 to lime-50/0 group
        before:content-[''] before:absolute before:w-[60px] before:h-full before:z-20 before:bg-blue-3000 before:translate-x-[-100%]
        ${isOver ? 'w-[10px]' : 'w-[0]'}
        after:content-[''] after:absolute after:left-[100%] after:w-[60px] after:h-full after:z-20 after:bg-red-3000 after:translate-x-[0]
        ${isOver ? margin : null}
        ${isDragging ? 'pointer-events-auto' : 'pointer-events-none'}
      `}
    />
  </>
}










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