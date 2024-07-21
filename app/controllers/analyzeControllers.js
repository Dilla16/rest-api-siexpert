const analyzeModels = require("../models/analyzeModels");

const analyzeControllers = {
  async getAllAnalyses(req, res) {
    try {
      const analyses = await analyzeModels.getAllAnalyses();
      res.status(200).json(analyses);
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
    const { id } = req.params;
    try {
      const updatedAnalysis = await analyzeModels.updateAnalysisById(id, req.body);
      if (updatedAnalysis) {
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
};

module.exports = analyzeControllers;
