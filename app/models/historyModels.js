const db = require("../../database");

const historyModels = {
  async createHistory(data) {
    try {
      const result = await db.query(
        `INSERT INTO history (analyse_id, status, created_at, created_by)
         VALUES ($1, $2, $3, $4) RETURNING history_id`,
        [data.analyse_id, data.status, data.created_at, data.created_by]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in createHistory:", error);
    }
  },

  async getHistoryById(history_id) {
    try {
      const result = await db.query(
        `SELECT history_id, analyse_id, status, created_at, created_by
         FROM history
         WHERE history_id = $1`,
        [history_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in getHistoryById:", error);
      throw new Error("Database query failed");
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
  async getHistoryByAnalyseId(analyse_id) {
    try {
      const result = await db.query(
        `SELECT history_id, analyse_id, status, created_at, created_by
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
};

module.exports = historyModels;
