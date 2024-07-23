const returModels = require("../models/returnModels");

const ReturController = {
  async getAllReturns(req, res) {
    try {
      const returns = await returModels.getAllReturns();
      res.status(200).json(returns);
    } catch (error) {
      console.error("Error in getAllReturns:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  async createReturn(req, res) {
    const { returnData } = req.body;
    const createdBy = req.user ? req.user.username : "unknown"; // Ensure `req.user` exists and has `username`

    console.log("Received data:", { returnData });

    // Validate the returnData
    if (!returnData) {
      return res.status(400).json({ error: "Bad Request", details: "Return data is required" });
    }

    // Destructure returnData and apply validation
    const { retur_no, customer_name, country, product_id, qty, serial_no, issue } = returnData;

    // Check for required fields
    if (!retur_no || !customer_name || !country || !product_id || !qty || !serial_no || !issue) {
      return res.status(400).json({ error: "Bad Request", details: "All fields are required" });
    }

    // Ensure field lengths are within limits
    if (retur_no.length > 100 || customer_name.length > 100 || country.length > 100 || serial_no.length > 100) {
      return res.status(400).json({ error: "Bad Request", details: "Field length exceeds allowed limit" });
    }

    try {
      // Begin transaction
      await returModels.beginTransaction();

      // Check for duplicate serial_no
      const existingReturn = await returModels.checkSerialNo(serial_no);
      if (existingReturn) {
        await returModels.rollbackTransaction();
        return res.status(400).json({ error: "Error", details: "Serial No. Already Exist" });
      }

      const analysisData = {
        verification: null,
        root_cause: null,
        defect_type: null,
        action: null,
        status: "created",
      };

      // Create analysis
      const newAnalysis = await returModels.createAnalysis(analysisData);
      console.log("New analysis created:", newAnalysis);

      // Create return with new analysis ID
      const newReturn = await returModels.createReturn({
        retur_no,
        customer_name,
        country,
        product_id,
        qty,
        serial_no,
        issue,
        analyse_id: newAnalysis.analyze_id, // Corrected field name
      });
      console.log("New return created:", newReturn);

      // Commit transaction
      await returModels.commitTransaction();

      res.status(201).json({ return: newReturn, analysis: newAnalysis });
    } catch (error) {
      console.error("Error in createReturn:", error);
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
      console.error("Error in getReturnById:", error);
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
      console.error("Error in updateReturnById:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  async deleteReturnById(req, res) {
    const { id } = req.params;

    try {
      // Begin transaction
      await returModels.beginTransaction();

      // Get the return to find associated analysis ID
      const returnData = await returModels.getReturnById(id);
      if (!returnData) {
        await returModels.rollbackTransaction();
        return res.status(404).json({ message: "Return not found" });
      }

      const { analyse_id } = returnData;

      // Delete the associated analysis if exists
      if (analyse_id) {
        await returModels.deleteAnalysisById(analyse_id);
      }

      // Delete the return
      const deletedReturn = await returModels.deleteReturnById(id);

      // Commit transaction
      await returModels.commitTransaction();

      if (deletedReturn) {
        res.status(200).json(deletedReturn);
      } else {
        res.status(404).json({ message: "Return not found" });
      }
    } catch (error) {
      console.error("Error in deleteReturnById:", error);
      // Rollback transaction in case of error
      await returModels.rollbackTransaction();
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
};

module.exports = ReturController;
