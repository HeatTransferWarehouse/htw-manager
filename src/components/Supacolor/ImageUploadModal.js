import { useSelector } from "react-redux";
import Button from "@material-ui/core/Button";
import { BsCheckCircleFill } from "react-icons/bs";
import { BiSolidErrorCircle } from "react-icons/bi";
import { useState } from "react";
import React from "react";

export default function ImageUploadModal({
  customerRef,
  jobId,
  setToggleUploadImg,
  setCustomerRef,
  setJobId,
  dispatch,
  goToOrder,
}) {
  const isLoading = useSelector((state) => state.item.artWorkReducer.isLoading);
  const popupMessage = useSelector(
    (state) => state.item.artWorkReducer.popupMessage
  );
  const [files, setFiles] = useState({});

  const handleFileChange = (reference, event) => {
    const file = event.target.files[0];
    setFiles((prevFiles) => ({
      ...prevFiles,
      [reference]: file,
    }));
  };

  const closePopup = () => {
    dispatch({ type: "CLEAR_POPUP_MESSAGE" });
    setToggleUploadImg(false);
    window.location.reload();
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
  return (
    <div className="details-modal">
      <div className="modal-styles">
        {isLoading && (
          <div className="loader-overlay">
            <div className="loader"></div>
          </div>
        )}
        {popupMessage && (
          <div className="popup">
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
                <button className="popup-button error-btn" onClick={closePopup}>
                  OK
                </button>
              )}
            </div>
          </div>
        )}
        <h2 style={{ textAlign: "center", margin: "1em 0 0 0" }}>
          Upload Images for Order #
          <span
            className="modal-orderNumber"
            onClick={() =>
              goToOrder(customerRef[0].customer_reference.split(":")[0].trim())
            }>
            {customerRef[0].customer_reference.split(":")[0].trim()}
          </span>
        </h2>
        <Button
          style={{
            position: "absolute",
            right: "10px",
            top: "10px",
            width: "15px",
            height: "25px",
            padding: "0px",
          }}
          color="secondary"
          onClick={() => {
            setToggleUploadImg(false);
            setCustomerRef([]);
            setJobId(0);
          }}>
          Close
        </Button>
        <form className="image-form" onSubmit={handleSubmit}>
          <div className="inputs-container">
            {customerRef
              .filter((ref) => ref.needs_artwork)
              .map((ref, index) => (
                <div className="uploadImages-container" key={index}>
                  <label
                    style={{
                      textAlign: "left",
                      fontSize: 15,
                    }}>
                    Upload For: <br />
                    <span>
                      <strong>{ref.item_sku}</strong>
                    </span>
                    <input
                      className="ref-input"
                      value={ref.customer_reference}
                      readOnly
                      required
                    />
                  </label>
                  <input
                    className="file-input"
                    type="file"
                    accept="image/jpg, image/png, .pdf, .psd, .ai, .eps"
                    required
                    onChange={(e) =>
                      handleFileChange(ref.customer_reference, e)
                    }
                  />
                </div>
              ))}
          </div>
          <Button
            style={{
              width: "150px",
              height: "50px",
              margin: "1em",
            }}
            variant="contained"
            color="primary"
            type="submit">
            Upload Images
          </Button>
        </form>
      </div>
    </div>
  );
}
