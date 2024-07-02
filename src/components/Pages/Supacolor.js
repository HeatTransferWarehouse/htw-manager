import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./css/Main.css";
import "./css/Supacolor.css";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import TablePagination from "@material-ui/core/TablePagination";
import DetailsModal from "../Supacolor/DetailsModal";
import SCTableHead from "../Supacolor/SCTableHead";
import SCTableHeader from "../Supacolor/SCPaperHeader";
import ImageUploadModal from "../Supacolor/ImageUploadModal";
import SCTableRow from "../Supacolor/SCTableRow";
import SortHelper from "../Supacolor/HelperFunc/SortHelper";
import setJobLists from "../Supacolor/HelperFunc/JobLists";

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
  const [jobId, setJobId] = useState(0);
  const [tableValue, setTableValue] = useState("");
  const [sort, setSort] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searched, setSearched] = useState("");
  const [jobAction, setJobAction] = useState("default");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [checkedJobs, setCheckedJobs] = useState([]);
  const [deletedTableView, setDeletedTableView] = useState(false);
  const [canceledTableView, setCanceledTableView] = useState(false);
  const [allJobsTableView, setAllJobsTableView] = useState(false);
  const [activeTableView, setActiveTableView] = useState(true);
  const [completedTableView, setCompletedTableView] = useState(false);
  const [activeJobsList, setActiveJobsList] = useState([]);
  const [canceledJobsList, setCanceledJobsList] = useState([]);
  const [deletedJobsList, setDeletedJobsList] = useState([]);
  const [completedJobsList, setCompletedJobsList] = useState([]);
  const [filteredActiveJobs, setFilteredActiveJobs] = useState([]);
  const [filteredCanceledJobs, setFilteredCanceledJobs] = useState([]);
  const [filteredDeletedJobs, setFilteredDeletedJobs] = useState([]);
  const [filteredCompletedJobs, setFilteredCompletedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    dispatch({ type: "FETCH_JOBS_LIST" });
  }, [dispatch]);

  useEffect(() => {
    setJobLists({
      setActiveJobsList,
      setCanceledJobsList,
      setDeletedJobsList,
      setCompletedJobsList,
      jobs,
    });
  }, [jobs]);

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
    setCheckedJobs([]);
  };

  const viewJobDetails = (id, e) => {
    setToggleViewDetails(true);
    setCheckedJobs([]);
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

  useEffect(() => {
    setFilteredActiveJobs(activeJobsList);
    setFilteredCanceledJobs(canceledJobsList);
    setFilteredDeletedJobs(deletedJobsList);
    setFilteredCompletedJobs(completedJobsList);
    setFilteredJobs(jobs);
  }, [
    activeJobsList,
    canceledJobsList,
    deletedJobsList,
    completedJobsList,
    jobs,
  ]);
  useEffect(() => {
    if (deletedTableView) setTableValue("deleted");
    if (activeTableView) setTableValue("current");
    if (canceledTableView) setTableValue("cancelled");
    if (completedTableView) setTableValue("complete");
    if (allJobsTableView) setTableValue("all");
  }, [
    deletedTableView,
    canceledTableView,
    completedTableView,
    activeTableView,
    allJobsTableView,
  ]);

  const handleSort = (field) => {
    SortHelper(
      field,
      sortDirection,
      sortField,
      setSortDirection,
      setSortField,
      setFilteredActiveJobs,
      setFilteredCanceledJobs,
      setFilteredDeletedJobs,
      setFilteredCompletedJobs,
      setFilteredJobs,
      activeTableView,
      canceledTableView,
      deletedTableView,
      completedTableView,
      activeJobsList,
      canceledJobsList,
      deletedJobsList,
      completedJobsList,
      jobs
    );
  };

  return (
    <>
      <h1 className="font-bold mx-auto mb-4 mt-8 text-4xl">Supa Queue</h1>
      <Paper
        className="opacity-0 animate-in"
        style={{
          maxWidth: "1200px",
          width: "90%",
          marginInline: "auto",
          marginTop: "2rem",
          padding: "1em",
          marginBottom: "3rem",
        }}>
        <SCTableHeader
          deletedTableView={deletedTableView}
          canceledTableView={canceledTableView}
          activeTableView={activeTableView}
          activeJobsList={activeJobsList}
          filteredJobs={filteredJobs}
          allJobsTableView={allJobsTableView}
          checkedJobs={checkedJobs}
          setSearched={setSearched}
          deletedJobsList={deletedJobsList}
          canceledJobsList={canceledJobsList}
          completedJobsList={completedJobsList}
          jobAction={jobAction}
          setJobAction={setJobAction}
          setFilteredDeletedJobs={setFilteredDeletedJobs}
          setFilteredActiveJobs={setFilteredActiveJobs}
          setFilteredCanceledJobs={setFilteredCanceledJobs}
          setFilteredCompletedJobs={setFilteredCompletedJobs}
          setFilteredJobs={setFilteredJobs}
          completedTableView={completedTableView}
          setCheckedJobs={setCheckedJobs}
          setActiveTableView={setActiveTableView}
          setCanceledTableView={setCanceledTableView}
          setDeletedTableView={setDeletedTableView}
          setAllJobsTableView={setAllJobsTableView}
          setCompletedTableView={setCompletedTableView}
          dispatch={dispatch}
          jobs={jobs}
          searched={searched}
          tableValue={tableValue}
        />
        <TableContainer
          style={{
            maxHeight: "880px",
            overflow: "auto",
            position: "relative",
          }}>
          <Table aria-label="Jobs Table">
            <SCTableHead
              sort={sort}
              setSort={setSort}
              handleSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />

            <TableBody>
              {activeTableView ? (
                <>
                  {filteredActiveJobs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((job, index) =>
                      job.active && !job.perm_delete ? (
                        <SCTableRow
                          key={index}
                          index={index}
                          job={job}
                          checkedJobs={checkedJobs}
                          setCheckedJobs={setCheckedJobs}
                          goToOrder={goToOrder}
                          imageUpload={imageUpload}
                          viewJobDetails={viewJobDetails}
                        />
                      ) : null
                    )}
                </>
              ) : deletedTableView ? (
                <>
                  {filteredDeletedJobs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((job, index) =>
                      job.fake_delete && !job.perm_delete ? (
                        <SCTableRow
                          key={index}
                          index={index}
                          job={job}
                          checkedJobs={checkedJobs}
                          setCheckedJobs={setCheckedJobs}
                          goToOrder={goToOrder}
                          imageUpload={imageUpload}
                          viewJobDetails={viewJobDetails}
                        />
                      ) : null
                    )}
                </>
              ) : canceledTableView ? (
                <>
                  {filteredCanceledJobs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((job, index) =>
                      job.canceled && !job.perm_delete ? (
                        <SCTableRow
                          key={index}
                          index={index}
                          job={job}
                          checkedJobs={checkedJobs}
                          setCheckedJobs={setCheckedJobs}
                          goToOrder={goToOrder}
                          imageUpload={imageUpload}
                          viewJobDetails={viewJobDetails}
                        />
                      ) : null
                    )}
                </>
              ) : completedTableView ? (
                <>
                  {filteredCompletedJobs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((job, index) =>
                      job.complete && !job.perm_delete ? (
                        <SCTableRow
                          key={index}
                          index={index}
                          job={job}
                          checkedJobs={checkedJobs}
                          setCheckedJobs={setCheckedJobs}
                          goToOrder={goToOrder}
                          imageUpload={imageUpload}
                          viewJobDetails={viewJobDetails}
                        />
                      ) : null
                    )}
                </>
              ) : (
                <>
                  {filteredJobs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((job, index) =>
                      !job.perm_delete ? (
                        <SCTableRow
                          key={index}
                          index={index}
                          job={job}
                          checkedJobs={checkedJobs}
                          setCheckedJobs={setCheckedJobs}
                          goToOrder={goToOrder}
                          imageUpload={imageUpload}
                          viewJobDetails={viewJobDetails}
                        />
                      ) : null
                    )}
                </>
              )}
            </TableBody>
          </Table>
          <TablePagination
            style={{
              position: "sticky",
              bottom: 0,
              zIndex: 1,
              backgroundColor: "white",
              height: "55px",
              borderTop: "1px solid rgb(217, 217, 217)",
            }}
            component="div"
            count={
              canceledTableView
                ? canceledJobsList.length
                : activeTableView
                ? activeJobsList.length
                : deletedTableView
                ? deletedJobsList.length
                : completedTableView
                ? completedJobsList.length
                : jobs.length
            }
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
      <div>
        <ImageUploadModal
          customerRef={customerRef}
          setCustomerRef={setCustomerRef}
          jobId={jobId}
          setJobId={setJobId}
          dispatch={dispatch}
          goToOrder={goToOrder}
          setToggleUploadImg={setToggleUploadImg}
          toggleUploadImg={toggleUploadImg}
        />

        {/* Here is our Popup Modal for viewing a completed Job to Supacolor */}
        {toggleViewDetails && (
          <DetailsModal
            exitViewJobDetails={exitViewJobDetails}
            goToOrder={goToOrder}
            jobDetailObj={jobDetailObj}
            jobUploadArr={jobUploadArr}
            jobUploadsRef={jobUploadsRef}
          />
        )}
      </div>
    </>
  );
}

export default Supacolor;
