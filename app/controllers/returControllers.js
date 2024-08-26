const returModels = require("../models/returnModels");
const historyModels = require("../models/historyModels");
const productModels = require("../models/productModels");
const analyzeModels = require("../models/analyzeModels");
const userModels = require("./../models/userModels");

const ReturController = {
  // async getAllReturns(req, res) {
  //   try {
  //     const { sesa } = req.userData;

  //     if (!sesa) {
  //       throw new Error("Invalid userData or sesa not found");
  //     }

  //     const departments = await userModels.getDepartmentBySesa(sesa);

  //     if (!Array.isArray(departments) || departments.length === 0) {
  //       throw new Error("Invalid userData or departments");
  //     }

  //     const returns = await returModels.getReturnsByDepartments(departments);

  //     res.status(200).json(returns);
  //   } catch (error) {
  //     console.error("Error in getAllReturns:", error.message || error);
  //     res.status(500).json({ error: "Internal Server Error", details: error.message });
  //   }
  // },
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

      // Fetch status for each return based on the analyze_id
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

      res.status(200).json(returnsWithStatus);
    } catch (error) {
      console.error("Error in getAllReturns:", error.message || error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
  // async createReturn(req, res) {
  //   const { returnData } = req.body;
  //   const { sesa } = req.userData;

  //   if (!returnData) {
  //     return res.status(400).json({ error: "Bad Request", details: "Return data is required" });
  //   }

  //   const { retur_no, customer_name, country, product_name, qty, serial_no, issue } = returnData;

  //   if (!retur_no || !customer_name || !country || !product_name || !qty || !serial_no || !issue) {
  //     return res.status(400).json({ error: "Bad Request", details: "All fields are required" });
  //   }

  //   if (retur_no.length > 100 || customer_name.length > 100 || country.length > 100 || serial_no.length > 100) {
  //     return res.status(400).json({ error: "Bad Request", details: "Field length exceeds allowed limit" });
  //   }

  //   try {
  //     await returModels.beginTransaction();

  //     const product = await productModels.getProductByName(product_name);
  //     if (!product) {
  //       await returModels.rollbackTransaction();
  //       return res.status(404).json({ error: "Not Found", details: "Product not found" });
  //     }
  //     const product_id = product.product_id;

  //     const existingReturn = await returModels.checkSerialNo(serial_no);
  //     if (existingReturn) {
  //       await returModels.rollbackTransaction();
  //       return res.status(400).json({ error: "Error", details: "Serial No. Already Exist" });
  //     }

  //     // Generate next analyze_id
  //     const lastAnalyzeId = await analyzeModels.getLastAnalyzeId();
  //     let nextId = 1;
  //     if (lastAnalyzeId) {
  //       const lastNumber = parseInt(lastAnalyzeId.replace("AN", ""), 10);
  //       nextId = lastNumber + 1;
  //     }
  //     const newAnalyseId = `AN${nextId.toString().padStart(6, "0")}`;

  //     // Create analysis with generated analyze_id
  //     const analysisData = {
  //       analyze_id: newAnalyseId,
  //       verification: null,
  //       root_cause: null,
  //       defect_type: null,
  //       action: null,
  //     };
  //     const newAnalysis = await analyzeModels.createAnalysis(analysisData);
  //     console.log("New analysis created:", newAnalysis);

  //     const newReturn = await returModels.createReturn({
  //       retur_no,
  //       customer_name,
  //       country,
  //       product_id,
  //       qty,
  //       serial_no,
  //       issue,
  //       analyse_id: newAnalyseId, // Ensure to pass the correct analyze_id here
  //     });
  //     console.log("New return created:", newReturn);

  //     await historyModels.createHistory({
  //       analyse_id: newAnalyseId,
  //       status: "created",
  //       created_by: sesa,
  //       created_at: new Date(),
  //     });

  //     await returModels.commitTransaction();

  //     const extendedAnalysis = await analyzeModels.getAnalysisById(newAnalyseId);

  //     const responseData = {
  //       returnData: {
  //         retur_id: newReturn.retur_id,
  //         retur_no: newReturn.retur_no,
  //         customer_name: newReturn.customer_name,
  //         country: newReturn.country,
  //         product_name: product.product_name,
  //         qty: newReturn.qty,
  //         serial_no: newReturn.serial_no,
  //         issue: newReturn.issue,
  //         analysis: {
  //           analyze_id: extendedAnalysis.analyze_id,
  //           root_cause: extendedAnalysis.root_cause,
  //           defect_type: extendedAnalysis.defect_type,
  //           action: extendedAnalysis.action,
  //           verification: extendedAnalysis.verification,
  //         },
  //       },
  //     };

  //     res.status(201).json(responseData);
  //   } catch (error) {
  //     console.error("Error in createReturn:", error);
  //     // Rollback transaction in case of error
  //     await returModels.rollbackTransaction();
  //     res.status(500).json({ error: "Internal Server Error", details: error.message });
  //   }
  // },

  async createReturn(req, res) {
    const { returnData } = req.body;
    const { sesa } = req.userData;

    if (!returnData) {
      return res.status(400).json({ error: "Bad Request", details: "Return data is required" });
    }

    const { retur_no, customer_name, country, product_name, serial_issues } = returnData;

    if (!retur_no || !customer_name || !country || !product_name || !serial_issues || serial_issues.length === 0) {
      return res.status(400).json({ error: "Bad Request", details: "All fields are required and serial_issues must not be empty" });
    }

    if (retur_no.length > 100 || customer_name.length > 100 || country.length > 100) {
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

      const returnResponses = [];
      const analysisIds = [];

      for (const serialIssue of serial_issues) {
        const { serial_no, issue } = serialIssue;

        const existingReturn = await returModels.checkSerialNo(serial_no);
        if (existingReturn) {
          await returModels.rollbackTransaction();
          return res.status(400).json({ error: "Error", details: `Serial No. ${serial_no} Already Exists` });
        }

        // Generate unique analysis ID for each serial issue
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

        analysisIds.push(newAnalyseId);

        // Create return record
        const newReturn = await returModels.createReturn({
          retur_no,
          customer_name,
          country,
          product_id,
          qty: 1, // Each serial issue is considered as one return
          serial_no,
          issue,
          analyse_id: newAnalyseId,
        });
        console.log("New return created:", newReturn);

        await historyModels.createHistory({
          analyse_id: newAnalyseId,
          status: "created",
          created_by: sesa,
          created_at: new Date(),
        });

        returnResponses.push({
          ...newReturn,
          analysis_id: newAnalyseId, // Include analysis_id in the response
        });
      }

      await returModels.commitTransaction();

      // Fetch all analyses after committing
      const extendedAnalyses = await Promise.all(
        analysisIds.map(async (id) => {
          const analysis = await analyzeModels.getAnalysisById(id);
          if (!analysis) {
            console.warn(`Analysis not found for analyze_id: ${id}`);
            return { analyze_id: id, root_cause: null, defect_type: null, action: null, verification: null };
          }
          return analysis;
        })
      );

      const responseData = {
        returnData: returnResponses.map((returnRecord) => {
          const analysis = extendedAnalyses.find((a) => a.analyze_id === returnRecord.analysis_id) || {
            analyze_id: returnRecord.analysis_id,
            root_cause: null,
            defect_type: null,
            action: null,
            verification: null,
          };
          return {
            retur_id: returnRecord.retur_id,
            retur_no: returnRecord.retur_no,
            customer_name: returnRecord.customer_name,
            country: returnRecord.country,
            product_name,
            qty: returnRecord.qty,
            serial_no: returnRecord.serial_no,
            issue: returnRecord.issue,
            analysis: {
              analyze_id: analysis.analyze_id,
              root_cause: analysis.root_cause,
              defect_type: analysis.defect_type,
              action: analysis.action,
              verification: analysis.verification,
            },
          };
        }),
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
      const retur = await returModels.deleteReturnTransaction(id, sesa);

      if (!retur) {
        return res.status(404).json({ error: "Not Found", details: "Return record not found" });
      }

      res.status(200).json({ message: "Return deleted successfully" });
    } catch (error) {
      console.error("Error deleting return:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
};

module.exports = ReturController;
