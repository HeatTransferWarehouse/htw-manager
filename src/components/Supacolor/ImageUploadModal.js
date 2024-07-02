import { useSelector } from "react-redux";
import { ImSpinner8 } from "react-icons/im";
import { useRef, useState } from "react";
import React from "react";
import {
  ModalOverlay,
  Modal,
  ModalCloseMobile,
  ModalCloseDesktop,
  ModalContent,
  ModalTitle,
} from "../Modal/modal";
import { useDrag } from "@use-gesture/react";
import { Button } from "../ui/button";
import { Fieldset, Form, Input, Label } from "../Form/form";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";

export default function ImageUploadModal({
  customerRef,
  jobId,
  setToggleUploadImg,
  setCustomerRef,
  setJobId,
  dispatch,
  goToOrder,
  toggleUploadImg,
}) {
  const isLoading = useSelector((state) => state.item.artWorkReducer.isLoading);
  const popupMessage = useSelector(
    (state) => state.item.artWorkReducer.popupMessage
  );
  const [files, setFiles] = useState({});
  const closeRef = useRef(null);
  const bgRef = useRef(null);

  const handleFileChange = (reference, event) => {
    const file = event.target.files[0];
    setFiles((prevFiles) => ({
      ...prevFiles,
      [reference]: file,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    for (const ref of customerRef) {
      if (files[ref.customer_reference]) {
        formData.append(ref.customer_reference, files[ref.customer_reference]);
      }
    }
    dispatch({
      type: "UPLOAD_ARTWORK",
      payload: { data: formData, id: jobId },
    });
  };

  const handleOutsideClick = (e) => {
    if (bgRef.current === e.target) {
      setToggleUploadImg(false);
      setCustomerRef([]);
      setJobId(0);
    }
  };

  const closePopup = (e) => {
    e.preventDefault();
    dispatch({ type: "CLEAR_POPUP_MESSAGE" });
    setToggleUploadImg(false);
  };

  const bind = useDrag(({ down, movement: [, my], cancel }) => {
    if (my > 100) {
      cancel(setToggleUploadImg(false));
      setCustomerRef([]);
      setJobId(0);
    }
    if (!down && my > 50) {
      setToggleUploadImg(false);
      setCustomerRef([]);
      setJobId(0);
    }
  });
  return (
    <>
      <ModalOverlay
        ref={bgRef}
        handleClick={handleOutsideClick}
        open={toggleUploadImg}>
        <Modal width="sm" open={toggleUploadImg}>
          {isLoading && (
            <div className="absolute top-0 left-0 flex items-center justify-center bg-black/60 w-full h-full">
              <ImSpinner8 className="h-12 w-12 animate-spin fill-white" />
            </div>
          )}
          <ModalCloseMobile ref={closeRef} bind={bind} />
          <ModalCloseDesktop
            handleClick={() => {
              setToggleUploadImg(false);
              setCustomerRef([]);
              setJobId(0);
            }}
          />
          <ModalTitle>
            Upload Images for Order #
            <span
              className="modal-orderNumber"
              onClick={() =>
                goToOrder(
                  customerRef[0]?.customer_reference.split(":")[0].trim()
                )
              }>
              {customerRef[0]?.customer_reference.split(":")[0].trim()}
            </span>
          </ModalTitle>
          <ModalContent>
            {popupMessage === "Artwork uploaded successfully!" ? (
              <SuccessModal
                props={{
                  open: popupMessage,
                  message: popupMessage,
                  function: closePopup,
                }}
              />
            ) : (
              <ErrorModal
                props={{
                  open: popupMessage,
                  message: popupMessage,
                  function: closePopup,
                }}
              />
            )}

            {/* <div className="absolute top-0 left-0 flex items-center justify-center bg-black/60 w-full h-full">
              <div className="popup-content">
                {popupMessage === "Artwork uploaded successfully!" ? (
                  <BsCheckCircleFill className="popup-checkmark success" />
                ) : (
                  <BiSolidErrorCircle className="popup-checkmark error" />
                )}
                <p>{popupMessage}</p>
                {popupMessage === "Artwork uploaded successfully!" ? (
                  <button
                    className="popup-button success-btn"
                    onClick={closePopup}>
                    OK
                  </button>
                ) : (
                  <button
                    className="popup-button error-btn"
                    onClick={closePopup}>
                    OK
                  </button>
                )}
              </div>
            </div> */}
            <Form onSubmit={handleSubmit}>
              {customerRef &&
                customerRef
                  .filter((ref) => ref.needs_artwork)
                  .map((ref, index) => (
                    <Fieldset key={index}>
                      <Label htmlFor={`ref-input-${ref.customer_reference}`}>
                        Upload For:{" "}
                        <span className="font-semibold">{ref.item_sku}</span>
                      </Label>
                      <Input
                        className="sr-only"
                        id={`ref-input-${ref.customer_reference}`}
                        readOnly={true}
                        required={true}
                        value={ref.customer_reference}
                      />
                      <Label
                        className="sr-only"
                        htmlFor={`file-input-${ref.customer_reference}`}>
                        Image upload
                      </Label>
                      <Input
                        id={`file-input-${ref.customer_reference}`}
                        type="file"
                        accept="image/jpg, image/png, .pdf, .psd, .ai, .eps"
                        required={true}
                        onChange={(e) =>
                          handleFileChange(ref.customer_reference, e)
                        }
                      />
                    </Fieldset>
                  ))}
              <Button className="mx-auto" variant="secondary" type="submit">
                Upload Images
              </Button>
            </Form>
          </ModalContent>
        </Modal>
      </ModalOverlay>
    </>
  );
}
