const analyzeModels = require("../models/analyzeModels");

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

  // Assign an analysis
  async assignAnalysis(req, res) {
    const { analyze_id, created_by } = req.body;

    if (!analyze_id || !created_by) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID and created_by are required" });
    }

    try {
      const result = await analyzeModels.updateAnalysisStatus(analyze_id, created_by, "assign");
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Save an analysis
  async saveAnalysis(req, res) {
    const { analyze_id, verification, root_cause, defect_type, action } = req.body;

    if (!analyze_id) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID is required" });
    }

    try {
      const result = await analyzeModels.saveAnalysis(analyze_id, verification, root_cause, defect_type, action);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Submit an analysis
  async submitAnalysis(req, res) {
    const { analyze_id, created_by } = req.body;

    if (!analyze_id || !created_by) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID and created_by are required" });
    }

    try {
      const result = await analyzeModels.updateAnalysisStatus(analyze_id, created_by, "submitted");
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Decide on an analysis
  async decisionAnalysis(req, res) {
    const { analyze_id, created_by, decision } = req.body;

    if (!analyze_id || !created_by || !decision) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID, created_by, and decision are required" });
    }

    let status;
    if (decision === "approved") {
      status = "close";
    } else if (decision === "reject") {
      status = "reject";
    } else {
      return res.status(400).json({ error: "Bad Request", details: "Invalid decision value" });
    }

    try {
      const result = await analyzeModels.updateAnalysisStatus(analyze_id, created_by, status);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = analyzeControllers;
