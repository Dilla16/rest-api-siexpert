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

  // analysisController
  async updateAnalysisById(req, res) {
    try {
      const returnData = await returModels.getReturnById(req.params.id);

      console.log("Return Data:", returnData);

      // Check if return data or analysis is missing
      if (!returnData || !returnData.analysis) {
        return res.status(404).json({ error: "Return data or analysis not found." });
      }

      // Extract analyze_id
      const analyze_id = returnData.analysis.analyze_id;
      if (!analyze_id) {
        return res.status(404).json({ error: "Analyze ID not found." });
      }

      // Extract analysisData from request body
      const analysisData = req.body.analysisData;
      if (!analysisData) {
        return res.status(400).json({ error: "Bad Request", details: "Analysis data is required" });
      }

      // Destructure individual fields from analysisData
      const { verification, root_cause, defect_type, action, location, category, images, caption } = analysisData;

      // Update analysis
      const updatedAnalysis = await analyzeModels.updateAnalysisById(analyze_id, {
        verification,
        root_cause,
        defect_type,
        action,
        location,
        category,
        images,
        caption,
      });

      if (updatedAnalysis) {
        // Create history record
        const { sesa } = req.userData;
        await historyModels.createHistory(analyze_id, sesa, "process");
        res.status(200).json(updatedAnalysis);
      } else {
        res.status(404).json({ error: "Analysis not found." });
      }
    } catch (error) {
      console.error("Detailed Error in updateAnalysisById controller:", error);
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
};
module.exports = analyzeControllers;
