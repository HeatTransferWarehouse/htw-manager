import React from "react";
import { Button, TableCell, TableRow } from "@material-ui/core";
import { BsFillCloudArrowUpFill } from "react-icons/bs";
import { CgDetailsMore } from "react-icons/cg";

export default function SCTableRow({
  checkedJobs,
  setCheckedJobs,
  job,
  index,
  goToOrder,
  imageUpload,
  viewJobDetails,
}) {
  const sendToSupacolor = (jobId) => {
    window.open(
      `https://secure.supacolor.com/secure/viewJob.aspx?ID=${jobId}`,
      "_blank"
    );
  };
  return (
    <TableRow
      style={{
        border: "5px solid white",
        backgroundColor: job.expecting_artwork
          ? "rgba(255, 0, 0, 0.108)"
          : job.canceled
          ? "rgba(0, 0, 0, 0.108)"
          : "rgba(21, 255, 0, 0.108)",
      }}
      key={index}>
      <TableCell>
        <input
          className="checkbox-input"
          type="checkbox"
          checked={checkedJobs.includes(job.job_id)}
          onChange={() => {
            if (checkedJobs.includes(job.job_id)) {
              setCheckedJobs((prevJobs) =>
                prevJobs.filter((id) => id !== job.job_id)
              );
            } else {
              setCheckedJobs((prevJobs) => [...prevJobs, job.job_id]);
            }
          }}
        />
      </TableCell>
      <TableCell>{job.customer_name}</TableCell>
      <TableCell>
        <button
          className="orderNumber-btn"
          onClick={() => goToOrder(job.order_id)}>
          {job.order_id}
        </button>
      </TableCell>
      <TableCell>
        <button
          className="orderNumber-btn"
          onClick={() => sendToSupacolor(job.job_id)}>
          {job.job_id}
        </button>
      </TableCell>
      <TableCell>
        {job.expecting_artwork ? (
          <div className="needs-artwork">ARTWORK NEEDED</div>
        ) : job.canceled ? (
          <div className="job-canceled">CANCELED</div>
        ) : (
          <div className="artwork-uploaded">ARTWORK UPLOADED</div>
        )}
      </TableCell>
      <TableCell>{job.date_due}</TableCell>
      <TableCell>
        {job.expecting_artwork ? (
          <Button
            style={{
              width: "170px",
              display: "flex",
              justifyContent: "space-between",
            }}
            variant="contained"
            color="primary"
            component="label"
            startIcon={<BsFillCloudArrowUpFill />}
            onClick={() =>
              imageUpload(
                job.job_id,
                job.job_line_details.filter((detail) => detail.needs_artwork)
              )
            }>
            Upload Images
          </Button>
        ) : job.canceled ? null : (
          <Button
            style={{
              width: "170px",
              display: "flex",
              justifyContent: "space-between",
            }}
            variant="contained"
            color="primary"
            component="label"
            startIcon={<CgDetailsMore />}
            onClick={(e) => viewJobDetails(job.job_id, e)}>
            View Details
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
