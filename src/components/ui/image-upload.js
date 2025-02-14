import React from "react";
import { MdOutlineUploadFile } from "react-icons/md";
import { twMerge } from "tailwind-merge";

function CustomImageUpload({ handleImageChange, file, className }) {
  const inputRef = React.useRef();
  return (
    <div
      className={twMerge(
        "w-full flex-col border-secondary bg-secondary/10 border-dashed gap-8 p-4 overflow-hidden items-center justify-center border  rounded max-w-[500px] h-fit",
        file ? "hidden" : "flex",
        className
      )}>
      {!file && (
        <>
          <p>Upload your file to get started</p>
          <button
            onClick={(e) => {
              e.preventDefault();
              inputRef.current.click();
            }}
            className="w-fit px-6 py-3 bg-secondary flex items-center justify-center gap-2 rounded text-white font-semibold">
            Choose File <MdOutlineUploadFile className="text-white w-6 h-6" />
          </button>
        </>
      )}
      <input
        ref={inputRef}
        onChange={handleImageChange}
        accept="image/*"
        type="file"
        className="sr-only"
      />
    </div>
  );
}

export default CustomImageUpload;
