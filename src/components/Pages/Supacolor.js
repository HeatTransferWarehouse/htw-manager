import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./css/Main.css";
import "./css/bootstrap.min.css";
import "./css/font-awesome.css";
import "./css/flex-slider.css";
import "./css/templatemo-softy-pinko.css";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import TablePagination from "@material-ui/core/TablePagination";
import SearchBar from "material-ui-search-bar";
import { BsFillCloudArrowUpFill, BsCheckCircleFill } from "react-icons/bs";
import { CgDetailsMore } from "react-icons/cg";
import {
  BiSolidUpArrow,
  BiSolidDownArrow,
  BiSolidErrorCircle,
} from "react-icons/bi";

function Supacolor() {
  const dispatch = useDispatch();
  const jobDetails = useSelector((store) => store.item.supacolorJobDetails);
  const [jobs, setJobs] = useState([]);
  const [jobDetailObj, setJobDetailObj] = useState({});
  const [jobUploadArr, setJobUploadArr] = useState([]);
  const [jobUploadsRef, setJobUploadsRef] = useState("");
  const [toggleViewDetails, setToggleViewDetails] = useState(false);
  const [toggleUploadImg, setToggleUploadImg] = useState(false);
  const [customerRef, setCustomerRef] = useState([]);
  const [files, setFiles] = useState({});
  const [jobId, setJobId] = useState(0);
  const [sort, setSort] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searched, setSearched] = useState("");
  const isLoading = useSelector((state) => state.item.artWorkReducer.isLoading);
  const popupMessage = useSelector(
    (state) => state.item.artWorkReducer.popupMessage
  );
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    setFilteredJobs(jobs);
  }, [jobs, sortField]);

  useEffect(() => {
    // Change the URL to match where your server is running
    fetch("/supacolor-api/get-jobs")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to fetch data");
        }
      })
      .then((data) => {
        setJobs(data);
      })
      .catch((error) => {
        console.log("Getting Jobs Error", error);
      });
  }, []);

  useEffect(() => {
    jobDetails[0] !== undefined && setJobDetailObj(jobDetails[0]);
    jobDetails[0] !== undefined &&
      setJobUploadArr(jobDetails[0].artwork_uploads);
    jobDetails[0] !== undefined &&
      setJobUploadsRef(
        jobDetails[0].artwork_uploads[0].customer_reference.split(":")[0].trim()
      );
  }, [jobDetails]);

  const handleSort = (field) => {
    let direction = "asc";
    if (sortField === field && sortDirection === "asc") {
      direction = "desc";
    }

    let sortedJobs = [...jobs];
    sortedJobs.sort((a, b) => {
      let aValue, bValue;

      if (field === "status") {
        aValue = a.job_line_details.some((detail) => detail.needs_artwork);
        bValue = b.job_line_details.some((detail) => detail.needs_artwork);
      } else if (field === "customerReference") {
        aValue = a.job_line_details[0].customer_reference.split(":")[0].trim();
        bValue = b.job_line_details[0].customer_reference.split(":")[0].trim();
      } else if (field === "jobId") {
        aValue = a.job_id;
        bValue = b.job_id;
      } else if (field === "dateDue") {
        aValue = a.date_due;
        bValue = b.date_due;
      }

      if (direction === "asc") {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    setJobs(sortedJobs);
    setSortField(field);
    setSortDirection(direction);
  };

  // Function to bring you to the order in big commerce when you click the order number
  const goToOrder = (orderNumber) => {
    const url = `https://store-et4qthkygq.mybigcommerce.com/manage/orders?viewId=${orderNumber}&orderTo=${orderNumber}&orderFrom=${orderNumber}`;
    window.open(url, "_blank");
  };

  const imageUpload = (jobNumber, reference) => {
    setJobId(jobNumber);
    setCustomerRef(reference);
    setToggleUploadImg(true);
  };

  const closePopup = () => {
    dispatch({ type: "CLEAR_POPUP_MESSAGE" });
    setToggleUploadImg(false);
    window.location.reload();
  };

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

  const viewJobDetails = (id, e) => {
    setToggleViewDetails(true);
    e.preventDefault();
    dispatch({
      type: "GET_JOB_DETAILS",
      payload: id,
    });
  };

  const exitViewJobDetails = () => {
    setToggleViewDetails(false);
    dispatch({ type: "RESET_JOB_DETAIL" });
  };

  const requestSearch = (searchVal) => {
    const filtered = jobs.filter((job) => {
      return (
        job.job_line_details[0].customer_reference
          .split(":")[0]
          .trim()
          .toLowerCase()
          .includes(searchVal.toLowerCase()) ||
        job.job_id.toString().toLowerCase().includes(searchVal.toLowerCase())
      );
    });
    setFilteredJobs(filtered);
  };

  const cancelSearch = () => {
    setFilteredJobs(jobs);
    setSearched("");
  };

  return (
    <>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Paper
        style={{
          maxWidth: "1200px",
          width: "90%",
          margin: "auto",
          padding: "1em",
        }}>
        <SearchBar
          style={{ width: "95%", maxWidth: "500px" }}
          value={searched}
          placeholder="Search Order Number"
          onChange={(searchVal) => requestSearch(searchVal)}
          onCancelSearch={() => cancelSearch()}
        />
        <TableContainer style={{ width: "100%" }}>
          <Table style={{ width: "100%" }} aria-label="Jobs Table">
            <TableHead>
              <TableRow style={{ backgroundColor: "white" }}>
                <TableCell style={{ width: "20%" }}>
                  <Button
                    className="th-btns"
                    style={{
                      width: "50%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    onClick={() => {
                      handleSort("customerReference");
                      setSort(true);
                    }}>
                    Order #
                    {sort && sortField === "customerReference" ? (
                      sortDirection === "asc" ? (
                        <BiSolidDownArrow />
                      ) : (
                        <BiSolidUpArrow />
                      )
                    ) : (
                      <></>
                    )}
                  </Button>
                </TableCell>
                <TableCell style={{ width: "20%" }}>
                  <Button
                    className="th-btns"
                    style={{
                      width: "50%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    onClick={() => {
                      handleSort("jobId");
                      setSort(true);
                    }}>
                    Job ID{" "}
                    {sort && sortField === "jobId" ? (
                      sortDirection === "asc" ? (
                        <BiSolidDownArrow />
                      ) : (
                        <BiSolidUpArrow />
                      )
                    ) : (
                      <></>
                    )}
                  </Button>
                </TableCell>
                <TableCell style={{ width: "20%" }}>
                  <Button
                    style={{
                      width: "46%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    onClick={() => {
                      handleSort("status");
                      setSort(true);
                    }}>
                    Status{" "}
                    {sort && sortField === "status" ? (
                      sortDirection === "asc" ? (
                        <BiSolidDownArrow />
                      ) : (
                        <BiSolidUpArrow />
                      )
                    ) : (
                      <></>
                    )}
                  </Button>
                </TableCell>
                <TableCell style={{ width: "20%" }}>
                  {" "}
                  <Button
                    style={{
                      width: "40%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    onClick={() => {
                      handleSort("dateDue");
                      setSort(true);
                    }}>
                    Date Due{" "}
                    {sort && sortField === "dateDue" ? (
                      sortDirection === "asc" ? (
                        <BiSolidDownArrow />
                      ) : (
                        <BiSolidUpArrow />
                      )
                    ) : (
                      <></>
                    )}
                  </Button>
                </TableCell>
                <TableCell style={{ width: "20%" }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((job, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <button
                        className="orderNumber-btn"
                        onClick={() =>
                          goToOrder(
                            job.job_line_details[0].customer_reference
                              .split(":")[0]
                              .trim()
                          )
                        }>
                        {job.job_line_details[0].customer_reference
                          .split(":")[0]
                          .trim()}
                      </button>
                    </TableCell>
                    <TableCell>{job.job_id}</TableCell>
                    <TableCell>
                      {job.job_line_details.some(
                        (detail) => detail.needs_artwork
                      ) ? (
                        <div className="needs-artwork">NEEDS ARTWORK</div>
                      ) : (
                        <div className="artwork-uploaded">COMPLETE</div>
                      )}
                    </TableCell>
                    <TableCell>{job.date_due}</TableCell>
                    <TableCell>
                      {job.job_line_details.some(
                        (detail) => detail.needs_artwork
                      ) ? (
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
                              job.job_line_details.filter(
                                (detail) => detail.needs_artwork
                              )
                            )
                          }>
                          Upload Images
                        </Button>
                      ) : (
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
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={jobs.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      </Paper>
      {/* Here is our Popup Modal for Clicking the Upload Image Button */}
      {toggleUploadImg ? (
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
                      Ok
                    </button>
                  ) : (
                    <button
                      className="popup-button error-btn"
                      onClick={closePopup}>
                      Ok
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
                  goToOrder(
                    customerRef[0].customer_reference.split(":")[0].trim()
                  )
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
                      <label style={{ fontSize: 20 }}>
                        Order Item #
                        {ref.customer_reference.split(":")[1].trim()}
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
      ) : (
        <></>
      )}
      {/* Here is our Popup Modal for viewing a completed Job to Supacolor */}
      {toggleViewDetails ? (
        <div className="details-modal">
          <div className="modal-styles">
            <h2 style={{ textAlign: "center" }}>
              Job Details for Job #{jobDetailObj.job_id}
            </h2>
            <Button
              style={{ position: "absolute", right: "15px", top: "15px" }}
              color="secondary"
              onClick={() => {
                exitViewJobDetails();
              }}>
              Close
            </Button>
            <div className="job-details-container">
              <p style={{ marginTop: "1em" }}>
                <strong>Big Commerce Order:</strong> <br /> {jobUploadsRef}
              </p>
              <p style={{ marginTop: "1em" }}>
                <strong>Order Items</strong>
              </p>
              <div className="upload-items-container">
                {jobUploadArr.map((upload, index) => (
                  <div
                    key={index}
                    style={{ margin: "1em" }}
                    className="upload-item">
                    <p style={{ fontSize: 17 }}>
                      Order Item: #
                      {upload.customer_reference.split(":")[1].trim()}
                    </p>
                    <ul>
                      <li>File Uploaded: {upload.message}</li>
                      <li>
                        Upload Status:{" "}
                        {upload.upload_successful ? (
                          <span style={{ color: "green", fontWeight: "bold" }}>
                            Success
                          </span>
                        ) : (
                          "Pending"
                        )}
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default Supacolor;
