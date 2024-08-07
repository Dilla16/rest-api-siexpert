const returModels = require("../models/returnModels");
const historyModels = require("../models/historyModels");
const productModels = require("../models/productModels");
const analyzeModels = require("../models/analyzeModels");
const userModels = require("./../models/userModels");

const ReturController = {
  async getAllReturns(req, res) {
    try {
      const { sesa } = req.userData;

      if (!sesa) {
        throw new Error("Invalid userData or sesa not found");
      }

      const departments = await userModels.getDepartmentBySesa(sesa);

      if (!Array.isArray(departments) || departments.length === 0) {
        throw new Error("Invalid userData or departments");
      }

      const returns = await returModels.getReturnsByDepartments(departments);

      res.status(200).json(returns);
    } catch (error) {
      console.error("Error in getAllReturns:", error.message || error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
  async createReturn(req, res) {
    const { returnData } = req.body;
    const { sesa } = req.userData;

    if (!returnData) {
      return res.status(400).json({ error: "Bad Request", details: "Return data is required" });
    }

    const { retur_no, customer_name, country, product_name, qty, serial_no, issue } = returnData;

    if (!retur_no || !customer_name || !country || !product_name || !qty || !serial_no || !issue) {
      return res.status(400).json({ error: "Bad Request", details: "All fields are required" });
    }

    if (retur_no.length > 100 || customer_name.length > 100 || country.length > 100 || serial_no.length > 100) {
      return res.status(400).json({ error: "Bad Request", details: "Field length exceeds allowed limit" });
    }

    try {
      await returModels.beginTransaction();

      const product = await productModels.getProductByName(product_name);
      if (!product) {
        await returModels.rollbackTransaction();
        return res.status(404).json({ error: "Not Found", details: "Product not found" });
      }
      const product_id = product.product_id;

      const existingReturn = await returModels.checkSerialNo(serial_no);
      if (existingReturn) {
        await returModels.rollbackTransaction();
        return res.status(400).json({ error: "Error", details: "Serial No. Already Exist" });
      }

      // Generate next analyze_id
      const lastAnalyzeId = await analyzeModels.getLastAnalyzeId();
      let nextId = 1;
      if (lastAnalyzeId) {
        const lastNumber = parseInt(lastAnalyzeId.replace("AN", ""), 10);
        nextId = lastNumber + 1;
      }
      const newAnalyseId = `AN${nextId.toString().padStart(6, "0")}`;

      // Create analysis with generated analyze_id
      const analysisData = {
        analyze_id: newAnalyseId,
        verification: null,
        root_cause: null,
        defect_type: null,
        action: null,
      };
      const newAnalysis = await analyzeModels.createAnalysis(analysisData);
      console.log("New analysis created:", newAnalysis);

      const newReturn = await returModels.createReturn({
        retur_no,
        customer_name,
        country,
        product_id,
        qty,
        serial_no,
        issue,
        analyse_id: newAnalyseId, // Ensure to pass the correct analyze_id here
      });
      console.log("New return created:", newReturn);

      await historyModels.createHistory({
        analyse_id: newAnalyseId,
        status: "created",
        created_by: sesa,
        created_at: new Date(),
      });

      await returModels.commitTransaction();

      const extendedAnalysis = await analyzeModels.getAnalysisById(newAnalyseId);

      const responseData = {
        returnData: {
          retur_id: newReturn.retur_id,
          retur_no: newReturn.retur_no,
          customer_name: newReturn.customer_name,
          country: newReturn.country,
          product_name: product.product_name,
          qty: newReturn.qty,
          serial_no: newReturn.serial_no,
          issue: newReturn.issue,
          analysis: {
            analyze_id: extendedAnalysis.analyze_id,
            root_cause: extendedAnalysis.root_cause,
            defect_type: extendedAnalysis.defect_type,
            action: extendedAnalysis.action,
            verification: extendedAnalysis.verification,
          },
        },
      };

      res.status(201).json(responseData);
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
    const { sesa } = req.userData;
    try {
      await db.query("BEGIN");

      // Check if the retur exists
      const result = await db.query("SELECT * FROM retur WHERE retur_id = $1", [id]);
      if (result.rows.length === 0) {
        await db.query("ROLLBACK");
        return res.status(404).json({ error: "Not Found", details: "Return record not found" });
      }

      const retur = result.rows[0];

      // Delete the retur record
      await db.query("DELETE FROM retur WHERE retur_id = $1", [id]);

      // Insert a history record with status 'deleted'
      await db.query(
        `INSERT INTO history (analyse_id, created_at, status, created_by) 
       VALUES ($1, $2, $3, $4)`,
        [retur.analyse_id, new Date(), "deleted", sesa]
      );

      await db.query("COMMIT");
      res.status(200).json({ message: "Return deleted successfully" });
    } catch (error) {
      await db.query("ROLLBACK");
      console.error("Error deleting return:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
};

module.exports = ReturController;
