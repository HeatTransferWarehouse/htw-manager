import React from "react";
import { Button, MenuItem, Select } from "@material-ui/core";
import SearchBar from "material-ui-search-bar";
import { BiSolidInfoCircle } from "react-icons/bi";
import { set } from "ol/transform";

export default function SCTableHeader({
  deletedTableView,
  canceledTableView,
  activeTableView,
  allJobsTableView,
  activeJobsList,
  checkedJobs,
  setFilteredJobs,
  setSearched,
  deletedJobsList,
  canceledJobsList,
  completedJobsList,
  jobAction,
  setJobAction,
  setFilteredDeletedJobs,
  setFilteredActiveJobs,
  setFilteredCanceledJobs,
  setFilteredCompletedJobs,
  completedTableView,
  setCheckedJobs,
  setActiveTableView,
  setCanceledTableView,
  setDeletedTableView,
  setCompletedTableView,
  setAllJobsTableView,
  dispatch,
  jobs,
  tableValue,
  searched,
}) {
  const handleDropdownChange = (e) => {
    if (e.target.value === "deleted") {
      setDeletedTableView(true);
      setCanceledTableView(false);
      setActiveTableView(false);
      setCompletedTableView(false);
      setAllJobsTableView(false);
    } else if (e.target.value === "current") {
      setCompletedTableView(false);
      setActiveTableView(true);
      setDeletedTableView(false);
      setCanceledTableView(false);
      setAllJobsTableView(false);
    } else if (e.target.value === "cancelled") {
      setCanceledTableView(true);
      setActiveTableView(false);
      setDeletedTableView(false);
      setCompletedTableView(false);
      setAllJobsTableView(false);
    } else if (e.target.value === "complete") {
      setCanceledTableView(false);
      setActiveTableView(false);
      setDeletedTableView(false);
      setCompletedTableView(true);
      setAllJobsTableView(false);
    } else if (e.target.value === "all") {
      setCanceledTableView(false);
      setActiveTableView(false);
      setDeletedTableView(false);
      setCompletedTableView(false);
      setAllJobsTableView(true);
    }
  };
  const markJobCanceled = () => {
    if (checkedJobs)
      dispatch({ type: "MARK_JOB_CANCELED", payload: checkedJobs });
    setCheckedJobs([]);
    setJobAction("default");
  };

  const markJobActive = () => {
    if (checkedJobs)
      dispatch({ type: "MARK_JOB_ACTIVE", payload: checkedJobs });
    setCheckedJobs([]);
    setJobAction("default");
  };

  const markJobArchived = () => {
    if (checkedJobs) {
      dispatch({ type: "MARK_JOB_ARCHIVED", payload: checkedJobs });
      setCheckedJobs([]);
      setJobAction("default");
    }
  };

  const markJobDeleted = () => {
    if (checkedJobs) {
      dispatch({ type: "MARK_JOB_DELETED", payload: checkedJobs });
      setCheckedJobs([]);
      setJobAction("default");
    }
  };

  const markJobComplete = () => {
    if (checkedJobs) {
      dispatch({ type: "MARK_JOB_COMPLETE", payload: checkedJobs });
      setCheckedJobs([]);
      setJobAction("default");
    }
  };
  const handleJobDestination = () => {
    if (jobAction === "archive") markJobArchived();
    if (jobAction === "delete") markJobDeleted();
    if (jobAction === "active") markJobActive();
    if (jobAction === "cancel") markJobCanceled();
    if (jobAction === "complete") markJobComplete();
  };
  const requestSearch = (searchVal) => {
    if (activeTableView) {
      const filtered = activeJobsList.filter((job) => {
        return (
          job.job_line_details[0].customer_reference
            .split(":")[0]
            .trim()
            .toLowerCase()
            .includes(searchVal.toLowerCase()) ||
          job.job_id
            .toString()
            .toLowerCase()
            .includes(searchVal.toLowerCase()) ||
          job.customer_name
            .toString()
            .toLowerCase()
            .includes(searchVal.toLowerCase())
        );
      });
      setFilteredActiveJobs(filtered);
    }
    if (deletedTableView) {
      const filtered = deletedJobsList.filter((job) => {
        return (
          job.job_line_details[0].customer_reference
            .split(":")[0]
            .trim()
            .toLowerCase()
            .includes(searchVal.toLowerCase()) ||
          job.job_id
            .toString()
            .toLowerCase()
            .includes(searchVal.toLowerCase()) ||
          job.customer_name
            .toString()
            .toLowerCase()
            .includes(searchVal.toLowerCase())
        );
      });
      setFilteredDeletedJobs(filtered);
    }
    if (canceledTableView) {
      const filtered = canceledJobsList.filter((job) => {
        return (
          job.job_line_details[0].customer_reference
            .split(":")[0]
            .trim()
            .toLowerCase()
            .includes(searchVal.toLowerCase()) ||
          job.job_id
            .toString()
            .toLowerCase()
            .includes(searchVal.toLowerCase()) ||
          job.customer_name
            .toString()
            .toLowerCase()
            .includes(searchVal.toLowerCase())
        );
      });
      setFilteredCanceledJobs(filtered);
    }
    if (completedTableView) {
      const filtered = completedJobsList.filter((job) => {
        return (
          job.job_line_details[0].customer_reference
            .split(":")[0]
            .trim()
            .toLowerCase()
            .includes(searchVal.toLowerCase()) ||
          job.job_id
            .toString()
            .toLowerCase()
            .includes(searchVal.toLowerCase()) ||
          job.customer_name
            .toString()
            .toLowerCase()
            .includes(searchVal.toLowerCase())
        );
      });
      setFilteredCompletedJobs(filtered);
    }
    if (allJobsTableView) {
      const filtered = jobs.filter((job) => {
        return (
          job.job_line_details[0].customer_reference
            .split(":")[0]
            .trim()
            .toLowerCase()
            .includes(searchVal.toLowerCase()) ||
          job.job_id
            .toString()
            .toLowerCase()
            .includes(searchVal.toLowerCase()) ||
          job.customer_name
            .toString()
            .toLowerCase()
            .includes(searchVal.toLowerCase())
        );
      });
      setFilteredJobs(filtered);
    }
  };

  const cancelSearch = () => {
    setFilteredActiveJobs(activeJobsList);
    setFilteredCanceledJobs(canceledJobsList);
    setFilteredDeletedJobs(deletedJobsList);
    setFilteredCompletedJobs(completedJobsList);
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
      <div style={{ width: "100%", textAlign: "center" }}>
        {deletedTableView ? (
          <h2>Archived Jobs List</h2>
        ) : canceledTableView ? (
          <h2>Cancelled Jobs List</h2>
        ) : activeTableView ? (
          <>
            <h2>Active Jobs List</h2>
          </>
        ) : completedTableView ? (
          <h2>Completed Jobs List</h2>
        ) : (
          <>
            <h2>All Jobs List</h2>
          </>
        )}
      </div>
      <div className="supacolor-table-head">
        <div style={{ display: "flex", width: "550px" }}>
          <SearchBar
            style={{ width: "95%", maxWidth: "500px" }}
            value={searched}
            placeholder="Search"
            onChange={(searchVal) => requestSearch(searchVal)}
            onCancelSearch={() => cancelSearch()}
          />
          <Select
            style={{ marginLeft: "10px", width: "200px" }}
            value={tableValue}
            label="Table View"
            onChange={handleDropdownChange}>
            <MenuItem value={"current"}>
              Active Jobs ({activeJobsList.length})
            </MenuItem>
            <MenuItem value={"deleted"}>
              Archived Jobs ({deletedJobsList.length})
            </MenuItem>
            <MenuItem value={"cancelled"}>
              Cancelled Jobs ({canceledJobsList.length})
            </MenuItem>
            <MenuItem value={"complete"}>
              Completed Jobs ({completedJobsList.length})
            </MenuItem>
            <MenuItem value={"all"}>All Jobs ({jobs.length})</MenuItem>
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
                  <MenuItem value={"cancel"}>Cancelled</MenuItem>
                  <MenuItem value={"complete"}>Completed</MenuItem>
                  <MenuItem value={"delete"}>Delete</MenuItem>
                </Select>
              ) : canceledTableView ? (
                <Select
                  style={{ width: "125px" }}
                  onChange={handleJobAction}
                  value={jobAction}>
                  <MenuItem value={"default"}>Select Action</MenuItem>
                  <MenuItem value={"active"}>Active</MenuItem>
                  <MenuItem value={"archive"}>Archive</MenuItem>
                  <MenuItem value={"complete"}>Completed</MenuItem>
                  <MenuItem value={"delete"}>Delete</MenuItem>
                </Select>
              ) : activeTableView ? (
                <Select
                  style={{ width: "125px" }}
                  onChange={handleJobAction}
                  value={jobAction}>
                  <MenuItem value={"default"}>Select Action</MenuItem>
                  <MenuItem value={"archive"}>Archive</MenuItem>
                  <MenuItem value={"cancel"}>Cancelled</MenuItem>
                  <MenuItem value={"complete"}>Completed</MenuItem>
                  <MenuItem value={"delete"}>Delete</MenuItem>
                </Select>
              ) : (
                <Select
                  style={{ width: "125px" }}
                  onChange={handleJobAction}
                  value={jobAction}>
                  <MenuItem value={"default"}>Select Action</MenuItem>
                  <MenuItem value={"active"}>Active</MenuItem>
                  <MenuItem value={"archive"}>Archive</MenuItem>
                  <MenuItem value={"cancel"}>Cancelled</MenuItem>
                  <MenuItem value={"complete"}>Completed</MenuItem>
                  <MenuItem value={"delete"}>Delete</MenuItem>
                </Select>
              )}
              {jobAction === "delete" ? (
                <Button
                  variant="danger"
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
    </>
  );
}
