const historyModels = require("../models/historyModels");
const returnModels = require("../models/returnModels");

const historyController = {
  async getHistoryByAnalyseId(req, res) {
    const { id } = req.params;
    const statuses = ["created", "signed", "completed", "submitted", "approved", "closed"];

    try {
      // Fetch the return data based on the provided id
      const returnData = await returnModels.getReturnById(id);

      if (!returnData) {
        return res.status(404).json({ message: "Return not found" });
      }

      // Extract the analyse_id from the returned data
      const analyse_id = returnData.analysis.analyze_id;

      // Fetch all history data based on the analyse_id
      const historyData = await historyModels.getHistoryByAnalyseId(analyse_id);

      if (!historyData || historyData.length === 0) {
        // Initialize the response object with empty objects for each status
        const mostRecentHistory = {};
        statuses.forEach((status) => {
          mostRecentHistory[status] = {};
        });
        return res.status(200).json(mostRecentHistory);
      }

      // Create an object to store the most recent record for each status
      const mostRecentHistory = {};
      statuses.forEach((status) => {
        mostRecentHistory[status] = {};
      });

      for (const status of statuses) {
        const recordsForStatus = historyData.filter((record) => record.status === status);

        if (recordsForStatus.length > 0) {
          // Find the most recent record for this status
          const latestRecord = recordsForStatus.reduce((latest, record) => {
            return new Date(record.created_at) > new Date(latest.created_at) ? record : latest;
          });

          mostRecentHistory[status] = latestRecord;
        }
      }

      res.status(200).json(mostRecentHistory);
    } catch (error) {
      console.error("Error in getHistoryByAnalyseId:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  async assignHistory(req, res) {
    const { analyze_id } = req.body;
    const { sesa } = req.userData;

    if (!analyze_id) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID is required" });
    }

    try {
      const result = await historyModels.createHistoryAssign(analyze_id, sesa, "signed");
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = historyController;
