export default function setJobLists({
  jobs,
  setCanceledJobsList,
  setCompletedJobsList,
  setDeletedJobsList,
  setActiveJobsList,
}) {
  let canceledJobs = [];
  let completedJobs = [];
  let deletedJobs = [];
  let activeJobs = [];

  jobs.forEach((job) => {
    if (job.canceled && !job.perm_delete) {
      canceledJobs.push(job);
    } else if (job.complete && !job.perm_delete) {
      completedJobs.push(job);
    } else if (job.fake_delete && !job.perm_delete) {
      deletedJobs.push(job);
    } else if (job.active && !job.perm_delete) {
      activeJobs.push(job);
    }
  });

  setCanceledJobsList(canceledJobs);
  setCompletedJobsList(completedJobs);
  setDeletedJobsList(deletedJobs);
  setActiveJobsList(activeJobs);
}
