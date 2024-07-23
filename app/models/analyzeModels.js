const db = require("../../database");

const analyzeModels = {
  async getAllAnalysis() {
    try {
      const result = await db.query("SELECT * FROM analysis");
      return result.rows;
    } catch (error) {
      console.error("Error in getAllAnalyses:", error);
      throw new Error("Database query failed");
    }
  },

  async getAnalysisById(id) {
    try {
      const result = await db.query("SELECT * FROM analysis WHERE analyze_id = $1", [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error in getAnalysisById:", error);
      throw new Error("Database query failed");
    }
  },

  async updateAnalysisById(id, analysisData) {
    const { verification, root_cause, defect_type, action } = analysisData;

    try {
      const result = await db.query(
        `UPDATE analysis
         SET verification = $1, root_cause = $2, defect_type = $3, action = $4
         WHERE analyze_id = $5 RETURNING *`,
        [verification, root_cause, defect_type, action, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in updateAnalysisById:", error);
      throw new Error("Database query failed");
    }
  },

  async deleteAnalysisById(id) {
    try {
      const result = await db.query("DELETE FROM analysis WHERE analyze_id = $1 RETURNING *", [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error in deleteAnalysisById:", error);
      throw new Error("Database query failed");
    }
  },

  async updateAnalysisStatus(analyze_id, created_by, status) {
    try {
      const result = await db.query(
        `UPDATE analyze
         SET created_by = $1, status = $2
         WHERE analyze_id = $3 RETURNING *`,
        [created_by, status, analyze_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in updateAnalysisStatus:", error);
      throw new Error("Database query failed");
    }
  },

  async saveAnalysis(analyze_id, verification, root_cause, defect_type, action) {
    try {
      const result = await db.query(
        `UPDATE analyze
         SET verification = COALESCE($2, verification), 
             root_cause = COALESCE($3, root_cause), 
             defect_type = COALESCE($4, defect_type), 
             action = COALESCE($5, action)
         WHERE analyze_id = $1 RETURNING *`,
        [analyze_id, verification, root_cause, defect_type, action]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in saveAnalysis:", error);
      throw new Error("Database query failed");
    }
  },
};

module.exports = analyzeModels;
