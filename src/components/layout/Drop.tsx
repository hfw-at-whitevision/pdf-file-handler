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

  const handleDropzoneLoaded = async (files: any) => {
    if (!files || !files?.length) return;
    setIsLoading(true);

    let currentPageIndex: any = 0;
    let updatedPdf: any = pdfs;

    if (updatedPdf?.length) {
      var pdfA: any = await PDFDocument.load(updatedPdf[0], { ignoreEncryption: true, parseSpeed: 1500 });
      var pageIndices = await pdfA.getPageIndices();
      currentPageIndex = pageIndices[pageIndices.length - 1] + 1;
    }

    // looping through uploaded files
    for (let i = 0; i < files.length; i++) {
      alert(`current currentPageIndex: ${currentPageIndex}`)
      setLoadingMessage(`Document ${i + 1} van ${files.length} wordt geladen...`);
      const fileSize = files[i]['size'] / 1024 / 1024;
      let newPdf: any = await blobToURL(files[i]);
      let mergedPdf = '';

      // check file size
      if (fileSize > 250) {
        alert(`${files[i]['name']} is groter dan 25MB. Gelieve het bestand te verkleinen.`)
        continue;
      }

      // skip the file if its not an image or pdf
      else if (files[i]['type'] !== 'application/pdf' && files[i]['type'] !== 'image/jpeg' && files[i]['type'] !== 'image/png') {
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

          setPdfs((oldPdfs: any) => {
            const result = oldPdfs?.length ? oldPdfs.concat(newPdf) : [newPdf];
            return result;
          });
          const newPdfDoc = await PDFDocument.load(newPdf, { ignoreEncryption: true, parseSpeed: 1500 })
          const pages = newPdfDoc.getPageCount();
          setPdfFilenames((oldValues: any) => [...oldValues, filename]);

          let pagesOfUploadedPdf: Array<number> = []
          for (let x = 0; x < pages; x++) {
            pagesOfUploadedPdf.push(x)
          }
        }
        continue;
      }

      // PDF / JPG / PNG files: further process it
      const pdfB = await PDFDocument.load(newPdf, { ignoreEncryption: true, parseSpeed: 1500 });

      // if there is an existing PDF, merge new PDF into existing PDF
      if (updatedPdf?.length) {
        const mergedPdfDoc = await PDFDocument.create();
        const copiedPagesA = await mergedPdfDoc.copyPages(pdfA, pdfA.getPageIndices());
        copiedPagesA.forEach((page) => mergedPdfDoc.addPage(page));
        const copiedPagesB = await mergedPdfDoc.copyPages(pdfB, pdfB.getPageIndices());
        copiedPagesB.forEach((page) => mergedPdfDoc.addPage(page));
        mergedPdf = await mergedPdfDoc.saveAsBase64({ dataUri: true });
      }
      else {
        mergedPdf = newPdf;
      }

      const pdfBTotalPages = await pdfB?.getPageCount();
      setPdfFilenames((oldValues: any) => [...oldValues, files[i]['name']]);

      const pdfRotations: any = [];
      const pdfPages: any = [];

      // populate page rotations array + populate pages array
      for (let i = 0; i < pdfBTotalPages; i++) {
        const rotation = await getPageRotation({ pdf: pdfB, pageNumber: i });
        pdfRotations.push(rotation);
        pdfPages.push(currentPageIndex + i);
      }
      currentPageIndex = currentPageIndex + pdfBTotalPages;
      alert(`new currentPageIndex: ${currentPageIndex}`)
      setRotations((oldValues: any) => [...oldValues, pdfRotations]);
      setPages((oldValues: any) => [...oldValues, pdfPages]);
      setOpenedRows((oldValues: any) => [...oldValues, true]);
      updatedPdf = [mergedPdf];
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