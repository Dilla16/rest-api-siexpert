const db = require("../../database");

const historyModels = {
  async createHistory(data) {
    const result = await db.query(
      `INSERT INTO history (analyse_id, status, created_at, created_by)
           VALUES ($1, $2, $3, $4) RETURNING history_id`,
      [data.analyse_id, data.status, data.created_at, data.created_by]
    );
    return result.rows[0];
  },

  async getHistoryByAnalyzeId(analyse_id) {
    try {
      const result = await db.query(
        `SELECT history_id, analyse_id, status, created_at, created_by
           FROM history
           WHERE analyse_id = $1`,
        [analyse_id]
      );
      return result.rows;
    } catch (error) {
      console.error("Error in getHistoryByAnalyzeId:", error);
      throw new Error("Database query failed");
    }
  },
};

module.exports = historyModels;
