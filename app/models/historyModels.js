const db = require("../../database");

const historyModels = {
  async getHistory(status) {
    const query = `
    WITH LatestStatus AS (
      SELECT
        DISTINCT ON (analyse_id) -- Get the latest entry for each analyse_id
        EXTRACT(YEAR FROM created_at) AS year,
        EXTRACT(MONTH FROM created_at) AS month,
        analyse_id,
        status
      FROM history
      WHERE status IN ('created', 'closed', 'submitted')
      ORDER BY analyse_id, created_at DESC
    ),
    StatusByMonth AS (
      SELECT
        year,
        month,
        status,
        COUNT(*) AS count
      FROM LatestStatus
      GROUP BY year, month, status
    ),
    AllMonths AS (
      SELECT generate_series(1, 12) AS month -- Generates months from 1 to 12
    )
    SELECT
      COALESCE(sb.year, EXTRACT(YEAR FROM CURRENT_DATE)) AS year,
      am.month,
      COALESCE(SUM(CASE WHEN sb.status = 'created' THEN sb.count ELSE 0 END), 0) AS created,
      COALESCE(SUM(CASE WHEN sb.status = 'closed' THEN sb.count ELSE 0 END), 0) AS closed,
      COALESCE(SUM(CASE WHEN sb.status = 'submitted' THEN sb.count ELSE 0 END), 0) AS submitted
    FROM AllMonths am
    LEFT JOIN StatusByMonth sb
      ON am.month = sb.month
      AND sb.year = EXTRACT(YEAR FROM CURRENT_DATE) -- Assuming the current year, modify as needed
    GROUP BY year, am.month
    ORDER BY year, am.month;
  `;

    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error in getHistory:", error.message || error);
      throw error; // Re-throw error to handle it at the calling level
    }
  },
  // async createHistory(data) {
  //   try {
  //     const result = await db.query(
  //       `INSERT INTO history (analyse_id, status, created_at, created_by)
  //        VALUES ($1, $2, $3, $4) RETURNING history_id`,
  //       [data.analyse_id, data.status, data.created_at, data.created_by]
  //     );
  //     return result.rows[0];
  //   } catch (error) {
  //     console.error("Error in create History:", error);
  //   }
  // },

  async createHistory(data) {
    try {
      // Inline the logic of getNextHistoryId within createHistory
      const result = await db.query(`SELECT history_id FROM history ORDER BY history_id DESC LIMIT 1`);

      let newHistoryId;
      if (result.rows.length === 0) {
        newHistoryId = "HT000001"; // Starting point if no records exist
      } else {
        const lastId = result.rows[0].history_id;
        const lastNumber = parseInt(lastId.replace("HT", ""), 10);
        const nextNumber = lastNumber + 1;
        newHistoryId = `HT${nextNumber.toString().padStart(6, "0")}`;
      }

      // Insert new history record
      const insertResult = await db.query(
        `INSERT INTO history (history_id, analyse_id, status, created_at, created_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [newHistoryId, data.analyse_id, data.status, data.created_at, data.created_by]
      );

      return insertResult.rows[0].history_id;
    } catch (error) {
      console.error("Error in create History:", error);
      throw error;
    }
  },

  async getHistoryById(analyse_id) {
    try {
      const query = `
        SELECT * 
        FROM history 
        WHERE analyse_id = $1 
        ORDER BY created_at
      `;
      const res = await db.query(query, [analyse_id]);
      const historyData = res.rows;

      // Initialize the response object with empty objects for each status
      const statuses = ["created", "signed", "submitted", "rejected", "approved", "closed"];
      const mostRecentHistory = {};
      statuses.forEach((status) => {
        mostRecentHistory[status] = {};
      });

      // Separate records for 'created' and other statuses
      const createdRecords = historyData.filter((record) => record.status === "created");
      const otherRecords = historyData.filter((record) => record.status !== "created");

      // Find the oldest record for the 'created' status
      if (createdRecords.length > 0) {
        const oldestRecord = createdRecords.reduce((oldest, record) => {
          return new Date(record.created_at) < new Date(oldest.created_at) ? record : oldest;
        });
        mostRecentHistory["created"] = oldestRecord;
      }

      // Find the most recent record for all other statuses
      statuses
        .filter((status) => status !== "created")
        .forEach((status) => {
          const recordsForStatus = otherRecords.filter((record) => record.status === status);
          if (recordsForStatus.length > 0) {
            const latestRecord = recordsForStatus.reduce((latest, record) => {
              return new Date(record.created_at) > new Date(latest.created_at) ? record : latest;
            });
            mostRecentHistory[status] = latestRecord;
          }
        });

      // Calculate lead time from 'created' to 'closed'
      let leadTime = null;
      if (mostRecentHistory["created"].created_at && mostRecentHistory["closed"].created_at) {
        const createdDate = new Date(mostRecentHistory["created"].created_at);
        const closedDate = new Date(mostRecentHistory["closed"].created_at);
        const timeDiff = closedDate - createdDate; // Difference in milliseconds
        leadTime = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
      }

      return { ...mostRecentHistory, leadTime };
    } catch (error) {
      console.error("Error fetching history by analyse_id:", error);
      throw error;
    }
  },

  async createHistoryAssign(analyze_id, created_by, status) {
    try {
      await db.query("BEGIN");

      const historyResult = await db.query(
        `INSERT INTO history (analyse_id, created_at, status, created_by)
         VALUES ($1, NOW(), $2, $3) RETURNING *`,
        [analyze_id, status, created_by]
      );

      await db.query("COMMIT");

      return {
        historyResult: historyResult.rows[0],
      };
    } catch (error) {
      await db.query("ROLLBACK");
      console.error("Error in createHistoryAssign:", error);
      throw new Error("Database query failed");
    }
  },
  async createHistoryDecision(analyze_id, created_by, status, comment) {
    try {
      await db.query("BEGIN");

      const historyResult = await db.query(
        `INSERT INTO history (analyse_id, created_by, status, comment, created_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [analyze_id, created_by, status, comment]
      );

      await db.query("COMMIT");

      return {
        historyResult: historyResult.rows[0],
      };
    } catch (error) {
      await db.query("ROLLBACK");
      console.error("Error in createHistoryDecision:", error);
      throw error; // Ensure the error is thrown so the calling function can handle it
    }
  },
  async getHistoryByAnalyseId(analyse_id) {
    try {
      const result = await db.query(
        `SELECT history_id, analyse_id, status, comment, created_at, created_by
         FROM history
         WHERE analyse_id = $1
         ORDER BY created_at DESC`,
        [analyse_id]
      );
      return result.rows;
    } catch (error) {
      console.error("Error in getHistoryByAnalyseId:", error);
      throw new Error("Database query failed");
    }
  },
  async processHistoryData(historyData) {
    const statuses = ["created", "signed", "submitted", "rejected", "approved", "closed"];
    const mostRecentHistory = {};

    statuses.forEach((status) => {
      mostRecentHistory[status] = {};
    });

    if (!historyData || historyData.length === 0) {
      return { mostRecentHistory, leadTime: null };
    }

    // Pisahkan record "created" dan status lainnya
    const createdRecords = historyData.filter((record) => record.status === "created");
    const otherRecords = historyData.filter((record) => record.status !== "created");

    // Cari record tertua untuk status 'created'
    if (createdRecords.length > 0) {
      const oldestRecord = createdRecords.reduce((oldest, record) => {
        return new Date(record.created_at) < new Date(oldest.created_at) ? record : oldest;
      });
      mostRecentHistory["created"] = oldestRecord;
    }

    // Cari record terbaru untuk status lainnya
    for (const status of statuses.filter((status) => status !== "created")) {
      const recordsForStatus = otherRecords.filter((record) => record.status === status);

      if (recordsForStatus.length > 0) {
        const latestRecord = recordsForStatus.reduce((latest, record) => {
          return new Date(record.created_at) > new Date(latest.created_at) ? record : latest;
        });
        mostRecentHistory[status] = latestRecord;
      }
    }

    // Hitung lead time dari "created" hingga "closed"
    let leadTime = null;
    if (mostRecentHistory["created"].created_at && mostRecentHistory["closed"].created_at) {
      const createdDate = new Date(mostRecentHistory["created"].created_at);
      const closedDate = new Date(mostRecentHistory["closed"].created_at);
      const timeDiff = closedDate - createdDate; // Selisih dalam milidetik
      leadTime = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Ubah milidetik ke hari
    }

    return { mostRecentHistory, leadTime };
  },
  async getStatusByAnalyzeId(analyse_id) {
    try {
      const query = `
        SELECT status 
        FROM history 
        WHERE analyse_id = $1 
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      const res = await db.query(query, [analyse_id]);
      return res.rows.length > 0 ? res.rows[0].status : null;
    } catch (error) {
      console.error("Error fetching status:", error.message || error);
      throw error;
    }
  },
  async createSubmitAnalysis(analyzeId, sesa, status) {
    try {
      const result = await db.query(
        `INSERT INTO history (analyse_id, status, created_by, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
        [analyzeId, status, sesa]
      );

      return result.rows[0]; // Return the newly created history record
    } catch (error) {
      console.error("Error creating submit analysis history:", error);
      throw error;
    }
  },
  async getHistoryById(analyse_id) {
    try {
      const query = `
        SELECT * 
        FROM history 
        WHERE analyse_id = $1 
        ORDER BY created_at
      `;
      const res = await db.query(query, [analyse_id]);
      const historyData = res.rows;

      // Initialize the response object with empty objects for each status
      const statuses = ["created", "signed", "submitted", "rejected", "approved", "closed"];
      const mostRecentHistory = {};
      statuses.forEach((status) => {
        mostRecentHistory[status] = {};
      });

      // Separate records for 'created' and other statuses
      const createdRecords = historyData.filter((record) => record.status === "created");
      const otherRecords = historyData.filter((record) => record.status !== "created");

      // Find the oldest record for the 'created' status
      if (createdRecords.length > 0) {
        const oldestRecord = createdRecords.reduce((oldest, record) => {
          return new Date(record.created_at) < new Date(oldest.created_at) ? record : oldest;
        });
        mostRecentHistory["created"] = oldestRecord;
      }

      // Find the most recent record for all other statuses
      statuses
        .filter((status) => status !== "created")
        .forEach((status) => {
          const recordsForStatus = otherRecords.filter((record) => record.status === status);
          if (recordsForStatus.length > 0) {
            const latestRecord = recordsForStatus.reduce((latest, record) => {
              return new Date(record.created_at) > new Date(latest.created_at) ? record : latest;
            });
            mostRecentHistory[status] = latestRecord;
          }
        });

      // Calculate lead time from 'created' to 'closed'
      let leadTime = null;
      if (mostRecentHistory["created"].created_at && mostRecentHistory["closed"].created_at) {
        const createdDate = new Date(mostRecentHistory["created"].created_at);
        const closedDate = new Date(mostRecentHistory["closed"].created_at);
        const timeDiff = closedDate - createdDate; // Difference in milliseconds
        leadTime = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
      }

      return { ...mostRecentHistory, leadTime };
    } catch (error) {
      console.error("Error fetching history by analyze_id:", error);
      throw error;
    }
  },
};

module.exports = historyModels;
