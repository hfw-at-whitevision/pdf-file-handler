import React, { useCallback } from "react";
import Dropzone from "react-dropzone";
import { BsUpload } from "react-icons/bs";
import ButtonXl from "../primitives/ButtonXl";
import { useAtom } from "jotai";
import { pdfsAtom, setIsLoadingAtom, setLoadingMessageAtom, setPdfFilenamesAtom, setPdfsAtom, setStateChangedAtom, setTotalPagesAtom } from "../store/atoms";
import { blobToURL } from "@/utils";
import { PDFDocument } from "pdf-lib";

const Drop = ({ className = '' }: any) => {
  const [, setIsLoading] = useAtom(setIsLoadingAtom)
  const [, setLoadingMessage] = useAtom(setLoadingMessageAtom)
  const [, setPdfs]: any = useAtom(pdfsAtom)
  const [, setTotalPages] = useAtom(setTotalPagesAtom)
  const [, setPdfFileNames] = useAtom(setPdfFilenamesAtom)
  const [, setStateChanged] = useAtom(setStateChangedAtom)

  const handleDropzoneLoaded = async (files: any) => {
    if (!files || !files?.length) return;
    setIsLoading(true)

    for (let i = 0; i < files.length; i++) {
      let newPdf: any = await blobToURL(files[i]);

      setLoadingMessage(`Document ${i + 1} van ${files.length} wordt geladen...`)

      // check file size
      const fileSize = files[i]['size'] / 1024 / 1024;
      if (fileSize > 250) {
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

          setPdfs((oldPdfs: any) => {
            const result = oldPdfs?.length ? oldPdfs.concat(newPdf) : [newPdf];
            return result;
          });
          const newPdfDoc = await PDFDocument.load(newPdf, { ignoreEncryption: true, parseSpeed: 1500 })
          const pages = newPdfDoc.getPageCount();
          setTotalPages((oldTotalPages: any) => [...oldTotalPages, pages]);
          setPdfFileNames((oldFileNames: any) => [...oldFileNames, filename]);

          let pagesOfUploadedPdf: Array<number> = []
          for (let x = 0; x < pages; x++) {
            pagesOfUploadedPdf.push(x)
          }
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
          const pages = newPdfDoc?.getPageCount()
          setTotalPages((oldTotalPages: any) => [...oldTotalPages, pages]);
          setPdfFileNames((oldFileNames: any) => [...oldFileNames, files[i]['name']]);

          setPdfs((oldPdfs: any) => {
            const result = oldPdfs?.length ? oldPdfs.concat(newPdf) : [newPdf];
            return result;
          });
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
                    setTotalPages((oldTotalPages: any) => [...oldTotalPages, pages]);
                    setPdfFileNames((oldFileNames: any) => [...oldFileNames, files[i].name]);

                    let pagesOfUploadedPdf: Array<number> = []
                    for (let x = 0; x < pages; x++) {
                      pagesOfUploadedPdf.push(x)
                    }
                    setPdfs((oldPdfs: any) => {
                      const result = oldPdfs?.length ? oldPdfs.concat(newPdf) : [newPdf];
                      return result;
                    });
                  })
              })
          } catch {
            alert(`Fout bij het laden van ${files[i]['name']}. Het document wordt overgeslagen.`);
            console.log(err);
            console.log(newPdf)
            return;
          }
        })
    }

    setStateChanged((oldValue: number) => oldValue + 1)
    setLoadingMessage('')
    setIsLoading(false)
  }

  return (
    <Dropzone onDrop={handleDropzoneLoaded}>
      {({ getRootProps, getInputProps }) => (

        <ButtonXl
          {...getRootProps()}
          className={
            `flex w-full flex-col gap-4 rounded-md text-stone-600 text-sm cursor-pointer bg-stone-100
        ring-2 ring-dashed hover:ring-amber/40 p-4 ring-offset-4 ring-amber-300/50 relative
        ${className}`
          }
          icon={<BsUpload className="text-base" />}
          title="Upload"
        >
          <input {...getInputProps()} />
        </ButtonXl>

      )}
    </Dropzone>
  );
}

const skipRerender = (prevProps: any, nextProps: any) => {
  if (
    prevProps.onLoaded === nextProps.onloaded
    ||
    prevProps.className !== nextProps.className
  ) return false;
  else return true;
}

//export default React.memo(Drop, () => true);
export default Drop;