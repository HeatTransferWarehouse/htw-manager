import { RiAlertLine } from "react-icons/ri";
import React, { useRef } from "react";
import { Modal, ModalContent, ModalOverlay, ModalTitle } from "../Modal/modal";
import { Button } from "../ui/button";

export default function ErrorModal({ props }) {
  const bgRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (bgRef.current === e.target) {
      props.setOpen(false);
      props.setId(null);
    }
  };

  return (
    <ModalOverlay
      ref={bgRef}
      handleClick={handleOutsideClick}
      open={props.open}>
      <Modal open={props.open} width={"xs"}>
        <ModalTitle>
          <span className="rounded-full mb-4 mx-auto w-fit flex items-center justify-center p-4 bg-red-600/10">
            <RiAlertLine className="h-10 w-10 fill-red-600" />
          </span>
          An Error Occurred
        </ModalTitle>
        <ModalContent>
          <p className="text-gray-800 text-center">
            {props.message ? props.message : "An error occurred."}
          </p>
          <Button
            className={"w-full"}
            onClick={props.function}
            variant={"danger"}>
            OK
          </Button>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
}
