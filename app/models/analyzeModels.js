const db = require("../../database");

const analyzeModels = {
  async getAllAnalyses() {
    const result = await db.query("SELECT * FROM analyze");
    return result.rows;
  },

  // Fungsi untuk mengambil data analyze berdasarkan ID
  async getAnalysisById(id) {
    const result = await db.query("SELECT * FROM analyze WHERE analyse_id = $1", [id]);
    return result.rows[0];
  },

  // Fungsi untuk memperbarui data analyze berdasarkan ID
  async updateAnalysisById(id, analyze) {
    const { verification, root_cause, defect_type, action, status, created_by, created_at } = analyze;
    const result = await db.query("UPDATE analyze SET verification = $1, root_cause = $2, defect_type = $3, action = $4, status = $5, created_by = $6, created_at = $7 WHERE analyse_id = $8 RETURNING *", [
      verification,
      root_cause,
      defect_type,
      action,
      status,
      created_by,
      created_at,
      id,
    ]);
    return result.rows[0];
  },

  // Fungsi untuk menghapus data analyze berdasarkan ID
  async deleteAnalysisById(id) {
    const result = await db.query("DELETE FROM analyze WHERE analyse_id = $1 RETURNING *", [id]);
    return result.rows[0];
  },
};

module.exports = analyzeModels;
