const returModels = require("../models/returModels");

const ReturController = {
  async getAllReturns(req, res) {
    try {
      const returns = await returModels.getAllReturns();
      res.status(200).json(returns);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  async createReturn(req, res) {
    const { returnData, analysisData } = req.body;

    try {
      // Begin transaction
      await returModels.beginTransaction();

      // Create analysis
      const newAnalysis = await returModels.createAnalysis(analysisData);

      // Create return with new analysis ID
      const newReturn = await returModels.createReturn({
        ...returnData,
        analyse_id: newAnalysis.analyse_id,
      });

      // Commit transaction
      await returModels.commitTransaction();

      res.status(201).json({ return: newReturn, analysis: newAnalysis });
    } catch (error) {
      // Rollback transaction in case of error
      await returModels.rollbackTransaction();
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  async getReturnById(req, res) {
    try {
      const returnData = await returModels.getReturnById(req.params.id);
      if (returnData) {
        res.status(200).json(returnData);
      } else {
        res.status(404).json({ message: "Return not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  async updateReturnById(req, res) {
    try {
      const updatedReturn = await returModels.updateReturnById(req.params.id, req.body);
      if (updatedReturn) {
        res.status(200).json(updatedReturn);
      } else {
        res.status(404).json({ message: "Return not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  async deleteReturnById(req, res) {
    try {
      const deletedReturn = await returModels.deleteReturnById(req.params.id);
      if (deletedReturn) {
        res.status(200).json(deletedReturn);
      } else {
        res.status(404).json({ message: "Return not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
};

module.exports = ReturController;
