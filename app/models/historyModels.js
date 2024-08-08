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
      await client.query("BEGIN");

      const historyResult = await db.query(
        `INSERT INTO history (analyse_id, created_at, status, created_by)
         VALUES ($1, NOW(), $2, $3) RETURNING *`,
        [analyze_id, status, created_by]
      );

      await client.query("COMMIT");

      return {
        updateResult: updateResult.rows[0],
        historyResult: historyResult.rows[0],
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in createHistoryAssign:", error);
      throw new Error("Database query failed");
    } finally {
      client.release();
    }
  },
};

module.exports = historyModels;
