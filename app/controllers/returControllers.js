const returModels = require("../models/returnModels");
const historyModels = require("../models/historyModels");
const productModels = require("../models/productModels");
const analyzeModels = require("../models/analyzeModels");
const userModels = require("./../models/userModels");
const notificationModels = require("../models/notificationModels");

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

  //   const { retur_no, customer_name, country, product_name, serial_no } = returnData;

  //   if (!retur_no || !customer_name || !country || !product_name || !serial_no || serial_no.length === 0) {
  //     return res.status(400).json({ error: "Bad Request", details: "All fields are required! must not be empty!" });
  //   }

  //   if (retur_no.length > 100 || customer_name.length > 100 || country.length > 100) {
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

  //     const returnResponses = [];
  //     const analysisIds = [];

  //     for (const serialIssue of serial_no) {
  //       const { serial_no, issue } = serialIssue;

  //       const existingReturn = await returModels.checkSerialNo(serial_no);
  //       if (existingReturn) {
  //         await returModels.rollbackTransaction();
  //         return res.status(400).json({ error: "Error", details: `Serial No. ${serial_no} Already Exists` });
  //       }

  //       // Generate unique analysis ID for each serial issue
  //       const lastAnalyzeId = await analyzeModels.getLastAnalyzeId();
  //       let nextId = 1;
  //       if (lastAnalyzeId) {
  //         const lastNumber = parseInt(lastAnalyzeId.replace("AN", ""), 10);
  //         nextId = lastNumber + 1;
  //       }
  //       const newAnalyseId = `AN${nextId.toString().padStart(6, "0")}`;

  //       // Create analysis with generated analyze_id
  //       const analysisData = {
  //         analyze_id: newAnalyseId,
  //         verification: null,
  //         root_cause: null,
  //         defect_type: null,
  //         action: null,
  //       };
  //       const newAnalysis = await analyzeModels.createAnalysis(analysisData);
  //       console.log("New analysis created:", newAnalysis);

  //       analysisIds.push(newAnalyseId);

  //       // Create return record
  //       const newReturn = await returModels.createReturn({
  //         retur_no,
  //         customer_name,
  //         country,
  //         product_id,
  //         qty: 1, // Each serial issue is considered as one return
  //         serial_no,
  //         issue,
  //         analyse_id: newAnalyseId,
  //       });
  //       console.log("New return created:", newReturn);

  //       await historyModels.createHistory({
  //         analyse_id: newAnalyseId,
  //         status: "created",
  //         created_by: sesa,
  //         created_at: new Date(),
  //       });

  //       returnResponses.push({
  //         ...newReturn,
  //         analysis_id: newAnalyseId,
  //       });
  //     }

  //     const users = await userModels.getUsersByRole("user");
  //     for (const user of users) {
  //       for (const analysisId of analysisIds) {
  //         await notificationModels.addNotification(analysisId, user.sesa);
  //       }
  //     }

  //     await returModels.commitTransaction();

  //     // Fetch all analyses after committing
  //     const extendedAnalyses = await Promise.all(
  //       analysisIds.map(async (id) => {
  //         const analysis = await analyzeModels.getAnalysisById(id);
  //         if (!analysis) {
  //           console.warn(`Analysis not found for analyze_id: ${id}`);
  //           return { analyze_id: id, root_cause: null, defect_type: null, action: null, verification: null };
  //         }
  //         return analysis;
  //       })
  //     );

  //     const responseData = {
  //       returnData: returnResponses.map((returnRecord) => {
  //         const analysis = extendedAnalyses.find((a) => a.analyze_id === returnRecord.analysis_id) || {
  //           analyze_id: returnRecord.analysis_id,
  //           root_cause: null,
  //           defect_type: null,
  //           action: null,
  //           verification: null,
  //         };
  //         return {
  //           retur_id: returnRecord.retur_id,
  //           retur_no: returnRecord.retur_no,
  //           customer_name: returnRecord.customer_name,
  //           country: returnRecord.country,
  //           product_name,
  //           qty: returnRecord.qty,
  //           serial_no: returnRecord.serial_no,
  //           issue: returnRecord.issue,
  //           analysis: {
  //             analyze_id: analysis.analyze_id,
  //             root_cause: analysis.root_cause,
  //             defect_type: analysis.defect_type,
  //             action: analysis.action,
  //             verification: analysis.verification,
  //           },
  //         };
  //       }),
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

    const { retur_no, customer_name, country, product_name, serial_issues, sector } = returnData;

    if (!retur_no || !customer_name || !country || !product_name || !serial_issues || serial_issues.length === 0) {
      return res.status(400).json({ error: "Bad Request", details: "All fields are required and must not be empty!" });
    }

    try {
      await returModels.beginTransaction();

      const product = await productModels.getProductByName(product_name);
      if (!product) {
        await returModels.rollbackTransaction();
        return res.status(404).json({ error: "Not Found", details: "Product not found" });
      }
      const product_id = product.product_id;

      const usersSesaArray = await userModels.getUsersByDepartment(sector);

      const returnResponses = [];
      const analysisIds = [];
      const historyIds = []; // Array to store generated history IDs
      const returIds = []; // Array to store generated return IDs

      for (const serialIssue of serial_issues) {
        const { serial_no, issue } = serialIssue;

        if (!serial_no || !issue) {
          await returModels.rollbackTransaction();
          return res.status(400).json({ error: "Bad Request", details: "Serial number and issue must not be empty!" });
        }

        const existingReturn = await returModels.checkSerialNo(serial_no);
        if (existingReturn) {
          await returModels.rollbackTransaction();
          return res.status(400).json({ error: "Error", details: `Serial No. ${serial_no} already exists` });
        }

        const lastAnalyzeId = await analyzeModels.getLastAnalyzeId();
        let nextId = 1;
        if (lastAnalyzeId) {
          const lastNumber = parseInt(lastAnalyzeId.replace("AN", ""), 10);
          nextId = lastNumber + 1;
        }
        const newAnalyseId = `AN${nextId.toString().padStart(6, "0")}`;

        const analysisData = {
          analyze_id: newAnalyseId,
          verification: null,
          root_cause: null,
          defect_type: null,
          action: null,
        };
        await analyzeModels.createAnalysis(analysisData);

        analysisIds.push(newAnalyseId);

        // Create return record
        const newReturn = await returModels.createReturn({
          retur_no,
          customer_name,
          country,
          product_id,
          qty: 1,
          serial_no,
          issue,
          analyse_id: newAnalyseId,
        });

        returIds.push(newReturn.retur_id); // Collect return IDs

        const historyId = await historyModels.createHistory({
          analyse_id: newAnalyseId,
          status: "created",
          created_by: sesa,
          created_at: new Date(),
        });

        historyIds.push(historyId);

        returnResponses.push({
          ...newReturn,
          analysis_id: newAnalyseId,
        });
      }

      // Create notifications for all users in the department
      await Promise.all(usersSesaArray.flatMap((userSesa) => historyIds.flatMap((historyId) => returIds.map((returId) => notificationModels.addNotification(historyId, userSesa, returId)))));

      await returModels.commitTransaction();

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
      await returModels.rollbackTransaction();
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
  async getReturnById(req, res) {
    try {
      const returnData = await returModels.getReturnById(req.params.id);

      if (!returnData) {
        return res.status(404).json({ message: "Return not found" });
      }

      // Fetch the status based on analyze_id
      const status = await historyModels.getStatusByAnalyzeId(returnData.analysis.analyze_id);

      // Combine returnData with status
      const response = {
        returnData,
        status: status || "Unknown", // default to "Unknown" if no status found
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error in getReturnById:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
  async updateReturnById(req, res) {
    const { id } = req.params;
    const { returnData } = req.body; // Assume returnData is sent in the request body

    if (!returnData) {
      return res.status(400).json({ error: "Bad Request", details: "Return data is required" });
    }

    const { retur_no, customer_name, country, product_name, serial_no, issue } = returnData;

    if (!retur_no || !customer_name || !country || !product_name || !serial_no || !issue) {
      return res.status(400).json({ error: "Bad Request", details: "All fields are required" });
    }

    try {
      // Begin transaction
      await returModels.beginTransaction();

      // Fetch product_id based on product_name
      const product = await productModels.getProductByName(product_name);
      if (!product) {
        await returModels.rollbackTransaction();
        return res.status(404).json({ error: "Not Found", details: "Product not found" });
      }
      const product_id = product.product_id;

      // Update return record
      const updatedReturn = await returModels.updateReturnById(id, {
        retur_no,
        customer_name,
        country,
        product_id,
        serial_no,
        issue,
      });

      if (!updatedReturn) {
        await returModels.rollbackTransaction();
        return res.status(404).json({ error: "Not Found", details: "Return record not found" });
      }

      // Commit transaction
      await returModels.commitTransaction();

      // Return updated return data
      res.status(200).json(updatedReturn);
    } catch (error) {
      console.error("Error in updateReturnById:", error);
      // Rollback transaction in case of error
      await returModels.rollbackTransaction();
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
