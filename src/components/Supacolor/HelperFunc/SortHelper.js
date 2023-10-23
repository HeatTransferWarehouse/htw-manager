export default function sortHelper(
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
) {
  let direction = "asc";
  if (sortField === field && sortDirection === "asc") {
    direction = "desc";
  }

  if (activeTableView) {
    let sortedJobs = [...activeJobsList];
    sortedJobs.sort((a, b) => {
      let aValue, bValue;

      if (field === "status") {
        aValue = a.expecting_artwork;
        bValue = b.expecting_artwork;
      } else if (field === "customerReference") {
        aValue = a.order_id;
        bValue = b.order_id;
      } else if (field === "jobId") {
        aValue = a.job_id;
        bValue = b.job_id;
      } else if (field === "dateDue") {
        aValue = a.date_due;
        bValue = b.date_due;
      } else if (field === "customer_name") {
        aValue = a.date_due;
        bValue = b.date_due;
      }

      if (direction === "asc") {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    setFilteredActiveJobs(sortedJobs);
    setSortField(field);
    setSortDirection(direction);
  }
  if (deletedTableView) {
    let sortedJobs = [...deletedJobsList];
    sortedJobs.sort((a, b) => {
      let aValue, bValue;

      if (field === "status") {
        aValue = a.expecting_artwork;
        bValue = b.expecting_artwork;
      } else if (field === "customerReference") {
        aValue = a.order_id;
        bValue = b.order_id;
      } else if (field === "jobId") {
        aValue = a.job_id;
        bValue = b.job_id;
      } else if (field === "dateDue") {
        aValue = a.date_due;
        bValue = b.date_due;
      } else if (field === "customer_name") {
        aValue = a.date_due;
        bValue = b.date_due;
      }

      if (direction === "asc") {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    setFilteredDeletedJobs(sortedJobs);
    setSortField(field);
    setSortDirection(direction);
  }

  if (completedTableView) {
    let sortedJobs = [...completedJobsList];
    sortedJobs.sort((a, b) => {
      let aValue, bValue;

      if (field === "status") {
        aValue = a.expecting_artwork;
        bValue = b.expecting_artwork;
      } else if (field === "customerReference") {
        aValue = a.order_id;
        bValue = b.order_id;
      } else if (field === "jobId") {
        aValue = a.job_id;
        bValue = b.job_id;
      } else if (field === "dateDue") {
        aValue = a.date_due;
        bValue = b.date_due;
      } else if (field === "customer_name") {
        aValue = a.date_due;
        bValue = b.date_due;
      }

      if (direction === "asc") {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    setFilteredCompletedJobs(sortedJobs);
    setSortField(field);
    setSortDirection(direction);
  }

  if (canceledTableView) {
    let sortedJobs = [...canceledJobsList];
    sortedJobs.sort((a, b) => {
      let aValue, bValue;

      if (field === "status") {
        aValue = a.expecting_artwork;
        bValue = b.expecting_artwork;
      } else if (field === "customerReference") {
        aValue = a.order_id;
        bValue = b.order_id;
      } else if (field === "jobId") {
        aValue = a.job_id;
        bValue = b.job_id;
      } else if (field === "dateDue") {
        aValue = a.date_due;
        bValue = b.date_due;
      } else if (field === "customer_name") {
        aValue = a.date_due;
        bValue = b.date_due;
      }

      if (direction === "asc") {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    setFilteredCanceledJobs(sortedJobs);
    setSortField(field);
    setSortDirection(direction);
  } else {
    let sortedJobs = [...jobs];
    sortedJobs.sort((a, b) => {
      let aValue, bValue;

      if (field === "status") {
        aValue = a.expecting_artwork;
        bValue = b.expecting_artwork;
      } else if (field === "customerReference") {
        aValue = a.order_id;
        bValue = b.order_id;
      } else if (field === "jobId") {
        aValue = a.job_id;
        bValue = b.job_id;
      } else if (field === "dateDue") {
        aValue = a.date_due;
        bValue = b.date_due;
      } else if (field === "customer_name") {
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
  }
}
