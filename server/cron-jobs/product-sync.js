const cron = require("node-cron");
const axios = require("axios");

// Schedule task to run every Sunday at midnight
cron.schedule("0 0 * * 0", async () => {
  console.log("Product sync started.");

  try {
    await axios.post(
      "https://admin.heattransferwarehouse.com/empty-descriptions/sync"
    );
    console.log("Heat Transfer Warehouse sync completed successfully.");

    await axios.post(
      "https://admin.heattransferwarehouse.com/sff/empty-descriptions/sync"
    );
    console.log("SFF sync completed successfully.");
    await axios.post(
      "https://admin.heattransferwarehouse.com/populate-sync-data"
    );
    console.log("Heat Transfer Warehouse sync data populated successfully.");

    await axios.post(
      "https://admin.heattransferwarehouse.com/sff/populate-sync-data"
    );
    console.log("SFF sync data populated successfully.");
    console.log("Weekly sync completed successfully.");
  } catch (error) {
    console.error("Error running weekly sync:", error);
  }
});
