const analyzeModels = require("../models/analyzeModels");
const historyModels = require("../models/historyModels");
const returModels = require("../models/returnModels");

const analyzeControllers = {
  async getAllAnalysis(req, res) {
    try {
      const analysis = await analyzeModels.getAllAnalysis();
      res.status(200).json(analysis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAnalysisById(req, res) {
    const { id } = req.params;
    try {
      const analysis = await analyzeModels.getAnalysisById(id);
      if (analysis) {
        res.status(200).json(analysis);
      } else {
        res.status(404).json({ error: "Analysis not found." });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateAnalysisById(req, res) {
    try {
      const returnData = await returModels.getReturnById(req.params.id);

      // Debugging logs
      console.log("Return Data:", returnData);

      if (!returnData || !returnData.analysis) {
        return res.status(404).json({ error: "Return data or analysis not found." });
      }

      const analyze_id = returnData.analysis.analyze_id;
      if (!analyze_id) {
        return res.status(404).json({ error: "Analyze ID not found." });
      }

      const analysisData = req.body;

      const updatedAnalysis = await analyzeModels.updateAnalysisById(analyze_id, analysisData);

      if (updatedAnalysis) {
        const { sesa } = req.userData;
        await historyModels.createHistory(analyze_id, sesa, "process");
        res.status(200).json(updatedAnalysis);
      } else {
        res.status(404).json({ error: "Analysis not found." });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async deleteAnalysisById(req, res) {
    const { id } = req.params;
    try {
      const deletedAnalysis = await analyzeModels.deleteAnalysisById(id);
      if (deletedAnalysis) {
        res.status(200).json({ message: "Analysis deleted successfully." });
      } else {
        res.status(404).json({ error: "Analysis not found." });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Assign an analysis
  async assignAnalysis(req, res) {
    const { analyze_id } = req.body;
    const { sesa } = req.userData;

    if (!analyze_id) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID is required" });
    }

    try {
      const result = await analyzeModels.createHistoryAssign(analyze_id, sesa, "signed");
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Save an analysis (equivalent to 'completed')
  async saveAnalysis(req, res) {
    const { analyze_id, verification, root_cause, defect_type, action } = req.body;
    const { sesa } = req.userData;

    if (!analyze_id) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID is required" });
    }

    try {
      const result = await analyzeModels.saveAnalysis(analyze_id, verification, root_cause, defect_type, action);
      await historyModels.createHistory(analyze_id, sesa, "completed");
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Submit an analysis
  async submitAnalysis(req, res) {
    const { analyze_id } = req.body;
    const { sesa } = req.userData;

    if (!analyze_id) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID is required" });
    }

    try {
      const result = await analyzeModels.updateAnalysisStatus(analyze_id, sesa, "submitted");
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Decide on an analysis
  async decisionAnalysis(req, res) {
    const { analyze_id, decision } = req.body;
    const { sesa } = req.userData;

    if (!analyze_id || !decision) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID and decision are required" });
    }

    let status;
    if (decision === "approved") {
      status = "closed";
    } else if (decision === "rejected") {
      status = "rejected";
    } else {
      return res.status(400).json({ error: "Bad Request", details: "Invalid decision value" });
    }

    try {
      const result = await analyzeModels.updateAnalysisStatus(analyze_id, sesa, status);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
module.exports = analyzeControllers;
