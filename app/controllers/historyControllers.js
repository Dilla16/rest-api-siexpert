const historyModels = require("../models/historyModels");
const returnModels = require("../models/returnModels");

const historyController = {
  async getHistoryByAnalyseId(req, res) {
    const { id } = req.params;
    const statuses = ["created", "signed", "submitted", "rejected", "approved", "closed"];

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
    const { analyze_id } = req.params;
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
  async checkStatus(req, res) {
    const { sesa } = req.userData;

    try {
      // Get the return data based on ID
      const returnData = await returnModels.getReturnById(req.params.id);

      // Check if return data or analyze_id is missing
      if (!returnData || !returnData.analysis || !returnData.analysis.analyze_id) {
        return res.status(404).json({ error: "Return data not found or analyze_id is missing" });
      }

      const { analyze_id } = returnData.analysis;

      // Get history data based on analyze_id
      const historyData = await historyModels.getHistoryByAnalyseId(analyze_id);

      let canEdit = null;
      let haveSubmitted = false;

      if (historyData && historyData.length > 0) {
        haveSubmitted = historyData.some((record) => record.status === "submitted");

        const signedRecord = historyData.find((record) => record.status === "signed");

        // Set canEdit based on whether a signed record exists and if the user is authorized
        if (signedRecord) {
          canEdit = signedRecord.created_by === sesa;
        }
      } else {
        // If no history records are found, canEdit remains null
        canEdit = null;
      }

      // Return both statuses
      res.status(200).json({ canEdit, haveSubmitted });
    } catch (error) {
      console.error("Error in checkStatus:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
  async submitAnalysis(req, res) {
    const { analyze_id } = req.params;
    const { sesa } = req.userData;

    if (!analyze_id) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID is required" });
    }

    try {
      const result = await historyModels.createSubmitAnalysis(analyze_id, sesa, "submitted");
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async decisionAnalysis(req, res) {
    const { analyze_id, decision } = req.body;
    const { sesa } = req.userData;

    if (!analyze_id || !decision) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID and decision are required" });
    }

    try {
      // Determine the status and create history entries
      let historyEntries = [];

      if (decision === "approved") {
        historyEntries = [
          { analyze_id, status: "approved", created_by: sesa },
          { analyze_id, status: "closed", created_by: sesa },
        ];
      } else if (decision === "rejected") {
        historyEntries = [{ analyze_id, status: "rejected", created_by: sesa }];
      } else {
        return res.status(400).json({ error: "Bad Request", details: "Invalid decision value" });
      }

      // Create history entries in the database
      for (const entry of historyEntries) {
        await historyModels.createHistory(entry);
      }

      res.status(200).json({ message: `Decision ${decision} processed and history created` });
    } catch (error) {
      console.error("Error processing decision and creating history:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
};

module.exports = historyController;
