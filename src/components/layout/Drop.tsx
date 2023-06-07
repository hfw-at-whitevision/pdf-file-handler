import React, { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useAtom, useSetAtom } from "jotai";
import { isDraggingInternallyAtom, isLoadingAtom, loadingMessageAtom, openedRowsAtom, pagesAtom, pdfFilenamesAtom, pdfsAtom, rotationsAtom, stateChangedAtom } from "../store/atoms";
import { blobToURL } from "@/utils";
import { PDFDocument } from "pdf-lib";

const Drop = ({ noClick = false }: any) => {
  const setIsLoading: any = useSetAtom(isLoadingAtom)
  const setLoadingMessage: any = useSetAtom(loadingMessageAtom)
  const [pdfs, setPdfs]: any = useAtom(pdfsAtom)
  const setPdfFilenames: any = useSetAtom(pdfFilenamesAtom)
  const [, setStateChanged]: any = useAtom(stateChangedAtom)
  const setOpenedRows: any = useSetAtom(openedRowsAtom)
  const setRotations: any = useSetAtom(rotationsAtom)
  const setPages: any = useSetAtom(pagesAtom)
  const setIsDraggingFiles = useSetAtom(isDraggingInternallyAtom)

  const getPageRotation = async ({ pdf, pageNumber }: any) => {
    const page = await pdf.getPage(pageNumber);
    return await page.getRotation().angle;
  }

  const getMergedPdf = async (pdfA: any, pdfB: any) => {
    pdfA = await PDFDocument.load(pdfA, { ignoreEncryption: true });
    pdfB = await PDFDocument.load(pdfB, { ignoreEncryption: true });
    const mergedPdfDoc = await PDFDocument.create();
    const copiedPagesA = await mergedPdfDoc.copyPages(pdfA, pdfA.getPageIndices());
    copiedPagesA.forEach((page) => mergedPdfDoc.addPage(page));
    const copiedPagesB = await mergedPdfDoc.copyPages(pdfB, pdfB.getPageIndices());
    copiedPagesB.forEach((page) => mergedPdfDoc.addPage(page));
    const mergedPdf = await mergedPdfDoc.saveAsBase64({ dataUri: true });
    return mergedPdf;
  }

  const finalStep = async ({ newPdf, updatedPdf, currentPageIndex, filename }) => {
    let mergedPdf = null;

    // PDF / JPG / PNG files: further process it
    const pdfB = await PDFDocument.load(newPdf, { ignoreEncryption: true });

    // if there is an existing PDF, merge new PDF into existing PDF
    if (updatedPdf?.length) mergedPdf = await getMergedPdf(updatedPdf[0], newPdf);
    else mergedPdf = newPdf;

    // populate page rotations array + populate pages array
    const pdfBTotalPages = await pdfB?.getPageCount();
    const pdfRotations: any = [];
    const pdfPages: any = [];
    for (let i = 0; i < pdfBTotalPages; i++) {
      const rotation = await getPageRotation({ pdf: pdfB, pageNumber: i });
      pdfRotations.push(rotation);
      pdfPages.push(currentPageIndex + i);
    }
    // set the start pageIndex for the next document if we are looping through multiple uploaded files
    currentPageIndex = currentPageIndex + pdfBTotalPages;

    setRotations((oldValues: any) => [...oldValues, pdfRotations]);
    setPages((oldValues: any) => [...oldValues, pdfPages]);
    setOpenedRows((oldValues: any) => [...oldValues, true]);
    setPdfFilenames((oldValues: any) => [...oldValues, filename]);

    return {
      currentPageIndex,
      mergedPdf,
    }
  }

  const handleDropzoneLoaded = async (files: any) => {
    if (!files || !files?.length) return;
    setIsLoading(true);

    let currentPageIndex: any = 0;
    let updatedPdf: any = pdfs;

    // if there is an existing PDF, get the pageIndex to start from
    if (pdfs?.length) {
      var pdfA: any = await PDFDocument.load(pdfs[0], { ignoreEncryption: true });
      var pageIndices = await pdfA.getPageIndices();
      currentPageIndex = pageIndices[pageIndices.length - 1] + 1;
    }

    // looping through uploaded files
    for (let i = 0; i < files.length; i++) {
      setLoadingMessage(`Document ${i + 1} van ${files.length} wordt geladen...`);
      const fileSize = files[i]['size'] / 1024 / 1024;
      let newPdf: any = await blobToURL(files[i]);

      // check file size
      if (fileSize > 50) {
        alert(`${files[i]['name']} is groter dan 50MB. Gelieve het bestand te verkleinen.`)
        continue;
      }

      // skip the file if its not an image or pdf
      else if (!allowedFileExtensions.some(extension => files[i]['name'].toLowerCase().includes(extension))) {
        console.log(files[i])
        alert(`${files[i]['name']} is overgeslagen. Het bestand is geen geldige PDF of afbeelding.`)
        continue;
      }

      // JPG / PNG: convert to PDF
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
        newPdf = await pdfDoc.saveAsBase64({ dataUri: true });
      }

      // MSG / EML / TIFF files: send to Serge API
      else if (
        files[i]['type'] === 'application/vnd.ms-outlook'
        || files[i]['type'] === 'message/rfc822'
        || files[i]['type'] === 'image/tiff'
      ) {
        console.log(`MSG / EML file detected. Sending to Serge API.`)
        const convertedBase64Msg = newPdf.replace(`data:application/octet-stream;base64,`, '').replace(`data:image/tiff;base64,`, '')
        const returnedPdfs = await fetch('/api/converttopdf', {
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
          .then(res => res.pdfFiles)
          .catch(err => console.log(err));

        // iterating over returned PDF's from API
        for (let i = 0; i < returnedPdfs?.length; i++) {
          const newPdf = 'data:application/pdf;base64,' + returnedPdfs[i].pdfFileBase64;
          const { mergedPdf: newMergedPdf, currentPageIndex: newCurrentPageIndex } = await finalStep({
            filename: returnedPdfs[i].fileName,
            currentPageIndex,
            newPdf,
            updatedPdf,
          });
          updatedPdf = [newMergedPdf];
          currentPageIndex = newCurrentPageIndex;
        }
        continue;
      }

      const { mergedPdf: newMergedPdf, currentPageIndex: newCurrentPageIndex } = await finalStep({
        filename: files[i]['name'],
        currentPageIndex,
        newPdf,
        updatedPdf,
      });
      updatedPdf = [newMergedPdf];
      currentPageIndex = newCurrentPageIndex;
    } // end looping through files
    setPdfs(updatedPdf);
    setStateChanged((oldValue: number) => oldValue + 1);
    setLoadingMessage('');
    setIsLoading(false);
  }

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop: handleDropzoneLoaded,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".tif", ".tiff"],
      "application/pdf": [".pdf"],
      "message/rfc822": [".eml", ".msg"],
    },
    noClick,
  });

  useEffect(() => {
    setIsDraggingFiles(isDragAccept)
  }, [isDragAccept])

  return (
    <div className="absolute inset-0" {...getRootProps()}>
      <input {...getInputProps()} />
    </div>
  )
}
export default Drop;

const allowedFileTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
];
const allowedFileExtensions = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.tiff',
  '.tif',
  '.msg',
  '.eml',
]