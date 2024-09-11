const returModels = require("../models/returnModels");
const historyModels = require("../models/historyModels");
const userModels = require("../models/userModels");

const StatsModel = {
  async getReturnStats(departments) {
    if (!departments || departments.length === 0) {
      throw new Error("No departments provided");
    }

    // Get all returns data
    const returns = await returModels.getReturnsByDepartments(departments);

    // Map returns to include status information
    const returnsWithStatus = await Promise.all(
      returns.map(async (item) => {
        const analyzeId = item.returnData.analysis.analyze_id;
        const status = await historyModels.getStatusByAnalyzeId(analyzeId);
        return {
          ...item,
          status: status || "Unknown", // default to "Unknown" if no status found
        };
      })
    );

    // Calculate counts based on status
    const statusCounts = {
      signed: 0,
      submitted: 0,
      closed: 0,
      total_return: returnsWithStatus.length,
    };

    returnsWithStatus.forEach((returnItem) => {
      const status = returnItem.status; // Ensure this field exists
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    return statusCounts;
  },
};

module.exports = StatsModel;
