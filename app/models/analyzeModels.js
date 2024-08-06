const db = require("../../database");

const analyzeModels = {
  async createAnalysis(data) {
    const result = await db.query(
      `INSERT INTO analysis (root_cause, defect_type, action, verification, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING analyze_id`,
      [data.root_cause, data.defect_type, data.action, data.verification, "created", data.created_by]
    );
    return result.rows[0];
  },

  async getAllAnalysis() {
    try {
      const result = await db.query("SELECT * FROM analysis");
      return result.rows;
    } catch (error) {
      console.error("Error in getAllAnalysis:", error);
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
         SET verification = COALESCE($1, verification), 
             root_cause = COALESCE($2, root_cause), 
             defect_type = COALESCE($3, defect_type), 
             action = COALESCE($4, action)
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
        `UPDATE analysis
         SET status = $1, created_by = $2
         WHERE analyze_id = $3 RETURNING *`,
        [status, created_by, analyze_id]
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
        `UPDATE analysis
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
