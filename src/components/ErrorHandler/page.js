import React from "react";
import { Card } from "../ui/card";
import { MdError } from "react-icons/md";
import { Button } from "../ui/button";

function ErrorHandler({ shouldShow, title, message, onClose }) {
  if (!shouldShow) {
    return null;
  }
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black/50 fixed top-0 left-0 z-50">
      <Card className="max-w-screen-md flex flex-col items-center justify-center gap-4 w-full p-6">
        <MdError className="text-6xl text-red-600" />
        <h2 className="text-xl font-semibold ">
          {title || "An Error Occurred"}
        </h2>
        <p className="text-base">{message}</p>
        <Button className="mt-4 bg-secondary text-white" onClick={onClose}>
          Okay
        </Button>
      </Card>
    </div>
  );
}

export default ErrorHandler;
