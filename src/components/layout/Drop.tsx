import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { BsUpload } from "react-icons/bs";

const Drop = ({ onLoaded = (acceptedFiles: any) => { }, className = '' }) => {
  const onDrop = useCallback((acceptedFiles: any) => {
    onLoaded(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ["application/pdf", "image/jpeg", "image/png", "image/tiff", "message/rfc822",
      "application/vnd.ms-outlook"] as any,
  });

  return (
    <div
      {...getRootProps()}
      className={
        `flex w-full flex-col gap-4 rounded-md text-gray-600 text-sm cursor-pointer bg-gray-100
        ring-2 ring-dashed hover:ring-amber/40 p-4 ring-offset-4 ring-amber-300/50
        ${className}`
      }
    >
      <h3 className="text-2xl font-bold flex items-center gap-2 justify-between">Upload <BsUpload className="text-base" /></h3>
      <input {...getInputProps()} />
    </div>
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

//export default React.memo(Drop, skipRerender);
export default Drop;