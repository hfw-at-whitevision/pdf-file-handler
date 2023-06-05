import React, { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useAtom, useSetAtom } from "jotai";
import { isDraggingFilesAtom, isLoadingAtom, loadingMessageAtom, openedRowsAtom, pagesAtom, pdfFilenamesAtom, pdfsAtom, rotationsAtom, stateChangedAtom } from "../store/atoms";
import { blobToURL } from "@/utils";
import { PDFDocument } from "pdf-lib";

const Drop = ({ noClick = false }) => {
  const setIsLoading: any = useSetAtom(isLoadingAtom)
  const setLoadingMessage: any = useSetAtom(loadingMessageAtom)
  const [pdfs, setPdfs]: any = useAtom(pdfsAtom)
  const setPdfFilenames: any = useSetAtom(pdfFilenamesAtom)
  const [, setStateChanged]: any = useAtom(stateChangedAtom)
  const setOpenedRows: any = useSetAtom(openedRowsAtom)
  const setRotations: any = useSetAtom(rotationsAtom)
  const setPages: any = useSetAtom(pagesAtom)
  const setIsDraggingFiles = useSetAtom(isDraggingFilesAtom)

  const handleDropzoneLoaded = async (files: any) => {
    if (!files || !files?.length) return;
    setIsLoading(true);

    let lastPageIndex: any = 0;
    let updatedPdf: any = pdfs;

    for (let i = 0; i < files.length; i++) {
      setLoadingMessage(`Document ${i + 1} van ${files.length} wordt geladen...`);

      let newPdf: any = await blobToURL(files[i]);

      if (updatedPdf?.length) {
        console.log(updatedPdf)
        var pdfA: any = await PDFDocument.load(updatedPdf[0], { ignoreEncryption: true, parseSpeed: 1500 });
        var pageIndices = await pdfA.getPageIndices();
        lastPageIndex = pageIndices[pageIndices.length - 1];
        alert('lastPageIndex: ' + lastPageIndex)
      }

      // check file size
      const fileSize = files[i]['size'] / 1024 / 1024;
      if (fileSize > 250) {
        alert(`${files[i]['name']} is groter dan 25MB. Gelieve het bestand te verkleinen.`)
        continue;
      }
      // skip the file if its not an image or pdf
      else if (files[i]['type'] !== 'application/pdf' && files[i]['type'] !== 'image/jpeg' && files[i]['type'] !== 'image/png') {
        alert(`${files[i]['name']} is overgeslagen. Het bestand is geen geldige PDF of afbeelding.`)
        continue;
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
      // JPG / PNG: convert to PDF
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

      // PDF / JPG / PNG files: further process it
      const pdfB = await PDFDocument.load(newPdf, { ignoreEncryption: true, parseSpeed: 1500 });
      let mergedPdf = newPdf;

      if (updatedPdf?.length) {
        alert('yes')
        // merge PDFs if there is an existing PDF
        const mergedPdfDoc = await PDFDocument.create();
        const copiedPagesA = await mergedPdfDoc.copyPages(pdfA, pdfA.getPageIndices());
        copiedPagesA.forEach((page) => mergedPdfDoc.addPage(page));
        const copiedPagesB = await mergedPdfDoc.copyPages(pdfB, pdfB.getPageIndices());
        copiedPagesB.forEach((page) => mergedPdfDoc.addPage(page));
        mergedPdf = await mergedPdfDoc.saveAsBase64({ dataUri: true });
      }
      else alert('no')

      const pdfBTotalPages = pdfB?.getPageCount();
      setPdfFilenames((oldValues: any) => [...oldValues, files[i]['name']]);

      const getPageRotation = async (pageNumber: number) => {
        const page = await pdfB.getPage(pageNumber);
        return await page.getRotation().angle;
      }
      const pdfRotations: any = [];
      const pdfPages: any = [];
      // populate page rotations array + populate pages array
      for (let i = 0; i < pdfBTotalPages; i++) {
        const rotation = await getPageRotation(i);
        pdfRotations.push(rotation);
        pdfPages.push(
          (lastPageIndex)
            ? lastPageIndex + 1 + i
            : lastPageIndex + i
        );
      }
      lastPageIndex = lastPageIndex + pdfBTotalPages;
      setRotations((oldValues: any) => [...oldValues, pdfRotations]);
      setPages((oldValues: any) => [...oldValues, pdfPages]);
      setOpenedRows((oldValues: any) => [...oldValues, true]);
      updatedPdf = [mergedPdf];
    }
    setPdfs(updatedPdf);
    setStateChanged((oldValue: number) => oldValue + 1);
    setLoadingMessage('')
    setIsLoading(false)
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