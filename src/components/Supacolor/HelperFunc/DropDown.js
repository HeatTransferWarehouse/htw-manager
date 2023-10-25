export default function dropDownFunction(
  e,
  setDeletedTableView,
  setCanceledTableView,
  setActiveTableView,
  setCompletedTableView,
  setAllJobsTableView
) {
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
}
