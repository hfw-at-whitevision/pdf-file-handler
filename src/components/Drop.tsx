import React, { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { BsUpload } from "react-icons/bs";

export default function Drop({ onLoaded = (acceptedFiles: any) => { }, className = null }) {
  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop: (files) => onLoaded(files),
    accept: ["application/pdf", "image/jpeg", "image/png", "image/tiff", "message/rfc822",
      "application/vnd.ms-outlook"] as any,
  });

  return (
    <div
      {...getRootProps()}
      className={
        `flex w-full flex-col gap-4 rounded-xl text-white text-sm cursor-pointer
        border-2 border-dashed border-white/20 hover:border-white/40 p-4
        ${className}`
      }
    >
      <h3 className="text-2xl font-bold flex items-center gap-2 justify-between">Upload <BsUpload /></h3>
      <input {...getInputProps()} />
    </div>
  );
}
