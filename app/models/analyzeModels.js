const db = require("../../database");

const analyzeModels = {
  async createAnalysis(data) {
    const { analyze_id, root_cause, defect_type, action, verification } = data;

    try {
      const result = await db.query(
        `INSERT INTO analysis (analyze_id, root_cause, defect_type, action, verification)
         VALUES ($1, $2, $3, $4, $5) RETURNING analyze_id`,
        [analyze_id, root_cause, defect_type, action, verification]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in createAnalysis:", error);
      throw new Error("Database query failed");
    }
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

  async getLastAnalyzeId() {
    const result = await db.query("SELECT analyze_id FROM analysis ORDER BY analyze_id DESC LIMIT 1");
    return result.rows[0] ? result.rows[0].analyze_id : null;
  },

  async updateAnalysisById(analyze_id, analysisData) {
    const { verification, root_cause, defect_type, action, location, category, images, caption } = analysisData;

    console.log("Updating Analysis ID:", analyze_id);
    console.log("Analysis Data:", analysisData);

    try {
      const result = await db.query(
        `UPDATE analysis
         SET verification = COALESCE($1, verification), 
             location = COALESCE($2, location),
             root_cause = COALESCE($3, root_cause), 
             defect_type = COALESCE($4, defect_type), 
             action = COALESCE($5, action),
             category = COALESCE($6, category),
             images = COALESCE($7, images),
             caption = COALESCE($8, caption)
         WHERE analyze_id = $9 RETURNING *`,
        [
          verification !== undefined ? verification : null,
          root_cause !== undefined ? root_cause : null,
          defect_type !== undefined ? defect_type : null,
          action !== undefined ? action : null,
          location !== undefined ? location : null,
          category !== undefined ? category : null,
          images !== undefined ? images : null, // No JSON.stringify needed
          caption !== undefined ? caption : null, // No JSON.stringify needed
          analyze_id,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in updateAnalysisById:", error);
      throw new Error("Database query failed: " + error.message);
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
