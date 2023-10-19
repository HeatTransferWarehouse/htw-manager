import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./css/Main.css";
import "./css/bootstrap.min.css";
import "./css/font-awesome.css";
import "./css/flex-slider.css";
import "./css/templatemo-softy-pinko.css";
import "./css/Supacolor.css";
import { BsCheckCircleFill } from "react-icons/bs";
import { BiSolidErrorCircle } from "react-icons/bi";
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
import { BsFillCloudArrowUpFill } from "react-icons/bs";
import { CgDetailsMore } from "react-icons/cg";
import {
  BiSolidUpArrow,
  BiSolidDownArrow,
  BiSolidInfoCircle,
} from "react-icons/bi";
import { MenuItem, Select, Tooltip } from "@material-ui/core";

function Supacolor() {
  const dispatch = useDispatch();
  const jobDetails = useSelector((store) => store.item.supacolorJobDetails);
  const jobs = useSelector((store) => store.item.jobsStorage);
  const [jobDetailObj, setJobDetailObj] = useState({});
  const [jobUploadArr, setJobUploadArr] = useState([]);
  const [jobUploadsRef, setJobUploadsRef] = useState("");
  const [toggleViewDetails, setToggleViewDetails] = useState(false);
  const [toggleUploadImg, setToggleUploadImg] = useState(false);
  const [customerRef, setCustomerRef] = useState([]);
  const [files, setFiles] = useState({});
  const [jobId, setJobId] = useState(0);
  const [tableValue, setTableValue] = useState("");
  const [sort, setSort] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searched, setSearched] = useState("");
  const [jobAction, setJobAction] = useState("default");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [checkedJobs, setCheckedJobs] = useState([]);
  const [deletedTableView, setDeletedTableView] = useState(false);
  const [canceledTableView, setCanceledTableView] = useState(false);
  const [activeTableView, setActiveTableView] = useState(true);
  const [completedTableView, setCompletedTableView] = useState(false);
  const isLoading = useSelector((state) => state.item.artWorkReducer.isLoading);
  const popupMessage = useSelector(
    (state) => state.item.artWorkReducer.popupMessage
  );

  useEffect(() => {
    dispatch({ type: "FETCH_JOBS_LIST" });
  }, [dispatch]);

  useEffect(() => {
    jobDetails[0] !== undefined && setJobDetailObj(jobDetails[0]);
    jobDetails[0] !== undefined &&
      setJobUploadArr(jobDetails[0].artwork_uploads);
    jobDetails[0] !== undefined &&
      setJobUploadsRef(
        jobDetails[0].artwork_uploads[0].customer_reference.split(":")[0].trim()
      );
  }, [jobDetails]);

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

  useEffect(() => {
    setFilteredJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    if (deletedTableView) setTableValue("deleted");
    if (activeTableView) setTableValue("current");
    if (canceledTableView) setTableValue("cancelled");
    if (completedTableView) setTableValue("complete");
  }, [deletedTableView, canceledTableView, completedTableView]);

  const handleDropdownChange = (e) => {
    if (e.target.value === "deleted") {
      setDeletedTableView(true);
      setCanceledTableView(false);
      setActiveTableView(false);
      setCompletedTableView(false);
    } else if (e.target.value === "current") {
      setCompletedTableView(false);
      setActiveTableView(true);
      setDeletedTableView(false);
      setCanceledTableView(false);
    } else if (e.target.value === "cancelled") {
      setCanceledTableView(true);
      setActiveTableView(false);
      setDeletedTableView(false);
      setCompletedTableView(false);
    } else if (e.target.value === "complete") {
      setCanceledTableView(false);
      setActiveTableView(false);
      setDeletedTableView(false);
      setCompletedTableView(true);
    }
  };

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

    setFilteredJobs(sortedJobs);
    setSortField(field);
    setSortDirection(direction);
  };

  const cancelJob = () => {
    if (checkedJobs) {
      dispatch({ type: "CANCEL_JOB", payload: checkedJobs });
      setCheckedJobs([]);
    }
  };

  const recoverDeletedJobs = () => {
    if (checkedJobs) {
      dispatch({ type: "RECOVER_DELETED_JOB", payload: checkedJobs });
      setCheckedJobs([]);
    } else {
    }
  };

  const fakeDeleteJob = () => {
    if (checkedJobs) {
      dispatch({ type: "FAKE_DELETE_JOB", payload: checkedJobs });
      setCheckedJobs([]);
    }
  };

  const permDeleteJob = () => {
    if (checkedJobs) {
      dispatch({ type: "PERM_DELETE_JOB", payload: checkedJobs });
      setCheckedJobs([]);
    }
  };

  const handleJobDestination = () => {
    if (jobAction === "archive") fakeDeleteJob();
    if (jobAction === "delete") permDeleteJob();
    if (jobAction === "active") recoverDeletedJobs();
    if (jobAction === "cancel") cancelJob();
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

  const handleJobAction = (e) => {
    setJobAction(e.target.value);
  };

  // Function to bring you to the order in big commerce when you click the order number

  const goToDocumentation = () => {
    const url = `https://docs.google.com/document/d/14e_R6Me_D98FLr6iHC8EDO8jx6ET6Tsuppti-rcRBCA/edit?usp=sharing`;
    window.open(url, "_blank");
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
          maxWidth: "1400px",
          width: "90%",
          margin: "auto",
          padding: "1em",
        }}>
        <div style={{ width: "100%", textAlign: "center" }}>
          {deletedTableView ? (
            <h2>Archived Jobs</h2>
          ) : canceledTableView ? (
            <h2>Cancelled Jobs</h2>
          ) : activeTableView ? (
            <>
              <h2>Active Jobs</h2>
            </>
          ) : (
            <>
              <h2>Completed Jobs</h2>
            </>
          )}
        </div>
        <div className="supacolor-table-head">
          <div style={{ display: "flex", width: "550px" }}>
            <SearchBar
              style={{ width: "95%", maxWidth: "500px" }}
              value={searched}
              placeholder="Search Order Number"
              onChange={(searchVal) => requestSearch(searchVal)}
              onCancelSearch={() => cancelSearch()}
            />
            <Select
              style={{ marginLeft: "10px", width: "200px" }}
              value={tableValue}
              label="Table View"
              onChange={handleDropdownChange}>
              <MenuItem value={"current"}>Active Jobs</MenuItem>
              <MenuItem value={"deleted"}>Archived Jobs</MenuItem>
              <MenuItem value={"cancelled"}>Cancelled Jobs</MenuItem>
              <MenuItem value={"complete"}>Completed Jobs</MenuItem>
            </Select>
          </div>
          <div className="top-table-icons">
            {checkedJobs.length ? (
              <div className="actions-options">
                {deletedTableView ? (
                  <Select
                    style={{ width: "125px" }}
                    onChange={handleJobAction}
                    value={jobAction}>
                    <MenuItem value={"default"}>Select Action</MenuItem>
                    <MenuItem value={"active"}>Active</MenuItem>
                    <MenuItem value={"delete"}>Delete</MenuItem>
                    <MenuItem value={"cancel"}>Cancelled</MenuItem>
                  </Select>
                ) : canceledTableView ? (
                  <Select
                    style={{ width: "125px" }}
                    onChange={handleJobAction}
                    value={jobAction}>
                    <MenuItem value={"default"}>Select Action</MenuItem>
                    <MenuItem value={"active"}>Active</MenuItem>
                    <MenuItem value={"delete"}>Archive</MenuItem>
                    <MenuItem value={"delete"}>Delete</MenuItem>
                  </Select>
                ) : activeTableView ? (
                  <Select
                    style={{ width: "125px" }}
                    onChange={handleJobAction}
                    value={jobAction}>
                    <MenuItem value={"default"}>Select Action</MenuItem>
                    <MenuItem value={"cancel"}>Cancelled</MenuItem>
                    <MenuItem value={"archive"}>Archive</MenuItem>
                    <MenuItem value={"delete"}>Delete</MenuItem>
                  </Select>
                ) : (
                  <Select
                    style={{ width: "125px" }}
                    onChange={handleJobAction}
                    value={jobAction}>
                    <MenuItem value={"default"}>Select Action</MenuItem>
                    <MenuItem value={"archive"}>Archive</MenuItem>
                    <MenuItem value={"delete"}>Delete</MenuItem>
                  </Select>
                )}
                {jobAction === "delete" ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleJobDestination}>
                    Save
                  </Button>
                ) : jobAction ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleJobDestination}>
                    Save
                  </Button>
                ) : (
                  <Button
                    disabled
                    variant="contained"
                    onClick={handleJobDestination}>
                    Save
                  </Button>
                )}
              </div>
            ) : null}

            <BiSolidInfoCircle
              onClick={goToDocumentation}
              className="supacolor-info-icon"
            />
          </div>
        </div>
        <TableContainer>
          <Table aria-label="Jobs Table">
            <TableHead>
              <TableRow>
                <TableCell style={{ width: "5%" }}></TableCell>
                <TableCell style={{ width: "19%" }}>
                  <Button
                    style={{ width: "50%" }}
                    className="th-btns"
                    onClick={() => {
                      handleSort("customerReference");
                      setSort(true);
                    }}>
                    Order #
                    {sort && sortField === "customerReference" ? (
                      sortDirection === "asc" ? (
                        <BiSolidUpArrow style={{ marginLeft: "5px" }} />
                      ) : (
                        <BiSolidDownArrow style={{ marginLeft: "5px" }} />
                      )
                    ) : (
                      <></>
                    )}
                  </Button>
                </TableCell>
                <TableCell style={{ width: "19%" }}>
                  <Button
                    style={{ width: "50%" }}
                    className="th-btns"
                    onClick={() => {
                      handleSort("jobId");
                      setSort(true);
                    }}>
                    Job ID
                    {sort && sortField === "jobId" ? (
                      sortDirection === "asc" ? (
                        <BiSolidUpArrow style={{ marginLeft: "5px" }} />
                      ) : (
                        <BiSolidDownArrow style={{ marginLeft: "5px" }} />
                      )
                    ) : (
                      <></>
                    )}
                  </Button>
                </TableCell>
                <TableCell style={{ width: "19%" }}>
                  <Button
                    style={{ width: "50%" }}
                    className="status-container"
                    onClick={() => {
                      handleSort("status");
                      setSort(true);
                    }}>
                    Status
                    {sort && sortField === "status" ? (
                      sortDirection === "asc" ? (
                        <BiSolidUpArrow style={{ marginLeft: "5px" }} />
                      ) : (
                        <BiSolidDownArrow style={{ marginLeft: "5px" }} />
                      )
                    ) : (
                      <></>
                    )}
                  </Button>
                </TableCell>
                <TableCell style={{ width: "19%" }}>
                  <Button
                    style={{ width: "50%" }}
                    onClick={() => {
                      handleSort("dateDue");
                      setSort(true);
                    }}>
                    Date Due
                    {sort && sortField === "dateDue" ? (
                      sortDirection === "asc" ? (
                        <BiSolidUpArrow style={{ marginLeft: "5px" }} />
                      ) : (
                        <BiSolidDownArrow style={{ marginLeft: "5px" }} />
                      )
                    ) : (
                      <></>
                    )}
                  </Button>
                </TableCell>
                <TableCell style={{ width: "19%" }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeTableView ? (
                <>
                  {filteredJobs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((job, index) =>
                      !job.fake_delete &&
                      !job.canceled &&
                      !job.perm_delete &&
                      job.job_line_details.some(
                        (detail) => detail.needs_artwork
                      ) ? (
                        <TableRow
                          style={{ backgroundColor: "white" }}
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
                                  setCheckedJobs((prevJobs) => [
                                    ...prevJobs,
                                    job.job_id,
                                  ]);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <button
                              className="orderNumber-btn"
                              onClick={() => goToOrder(job.order_id)}>
                              {job.order_id}
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
                      ) : null
                    )}
                </>
              ) : deletedTableView ? (
                <>
                  {filteredJobs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((job, index) =>
                      job.fake_delete && !job.canceled && !job.perm_delete ? (
                        <TableRow
                          style={{ backgroundColor: "white" }}
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
                                  setCheckedJobs((prevJobs) => [
                                    ...prevJobs,
                                    job.job_id,
                                  ]);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <button
                              className="orderNumber-btn"
                              onClick={() => goToOrder(job.order_id)}>
                              {job.order_id}
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
                              <Tooltip
                                title="Job must be active to upload artwork."
                                arrow>
                                <Button
                                  style={{
                                    width: "170px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                  color="primary"
                                  component="label"
                                  startIcon={<BsFillCloudArrowUpFill />}>
                                  Upload Images
                                </Button>
                              </Tooltip>
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
                      ) : null
                    )}
                </>
              ) : canceledTableView ? (
                <>
                  {filteredJobs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((job, index) =>
                      !job.fake_delete && job.canceled && !job.perm_delete ? (
                        <TableRow
                          style={{ backgroundColor: "white" }}
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
                                  setCheckedJobs((prevJobs) => [
                                    ...prevJobs,
                                    job.job_id,
                                  ]);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <button
                              className="orderNumber-btn"
                              onClick={() => goToOrder(job.order_id)}>
                              {job.order_id}
                            </button>
                          </TableCell>
                          <TableCell>{job.job_id}</TableCell>
                          <TableCell>
                            <div className="cancelled">CANCELLED</div>
                          </TableCell>
                          <TableCell>{job.date_due}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      ) : null
                    )}
                </>
              ) : (
                <>
                  {filteredJobs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((job, index) =>
                      !job.fake_delete &&
                      !job.canceled &&
                      !job.perm_delete &&
                      !job.job_line_details.some(
                        (detail) => detail.needs_artwork
                      ) ? (
                        <TableRow
                          style={{ backgroundColor: "white" }}
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
                                  setCheckedJobs((prevJobs) => [
                                    ...prevJobs,
                                    job.job_id,
                                  ]);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <button
                              className="orderNumber-btn"
                              onClick={() => goToOrder(job.order_id)}>
                              {job.order_id}
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
                      ) : null
                    )}
                </>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredJobs.length}
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
      ) : (
        <></>
      )}
      {/* Here is our Popup Modal for viewing a completed Job to Supacolor */}
      {toggleViewDetails ? (
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
                      Order Item: #
                      {upload.customer_reference.split(":")[1].trim()}
                    </p>
                    <ul>
                      <li>File Uploaded: {upload.message}</li>
                      <li>
                        Upload Status:
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
