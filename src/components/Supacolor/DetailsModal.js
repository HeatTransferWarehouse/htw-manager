import { Button } from "@material-ui/core";
import React from "react";
import { SlClose } from "react-icons/sl";

export default function DetailsModal({
  exitViewJobDetails,
  goToOrder,
  jobUploadArr,
  jobDetailObj,
  jobUploadsRef,
}) {
  return (
    <div className="details-modal">
      <div className="modal-styles">
        <h2
          style={{
            textAlign: "center",
            borderBottom: "1px solid gray",
            padding: "0 0 0.5em 0",
          }}>
          Job Details for Job #{jobDetailObj.job_id}
        </h2>
        <button
          className="img-upload-close-btn"
          onClick={() => {
            exitViewJobDetails();
          }}>
          <SlClose className="img-upload-x" />
        </button>
        <div className="job-details-container">
          <p style={{ marginTop: "1em" }}>
            <strong>Big Commerce Order Id</strong>
          </p>
          <button
            className="orderNumber-btn"
            onClick={() => goToOrder(jobUploadsRef)}
            style={{ margin: "1em 0 0 1em" }}>
            {jobUploadsRef}
          </button>
          <p style={{ marginTop: "1em" }}>
            <strong>Order Items</strong>
          </p>
          <div className="upload-items-container">
            {jobUploadArr.map((upload, index) => (
              <div
                key={index}
                style={{
                  margin: "1em",
                  borderBottom: "1px solid gray",
                  paddingBottom: "1em",
                }}
                className="upload-item">
                <p
                  style={{
                    fontSize: 17,
                    marginBottom: "0.25em",
                  }}>
                  Order Item: #{upload.customer_reference.split(":")[1].trim()}
                </p>
                <ul>
                  <li>File Uploaded: {upload.message}</li>
                  <li>
                    Upload Status:
                    {upload.upload_successful ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        {" "}
                        Success
                      </span>
                    ) : (
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        {" "}
                        Pending
                      </span>
                    )}
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
