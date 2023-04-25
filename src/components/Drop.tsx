import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { BsUpload } from "react-icons/bs";
import ButtonXl from "./ButtonXl";

export default function Drop({ onLoaded, className }) {
  const onDrop = useCallback((acceptedFiles) => {
    onLoaded(acceptedFiles);
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ["application/pdf"],
  });

  return (
    <div
      {...getRootProps()}
      className={
        `flex w-full flex-col gap-4 rounded-xl text-white text-sm cursor-pointer
        border-2 border-dashed border-white/20 hover:border-white/40
        p-4
        ${className}`
      }
    >
      <h3 className="text-2xl font-bold flex items-center gap-2 justify-between">Upload <BsUpload /></h3>
      <input {...getInputProps()} />

    </div>
  );
}
