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

      // Create an object to store the most relevant record for each status
      const mostRecentHistory = {};
      statuses.forEach((status) => {
        mostRecentHistory[status] = {};
      });

      // Separate records for 'created' and other statuses
      const createdRecords = historyData.filter((record) => record.status === "created");
      const otherRecords = historyData.filter((record) => record.status !== "created");

      // Find the oldest record for the 'created' status
      if (createdRecords.length > 0) {
        const oldestRecord = createdRecords.reduce((oldest, record) => {
          return new Date(record.created_at) < new Date(oldest.created_at) ? record : oldest;
        });
        mostRecentHistory["created"] = oldestRecord;
      }

      // Find the most recent record for all other statuses
      for (const status of statuses.filter((status) => status !== "created")) {
        const recordsForStatus = otherRecords.filter((record) => record.status === status);

        if (recordsForStatus.length > 0) {
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
  async checkSignedStatus(req, res) {
    const { analyze_id } = req.params; // Correctly retrieve URL parameter
    const { sesa } = req.userData;

    if (!analyze_id) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID is required" });
    }

    try {
      const historyData = await historyModels.getHistoryByAnalyseId(analyze_id);

      if (!historyData || historyData.length === 0) {
        return res.status(200).json({ canEdit: false });
      }

      const signedRecord = historyData.find((record) => record.status === "signed");

      if (!signedRecord) {
        return res.status(200).json({ canEdit: false });
      }

      const isAuthorized = signedRecord.created_by === sesa;

      res.status(200).json({ canEdit: isAuthorized });
    } catch (error) {
      console.error("Error in checkSignedStatus:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
};

module.exports = historyController;
