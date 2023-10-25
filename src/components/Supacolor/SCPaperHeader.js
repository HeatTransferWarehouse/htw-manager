import React from "react";
import { Button, MenuItem, Select } from "@material-ui/core";
import SearchBar from "material-ui-search-bar";
import { BiSolidInfoCircle } from "react-icons/bi";
import searchFunction from "./HelperFunc/Search";
import dropDownFunction from "./HelperFunc/DropDown";

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
    dropDownFunction(
      e,
      setDeletedTableView,
      setCanceledTableView,
      setActiveTableView,
      setCompletedTableView,
      setAllJobsTableView
    );
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
    searchFunction(
      activeTableView,
      deletedTableView,
      canceledTableView,
      completedTableView,
      allJobsTableView,
      activeJobsList,
      deletedJobsList,
      canceledJobsList,
      completedJobsList,
      jobs,
      searchVal,
      setFilteredActiveJobs,
      setFilteredDeletedJobs,
      setFilteredCanceledJobs,
      setFilteredCompletedJobs,
      setFilteredJobs
    );
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
            style={{ marginLeft: "10px", width: "200px", marginBottom: "5px" }}
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
                  style={{ width: "110px", marginBottom: "5px" }}
                  onChange={handleJobAction}
                  value={jobAction}>
                  <MenuItem value={"default"}>Select Tag</MenuItem>
                  <MenuItem value={"active"}>Active</MenuItem>
                  <MenuItem value={"cancel"}>Cancelled</MenuItem>
                  <MenuItem value={"complete"}>Completed</MenuItem>
                  <MenuItem value={"delete"}>Delete</MenuItem>
                </Select>
              ) : canceledTableView ? (
                <Select
                  style={{ width: "110px", marginBottom: "5px" }}
                  onChange={handleJobAction}
                  value={jobAction}>
                  <MenuItem value={"default"}>Select Tag</MenuItem>
                  <MenuItem value={"active"}>Active</MenuItem>
                  <MenuItem value={"archive"}>Archive</MenuItem>
                  <MenuItem value={"complete"}>Completed</MenuItem>
                  <MenuItem value={"delete"}>Delete</MenuItem>
                </Select>
              ) : activeTableView ? (
                <Select
                  style={{ width: "110px", marginBottom: "5px" }}
                  onChange={handleJobAction}
                  value={jobAction}>
                  <MenuItem value={"default"}>Select Tag</MenuItem>
                  <MenuItem value={"archive"}>Archive</MenuItem>
                  <MenuItem value={"cancel"}>Cancelled</MenuItem>
                  <MenuItem value={"complete"}>Completed</MenuItem>
                  <MenuItem value={"delete"}>Delete</MenuItem>
                </Select>
              ) : (
                <Select
                  style={{ width: "110px", marginBottom: "5px" }}
                  onChange={handleJobAction}
                  value={jobAction}>
                  <MenuItem value={"default"}>Select Tag</MenuItem>
                  <MenuItem value={"active"}>Active</MenuItem>
                  <MenuItem value={"archive"}>Archive</MenuItem>
                  <MenuItem value={"cancel"}>Cancelled</MenuItem>
                  <MenuItem value={"complete"}>Completed</MenuItem>
                  <MenuItem value={"delete"}>Delete</MenuItem>
                </Select>
              )}
              {jobAction === "delete" ? (
                <Button
                  style={{ marginBottom: "5px" }}
                  variant="contained"
                  color="secondary"
                  onClick={handleJobDestination}>
                  Delete
                </Button>
              ) : jobAction ? (
                <Button
                  style={{ marginBottom: "5px" }}
                  variant="contained"
                  color="primary"
                  onClick={handleJobDestination}>
                  Save
                </Button>
              ) : (
                <Button
                  style={{ marginBottom: "5px" }}
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
