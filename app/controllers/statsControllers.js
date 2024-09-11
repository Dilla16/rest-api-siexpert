const StatsModel = require("../models/statsModels");
const userModels = require("../models/userModels");

const StatsController = {
  async getReturnStats(req, res) {
    try {
      const { sesa } = req.userData;

      if (!sesa) {
        return res.status(400).json({ error: "Invalid userData or sesa not found" });
      }

      const departments = await userModels.getDepartmentBySesa(sesa);

      if (!Array.isArray(departments) || departments.length === 0) {
        return res.status(400).json({ error: "Invalid userData or departments" });
      }

      const statusCounts = await StatsModel.getReturnStats(departments);

      res.status(200).json(statusCounts);
    } catch (error) {
      console.error("Error in getReturnStats:", error.message || error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
};

module.exports = StatsController;
