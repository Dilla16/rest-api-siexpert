const historyModels = require("../models/historyModels");

const historyController = {
  async getHistoryByAnalyzeId(req, res) {
    const { analyse_id } = req.params;

    if (!analyse_id) {
      return res.status(400).json({ error: "Bad Request", details: "analyse_id is required" });
    }

    try {
      const history = await historyModels.getHistoryByAnalyzeId(analyse_id);
      if (!history) {
        return res.status(404).json({ error: "Not Found", details: "No history found for the given analyse_id" });
      }
      res.status(200).json(history);
    } catch (error) {
      console.error("Error in getHistoryByAnalyzeId:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  async getLatestHistoryEntries(req, res) {
    try {
      const latestHistoryEntries = await historyModels.getLatestHistoryEntries();
      res.status(200).json(latestHistoryEntries);
    } catch (error) {
      console.error("Error in getLatestHistoryEntries:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
};

module.exports = historyController;
