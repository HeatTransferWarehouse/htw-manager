export default function searchFunction(
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
) {
  if (activeTableView) {
    const filtered = activeJobsList.filter((job) => {
      return (
        job.job_line_details[0].customer_reference
          .split(":")[0]
          .trim()
          .toLowerCase()
          .includes(searchVal.toLowerCase()) ||
        job.job_id.toString().toLowerCase().includes(searchVal.toLowerCase()) ||
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
        job.job_id.toString().toLowerCase().includes(searchVal.toLowerCase()) ||
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
        job.job_id.toString().toLowerCase().includes(searchVal.toLowerCase()) ||
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
        job.job_id.toString().toLowerCase().includes(searchVal.toLowerCase()) ||
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
        job.job_id.toString().toLowerCase().includes(searchVal.toLowerCase()) ||
        job.customer_name
          .toString()
          .toLowerCase()
          .includes(searchVal.toLowerCase())
      );
    });
    setFilteredJobs(filtered);
  }
}
