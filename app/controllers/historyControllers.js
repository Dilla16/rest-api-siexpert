const historyModels = require("../models/historyModels");
const returnModels = require("../models/returnModels");
const analysisModels = require("../models/analyzeModels");
const UserModel = require("../models/userModels");
const notificationModels = require("../models/notificationModels");

const historyController = {
  async getHistory(req, res) {
    try {
      const monthlyCounts = await historyModels.getHistory();
      const response = monthlyCounts.reduce((acc, row) => {
        const monthName = new Date(row.month + "/01/" + row.year).toLocaleString("default", { month: "short", year: "numeric" });
        if (!acc[monthName]) {
          acc[monthName] = { created: 0, closed: 0, submitted: 0 };
        }
        acc[monthName].created += row.created;
        acc[monthName].closed += row.closed;
        acc[monthName].submitted += row.submitted;
        return acc;
      }, {});

      res.status(200).json(response);
    } catch (error) {
      console.error("Error in getHistory:", error.message || error);
      res.status(500).json({ error: "Failed to retrieve history data" });
    }
  },

  // async getHistoryByAnalyseId(req, res) {
  //   const { id } = req.params;
  //   const statuses = ["created", "signed", "submitted", "rejected", "approved", "closed"];

  //   try {
  //     const returnData = await returnModels.getReturnById(id);

  //     if (!returnData) {
  //       return res.status(404).json({ message: "Return not found" });
  //     }

  //     const analyse_id = returnData.analysis.analyze_id;

  //     const historyData = await historyModels.getHistoryByAnalyseId(analyse_id);

  //     if (!historyData || historyData.length === 0) {
  //       // Initialize the response object with empty objects for each status
  //       const mostRecentHistory = {};
  //       statuses.forEach((status) => {
  //         mostRecentHistory[status] = {};
  //       });
  //       return res.status(200).json({ ...mostRecentHistory, leadTime: null });
  //     }

  //     // Create an object to store the most relevant record for each status
  //     const mostRecentHistory = {};
  //     statuses.forEach((status) => {
  //       mostRecentHistory[status] = {};
  //     });

  //     // Separate records for 'created' and other statuses
  //     const createdRecords = historyData.filter((record) => record.status === "created");
  //     const otherRecords = historyData.filter((record) => record.status !== "created");

  //     // Find the oldest record for the 'created' status
  //     if (createdRecords.length > 0) {
  //       const oldestRecord = createdRecords.reduce((oldest, record) => {
  //         return new Date(record.created_at) < new Date(oldest.created_at) ? record : oldest;
  //       });
  //       mostRecentHistory["created"] = oldestRecord;
  //     }

  //     // Find the most recent record for all other statuses
  //     for (const status of statuses.filter((status) => status !== "created")) {
  //       const recordsForStatus = otherRecords.filter((record) => record.status === status);

  //       if (recordsForStatus.length > 0) {
  //         const latestRecord = recordsForStatus.reduce((latest, record) => {
  //           return new Date(record.created_at) > new Date(latest.created_at) ? record : latest;
  //         });
  //         mostRecentHistory[status] = latestRecord;
  //       }
  //     }

  //     // Calculate lead time from 'created' to 'closed'
  //     let leadTime = null;
  //     if (mostRecentHistory["created"].created_at && mostRecentHistory["closed"].created_at) {
  //       const createdDate = new Date(mostRecentHistory["created"].created_at);
  //       const closedDate = new Date(mostRecentHistory["closed"].created_at);
  //       const timeDiff = closedDate - createdDate; // Difference in milliseconds
  //       leadTime = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  //     }

  //     res.status(200).json({ ...mostRecentHistory, leadTime });
  //   } catch (error) {
  //     console.error("Error in getHistoryByAnalyseId:", error);
  //     res.status(500).json({ error: "Internal Server Error", details: error.message });
  //   }
  // },
  async getHistoryByAnalyseId(req, res) {
    const { id } = req.params;

    try {
      // Dapatkan data return berdasarkan id
      const returnData = await returnModels.getReturnById(id);

      if (!returnData) {
        return res.status(404).json({ message: "Return not found" });
      }

      const analyse_id = returnData.analysis.analyze_id;

      // Dapatkan history berdasarkan analyse_id
      const historyData = await historyModels.getHistoryByAnalyseId(analyse_id);

      // Proses data history menggunakan fungsi di model
      const { mostRecentHistory, leadTime } = await historyModels.processHistoryData(historyData);

      res.status(200).json({ ...mostRecentHistory, leadTime });
    } catch (error) {
      console.error("Error in getHistoryByAnalyseId:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  async assignHistory(req, res) {
    const { analyze_id } = req.params;
    const { sesa } = req.userData;

    if (!analyze_id) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID is required" });
    }

    try {
      const result = await historyModels.createHistoryAssign(analyze_id, sesa, "signed");
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async checkStatus(req, res) {
    const { sesa } = req.userData;

    try {
      const returnData = await returnModels.getReturnById(req.params.id);

      if (!returnData || !returnData.analysis || !returnData.analysis.analyze_id) {
        return res.status(404).json({ error: "Return data not found or analyze_id is missing" });
      }

      const analyze_id = returnData.analysis.analyze_id;

      // Fetch status data and history data
      const statusData = await historyModels.getStatusByAnalyzeId(analyze_id);
      const historyData = await historyModels.getHistoryById(analyze_id);

      // Initialize status flags
      let canEdit = false;
      let haveSubmitted = false;
      let signed = false;
      let approved = false;
      let rejected = false;
      let status = statusData;

      // Determine if editing is allowed based on signed data
      if (historyData && historyData.signed) {
        canEdit = historyData.signed.created_by === sesa;
      }

      // Determine status and flags based on statusData
      if (statusData) {
        switch (status) {
          case "created":
            haveSubmitted = false;
            signed = false;
            approved = false;
            rejected = false;
            break;
          case "signed":
            signed = true;
            haveSubmitted = false;
            approved = false;
            rejected = false;
            break;
          case "submitted":
            signed = true;
            haveSubmitted = true;
            approved = false;
            rejected = false;
            break;
          case "rejected":
            signed = true;
            haveSubmitted = false;
            approved = false;
            rejected = true;
            break;
          case "closed":
            signed = true;
            haveSubmitted = true;
            approved = true;
            rejected = false;
            break;
          default:
            status;
            break;
        }
      }

      // Return the response
      res.status(200).json({
        canEdit,
        haveSubmitted,
        signed,
        approved,
        rejected,
        status,
      });
    } catch (error) {
      console.error("Error in checkStatus:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
  async submitAnalysis(req, res) {
    const { analyze_id } = req.params;
    const { sesa } = req.userData;

    if (!analyze_id) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID is required" });
    }

    try {
      const result = await historyModels.createSubmitAnalysis(analyze_id, sesa, "submitted");

      const returData = await returnModels.getReturIdByAnalyzeId(analyze_id);
      if (!returData || !returData.retur_id) {
        return res.status(404).json({ error: "Not Found", details: "No retur ID found for the given analyze_id" });
      }
      const returId = returData.retur_id;

      const role = "Engineer";
      const sector = "AUTOMATION";
      const sesa = await UserModel.getUsersByDepartment(sector, role);

      const historyId = result.history_id;

      await Promise.all(
        sesa.map((sesa) => {
          return notificationModels.addNotification(historyId, sesa, returId);
        })
      );

      res.status(200).json({ message: "Analysis submitted successfully and notifications sent.", result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async decisionAnalysis(req, res) {
    const { analyze_id } = req.params;
    const { decision, comment } = req.body;

    // Pastikan req.userData terdefinisi sebelum mengakses sesa
    if (!req.userData) {
      return res.status(400).json({ error: "Bad Request", details: "User data is missing" });
    }

    const { sesa } = req.userData;

    if (!analyze_id || !decision) {
      return res.status(400).json({ error: "Bad Request", details: "Analyze ID and decision are required" });
    }

    try {
      let historyEntries = [];

      // Membuat entri history tergantung keputusan
      if (decision === "approved") {
        historyEntries = [
          { analyze_id, status: "approved", created_by: sesa, comment },
          { analyze_id, status: "closed", created_by: sesa, comment },
        ];
      } else if (decision === "rejected") {
        historyEntries = [{ analyze_id, status: "rejected", created_by: sesa, comment }];
      } else {
        return res.status(400).json({ error: "Bad Request", details: "Invalid decision value" });
      }

      // Simpan history decision baru
      for (const entry of historyEntries) {
        await historyModels.createHistoryDecision(entry.analyze_id, entry.created_by, entry.status, entry.comment);
      }

      // Mengambil data history terbaru untuk analyze_id
      const { mostRecentHistory } = await historyModels.processHistoryData(analyze_id);

      // Ambil sesa dari status "submitted"
      const submittedSesa = mostRecentHistory.submitted?.created_by;

      // Cek apakah submittedSesa valid
      if (!submittedSesa) {
        return res.status(404).json({ error: "Not Found", details: "No submitted user found for the given analyze_id" });
      }

      // Dapatkan returId menggunakan getReturIdByAnalyzeId
      const returData = await returnModels.getReturIdByAnalyzeId(analyze_id);
      if (!returData || !returData.retur_id) {
        return res.status(404).json({ error: "Not Found", details: "No retur ID found for the given analyze_id" });
      }
      const returId = returData.retur_id;

      // Kirim notifikasi menggunakan sesa yang "submitted" dan submittedHistoryId untuk semua keputusan
      await notificationModels.addNotification(mostRecentHistory.submitted.history_id, submittedSesa, returId);

      // Mengirim response sukses
      res.status(200).json({ message: `Decision ${decision} processed, notification sent, and history created` });
    } catch (error) {
      console.error("Error processing decision and creating history:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  // async decisionAnalysis(req, res) {
  //   const { analyze_id } = req.params;
  //   const { decision, comment } = req.body; // Include comment parameter
  //   const { sesa } = req.userData;

  //   if (!analyze_id || !decision) {
  //     return res.status(400).json({ error: "Bad Request", details: "Analyze ID and decision are required" });
  //   }

  //   try {
  //     let historyEntries = [];

  //     if (decision === "approved") {
  //       historyEntries = [
  //         { analyze_id, status: "approved", created_by: sesa, comment },
  //         { analyze_id, status: "closed", created_by: sesa, comment },
  //       ];
  //     } else if (decision === "rejected") {
  //       historyEntries = [{ analyze_id, status: "rejected", created_by: sesa, comment }];
  //     } else {
  //       return res.status(400).json({ error: "Bad Request", details: "Invalid decision value" });
  //     }

  //     for (const entry of historyEntries) {
  //       await historyModels.createHistoryDecision(entry.analyze_id, entry.created_by, entry.status, entry.comment);
  //     }

  //     res.status(200).json({ message: `Decision ${decision} processed and history created` });
  //   } catch (error) {
  //     console.error("Error processing decision and creating history:", error);
  //     res.status(500).json({ error: "Internal Server Error", details: error.message });
  //   }
  // },
};

module.exports = historyController;
