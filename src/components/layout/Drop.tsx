import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { BsUpload } from "react-icons/bs";
import ButtonXl from "../primitives/ButtonXl";

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
    <ButtonXl
      {...getRootProps()}
      className={
        `flex w-full flex-col gap-4 rounded-md text-stone-600 text-sm cursor-pointer bg-stone-100
        ring-2 ring-dashed hover:ring-amber/40 p-4 ring-offset-4 ring-amber-300/50
        ${className}`
      }
      icon={<BsUpload className="text-base" />}
    >
      Upload
      <input {...getInputProps()} />
    </ButtonXl>
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